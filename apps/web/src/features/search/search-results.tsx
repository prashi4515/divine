"use client";

import type { VerseSearchResult } from "@divine/types";
import { VerseResultCard } from "./verse-result-card";

type SearchResultsProps = {
  results: VerseSearchResult[];
  query: string;
  total: number;
  expandedTerms?: string[];
  onTermClick?: (term: string) => void;
};

export function SearchResults({
  results,
  query,
  total,
  expandedTerms,
  onTermClick,
}: SearchResultsProps) {
  if (!query && results.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Enter a word, feeling, or verse reference to begin.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        No verses matched “{query}”. Try a synonym (anger → krodha) or a topic.
      </p>
    );
  }

  const related = (expandedTerms ?? []).filter(
    (t) => t.trim().toLowerCase() !== query.trim().toLowerCase(),
  );

  return (
    <div>
      <div className="mb-3 space-y-2">
        <p className="text-muted-foreground text-xs">
          {total} result{total === 1 ? "" : "s"}
          {query ? (
            <>
              {" "}
              for <span className="text-foreground">“{query}”</span>
            </>
          ) : null}
        </p>
        {related.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-[11px]">Also:</span>
            {related.slice(0, 8).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onTermClick?.(term)}
                className="border-border/70 text-muted-foreground hover:border-foreground/30 hover:text-foreground rounded-md border px-2 py-0.5 text-[11px] transition-divine"
              >
                {term}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div>
        {results.map((result) => (
          <VerseResultCard
            key={result.publicId}
            result={result}
            query={query}
            expandedTerms={expandedTerms}
            onTermClick={onTermClick}
          />
        ))}
      </div>
    </div>
  );
}
