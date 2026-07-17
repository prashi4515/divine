import {
  recentSearchesResponseSchema,
  relatedContentResponseSchema,
  searchSuggestResponseSchema,
  trendingSearchesResponseSchema,
  verseSearchResponseSchema,
  type VerseSearchResponse,
} from "@divine/types";
import { apiFetch } from "./client";

export type SearchVersesParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  topic?: string;
  lang?: string;
};

export async function searchVerses(
  params: SearchVersesParams,
): Promise<VerseSearchResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.topic) qs.set("topic", params.topic);
  if (params.lang) qs.set("lang", params.lang);
  const path = `/v1/search/verses?${qs.toString()}`;
  return apiFetch({ path, next: { revalidate: 0 } }, (json) =>
    verseSearchResponseSchema.parse(json),
  );
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
