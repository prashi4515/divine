"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Clock3, Fullscreen, GitBranch, Info, X } from "lucide-react";
import { GenealogyTimeline } from "@/features/genealogy/genealogy-timeline";
import { PersonDrawer } from "@/features/genealogy/person-drawer";
import { SearchCommand } from "@/features/genealogy/search-command";
import { CATEGORY_TOKENS } from "@/lib/genealogy/types";
import type { GenealogyModule, Person } from "@/lib/genealogy/types";
import { cn } from "@/lib/utils";

const GenealogyGraph = dynamic(
  () =>
    import("@/features/genealogy/genealogy-graph").then((m) => m.GenealogyGraph),
  {
    ssr: false,
    loading: () => (
      <div
        className="text-muted-foreground flex h-full w-full items-center justify-center text-xs"
        role="status"
      >
        Loading interactive graph…
      </div>
    ),
  },
);

type ViewMode = "graph" | "timeline";

/**
 * Client-only orchestrator: selection, drawer, search, lineage highlight,
 * fullscreen, and graph ↔ timeline modes.
 */
export function GenealogyExplorer({
  module: mod,
  people,
}: {
  module: GenealogyModule;
  people: readonly Person[];
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(
    mod.rootPersonId ?? mod.highlightPath?.[0] ?? null,
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [focusReq, setFocusReq] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [legendOpen, setLegendOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("graph");
  const [spineActive, setSpineActive] = React.useState(
    Boolean(mod.highlightPath && mod.highlightPath.length > 1),
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  const peopleById = React.useMemo(() => {
    const map = new Map<string, Person>();
    for (const p of people) map.set(p.id, p);
    return map;
  }, [people]);

  const selected = React.useMemo(
    () => (selectedId ? peopleById.get(selectedId) ?? null : null),
    [peopleById, selectedId],
  );

  const handleSelect = React.useCallback((id: string) => {
    setSelectedId(id);
    setSpineActive(false);
    setFocusReq((n) => n + 1);
    setDrawerOpen(true);
  }, []);

  const handleNavigateInDrawer = React.useCallback(
    (id: string) => {
      if (peopleById.has(id)) {
        setSelectedId(id);
        setSpineActive(false);
        setFocusReq((n) => n + 1);
      }
    },
    [peopleById],
  );

  const clearLineage = React.useCallback(() => {
    setSelectedId(null);
    setSpineActive(false);
  }, []);

  const showDynastySpine = React.useCallback(() => {
    if (!mod.highlightPath?.length) return;
    setSelectedId(mod.highlightPath[mod.highlightPath.length - 1] ?? null);
    setSpineActive(true);
    setFocusReq((n) => n + 1);
    setViewMode("graph");
  }, [mod.highlightPath]);

  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (drawerOpen) return;
        if (selectedId) setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, selectedId]);

  return (
    <div className="page-gutter w-full pb-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchCommand
              people={people}
              onSelect={handleSelect}
              moduleTitle={mod.title}
            />
            <div
              className="border-border bg-background/80 inline-flex rounded-full border p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                onClick={() => setViewMode("graph")}
                aria-pressed={viewMode === "graph"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-divine",
                  viewMode === "graph"
                    ? "cta-saffron text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                Graph
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                aria-pressed={viewMode === "timeline"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-divine",
                  viewMode === "timeline"
                    ? "cta-saffron text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                Timeline
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              aria-pressed={legendOpen}
              className="border-border bg-background/80 hover:border-saffron/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-divine"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
              Legend
            </button>
            {mod.highlightPath && mod.highlightPath.length > 1 ? (
              <button
                type="button"
                onClick={showDynastySpine}
                className="border-border bg-background/80 hover:border-saffron/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-divine"
              >
                Highlight lineage
              </button>
            ) : null}
            {selectedId ? (
              <button
                type="button"
                onClick={clearLineage}
                className="border-border bg-background/80 hover:border-saffron/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-divine"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear lineage
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="border-border bg-background/80 hover:border-saffron/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-divine"
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Fullscreen className="h-3.5 w-3.5" aria-hidden />
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
          </div>
        </div>

        {legendOpen ? (
          <div className="border-border/70 bg-card/80 text-muted-foreground mb-3 rounded-xl border p-4 text-xs">
            <p className="text-foreground mb-2 text-sm font-medium">
              Reading the graph
            </p>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              <li>· Solid line — parent → child relationship</li>
              <li>· Dashed line — spouse / consort</li>
              <li>· Dotted line — attested only in some traditions (variant)</li>
              <li>· Click any figure to open details and highlight ancestry</li>
              <li>· Highlight lineage — module&apos;s canonical spine path</li>
              <li>· ⌘/Ctrl-K to search · Esc to clear · scroll to zoom</li>
            </ul>
          </div>
        ) : null}

        <div
          ref={containerRef}
          className={cn(
            "border-border/70 bg-background/40 relative overflow-hidden rounded-2xl border shadow-sm",
            isFullscreen ? "h-svh w-svw" : "h-[62vh] min-h-[420px] md:h-[70vh]",
          )}
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% -10%, hsl(var(--saffron) / 0.05), transparent 55%),
              hsl(var(--background))
            `,
          }}
        >
          {viewMode === "graph" ? (
            <GenealogyGraph
              module={mod}
              people={people}
              selectedId={selectedId}
              onSelectPerson={handleSelect}
              focusRequestId={focusReq}
              spinePath={spineActive ? mod.highlightPath : undefined}
            />
          ) : (
            <GenealogyTimeline
              people={people}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}

          {viewMode === "graph" ? (
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {legendCategoriesUsed(people).map((cat) => (
                <span
                  key={cat}
                  className="pointer-events-auto border-border/70 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] backdrop-blur-sm"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: CATEGORY_TOKENS[cat].accent }}
                    aria-hidden
                  />
                  <span className="text-muted-foreground capitalize">
                    {cat.replace(/-/g, " ")}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <PersonDrawer
        person={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onNavigateToPerson={handleNavigateInDrawer}
        peopleById={peopleById}
      />
    </div>
  );
}

function legendCategoriesUsed(people: readonly Person[]) {
  const seen = new Set<Person["category"]>();
  for (const p of people) seen.add(p.category);
  return [...seen];
}
