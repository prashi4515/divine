import {
  versesListResponseSchema,
  type Verse,
} from "@divine/types";
import { apiFetch } from "./client";

/**
 * GET /v1/verses?chapterPublicId= — published verses for a chapter (RSC).
 */
export async function getPublishedVerses(chapterPublicId: string): Promise<{
  verses: Verse[];
  languages: Array<{ code: string; name: string; nativeName: string | null }>;
}> {
  const result = await apiFetch(
    {
      path: `/v1/verses?chapterPublicId=${encodeURIComponent(chapterPublicId)}`,
      next: { revalidate: 0 },
    },
    (json) => versesListResponseSchema.parse(json),
  );
  return {
    verses: result.data,
    languages: result.meta?.languages ?? [],
  };
}
