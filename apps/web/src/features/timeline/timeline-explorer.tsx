"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  GitBranch,
  Library,
  MapPinned,
  Swords,
} from "lucide-react";
import type { TimelineFilter, TimelineZoomLevel } from "@/lib/timeline/layout";
import {
  TIMELINE_FILTER_LABELS,
  TIMELINE_ZOOM_LABELS,
} from "@/lib/timeline/layout";
import {
  filterTimelineViewNodes,
  type TimelineView,
} from "@/lib/timeline/view-model";
import { eventHref, eventTypeLabel, gitaChapterHref } from "@/lib/events/helpers";
import { cn } from "@/lib/utils";
import "@/features/timeline/timeline.css";

type TimelineExplorerProps = {
  view: TimelineView;
};

/**
 * Interactive Mahabharata timeline — era groups, filters, zoom, event cards.
 * Receives a slim view-model (not full Knowledge Graph entities).
 */
export function TimelineExplorer({ view }: TimelineExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEventSlug = searchParams.get("event") ?? undefined;
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState<TimelineZoomLevel>(2);
  const [filter, setFilter] = React.useState<TimelineFilter>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(() => {
    const fromQuery = view.nodes.find(
      (n) => n.event.slug === initialEventSlug,
    )?.event.id;
    return fromQuery ?? view.nodes[0]?.event.id ?? null;
  });

  const visible = React.useMemo(
    () => filterTimelineViewNodes(view, zoom, filter),
    [view, zoom, filter],
  );

  const selected =
    visible.find((n) => n.event.id === selectedId) ?? visible[0] ?? null;

  React.useEffect(() => {
    if (!selected) return;
    const el = scrollerRef.current?.querySelector(
      `[data-event-id="${selected.event.id}"]`,
    );
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selected?.event.id, zoom, filter]);

  const erasWithVisible = React.useMemo(() => {
    const byEra = new Map<string, typeof visible>();
    for (const n of visible) {
      const list = byEra.get(n.eraSlug) ?? [];
      list.push(n);
      byEra.set(n.eraSlug, list);
    }
    return view.eras
      .map(({ era }) => ({
        era,
        nodes: byEra.get(era.slug) ?? [],
      }))
      .filter((x) => x.nodes.length > 0);
  }, [view.eras, visible]);

  return (
    <div className="border-border/70 bg-card/40 overflow-hidden rounded-3xl border shadow-sm">
      <div className="border-border/60 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Event filters"
        >
          {(Object.keys(TIMELINE_FILTER_LABELS) as TimelineFilter[]).map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-divine",
                  filter === key
                    ? "border-saffron/50 bg-saffron/10 text-foreground"
                    : "border-border/70 text-muted-foreground hover:border-saffron/30 hover:text-foreground",
                )}
              >
                {TIMELINE_FILTER_LABELS[key]}
              </button>
            ),
          )}
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Zoom level"
        >
          {([1, 2, 3] as TimelineZoomLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setZoom(level)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-divine",
                zoom === level
                  ? "border-foreground/30 bg-foreground/5 text-foreground"
                  : "border-border/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {TIMELINE_ZOOM_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="timeline-scroller flex gap-6 overflow-x-auto px-4 py-6 scroll-smooth"
        tabIndex={0}
        aria-label="Timeline eras"
      >
        {erasWithVisible.length === 0 ? (
          <p className="text-muted-foreground px-2 text-sm">
            No events match this filter and zoom level.
          </p>
        ) : (
          erasWithVisible.map(({ era, nodes }) => (
            <section
              key={era.id}
              className="flex w-[min(100%,320px)] shrink-0 flex-col gap-3"
              aria-labelledby={`era-${era.slug}`}
            >
              <div>
                <p className="text-saffron text-[10px] font-medium uppercase tracking-[0.16em]">
                  {era.eyebrow ?? "Epoch"}
                </p>
                <h3
                  id={`era-${era.slug}`}
                  className="text-foreground mt-1 font-serif text-lg leading-tight"
                >
                  {era.title}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                  {era.summary}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {nodes.map((n) => {
                  const active = selected?.event.id === n.event.id;
                  return (
                    <li key={n.event.id}>
                      <button
                        type="button"
                        data-event-id={n.event.id}
                        onClick={() => setSelectedId(n.event.id)}
                        onDoubleClick={() =>
                          router.push(eventHref(n.event.slug))
                        }
                        className={cn(
                          "border-border/70 w-full rounded-2xl border px-3.5 py-3 text-left transition-divine",
                          active
                            ? "border-saffron/50 bg-background shadow-sm"
                            : "bg-background/60 hover:border-saffron/30",
                        )}
                      >
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          {eventTypeLabel(n.event.eventType)}
                        </span>
                        <span className="text-foreground mt-0.5 block text-sm font-medium">
                          {n.event.name}
                        </span>
                        <span className="text-muted-foreground mt-1 line-clamp-2 block text-xs leading-relaxed">
                          {n.event.summary}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      {selected ? (
        <div className="border-border/60 bg-background/80 border-t px-4 py-5">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                {selected.eraTitle} ·{" "}
                {eventTypeLabel(selected.event.eventType)}
              </p>
              <h3 className="text-foreground mt-1 font-serif text-xl leading-tight">
                {selected.event.name}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {selected.event.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={eventHref(selected.event.slug)}
                className="cta-saffron inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs text-white"
                prefetch
              >
                <Swords className="h-3.5 w-3.5" aria-hidden />
                Open event
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
              <Link
                href={`/encyclopedia/${selected.event.kind}/${selected.event.slug}`}
                className="border-border hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-divine"
                prefetch
              >
                <Library className="h-3.5 w-3.5" aria-hidden />
                Encyclopedia
              </Link>
              {selected.event.chapters[0] ? (
                <Link
                  href={gitaChapterHref(selected.event.chapters[0])}
                  className="border-border hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-divine"
                  prefetch
                >
                  <BookOpen className="h-3.5 w-3.5" aria-hidden />
                  Gita {selected.event.chapters[0]}
                </Link>
              ) : null}
              <Link
                href="/genealogy"
                className="border-border hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-divine"
                prefetch
              >
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                Genealogy
              </Link>
              <Link
                href="/atlas"
                className="border-border hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-divine"
                prefetch
              >
                <MapPinned className="h-3.5 w-3.5" aria-hidden />
                Atlas
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
