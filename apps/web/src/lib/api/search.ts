import {
  recentSearchesResponseSchema,
  relatedContentResponseSchema,
  searchSuggestResponseSchema,
  trendingSearchesResponseSchema,
  type VerseSearchResponse,
} from "@divine/types";
import { apiFetch } from "./client";
import { staticSearchVerses } from "@/lib/search/static-verse-search";

export type SearchVersesParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  topic?: string;
  lang?: string;
};

/** Server-side search — static index only (never blocks on Neon). */
export async function searchVerses(
  params: SearchVersesParams,
): Promise<VerseSearchResponse> {
  return staticSearchVerses(params);
}

export async function getTrendingSearches(limit = 8) {
  return apiFetch(
    {
      path: `/v1/search/trending?limit=${limit}`,
      next: { revalidate: 60 },
    },
    (json) => trendingSearchesResponseSchema.parse(json).data,
  );
}

export async function getRelatedContent(publicId: string) {
  return apiFetch(
    {
      path: `/v1/search/related/${encodeURIComponent(publicId)}`,
      next: { revalidate: 3600 },
    },
    (json) => relatedContentResponseSchema.parse(json).data,
  );
}

export async function suggestSearch(q: string, limit = 8) {
  return apiFetch(
    {
      path: `/v1/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`,
      next: { revalidate: 0 },
    },
    (json) => searchSuggestResponseSchema.parse(json).data,
  );
}

export async function getRecentSearches() {
  return apiFetch(
    { path: "/v1/search/recent", next: { revalidate: 0 } },
    (json) => recentSearchesResponseSchema.parse(json).data,
  );
}
