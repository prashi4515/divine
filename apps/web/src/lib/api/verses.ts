import {
  versesListResponseSchema,
  type Verse,
} from "@divine/types";
import { apiFetch } from "./client";

export type VerseIncludeMode = "reader" | "full";

/**
 * GET /v1/verses?chapterPublicId= — published verses for a chapter (RSC).
 * Default `reader` payload omits commentaries/word-meanings for fast first paint.
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
      next: { revalidate: 86_400 },
    },
    (json) => versesListResponseSchema.parse(json),
  );
  return {
    verses: result.data,
    languages: result.meta?.languages ?? [],
  };
}
