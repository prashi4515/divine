import {
  recentSearchesResponseSchema,
  searchSuggestResponseSchema,
  trendingSearchesResponseSchema,
  verseSearchResponseSchema,
  type SearchSuggestion,
  type VerseSearchResponse,
} from "@divine/types";
import { http } from "../http";

const SESSION_KEY = "divine_search_session";
const LOCAL_RECENT_KEY = "divine_recent_searches";

export function getSearchSessionKey(): string {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(SESSION_KEY);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}`;
    window.localStorage.setItem(SESSION_KEY, key);
  }
  return key;
}

function sessionHeaders(): Record<string, string> {
  const key = getSearchSessionKey();
  return key ? { "X-Search-Session": key } : {};
}

export function readLocalRecentSearches(limit = 8): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, limit);
  } catch {
    return [];
  }
}

export function pushLocalRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const q = query.trim();
  if (!q) return;
  const prev = readLocalRecentSearches(20).filter(
    (x) => x.toLowerCase() !== q.toLowerCase(),
  );
  window.localStorage.setItem(
    LOCAL_RECENT_KEY,
    JSON.stringify([q, ...prev].slice(0, 20)),
  );
}

export const verseSearchService = {
  search(params: {
    q?: string;
    page?: number;
    pageSize?: number;
    topic?: string;
    lang?: string;
  }): Promise<VerseSearchResponse> {
    return http("/v1/search/verses", (json) => verseSearchResponseSchema.parse(json), {
      auth: false,
      query: {
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        topic: params.topic,
        lang: params.lang,
      },
    });
  },

  suggest(q: string, limit = 8): Promise<SearchSuggestion[]> {
    return http(
      "/v1/search/suggest",
      (json) => searchSuggestResponseSchema.parse(json).data,
      { auth: false, query: { q, limit } },
    );
  },

  trending(limit = 8) {
    return http(
      "/v1/search/trending",
      (json) => trendingSearchesResponseSchema.parse(json).data,
      { auth: false, query: { limit } },
    );
  },

  recent(limit = 8) {
    return http(
      "/v1/search/recent",
      (json) => recentSearchesResponseSchema.parse(json).data,
      {
        auth: true,
        query: { limit },
        headers: sessionHeaders(),
      },
    );
  },

  record(query: string, resultCount: number): Promise<void> {
    pushLocalRecentSearch(query);
    return http("/v1/search/history", () => undefined, {
      method: "POST",
      auth: true,
      headers: sessionHeaders(),
      body: { query, resultCount },
    }).then(() => undefined);
  },
};
