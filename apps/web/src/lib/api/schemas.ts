import { z } from "zod";
import { authUserSchema } from "@/lib/auth/types";

export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;
export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const scriptureSchema = z.object({
  id: z.string().uuid(),
  workId: z.string().uuid().nullable().optional(),
  workCode: z.string().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  shortName: z.string().nullable(),
  description: z.string().nullable(),
  religion: z.string().nullable(),
  originalLanguage: z.string().nullable(),
  author: z.string().nullable(),
  estimatedDate: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  bannerImageUrl: z.string().nullable(),
  themeColor: z.string().nullable(),
  accentColor: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  ogImageUrl: z.string().nullable(),
  copyright: z.string().nullable(),
  license: z.string().nullable(),
  website: z.string().nullable(),
  visibility: z.string(),
  defaultLanguage: z.string().nullable(),
  readingDirection: z.string(),
  structureLevels: z.array(z.string()),
  status: z.string(),
  isPublished: z.boolean(),
  bookCount: z.number().int().nonnegative(),
  chapterCount: z.number().int().nonnegative(),
  verseCount: z.number().int().nonnegative(),
  translationCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Scripture = z.infer<typeof scriptureSchema>;

export const scriptureNodeSchema: z.ZodType<{
  id: string;
  scriptureId: string;
  parentId: string | null;
  label: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children: ScriptureNode[];
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    scriptureId: z.string(),
    parentId: z.string().nullable(),
    label: z.string(),
    title: z.string(),
    sortOrder: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(scriptureNodeSchema),
  }),
);
export type ScriptureNode = z.infer<typeof scriptureNodeSchema>;

export const mediaAssetSchema = z.object({
  id: z.string(),
  scriptureId: z.string().nullable(),
  kind: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

export const adminUserSchema = authUserSchema;
export type AdminUser = z.infer<typeof adminUserSchema>;

export const STRUCTURE_PRESETS = [
  { key: "gita", label: "Bhagavad Gita", levels: ["Chapter", "Verse"] },
  { key: "bible", label: "Bible", levels: ["Testament", "Book", "Chapter", "Verse"] },
  { key: "mahabharata", label: "Mahabharata", levels: ["Book", "Section", "Chapter", "Verse"] },
  { key: "ramayana", label: "Ramayana", levels: ["Kanda", "Chapter", "Verse"] },
  { key: "quran", label: "Quran", levels: ["Surah", "Verse"] },
  { key: "tripitaka", label: "Tripitaka", levels: ["Basket", "Book", "Chapter", "Verse"] },
  { key: "custom", label: "Custom", levels: [] as string[] },
] as const;
