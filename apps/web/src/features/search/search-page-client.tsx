"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { VerseSearchResult } from "@divine/types";
import {
  pushLocalRecentSearch,
  readLocalRecentSearches,
  verseSearchService,
} from "@/lib/api/services/verse-search";
import { RecentSearches } from "./recent-searches";
import { SearchFilters } from "./search-filters";
import { SearchHero } from "./search-hero";
import { SearchResults } from "./search-results";

type SearchPageClientProps = {
  initialQuery: string;
  initialTopic?: string;
  initialLang: string;
  initialResults: VerseSearchResult[];
  initialTotal: number;
  initialExpanded: string[];
  initialPage: number;
  initialTotalPages: number;
  initialTrending?: Array<{ query: string; hitCount: number }>;
};

/**
 * Search UI. URL is the source of truth; each change hits the Next.js static
 * index (`/api/search/verses`) so new keywords resolve in milliseconds.
 */
export function SearchPageClient({
  initialQuery,
  initialTopic,
  initialLang,
  initialResults,
  initialTotal,
  initialExpanded,
  initialPage,
  initialTotalPages,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = React.useState(initialResults);
  const [total, setTotal] = React.useState(initialTotal);
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const [page, setPage] = React.useState(initialPage);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(
    Boolean(initialQuery.trim() || initialTopic),
  );
  const requestIdRef = React.useRef(0);

  const query = searchParams.get("q") ?? initialQuery;
  const topic = searchParams.get("topic") ?? initialTopic;
  const lang = searchParams.get("lang") ?? initialLang;
  const pageParam = Number(searchParams.get("page") || 1) || 1;

  React.useEffect(() => {
    setRecent(readLocalRecentSearches(6));
  }, [query]);

  // Fetch on mount and whenever the URL changes (static index — typically <300ms).
  React.useEffect(() => {
    if (!query.trim() && !topic) {
      setResults([]);
      setTotal(0);
      setExpanded([]);
      setPage(1);
      setTotalPages(0);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    void verseSearchService
      .search({
        q: query.trim() || undefined,
        topic,
        lang,
        page: pageParam,
        pageSize: 20,
      })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setResults(res.data);
        setTotal(res.meta.total);
        setExpanded(res.meta.expandedTerms);
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [query, topic, lang, pageParam]);

  function buildHref(next: {
    q?: string;
    topic?: string | null;
    lang?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const q = next.q !== undefined ? next.q : query;
    const t =
      next.topic === undefined
        ? topic
        : next.topic === null
          ? undefined
          : next.topic;
    const l = next.lang ?? lang;
    const p = next.page ?? 1;
    if (q) params.set("q", q);
    if (t) params.set("topic", t);
    if (l && l !== "en") params.set("lang", l);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  function runSearch(opts: {
    q?: string;
    topic?: string | null;
    lang?: string;
    page?: number;
    record?: boolean;
  }) {
    const q = (opts.q !== undefined ? opts.q : query).trim();
    const href = buildHref({
      q,
      topic: opts.topic === undefined ? topic : opts.topic,
      lang: opts.lang ?? lang,
      page: opts.page ?? 1,
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
            Search the Bhagavad Gita
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Sanskrit, English, Telugu, Hindi, commentary and topics — press
            Enter or tap Search.
          </p>
        </header>

        <SearchHero
          initialQuery={query}
          onSubmit={(q) => runSearch({ q, page: 1, record: true })}
        />

        {query ? (
          <p className="text-muted-foreground mb-4 text-sm">
            Results for <span className="text-foreground">“{query}”</span>
          </p>
        ) : null}

        <div className="mb-5 lg:hidden">
          <SearchFilters
            topic={topic}
            lang={lang}
            onTopicChange={(t) =>
              runSearch({ topic: t ?? null, page: 1, record: false })
            }
            onLangChange={(l) =>
              runSearch({ lang: l, page: 1, record: false })
            }
          />
        </div>

        <div aria-busy={loading}>
          {loading && results.length === 0 ? (
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
            <SearchResults
              results={results}
              query={query || (topic ? `topic:${topic}` : "")}
              total={total}
              expandedTerms={expanded}
              onTermClick={(term) =>
                runSearch({ q: term, page: 1, record: true })
              }
            />
          )}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-8 flex items-center justify-between gap-4 text-sm"
            aria-label="Search pagination"
          >
            <button
              type="button"
              disabled={page <= 1 || loading}
              className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => runSearch({ page: page - 1, record: false })}
            >
              Previous
            </button>
            <span className="text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              onClick={() => runSearch({ page: page + 1, record: false })}
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>

      <aside className="hidden space-y-6 lg:block">
        <SearchFilters
          topic={topic}
          lang={lang}
          onTopicChange={(t) =>
            runSearch({ topic: t ?? null, page: 1, record: false })
          }
          onLangChange={(l) => runSearch({ lang: l, page: 1, record: false })}
        />
        <RecentSearches
          items={recent}
          onSelect={(q) => runSearch({ q, page: 1, record: true })}
        />
      </aside>
    </div>
  );
}
