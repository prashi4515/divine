"use client";

type TrendingSearchesProps = {
  items: Array<{ query: string; hitCount: number }>;
  onSelect: (query: string) => void;
};

export function TrendingSearches({ items, onSelect }: TrendingSearchesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Trending searches">
      <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-[0.16em]">
        Trending
      </p>
      <ol className="space-y-1.5">
        {items.map((item, index) => (
          <li key={item.query}>
            <button
              type="button"
              onClick={() => onSelect(item.query)}
              className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-md px-1 py-1.5 text-left transition-divine"
            >
              <span className="text-muted-foreground w-4 text-xs tabular-nums">
                {index + 1}
              </span>
              <span className="flex-1 text-sm">{item.query}</span>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {item.hitCount}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
