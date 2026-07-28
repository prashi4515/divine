import { z } from "zod";
import {
  chapterSchema,
  verseSchema,
} from "@divine/types";

/** On-disk snapshot for a Gita chapter reader page (no runtime API). */
export const gitaChapterSnapshotSchema = z.object({
  generatedAt: z.string().datetime(),
  chapter: chapterSchema,
  verses: z.array(verseSchema),
  languages: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      nativeName: z.string().nullable(),
    }),
  ),
});

export type GitaChapterSnapshot = z.infer<typeof gitaChapterSnapshotSchema>;

export const gitaChaptersIndexSchema = z.object({
  generatedAt: z.string().datetime(),
  chapters: z.array(chapterSchema),
});

export type GitaChaptersIndex = z.infer<typeof gitaChaptersIndexSchema>;
