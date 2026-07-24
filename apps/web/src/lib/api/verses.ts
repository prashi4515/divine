import {
  versesListResponseSchema,
  type Verse,
} from "@divine/types";
import { apiFetch } from "./client";

export type VerseIncludeMode = "reader" | "full";

/**
 * GET /v1/verses?chapterPublicId= — published verses for a chapter (RSC).
 * `reader` scopes to en/hi/te/or native sources (kn/ta/ml derived client-side).
 * `full` returns every published language/source.
 */
export async function getPublishedVerses(
  chapterPublicId: string,
  include: VerseIncludeMode = "reader",
): Promise<{
  verses: Verse[];
  languages: Array<{ code: string; name: string; nativeName: string | null }>;
}> {
  const result = await apiFetch(
    {
      path: `/v1/verses?chapterPublicId=${encodeURIComponent(chapterPublicId)}&include=${include}`,
      next: { revalidate: 3_600 },
    },
    (json) => versesListResponseSchema.parse(json),
  );
  return {
    verses: result.data,
    languages: result.meta?.languages ?? [],
  };
}
