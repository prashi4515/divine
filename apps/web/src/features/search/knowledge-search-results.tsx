"use client";

import type { KnowledgeSearchGroupBucket } from "@divine/types";
import { KnowledgeResultCard } from "./knowledge-result-card";

type KnowledgeSearchResultsProps = {
  groups: KnowledgeSearchGroupBucket[];
  query: string;
  total: number;
  tookMs?: number;
};

export function KnowledgeSearchResults({
  groups,
  query,
  total,
  tookMs,
}: KnowledgeSearchResultsProps) {
  if (!query) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Search people, places, events, kingdoms, weapons, concepts, genealogy,
        atlas, and verses.
      </p>
    );
  }

  if (groups.length === 0 || total === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        No matches for “{query}”. Try an alias, Sanskrit spelling, or a shorter
        word.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-muted-foreground text-xs">
        {total} result{total === 1 ? "" : "s"}
        {tookMs !== undefined ? (
          <span className="text-muted-foreground/70"> · {tookMs}ms</span>
        ) : null}
      </p>

      {groups.map((bucket) => (
        <section key={bucket.group} aria-labelledby={`search-group-${bucket.group}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2
              id={`search-group-${bucket.group}`}
              className="font-serif text-xl tracking-tight md:text-2xl"
            >
              {bucket.label}
            </h2>
            <span className="text-muted-foreground text-xs tabular-nums">
              {bucket.total}
              {bucket.total > bucket.hits.length
                ? ` · showing ${bucket.hits.length}`
                : ""}
            </span>
          </div>
          <div>
            {bucket.hits.map((hit) => (
              <KnowledgeResultCard key={hit.id} hit={hit} query={query} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
