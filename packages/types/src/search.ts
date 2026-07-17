import { z } from "zod";

export const searchTopicChipSchema = z.object({
  slug: z.string(),
  name: z.string(),
});
export type SearchTopicChip = z.infer<typeof searchTopicChipSchema>;

export const verseSearchResultSchema = z.object({
  publicId: z.string(),
  chapterNumber: z.number().int().positive(),
  verseNumber: z.number().int().positive(),
  href: z.string(),
  sanskrit: z.string(),
  transliteration: z.string().nullable(),
  translation: z.string().nullable(),
  preview: z.string(),
  matchedKeywords: z.array(z.string()),
  topics: z.array(searchTopicChipSchema),
  score: z.number(),
  languageCode: z.string().nullable(),
});
export type VerseSearchResult = z.infer<typeof verseSearchResultSchema>;

export const verseSearchResponseSchema = z.object({
  data: z.array(verseSearchResultSchema),
  meta: z.object({
    query: z.string(),
    expandedTerms: z.array(z.string()),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});
export type VerseSearchResponse = z.infer<typeof verseSearchResponseSchema>;

export const searchSuggestionSchema = z.object({
  text: z.string(),
  kind: z.enum(["query", "topic", "verse", "synonym"]),
  href: z.string().nullable(),
});
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;

export const searchSuggestResponseSchema = z.object({
  data: z.array(searchSuggestionSchema),
});

export const relatedVerseSchema = z.object({
  publicId: z.string(),
  href: z.string(),
  preview: z.string(),
  topics: z.array(searchTopicChipSchema),
  reason: z.enum(["topic", "people_also_read", "keyword"]),
});
export type RelatedVerse = z.infer<typeof relatedVerseSchema>;

export const relatedContentResponseSchema = z.object({
  data: z.object({
    relatedVerses: z.array(relatedVerseSchema),
    relatedTopics: z.array(searchTopicChipSchema),
    peopleAlsoRead: z.array(relatedVerseSchema),
  }),
});

export const trendingSearchesResponseSchema = z.object({
  data: z.array(
    z.object({
      query: z.string(),
      hitCount: z.number().int().nonnegative(),
    }),
  ),
});

export const recentSearchesResponseSchema = z.object({
  data: z.array(
    z.object({
      query: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),
});

/** Legacy admin command-palette hit (kept for CMS ⌘K). */
export const adminSearchHitSchema = z.object({
  type: z.enum([
    "scripture",
    "work",
    "chapter",
    "verse",
    "translation",
    "topic",
  ]),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  href: z.string(),
});
