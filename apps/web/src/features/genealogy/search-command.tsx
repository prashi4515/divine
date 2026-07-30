"use client";

import * as React from "react";
import { Search } from "lucide-react";
import type { Person } from "@/lib/genealogy/types";
import {
  CATEGORY_LABELS,
  CATEGORY_TOKENS,
  personSearchKeys,
} from "@/lib/genealogy/types";
import { cn } from "@/lib/utils";

/** Fold IAST diacritics so "Krsna" matches "Krsna". */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

const RECENT_KEY = "divine.genealogy.recent";

/**
 * Command palette scoped to the current module's people.
 * Keyboard: ⌘/Ctrl-K to open, arrows to move, Enter to select, Esc to close.
 * Recent searches stored per-browser in localStorage.
 */
export function SearchCommand({
  people,
  onSelect,
  moduleTitle,
}: {
  people: readonly Person[];
  onSelect: (id: string) => void;
  moduleTitle: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [recent, setRecent] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !isTypingElement(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recentPeople = recent
        .map((id) => people.find((p) => p.id === id))
        .filter((p): p is Person => Boolean(p));
      return recentPeople.length > 0 ? recentPeople : people.slice(0, 20);
    }
    const qFold = fold(q);
    const scored: Array<{ p: Person; score: number }> = [];
    for (const p of people) {
      let score = 0;
      const keys = personSearchKeys(p);
      for (const key of keys) {
        const k = fold(key);
        if (k === qFold) score += 6;
        else if (k.startsWith(qFold)) score += 4;
        else if (k.includes(qFold)) score += 3;
      }
      if (fold(p.englishName).includes(qFold)) score += 3;
      if (p.epithet && fold(p.epithet).includes(qFold)) score += 1;
      if (fold(p.description).includes(qFold)) score += 1;
      if (score > 0) scored.push({ p, score });
    }
    return scored.sort((a, b) => b.score - a.score).map((x) => x.p).slice(0, 30);
  }, [people, query, recent]);

  function commit(id: string) {
    const next = [id, ...recent.filter((r) => r !== id)].slice(0, 8);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    onSelect(id);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border bg-background/80 hover:border-saffron/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-divine"
        aria-label="Search people in this module"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span>Search {moduleTitle}</span>
        <kbd className="border-border/70 bg-background/60 ml-2 hidden rounded border px-1 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[10vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Search people"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-background border-border w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
            <div className="border-border/70 flex items-center gap-2 border-b px-3.5 py-2.5">
              <Search className="text-muted-foreground h-4 w-4" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search by name, Sanskrit, alias…"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const target = filtered[activeIndex];
                    if (target) commit(target.id);
                  }
                }}
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground text-[11px]"
              >
                Esc
              </button>
            </div>
            <ul
              className="max-h-[50vh] overflow-y-auto py-1"
              role="listbox"
              aria-activedescendant={
                filtered[activeIndex]
                  ? `search-item-${filtered[activeIndex].id}`
                  : undefined
              }
            >
              {filtered.length === 0 && (
                <li className="text-muted-foreground px-4 py-6 text-center text-xs">
                  No matches in this module.
                </li>
              )}
              {filtered.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    id={`search-item-${p.id}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => commit(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors",
                      i === activeIndex && "bg-muted/60",
                    )}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base leading-none"
                      style={{
                        background: CATEGORY_TOKENS[p.category].tint,
                        color: CATEGORY_TOKENS[p.category].accent,
                      }}
                      aria-hidden
                    >
                      {p.imagePlaceholder ?? "◈"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-sm font-medium">
                        {highlight(p.name, query)}
                      </span>
                      {p.sanskritName && (
                        <span
                          className="indic-display text-muted-foreground block truncate font-serif text-xs"
                          lang="sa"
                        >
                          {p.sanskritName}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: CATEGORY_TOKENS[p.category].accent }}
                    >
                      {CATEGORY_LABELS[p.category]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {!query && recent.length > 0 && (
              <p className="text-muted-foreground border-border/70 border-t px-3.5 py-2 text-[10px] uppercase tracking-wider">
                Recent searches
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-saffron/25 text-foreground rounded-sm px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}
