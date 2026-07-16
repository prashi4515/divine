"use client";

import { cn } from "@/lib/utils";

type VerseNumberGridProps = {
  verseNumbers: number[];
  currentNumber: number;
  onSelect: (number: number) => void;
  label: string;
  /** Compact sidebar layout (8 columns, scrollable). */
  compact?: boolean;
};

/**
 * Quick-jump grid of verse numbers (holy-bhagavad-gita style).
 */
export function VerseNumberGrid({
  verseNumbers,
  currentNumber,
  onSelect,
  label,
  compact = false,
}: VerseNumberGridProps) {
  return (
    <nav aria-label={label} className="space-y-3">
      <h3 className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
        {label}
      </h3>
      <ul
        className={cn(
          "grid gap-1.5",
          compact
            ? "max-h-[min(70vh,36rem)] grid-cols-8 overflow-y-auto pr-1"
            : "grid-cols-8 sm:grid-cols-10 md:grid-cols-12",
        )}
      >
        {verseNumbers.map((n) => {
          const active = n === currentNumber;
          return (
            <li key={n} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(n)}
                aria-current={active ? "true" : undefined}
                aria-label={`${label} ${n}`}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs tabular-nums transition-divine sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  active
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/50 text-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {n}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
