"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KNOWLEDGE_SEARCH_GROUPS,
  type KnowledgeSearchGroup,
  type KnowledgeSearchGroupBucket,
} from "@divine/types";
import {
  pushLocalRecentSearch,
  readLocalRecentSearches,
  verseSearchService,
} from "@/lib/api/services/verse-search";
import { KnowledgeSearchResults } from "./knowledge-search-results";
import { RecentSearches } from "./recent-searches";
import { SearchFilters } from "./search-filters";
import { SearchHero } from "./search-hero";

function parseGroup(raw: string | null | undefined): KnowledgeSearchGroup | undefined {
  if (!raw) return undefined;
  return (KNOWLEDGE_SEARCH_GROUPS as readonly string[]).includes(raw)
    ? (raw as KnowledgeSearchGroup)
    : undefined;
}

type SearchPageClientProps = {
  initialQuery: string;
  initialGroup?: KnowledgeSearchGroup;
};

/**
 * Global Knowledge Search. URL is source of truth; results come from the
 * build-time static index via `/api/search/knowledge` (no Neon).
 */
export function SearchPageClient({
  initialQuery,
  initialGroup,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groups, setGroups] = React.useState<KnowledgeSearchGroupBucket[]>([]);
  const [total, setTotal] = React.useState(0);
  const [tookMs, setTookMs] = React.useState<number | undefined>();
  const [recent, setRecent] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(Boolean(initialQuery.trim()));
  const requestIdRef = React.useRef(0);

  const query = searchParams.get("q") ?? initialQuery;
  const group = parseGroup(searchParams.get("group")) ?? initialGroup;

  React.useEffect(() => {
    setRecent(readLocalRecentSearches(6));
  }, [query]);

  React.useEffect(() => {
    if (!query.trim()) {
      setGroups([]);
      setTotal(0);
      setTookMs(undefined);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    void verseSearchService
      .knowledgeSearch({
        q: query.trim(),
        group,
        perGroup: group ? 24 : 8,
      })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setGroups(res.data.groups);
        setTotal(res.data.total);
        setTookMs(res.meta.tookMs);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setGroups([]);
        setTotal(0);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [query, group]);

  function buildHref(next: {
    q?: string;
    group?: KnowledgeSearchGroup | null;
  }) {
    const params = new URLSearchParams();
    const q = next.q !== undefined ? next.q : query;
    const g =
      next.group === undefined
        ? group
        : next.group === null
          ? undefined
          : next.group;
    if (q) params.set("q", q);
    if (g) params.set("group", g);
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  function runSearch(opts: {
    q?: string;
    group?: KnowledgeSearchGroup | null;
    record?: boolean;
  }) {
    const q = (opts.q !== undefined ? opts.q : query).trim();
    const href = buildHref({
      q,
      group: opts.group === undefined ? group : opts.group,
    });

    if (opts.record !== false && q) {
      pushLocalRecentSearch(q);
      setRecent(readLocalRecentSearches(6));
      void verseSearchService.record(q, total).catch(() => undefined);
    }

    router.push(href);
  }

  return (
    <div className="mx-auto grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-12">
      <div className="min-w-0">
        <header className="mb-6">
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
            Knowledge Search
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            People, places, events, kingdoms, weapons, concepts, genealogy,
            atlas, and verses — aliases, Sanskrit, and fuzzy matching.
          </p>
        </header>

        <SearchHero
          initialQuery={query}
          onSubmit={(q) => runSearch({ q, record: true })}
        />

        {query ? (
          <p className="text-muted-foreground mb-4 text-sm">
            Results for <span className="text-foreground">“{query}”</span>
          </p>
        ) : null}

        <div className="mb-5 lg:hidden">
          <SearchFilters
            group={group}
            onGroupChange={(g) =>
              runSearch({ group: g ?? null, record: false })
            }
          />
        </div>

        <div aria-busy={loading}>
          {loading && groups.length === 0 ? (
            <div className="space-y-4 py-2" aria-hidden>
              <p className="text-muted-foreground text-xs">Searching…</p>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-muted/60 h-28 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <KnowledgeSearchResults
              groups={groups}
              query={query}
              total={total}
              tookMs={tookMs}
            />
          )}
        </div>
      </div>

      <aside className="hidden space-y-6 lg:block">
        <SearchFilters
          group={group}
          onGroupChange={(g) => runSearch({ group: g ?? null, record: false })}
        />
        <RecentSearches
          items={recent}
          onSelect={(q) => runSearch({ q, record: true })}
        />
      </aside>
    </div>
  );
}
