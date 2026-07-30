"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { SearchSuggestion } from "@divine/types";
import { verseSearchService } from "@/lib/api/services/verse-search";
import { AutocompleteDropdown } from "./autocomplete-dropdown";

type SearchBarProps = {
  initialQuery?: string;
  onSubmit: (query: string) => void;
  autoFocus?: boolean;
  /**
   * Notified on every keystroke — lets a parent (e.g. the search page's
   * hero "Search" button) submit the current draft without waiting for
   * Enter. Optional; existing callers don't need to change.
   */
  onDraftChange?: (value: string) => void;
};

export function SearchBar({
  initialQuery = "",
  onSubmit,
  autoFocus,
  onDraftChange,
}: SearchBarProps) {
  const [value, setValue] = React.useState(initialQuery);
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  // Google-style predict: fetch as you type
  React.useEffect(() => {
    const q = value.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(() => {
      void verseSearchService
        .suggest(q, 10)
        .then((rows) => {
          if (cancelled) return;
          setSuggestions(rows);
          setOpen(rows.length > 0);
          // Do not auto-highlight — Enter submits the typed query to /search.
          setActiveIndex(-1);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setOpen(false);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [value]);

  React.useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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

  function submit(next?: string) {
    const q = (next ?? value).trim();
    setOpen(false);
    setActiveIndex(-1);
    if (!q) return;
    onSubmit(q);
  }

  function selectSuggestion(item: SearchSuggestion) {
    // Always land on the search results page — never deep-link a single verse.
    if (item.kind === "topic" && item.href) {
      setOpen(false);
      window.location.href = item.href;
      return;
    }
    setValue(item.kind === "verse" ? value : item.text);
    submit(item.kind === "verse" ? value.trim() || item.text : item.text);
  }

  return (
    <div ref={wrapRef} className="relative z-40 w-full">
      <label htmlFor="divine-search" className="sr-only">
        Knowledge Search
      </label>
      <div className="border-border bg-background flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-sm md:px-4 md:py-3">
        <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <div className="relative min-w-0 flex-1">
          {/* Ghost completion (Google-style) */}
          {ghost ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 truncate text-sm md:text-[15px]"
            >
              <span className="invisible whitespace-pre">{value}</span>
              <span className="text-muted-foreground/45">
                {ghost.slice(value.length)}
              </span>
            </div>
          ) : null}
          <input
            ref={inputRef}
            id="divine-search"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="divine-search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `divine-suggest-${activeIndex}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              onDraftChange?.(e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!open && suggestions.length > 0) {
                  setOpen(true);
                  setActiveIndex(0);
                  return;
                }
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
                if (
                  open &&
                  activeIndex >= 0 &&
                  suggestions[activeIndex]?.kind === "topic"
                ) {
                  selectSuggestion(suggestions[activeIndex]!);
                } else if (
                  open &&
                  activeIndex >= 0 &&
                  suggestions[activeIndex] &&
                  suggestions[activeIndex]!.kind !== "verse"
                ) {
                  selectSuggestion(suggestions[activeIndex]!);
                } else {
                  submit();
                }
                return;
              }
              if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
            placeholder="People, places, events, verses, concepts…"
            className="placeholder:text-muted-foreground/70 relative w-full bg-transparent text-sm outline-none md:text-[15px]"
          />
        </div>
        {loading ? (
          <span className="text-muted-foreground text-[10px] tracking-wide">
            …
          </span>
        ) : null}
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground rounded-md p-1"
            onClick={() => {
              setValue("");
              setSuggestions([]);
              setOpen(false);
              onDraftChange?.("");
              inputRef.current?.focus();
            }}
          >
            <X className="size-3.5" />
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
