import { z } from "zod";

export const verseTranslationSchema = z.object({
  id: z.string().uuid(),
  languageCode: z.string().min(1),
  languageName: z.string().min(1),
  sourceKey: z.string().min(1),
  sourceDisplayName: z.string().min(1),
  text: z.string(),
  isPublished: z.boolean(),
});

export type VerseTranslation = z.infer<typeof verseTranslationSchema>;

export const verseSchema = z.object({
  id: z.string().uuid(),
  publicId: z.string().min(1),
  number: z.number().int().positive(),
  sanskritText: z.string(),
  transliteration: z.string().nullable(),
  meaning: z.string().nullable(),
  commentary: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  chapterPublicId: z.string().min(1),
  chapterNumber: z.number().int().positive(),
  workCode: z.string().min(1),
  translations: z.array(verseTranslationSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Verse = z.infer<typeof verseSchema>;

export const versesListResponseSchema = z.object({
  data: z.array(verseSchema),
  meta: z
    .object({
      languages: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
          nativeName: z.string().nullable(),
        }),
      ),
    })
    .optional(),
});

export type VersesListResponse = z.infer<typeof versesListResponseSchema>;

export const verseDetailResponseSchema = z.object({
  data: verseSchema,
});

export type VerseDetailResponse = z.infer<typeof verseDetailResponseSchema>;

export const contentRevisionSchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
  snapshot: z.record(z.string(), z.unknown()),
});

export type ContentRevision = z.infer<typeof contentRevisionSchema>;

export const searchHitSchema = z.object({
  type: z.enum(["scripture", "work", "chapter", "verse", "translation", "topic"]),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  href: z.string(),
});

export type SearchHit = z.infer<typeof searchHitSchema>;

export const searchResponseSchema = z.object({
  data: z.array(searchHitSchema),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
