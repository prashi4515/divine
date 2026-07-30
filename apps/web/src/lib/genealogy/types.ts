import { z } from "zod";

/**
 * Divine Genealogy — citation-first data model.
 *
 * Rules (non-negotiable):
 * - Every relationship MUST carry scripture citation(s) + a confidence level.
 * - Prefer fewer, defensible facts over a dense unverified graph.
 * - When traditions disagree, use confidence "variant" + variantTraditions[].
 * - Canonical display names use IAST (Kṛṣṇa, not Krishna).
 * - IDs are stable forever (`krishna`, `hiranyakashipu`).
 */

export const PERSON_CATEGORIES = [
  "supreme",
  "trimurti",
  "avatar",
  "devi",
  "prajapati",
  "manu",
  "rishi",
  "saptarishi",
  "king",
  "queen",
  "prince",
  "princess",
  "warrior",
  "deva",
  "daitya",
  "danava",
  "rakshasa",
  "asura",
  "yaksha",
  "gandharva",
  "naga",
  "dynasty-founder",
  "other",
] as const;
export type PersonCategory = (typeof PERSON_CATEGORIES)[number];

export const RELATIONSHIP_TYPES = [
  "parent",
  "child",
  "father",
  "mother",
  "spouse",
  "consort",
  "sibling",
  "brother",
  "sister",
  "son",
  "daughter",
  "adoptive-father",
  "adoptive-mother",
  "adoptive-son",
  "adoptive-daughter",
  "guru",
  "disciple",
  "friend",
  "enemy",
  "ancestor",
  "descendant",
  "incarnation-of",
  "manifestation-of",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const CONFIDENCE_LEVELS = [
  "verified",
  "traditional",
  "variant",
] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const GENDERS = ["male", "female", "divine", "unknown"] as const;
export type Gender = (typeof GENDERS)[number];

export const ERAS = [
  "pre-creation",
  "creation",
  "satya-yuga",
  "treta-yuga",
  "dvapara-yuga",
  "kali-yuga",
  "eternal",
  "unspecified",
] as const;
export type Era = (typeof ERAS)[number];

/** Authoritative works we cite (keep spellings stable for UI filters). */
export const PRIMARY_WORKS = [
  "Mahābhārata",
  "Harivaṃśa",
  "Bhāgavata Purāṇa",
  "Viṣṇu Purāṇa",
  "Brahma Purāṇa",
  "Brahmāṇḍa Purāṇa",
  "Matsya Purāṇa",
  "Padma Purāṇa",
  "Agni Purāṇa",
  "Mārkaṇḍeya Purāṇa",
  "Liṅga Purāṇa",
  "Kūrma Purāṇa",
  "Vāyu Purāṇa",
  "Skanda Purāṇa",
  "Śiva Purāṇa",
  "Rāmāyaṇa",
  "Bhagavad Gītā",
  "Manu Smṛti",
  "Ṛg Veda",
] as const;

export const scriptureReferenceSchema = z.object({
  work: z.string().min(1),
  /** e.g. "Skandha 6", "Ādi Parva", "Bāla Kāṇḍa" */
  section: z.string().optional(),
  /** e.g. "18", "3–5", "94–100" */
  chapter: z.string().optional(),
  verse: z.string().optional(),
  note: z.string().optional(),
});
export type ScriptureReference = z.infer<typeof scriptureReferenceSchema>;

/**
 * Directed edge with mandatory citation + confidence.
 * `sources[0]` is the primary citation shown on the edge.
 */
export const relationshipSchema = z.object({
  type: z.enum(RELATIONSHIP_TYPES),
  personId: z.string().min(1),
  confidence: z.enum(CONFIDENCE_LEVELS),
  sources: z.array(scriptureReferenceSchema).min(1),
  note: z.string().optional(),
});
export type Relationship = z.infer<typeof relationshipSchema>;

export const variantTraditionSchema = z.object({
  label: z.string(),
  description: z.string(),
  sources: z.array(scriptureReferenceSchema).min(1),
});
export type VariantTradition = z.infer<typeof variantTraditionSchema>;

export const relatedVerseSchema = z.object({
  workCode: z.string(),
  publicId: z.string(),
  label: z.string().optional(),
});
export type RelatedVerse = z.infer<typeof relatedVerseSchema>;

export const relatedStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  sources: z.array(scriptureReferenceSchema).optional(),
});
export type RelatedStory = z.infer<typeof relatedStorySchema>;

export const personSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  /** URL slug — defaults to id when omitted at load time. */
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  /** Canonical IAST display name (Kṛṣṇa). */
  name: z.string().min(1),
  /** Plain ASCII / common English spelling (Krishna). */
  englishName: z.string().min(1),
  /** Explicit IAST form — usually identical to `name`. */
  iastName: z.string().min(1),
  /** Devanāgarī when available. */
  sanskritName: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  gender: z.enum(GENDERS),
  category: z.enum(PERSON_CATEGORIES),
  dynasty: z.string().optional(),
  era: z.enum(ERAS).default("unspecified"),
  epithet: z.string().optional(),
  description: z.string().min(1),
  /** Leading work for this figure's biography. */
  primaryScripture: z.string().min(1),
  importance: z.number().int().min(1).max(5).default(3),
  relationships: z.array(relationshipSchema).default([]),
  variantTraditions: z.array(variantTraditionSchema).default([]),
  scriptureSources: z.array(scriptureReferenceSchema).default([]),
  relatedStories: z.array(relatedStorySchema).default([]),
  relatedVerses: z.array(relatedVerseSchema).default([]),
  notes: z.string().optional(),
  imagePlaceholder: z.string().optional(),
  /** Canonical Encyclopedia entity page when served from the knowledge graph. */
  encyclopediaHref: z.string().optional(),
});
export type Person = z.infer<typeof personSchema>;

export const personCollectionSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  people: z.array(personSchema),
});
export type PersonCollection = z.infer<typeof personCollectionSchema>;

export const MODULE_STATUSES = ["available", "coming-soon"] as const;
export type ModuleStatus = (typeof MODULE_STATUSES)[number];

export const genealogyModuleSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  sanskritTitle: z.string().optional(),
  eyebrow: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(MODULE_STATUSES).default("available"),
  personIds: z.array(z.string()).default([]),
  rootPersonId: z.string().optional(),
  highlightPath: z.array(z.string()).optional(),
  scriptureSources: z.array(scriptureReferenceSchema).default([]),
  relatedGitaChapters: z.array(z.number().int().min(1).max(18)).optional(),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  color: z
    .object({ accent: z.string(), tint: z.string() })
    .optional(),
  order: z.number().int().default(100),
});
export type GenealogyModule = z.infer<typeof genealogyModuleSchema>;

export const genealogyModuleCollectionSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  modules: z.array(genealogyModuleSchema),
});
export type GenealogyModuleCollection = z.infer<
  typeof genealogyModuleCollectionSchema
>;

export const CATEGORY_LABELS: Record<PersonCategory, string> = {
  supreme: "Supreme",
  trimurti: "Trimūrti",
  avatar: "Avatar",
  devi: "Devī",
  prajapati: "Prajāpati",
  manu: "Manu",
  rishi: "Ṛṣi",
  saptarishi: "Saptarṣi",
  king: "King",
  queen: "Queen",
  prince: "Prince",
  princess: "Princess",
  warrior: "Warrior",
  deva: "Deva",
  daitya: "Daitya",
  danava: "Dānava",
  rakshasa: "Rākṣasa",
  asura: "Asura",
  yaksha: "Yakṣa",
  gandharva: "Gandharva",
  naga: "Nāga",
  "dynasty-founder": "Dynasty Founder",
  other: "Other",
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  parent: "Parent",
  child: "Child",
  father: "Father",
  mother: "Mother",
  spouse: "Spouse",
  consort: "Consort",
  sibling: "Sibling",
  brother: "Brother",
  sister: "Sister",
  son: "Son",
  daughter: "Daughter",
  "adoptive-father": "Adoptive father",
  "adoptive-mother": "Adoptive mother",
  "adoptive-son": "Adoptive son",
  "adoptive-daughter": "Adoptive daughter",
  guru: "Guru",
  disciple: "Disciple",
  friend: "Friend",
  enemy: "Enemy",
  ancestor: "Ancestor",
  descendant: "Descendant",
  "incarnation-of": "Incarnation of",
  "manifestation-of": "Manifestation of",
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  verified: "Verified",
  traditional: "Traditional",
  variant: "Variant Tradition",
};

export const CATEGORY_TOKENS: Record<
  PersonCategory,
  { accent: string; tint: string; ring: string }
> = {
  supreme: { accent: "#8b6d2c", tint: "#f8ecc9", ring: "#c9a548" },
  trimurti: { accent: "#7f4a2b", tint: "#f6dfcd", ring: "#c98860" },
  avatar: { accent: "#8a3b52", tint: "#f7d9dd", ring: "#c26580" },
  devi: { accent: "#8c4573", tint: "#f4d3e2", ring: "#b876a0" },
  prajapati: { accent: "#5b6b3c", tint: "#e8ecd0", ring: "#98a26a" },
  manu: { accent: "#6f5b2f", tint: "#efe4c2", ring: "#b39a5d" },
  rishi: { accent: "#5c6d80", tint: "#dce6ee", ring: "#8a9bad" },
  saptarishi: { accent: "#3e5a70", tint: "#d3e0ea", ring: "#6f8a9f" },
  king: { accent: "#6a4b1e", tint: "#f0e0bd", ring: "#a58a4f" },
  queen: { accent: "#7a3d68", tint: "#f2d3e4", ring: "#b878a3" },
  prince: { accent: "#5d6e37", tint: "#e9edcc", ring: "#8f9b5c" },
  princess: { accent: "#8a5c78", tint: "#f2d8e6", ring: "#b389a4" },
  warrior: { accent: "#7c3f28", tint: "#f2d5c8", ring: "#b3745a" },
  deva: { accent: "#4d6a86", tint: "#d5e2ee", ring: "#7d95af" },
  daitya: { accent: "#6b3236", tint: "#e9c9cd", ring: "#a86369" },
  danava: { accent: "#5a3a4a", tint: "#e8d0da", ring: "#9a6a7a" },
  rakshasa: { accent: "#5c2a2e", tint: "#e6c4c8", ring: "#9a555c" },
  asura: { accent: "#6b3236", tint: "#e9c9cd", ring: "#a86369" },
  yaksha: { accent: "#4b6c5f", tint: "#d4e5df", ring: "#7b9a8e" },
  gandharva: { accent: "#7c6c39", tint: "#eee4c0", ring: "#b8a76a" },
  naga: { accent: "#3f6a6a", tint: "#cee3e3", ring: "#729c9c" },
  "dynasty-founder": { accent: "#7a5a2a", tint: "#efdfbd", ring: "#b39461" },
  other: { accent: "#6a6a6a", tint: "#e2e2e2", ring: "#9a9a9a" },
};

/** Format a primary citation for UI chips. */
export function formatCitation(ref: ScriptureReference): string {
  const parts = [ref.work];
  if (ref.section) parts.push(ref.section);
  if (ref.chapter) parts.push(ref.chapter.startsWith("ch") ? ref.chapter : `ch. ${ref.chapter}`);
  if (ref.verse) parts.push(ref.verse);
  return parts.join(" · ");
}

/** All searchable strings for a person (IAST, English, aliases, id). */
export function personSearchKeys(person: Person): string[] {
  return [
    person.id,
    person.slug ?? person.id,
    person.name,
    person.englishName,
    person.iastName,
    person.sanskritName ?? "",
    ...(person.aliases ?? []),
    person.epithet ?? "",
  ]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
