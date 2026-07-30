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
  kind: z.enum(["query", "topic", "verse", "synonym", "entity"]),
  href: z.string().nullable(),
  /** Entity kind badge when kind === "entity" (person, place, concept, …). */
  entityKind: z.string().optional(),
});
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;

export const searchSuggestResponseSchema = z.object({
  data: z.array(searchSuggestionSchema),
});

/** Result groups on the global Knowledge Search page. */
export const KNOWLEDGE_SEARCH_GROUPS = [
  "people",
  "places",
  "events",
  "verses",
  "concepts",
] as const;
export type KnowledgeSearchGroup = (typeof KNOWLEDGE_SEARCH_GROUPS)[number];

export const KNOWLEDGE_SEARCH_GROUP_LABELS: Record<
  KnowledgeSearchGroup,
  string
> = {
  people: "People",
  places: "Places",
  events: "Events",
  verses: "Verses",
  concepts: "Concepts",
};

export const KNOWLEDGE_SEARCH_SURFACES = [
  "encyclopedia",
  "atlas",
  "events",
  "genealogy",
  "timeline",
  "gita",
] as const;
export type KnowledgeSearchSurface =
  (typeof KNOWLEDGE_SEARCH_SURFACES)[number];

/** Lightweight document in the build-time static search index. */
export const knowledgeSearchDocumentSchema = z.object({
  id: z.string(),
  group: z.enum(KNOWLEDGE_SEARCH_GROUPS),
  kind: z.string(),
  title: z.string(),
  englishTitle: z.string(),
  iast: z.string().optional(),
  sanskrit: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  summary: z.string(),
  href: z.string(),
  surfaces: z.array(z.enum(KNOWLEDGE_SEARCH_SURFACES)).default([]),
  importance: z.number().int().min(1).max(5).default(3),
  /** Diacritic-folded haystack for Latin / alias matching. */
  searchText: z.string(),
  /** Raw haystack preserving Devanagari / IAST for Sanskrit queries. */
  searchTextRaw: z.string(),
});
export type KnowledgeSearchDocument = z.infer<
  typeof knowledgeSearchDocumentSchema
>;

export const knowledgeSearchIndexSchema = z.object({
  generatedAt: z.string(),
  schemaVersion: z.literal(1),
  documents: z.array(knowledgeSearchDocumentSchema),
});
export type KnowledgeSearchIndex = z.infer<typeof knowledgeSearchIndexSchema>;

export const knowledgeSearchHitSchema = knowledgeSearchDocumentSchema.extend({
  score: z.number(),
  matchedOn: z.array(z.string()).default([]),
});
export type KnowledgeSearchHit = z.infer<typeof knowledgeSearchHitSchema>;

export const knowledgeSearchGroupBucketSchema = z.object({
  group: z.enum(KNOWLEDGE_SEARCH_GROUPS),
  label: z.string(),
  hits: z.array(knowledgeSearchHitSchema),
  total: z.number().int().nonnegative(),
});
export type KnowledgeSearchGroupBucket = z.infer<
  typeof knowledgeSearchGroupBucketSchema
>;

export const knowledgeSearchResponseSchema = z.object({
  data: z.object({
    groups: z.array(knowledgeSearchGroupBucketSchema),
    total: z.number().int().nonnegative(),
  }),
  meta: z.object({
    query: z.string(),
    tookMs: z.number().nonnegative(),
  }),
});
export type KnowledgeSearchResponse = z.infer<
  typeof knowledgeSearchResponseSchema
>;

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
