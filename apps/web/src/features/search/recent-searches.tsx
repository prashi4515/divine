"use client";

type RecentSearchesProps = {
  items: string[];
  onSelect: (query: string) => void;
};

export function RecentSearches({ items, onSelect }: RecentSearchesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Recent searches">
      <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-[0.16em]">
        Recent
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onSelect(q)}
              className="text-muted-foreground hover:text-foreground border-border/70 rounded-md border px-2.5 py-1 text-xs transition-divine"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
