"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search } from "lucide-react";
import { adminNavItems } from "@/features/admin/nav";
import { usePermissions } from "@/features/rbac";
import { useUiStore } from "@/lib/stores";
import { searchService } from "@/lib/api/services/search";
import type { SearchHit } from "@divine/types";
import { cn } from "@/lib/utils";

/**
 * Global admin command palette (⌘K). Searches admin sections and content.
 */
export function AdminCommandPalette() {
  const router = useRouter();
  const { can } = usePermissions();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setHits([]);
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || !query.trim()) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void searchService
        .search(query.trim(), 16)
        .then(setHits)
        .catch(() => setHits([]));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  if (!open) return null;

  const sectionResults = adminNavItems
    .filter((item) => can(item.permission))
    .filter((item) =>
      query.trim() === ""
        ? true
        : `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
    );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="border-border bg-popover animate-fade-up absolute left-1/2 top-24 w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border shadow-lg"
      >
        <div className="border-border flex items-center gap-2 border-b px-4">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scriptures, chapters, verses…"
            aria-label="Search"
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {hits.length > 0 ? (
            <div className="mb-2">
              <p className="text-muted-foreground px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
                Content
              </p>
              <ul>
                {hits.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                      )}
                    >
                      <BookOpen className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {item.type}
                          {item.subtitle ? ` · ${item.subtitle}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-muted-foreground px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
            Sections
          </p>
          <ul>
            {sectionResults.length === 0 && hits.length === 0 ? (
              <li className="text-muted-foreground px-3 py-6 text-center text-sm">
                No matches for “{query}”.
              </li>
            ) : (
              sectionResults.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                      )}
                    >
                      <Icon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
