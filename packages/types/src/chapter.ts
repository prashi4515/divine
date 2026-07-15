import { z } from "zod";

/**
 * Nested work summary on chapter responses — enough for admin/list UI
 * without a second round-trip.
 */
export const chapterWorkSummarySchema = z.object({
  code: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
});

export type ChapterWorkSummary = z.infer<typeof chapterWorkSummarySchema>;

/**
 * Public chapter resource — wire contract between API and clients.
 * Dates are ISO strings on the wire. Public identity is `publicId` (e.g. "bg.2").
 */
export const chapterSchema = z.object({
  id: z.string().uuid(),
  publicId: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().nullable(),
  verseCount: z.number().int().nonnegative(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  work: chapterWorkSummarySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Chapter = z.infer<typeof chapterSchema>;

export const chaptersListResponseSchema = z.object({
  data: z.array(chapterSchema),
});

export type ChaptersListResponse = z.infer<typeof chaptersListResponseSchema>;

export const chapterDetailResponseSchema = z.object({
  data: chapterSchema,
});

export type ChapterDetailResponse = z.infer<typeof chapterDetailResponseSchema>;
