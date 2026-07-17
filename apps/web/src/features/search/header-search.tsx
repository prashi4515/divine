"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchSuggestion } from "@divine/types";
import { verseSearchService } from "@/lib/api/services/verse-search";
import { AutocompleteDropdown } from "./autocomplete-dropdown";

/**
 * Icon-first header search — expands only when opened; sits with other header actions.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [listOpen, setListOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!expanded) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [expanded]);

  React.useEffect(() => {
    if (!expanded) return;
    const q = value.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setListOpen(false);
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
          setListOpen(rows.length > 0);
          setActiveIndex(rows.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setListOpen(false);
          }
        });
    }, 100);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [value, expanded]);

  React.useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setListOpen(false);
        if (!value.trim()) setExpanded(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [value]);

  function collapse() {
    setExpanded(false);
    setListOpen(false);
    setValue("");
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function go(query: string) {
    const q = query.trim();
    if (!q) return;
    collapse();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function selectSuggestion(item: SearchSuggestion) {
    if (item.kind === "verse" && item.href) {
      collapse();
      router.push(item.href);
      return;
    }
    if (item.kind === "topic" && item.href) {
      collapse();
      router.push(item.href);
      return;
    }
    go(item.text);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        aria-label="Open search"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-divine"
        onClick={() => setExpanded(true)}
      >
        <Search className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <div ref={wrapRef} className="relative w-[min(16rem,70vw)] shrink-0 sm:w-64">
      <label htmlFor="divine-header-search" className="sr-only">
        Search the Bhagavad Gita
      </label>
      <div className="border-border bg-background flex items-center gap-1.5 rounded-md border px-2 py-1.5 shadow-xs">
        <Search className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          id="divine-header-search"
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls="divine-search-listbox"
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder="Search…"
          className="placeholder:text-muted-foreground/60 w-full min-w-0 bg-transparent text-sm outline-none"
          onChange={(e) => setValue(e.target.value)}
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
            if (e.key === "Enter") {
              e.preventDefault();
              if (listOpen && activeIndex >= 0 && suggestions[activeIndex]) {
                selectSuggestion(suggestions[activeIndex]!);
              } else {
                go(value);
              }
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              collapse();
            }
          }}
        />
        <button
          type="button"
          aria-label="Close search"
          className="text-muted-foreground hover:text-foreground rounded p-0.5"
          onClick={collapse}
        >
          <X className="size-3.5" />
        </button>
      </div>
      <AutocompleteDropdown
        query={value}
        suggestions={suggestions}
        open={listOpen}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={selectSuggestion}
      />
    </div>
  );
}
