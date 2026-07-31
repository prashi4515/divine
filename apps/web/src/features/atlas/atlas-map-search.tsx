"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { AtlasDataset } from "@divine/types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import {
  SEARCH_GROUP_LABELS,
  pushRecentSearch,
  searchAtlas,
  type AtlasSearchGroup,
  type AtlasSearchResult,
} from "@/lib/atlas/search/atlas-search-engine";
import { cn } from "@/lib/utils";

type AtlasMapSearchProps = {
  places: readonly AtlasPlace[];
  dataset: AtlasDataset;
  placeholder: string;
  onSelect: (hit: AtlasSearchResult) => void;
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

/**
 * Google Maps–style search: floating card, keyboard nav, grouped results.
 */
export function AtlasMapSearch({
  places,
  dataset,
  placeholder,
  onSelect,
}: AtlasMapSearchProps) {
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 100);
    return () => window.clearTimeout(t);
  }, [query]);

  const results = React.useMemo(
    () => searchAtlas(debounced, places, dataset, 16),
    [debounced, places, dataset],
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
      data-atlas-ui
      className="relative z-[60] w-[min(100%,22rem)] min-w-0"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="border-border bg-background relative flex h-12 items-center rounded-xl border shadow-md">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-full w-full rounded-xl bg-transparent py-2 pl-10 pr-10 text-sm outline-none"
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
          id="atlas-map-search-results"
          role="listbox"
          className="border-border bg-background absolute left-0 right-0 top-full z-[70] mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-xl border py-1 shadow-lg"
          onWheel={(e) => e.stopPropagation()}
        >
          {grouped.map(([group, items]) => (
            <div key={group}>
              <p className="text-muted-foreground px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                {SEARCH_GROUP_LABELS[group]}
              </p>
              <ul>
                {items.map((h) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  return (
                    <li
                      key={h.id}
                      role="option"
                      aria-selected={idx === active}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex h-11 w-full items-center justify-between gap-2 px-4 text-left text-sm",
                          idx === active ? "bg-muted" : "hover:bg-muted/70",
                        )}
                        onMouseEnter={() => setActive(idx)}
                        onMouseDown={(e) => {
                          // Prevent input blur before click selects.
                          e.preventDefault();
                        }}
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
