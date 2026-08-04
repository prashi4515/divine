/**
 * Atlas search — autocomplete, keyboard nav, scrollable results.
 * Sidebar layout keeps the dropdown outside the map surface.
 */
"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { AtlasDataset } from "@divine/types";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import {
  SEARCH_GROUP_LABELS,
  pushRecentSearch,
  searchAtlas,
  type AtlasSearchGroup,
  type AtlasSearchResult,
} from "@/lib/atlas/search/atlas-search-engine";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

type AtlasMapSearchProps = {
  places: readonly AtlasPlace[];
  dataset: AtlasDataset;
  traditionalLabels?: readonly TraditionalAtlasLabel[];
  relatedPeople?: ReadonlyArray<{
    id: string;
    name: string;
    placeSlug: string;
    longitude: number;
    latitude: number;
  }>;
  placeholder: string;
  onSelect: (hit: AtlasSearchResult) => void;
  layout?: "floating" | "sidebar";
};

function groupResults(
  results: AtlasSearchResult[],
): Array<[AtlasSearchGroup, AtlasSearchResult[]]> {
  const order: AtlasSearchGroup[] = [
    "recent",
    "places",
    "rivers",
    "events",
    "routes",
    "people",
  ];
  const map = new Map<AtlasSearchGroup, AtlasSearchResult[]>();
  for (const r of results) {
    const list = map.get(r.group) ?? [];
    list.push(r);
    map.set(r.group, list);
  }
  return order
    .filter((g) => (map.get(g)?.length ?? 0) > 0)
    .map((g) => [g, map.get(g)!]);
}

export function AtlasMapSearch({
  places,
  dataset,
  traditionalLabels = [],
  relatedPeople = [],
  placeholder,
  onSelect,
  layout = "sidebar",
}: AtlasMapSearchProps) {
  const lang = useReadingStore((s) => s.preferredLanguage);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 80);
    return () => window.clearTimeout(t);
  }, [query]);

  const results = React.useMemo(
    () =>
      searchAtlas(debounced, places, dataset, {
        limit: 20,
        lang,
        traditionalLabels,
        people: relatedPeople,
      }),
    [debounced, places, dataset, lang, traditionalLabels, relatedPeople],
  );
  const grouped = React.useMemo(() => groupResults(results), [results]);
  const flat = results;

  React.useEffect(() => {
    setActive(0);
  }, [debounced, flat.length]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-atlas-search-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(hit: AtlasSearchResult) {
    pushRecentSearch(hit);
    setQuery(hit.label);
    setOpen(false);
    inputRef.current?.blur();
    onSelect(hit);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter") && flat.length) {
      setOpen(true);
      return;
    }
    if (!open || flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[active];
      if (hit) choose(hit);
    }
  }

  let flatIndex = -1;
  const showList = open && flat.length > 0;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full min-w-0",
        layout === "floating" && "z-[60] w-[min(100%,22rem)]",
      )}
    >
      <div className="border-border bg-background relative flex h-11 items-center rounded-lg border shadow-sm">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-full w-full rounded-lg bg-transparent py-2 pl-10 pr-10 text-sm outline-none"
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls="atlas-map-search-results"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md"
            onClick={() => {
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showList ? (
        <div
          ref={listRef}
          id="atlas-map-search-results"
          role="listbox"
          className="border-border bg-background absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto overscroll-contain rounded-lg border py-1 shadow-lg"
        >
          {grouped.map(([group, items]) => (
            <div key={group}>
              <p className="text-muted-foreground px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                {SEARCH_GROUP_LABELS[group]}
              </p>
              <ul>
                {items.map((h) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  return (
                    <li key={h.id} role="option" aria-selected={idx === active}>
                      <button
                        type="button"
                        data-atlas-search-idx={idx}
                        className={cn(
                          "flex h-10 w-full items-center justify-between gap-2 px-3 text-left text-sm",
                          idx === active ? "bg-muted" : "hover:bg-muted/70",
                        )}
                        onMouseEnter={() => setActive(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(h)}
                      >
                        <span className="truncate font-medium">{h.label}</span>
                        <span className="text-muted-foreground shrink-0 text-[10px] uppercase tracking-wider">
                          {h.subtitle}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
