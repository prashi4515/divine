"use client";

import type { SearchSuggestion } from "@divine/types";

type AutocompleteDropdownProps = {
  query: string;
  suggestions: SearchSuggestion[];
  open: boolean;
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: SearchSuggestion) => void;
};

const KIND_LABEL: Record<SearchSuggestion["kind"], string> = {
  query: "Search",
  topic: "Topic",
  verse: "Verse",
  synonym: "Related",
};

function renderMatchedLabel(text: string, query: string) {
  const q = query.trim();
  if (!q) return <span className="truncate text-sm">{text}</span>;

  const lower = text.toLowerCase();
  const qi = lower.indexOf(q.toLowerCase());
  if (qi < 0) {
    return <span className="truncate text-sm">{text}</span>;
  }

  const before = text.slice(0, qi);
  const match = text.slice(qi, qi + q.length);
  const after = text.slice(qi + q.length);

  return (
    <span className="truncate text-sm">
      {before}
      <span className="text-foreground font-semibold">{match}</span>
      {after}
    </span>
  );
}

export function AutocompleteDropdown({
  query,
  suggestions,
  open,
  activeIndex,
  onHover,
  onSelect,
}: AutocompleteDropdownProps) {
  if (!open || suggestions.length === 0) return null;

  return (
    <ul
      id="divine-search-listbox"
      role="listbox"
      className="border-border bg-background absolute inset-x-0 top-[calc(100%+0.4rem)] z-50 max-h-80 overflow-auto rounded-xl border shadow-md"
    >
      {suggestions.map((item, index) => {
        const active = index === activeIndex;
        return (
          <li
            id={`divine-suggest-${index}`}
            key={`${item.kind}-${item.text}-${index}`}
            role="option"
            aria-selected={active}
          >
            <button
              type="button"
              className={[
                "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                active ? "bg-muted" : "hover:bg-muted/70",
              ].join(" ")}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(e) => {
                // Prevent input blur before click registers
                e.preventDefault();
              }}
              onClick={() => onSelect(item)}
            >
              <span className="text-muted-foreground w-[3.25rem] shrink-0 text-[10px] uppercase tracking-wider">
                {KIND_LABEL[item.kind]}
              </span>
              {renderMatchedLabel(item.text, query)}
              {item.kind === "synonym" ? (
                <span className="text-muted-foreground ml-auto shrink-0 text-[10px]">
                  synonym
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
