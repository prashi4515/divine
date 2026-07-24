import {
  verseDetailResponseSchema,
  type Verse,
  type VerseTranslation,
} from "@divine/types";

/**
 * Fetch a single published verse (includes commentaries) for client-side
 * hydration after the slim chapter list has already painted.
 */
export async function fetchPublishedVerseClient(
  publicId: string,
): Promise<Verse | null> {
  const base = process.env.NEXT_PUBLIC_DIVINE_API_URL?.replace(/\/$/, "");
  if (!base) return null;

  try {
    const res = await fetch(
      `${base}/v1/verses/${encodeURIComponent(publicId)}`,
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
  if (extras.length === 0) return slim;
  return {
    ...slim,
    commentary: slim.commentary ?? full.commentary,
    translations: [...slim.translations, ...extras],
  };
}
