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
    // Prefer the Next.js static index (ms) over Nest/Neon (multi-second).
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params.topic) qs.set("topic", params.topic);
    if (params.lang) qs.set("lang", params.lang);
    return fetch(`/api/search/verses?${qs.toString()}`, {
      headers: { Accept: "application/json" },
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Search failed (${res.status})`);
      }
      const json: unknown = await res.json();
      return verseSearchResponseSchema.parse(json);
    });
  },

  suggest(q: string, limit = 8): Promise<SearchSuggestion[]> {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    return fetch(`/api/search/suggest?${qs.toString()}`, {
      headers: { Accept: "application/json" },
    }).then(async (res) => {
      if (!res.ok) return [];
      const json: unknown = await res.json();
      return searchSuggestResponseSchema.parse(json).data;
    });
  },

  trending(limit = 8) {
    return http(
      "/v1/search/trending",
      (json) => trendingSearchesResponseSchema.parse(json).data,
      { auth: false, query: { limit } },
    ).catch(() => []);
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
    ).catch(() => []);
  },

  record(query: string, resultCount: number): Promise<void> {
    pushLocalRecentSearch(query);
    return http("/v1/search/history", () => undefined, {
      method: "POST",
      auth: true,
      headers: sessionHeaders(),
      body: { query, resultCount },
    })
      .then(() => undefined)
      .catch(() => undefined);
  },
};
