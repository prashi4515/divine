/**
 * Content Import Schema — Version 1
 *
 * Wire format for offline JSON catalogs. Versioned so we can evolve
 * the payload without breaking historical dumps.
 *
 * Design notes:
 * - Natural keys only (codes, publicIds, slugs) — never UUIDs.
 * - Languages / sources / topics / emotions may be declared inline
 *   OR assumed to already exist in the DB (referential check covers both).
 * - Verses nest under chapters to keep chapter↔verse integrity local.
 */

import { z } from "zod";

export const IMPORT_SCHEMA_VERSION = "1.0.0" as const;

const nonEmpty = z.string().trim().min(1);

export const importLanguageSchema = z.object({
  code: nonEmpty.max(16),
  name: nonEmpty.max(128),
  nativeName: z.string().trim().max(128).optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export const importTranslationSourceSchema = z.object({
  key: nonEmpty.max(64),
  displayName: nonEmpty.max(255),
  author: z.string().trim().max(255).optional(),
  license: z.string().trim().max(255).optional(),
  isDefault: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const importTopicSchema = z.object({
  slug: nonEmpty.max(64),
  name: nonEmpty.max(128),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
});

export const importEmotionSchema = z.object({
  slug: nonEmpty.max(64),
  name: nonEmpty.max(128),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
});

export const importTranslationSchema = z.object({
  languageCode: nonEmpty.max(16),
  sourceKey: nonEmpty.max(64),
  text: nonEmpty,
  isPublished: z.boolean().optional(),
});

export const importVerseSchema = z.object({
  number: z.number().int().positive(),
  publicId: nonEmpty.max(64),
  sanskritText: nonEmpty,
  transliteration: z.string().trim().nullish(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  translations: z.array(importTranslationSchema).default([]),
  topicSlugs: z.array(nonEmpty.max(64)).default([]),
  emotionSlugs: z.array(nonEmpty.max(64)).default([]),
});

export const importChapterSchema = z.object({
  number: z.number().int().positive(),
  publicId: nonEmpty.max(64),
  title: z.string().trim().max(255).optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  /** Empty allowed — chapter structure can land before verses. */
  verses: z.array(importVerseSchema).default([]),
});

export const importWorkSchema = z.object({
  code: nonEmpty.max(32),
  slug: nonEmpty.max(64),
  title: nonEmpty.max(255),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export const importMetaSchema = z.object({
  name: nonEmpty.max(255),
  description: z.string().trim().optional(),
  exportedAt: z.string().datetime().optional(),
});

/**
 * Root document for schemaVersion 1.0.0
 */
export const contentImportV1Schema = z.object({
  schemaVersion: z.literal(IMPORT_SCHEMA_VERSION),
  meta: importMetaSchema,
  work: importWorkSchema,
  languages: z.array(importLanguageSchema).default([]),
  translationSources: z.array(importTranslationSourceSchema).default([]),
  topics: z.array(importTopicSchema).default([]),
  emotions: z.array(importEmotionSchema).default([]),
  chapters: z.array(importChapterSchema).min(1),
});

export type ContentImportV1 = z.infer<typeof contentImportV1Schema>;
export type ImportVerse = z.infer<typeof importVerseSchema>;
export type ImportChapter = z.infer<typeof importChapterSchema>;
