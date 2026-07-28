import {
  verseDetailResponseSchema,
  type Verse,
  type VerseTranslation,
} from "@divine/types";
import { z } from "zod";

const gitaCommentaryResponseSchema = z.object({
  data: z.object({
    publicId: z.string(),
    commentary: z.string().nullable(),
    translations: z.array(
      z.object({
        id: z.string(),
        languageCode: z.string(),
        languageName: z.string(),
        sourceKey: z.string(),
        sourceDisplayName: z.string(),
        text: z.string(),
        isPublished: z.boolean(),
      }),
    ),
  }),
});

/**
 * Fetch commentary for a verse.
 * Gita verses (`bg.*`) use the local static snapshot API (instant, no Neon).
 * Other works fall back to the Nest API hydrate endpoint.
 */
export async function fetchPublishedVerseClient(
  publicId: string,
): Promise<Verse | null> {
  try {
    if (publicId.startsWith("bg.")) {
      const res = await fetch(
        `/api/gita/commentary/${encodeURIComponent(publicId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) return null;
      const json: unknown = await res.json();
      const parsed = gitaCommentaryResponseSchema.parse(json).data;
      return {
        id: "00000000-0000-4000-8000-000000000000",
        publicId: parsed.publicId,
        number: 1,
        sanskritText: "",
        transliteration: null,
        meaning: null,
        commentary: parsed.commentary,
        seoTitle: null,
        seoDescription: null,
        sortOrder: 0,
        isPublished: true,
        chapterPublicId: "",
        chapterNumber: 1,
        workCode: "bg",
        translations: parsed.translations,
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      };
    }

    const base = process.env.NEXT_PUBLIC_DIVINE_API_URL?.replace(/\/$/, "");
    if (!base) return null;

    const res = await fetch(
      `${base}/v1/verses/${encodeURIComponent(publicId)}?include=hydrate`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return verseDetailResponseSchema.parse(json).data;
  } catch {
    return null;
  }
}

/** Merge commentary / missing rows from a full verse into a slim list row. */
export function mergeVerseTranslations(
  slim: Verse,
  full: Verse,
): Verse {
  const keys = new Set(
    slim.translations.map((t) => `${t.languageCode}:${t.sourceKey}`),
  );
  const extras: VerseTranslation[] = [];
  for (const t of full.translations) {
    const key = `${t.languageCode}:${t.sourceKey}`;
    if (!keys.has(key)) {
      extras.push(t);
      keys.add(key);
    }
  }
  if (extras.length === 0 && (slim.commentary ?? null) === (full.commentary ?? null)) {
    return slim;
  }
  return {
    ...slim,
    commentary: slim.commentary ?? full.commentary,
    translations: [...slim.translations, ...extras],
  };
}

const VYAKHYA_KEYS = new Set([
  "ramsukhdas-vyakhya",
  "ramsukhdas-vyakhya-kn",
  "ramsukhdas-vyakhya-ta",
  "ramsukhdas-vyakhya-ml",
  "ramsukhdas-vyakhya-or",
  "holy-bg-telugu-vyakhya",
]);

/** Drop commentaries from the client verse list (loaded on demand, instantly). */
export function stripCommentariesForClient(verses: Verse[]): Verse[] {
  return verses.map((verse) => ({
    ...verse,
    commentary: null,
    translations: verse.translations.filter(
      (t) => !VYAKHYA_KEYS.has(t.sourceKey),
    ),
  }));
}
