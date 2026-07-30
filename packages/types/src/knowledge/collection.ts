import { z } from "zod";
import { scriptureReferenceSchema, entitySeoSchema } from "./entity";

export const COLLECTION_KINDS = [
  "encyclopedia-section",
  "genealogy-module",
  "atlas-layer",
  "timeline-era",
  "events-layer",
  "weapons-layer",
  "concepts-layer",
  "other",
] as const;
export type CollectionKind = (typeof COLLECTION_KINDS)[number];

export const COLLECTION_STATUSES = ["available", "coming-soon"] as const;
export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export const knowledgeCollectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  kind: z.enum(COLLECTION_KINDS),
  sanskritTitle: z.string().optional(),
  eyebrow: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(COLLECTION_STATUSES).default("available"),
  entityIds: z.array(z.string()).default([]),
  rootEntityId: z.string().optional(),
  highlightPath: z.array(z.string()).optional(),
  scriptureSources: z.array(scriptureReferenceSchema).default([]),
  relatedGitaChapters: z.array(z.number().int().min(1).max(18)).optional(),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  color: z
    .object({ accent: z.string(), tint: z.string() })
    .optional(),
  seo: entitySeoSchema.optional(),
  order: z.number().int().default(100),
});
export type KnowledgeCollection = z.infer<typeof knowledgeCollectionSchema>;

export const knowledgeCollectionBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  collections: z.array(knowledgeCollectionSchema),
});
export type KnowledgeCollectionBundle = z.infer<
  typeof knowledgeCollectionBundleSchema
>;
