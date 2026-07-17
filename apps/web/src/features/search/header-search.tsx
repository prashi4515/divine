"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchSuggestion } from "@divine/types";
import { verseSearchService } from "@/lib/api/services/verse-search";
import { AutocompleteDropdown } from "./autocomplete-dropdown";

/**
 * Compact Google-style search field for the global site header.
 * Submits to /search?q=… so results stay on the dedicated results page.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const q = value.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void verseSearchService
        .suggest(q, 8)
        .then((rows) => {
          if (cancelled) return;
          setSuggestions(rows);
          setOpen(rows.length > 0);
          setActiveIndex(rows.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setOpen(false);
          }
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [value]);

  React.useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function go(query: string) {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setValue("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function selectSuggestion(item: SearchSuggestion) {
    if (item.kind === "verse" && item.href) {
      setOpen(false);
      setValue("");
      router.push(item.href);
      return;
    }
    if (item.kind === "topic" && item.href) {
      setOpen(false);
      setValue("");
      router.push(item.href);
      return;
    }
    go(item.text);
  }

  const ghost =
    open &&
    activeIndex >= 0 &&
    suggestions[activeIndex] &&
    suggestions[activeIndex]!.text
      .toLowerCase()
      .startsWith(value.trim().toLowerCase()) &&
    value.trim().length > 0
      ? suggestions[activeIndex]!.text
      : "";

  return (
    <div ref={wrapRef} className="relative w-full min-w-0 max-w-md flex-1">
      <label htmlFor="divine-header-search" className="sr-only">
        Search the Bhagavad Gita
      </label>
      <div className="border-border bg-background/90 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 shadow-xs">
        <Search className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
        <div className="relative min-w-0 flex-1">
          {ghost ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 truncate text-xs md:text-sm"
            >
              <span className="invisible whitespace-pre">{value}</span>
              <span className="text-muted-foreground/40">
                {ghost.slice(value.length)}
              </span>
            </div>
          ) : null}
          <input
            ref={inputRef}
            id="divine-header-search"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="divine-search-listbox"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={value}
            placeholder="Search verses, topics…"
            className="placeholder:text-muted-foreground/60 relative w-full bg-transparent text-xs outline-none md:text-sm"
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) =>
                  suggestions.length === 0
                    ? -1
                    : Math.min(i + 1, suggestions.length - 1),
                );
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === "Tab" && ghost) {
                e.preventDefault();
                setValue(ghost);
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (open && activeIndex >= 0 && suggestions[activeIndex]) {
                  selectSuggestion(suggestions[activeIndex]!);
                } else {
                  go(value);
                }
                return;
              }
              if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
          />
        </div>
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground rounded p-0.5"
            onClick={() => {
              setValue("");
              setSuggestions([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>
      <AutocompleteDropdown
        query={value}
        suggestions={suggestions}
        open={open}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={selectSuggestion}
      />
    </div>
  );
}
