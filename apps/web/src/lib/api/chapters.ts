import {
  chapterDetailResponseSchema,
  chaptersListResponseSchema,
  type Chapter,
} from "@divine/types";
import { apiFetch } from "./client";

/**
 * GET /v1/chapters — published chapters ordered by sortOrder.
 */
export async function getPublishedChapters(): Promise<Chapter[]> {
  const result = await apiFetch(
    {
      path: "/v1/chapters",
      next: { revalidate: 60 },
    },
    (json) => chaptersListResponseSchema.parse(json),
  );
  return result.data;
}

/**
 * GET /v1/chapters/:publicId — one published chapter.
 */
export async function getPublishedChapter(publicId: string): Promise<Chapter> {
  const encoded = encodeURIComponent(publicId);
  const result = await apiFetch(
    {
      path: `/v1/chapters/${encoded}`,
      next: { revalidate: 60 },
    },
    (json) => chapterDetailResponseSchema.parse(json),
  );
  return result.data;
}
