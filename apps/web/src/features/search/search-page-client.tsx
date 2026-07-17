"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { VerseSearchResult } from "@divine/types";
import {
  readLocalRecentSearches,
  verseSearchService,
} from "@/lib/api/services/verse-search";
import { RecentSearches } from "./recent-searches";
import { SearchBar } from "./search-bar";
import { SearchFilters } from "./search-filters";
import { SearchResults } from "./search-results";
import { TrendingSearches } from "./trending-searches";

type SearchPageClientProps = {
  initialQuery: string;
  initialTopic?: string;
  initialLang: string;
  initialResults: VerseSearchResult[];
  initialTotal: number;
  initialExpanded: string[];
  initialPage: number;
  initialTotalPages: number;
  initialTrending: Array<{ query: string; hitCount: number }>;
};

export function SearchPageClient({
  initialQuery,
  initialTopic,
  initialLang,
  initialResults,
  initialTotal,
  initialExpanded,
  initialPage,
  initialTotalPages,
  initialTrending,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = React.useState(initialResults);
  const [total, setTotal] = React.useState(initialTotal);
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const [page, setPage] = React.useState(initialPage);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [loading, setLoading] = React.useState(false);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [trending, setTrending] = React.useState(initialTrending);

  const query = searchParams.get("q") ?? initialQuery;
  const topic = searchParams.get("topic") ?? initialTopic;
  const lang = searchParams.get("lang") ?? initialLang;
  const pageFromUrl = Number(searchParams.get("page") || "1") || 1;

  React.useEffect(() => {
    setResults(initialResults);
    setTotal(initialTotal);
    setExpanded(initialExpanded);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
  }, [
    initialResults,
    initialTotal,
    initialExpanded,
    initialPage,
    initialTotalPages,
  ]);

  React.useEffect(() => {
    setRecent(readLocalRecentSearches(8));
    void verseSearchService
      .recent(8)
      .then((rows) => {
        if (rows.length > 0) setRecent(rows.map((r) => r.query));
      })
      .catch(() => undefined);
    void verseSearchService
      .trending(8)
      .then(setTrending)
      .catch(() => undefined);
  }, []);

  function buildHref(next: {
    q?: string;
    topic?: string | null;
    lang?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const q = next.q !== undefined ? next.q : query;
    const t =
      next.topic === undefined ? topic : next.topic === null ? undefined : next.topic;
    const l = next.lang ?? lang;
    const p = next.page ?? 1;
    if (q) params.set("q", q);
    if (t) params.set("topic", t);
    if (l && l !== "en") params.set("lang", l);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  async function runSearch(opts: {
    q?: string;
    topic?: string | null;
    lang?: string;
    page?: number;
    record?: boolean;
  }) {
    const q = opts.q !== undefined ? opts.q : query;
    const t =
      opts.topic === undefined
        ? topic
        : opts.topic === null
          ? undefined
          : opts.topic;
    const l = opts.lang ?? lang;
    const p = opts.page ?? 1;

    router.push(
      buildHref({
        q,
        topic: opts.topic === undefined ? topic : opts.topic,
        lang: l,
        page: p,
      }),
    );

    if (!q && !t) {
      setResults([]);
      setTotal(0);
      setExpanded([]);
      setPage(1);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    try {
      const res = await verseSearchService.search({
        q: q || undefined,
        topic: t,
        lang: l,
        page: p,
        pageSize: 20,
      });
      setResults(res.data);
      setTotal(res.meta.total);
      setExpanded(res.meta.expandedTerms);
      setPage(res.meta.page);
      setTotalPages(res.meta.totalPages);
      if (opts.record !== false && q) {
        void verseSearchService.record(q, res.meta.total);
        setRecent(readLocalRecentSearches(8));
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // Keep results in sync when URL page/topic/lang change via browser back/forward
  React.useEffect(() => {
    if (
      pageFromUrl === initialPage &&
      (searchParams.get("q") ?? "") === initialQuery &&
      (searchParams.get("topic") ?? undefined) === initialTopic &&
      (searchParams.get("lang") ?? "en") === initialLang
    ) {
      return;
    }
    // Soft sync from SSR when available; otherwise client fetch fills gaps
  }, [
    pageFromUrl,
    initialPage,
    initialQuery,
    initialTopic,
    initialLang,
    searchParams,
  ]);

  return (
    <div className="mx-auto grid w-full max-w-content gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0">
        <header className="mb-6 md:mb-8">
          <p className="text-muted-foreground text-[11px] uppercase tracking-[0.18em]">
            Search
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
            Bhagavad Gita
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
            Find verses by meaning, transliteration, commentary, or theme —
            tolerant of spelling variants and synonyms.
          </p>
        </header>

        <SearchBar
          initialQuery={query}
          onSubmit={(q) => void runSearch({ q, page: 1, record: true })}
          autoFocus
        />

        <div className="mt-6 lg:hidden">
          <SearchFilters
            topic={topic}
            lang={lang}
            onTopicChange={(t) =>
              void runSearch({ topic: t ?? null, page: 1, record: false })
            }
            onLangChange={(l) =>
              void runSearch({ lang: l, page: 1, record: false })
            }
          />
        </div>

        <div className="mt-8" aria-busy={loading}>
          {loading ? (
            <p className="text-muted-foreground mb-3 text-xs">Updating…</p>
          ) : null}
          <SearchResults
            results={results}
            query={query || (topic ? `topic:${topic}` : "")}
            total={total}
            expandedTerms={expanded}
            onTermClick={(term) =>
              void runSearch({ q: term, page: 1, record: true })
            }
          />
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
              onClick={() => void runSearch({ page: page - 1, record: false })}
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
              onClick={() => void runSearch({ page: page + 1, record: false })}
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>

      <aside className="space-y-8 lg:pt-28">
        <div className="hidden lg:block">
          <SearchFilters
            topic={topic}
            lang={lang}
            onTopicChange={(t) =>
              void runSearch({ topic: t ?? null, page: 1, record: false })
            }
            onLangChange={(l) =>
              void runSearch({ lang: l, page: 1, record: false })
            }
          />
        </div>
        <RecentSearches
          items={recent}
          onSelect={(q) => void runSearch({ q, page: 1, record: true })}
        />
        <TrendingSearches
          items={trending}
          onSelect={(q) => void runSearch({ q, page: 1, record: true })}
        />
      </aside>
    </div>
  );
}
