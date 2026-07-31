import { z } from "zod";

/** Authoritative works we cite (stable spellings for UI filters). */
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

export const CONFIDENCE_LEVELS = [
  "verified",
  "traditional",
  "variant",
] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  verified: "Verified",
  traditional: "Traditional",
  variant: "Variant Tradition",
};

export const scriptureReferenceSchema = z.object({
  work: z.string().min(1),
  section: z.string().optional(),
  chapter: z.string().optional(),
  verse: z.string().optional(),
  note: z.string().optional(),
});
export type ScriptureReference = z.infer<typeof scriptureReferenceSchema>;

export function formatCitation(ref: ScriptureReference): string {
  const parts = [ref.work];
  if (ref.section) parts.push(ref.section);
  if (ref.chapter) {
    parts.push(
      ref.chapter.startsWith("ch") ? ref.chapter : `ch. ${ref.chapter}`,
    );
  }
  if (ref.verse) parts.push(ref.verse);
  return parts.join(" · ");
}

export const ENTITY_KINDS = [
  "person",
  "deity",
  "avatar",
  "sage",
  "asura",
  "daitya",
  "danava",
  "rakshasa",
  "deva",
  "naga",
  "yaksha",
  "gandharva",
  "devi",
  "prajapati",
  "manu",
  "king",
  "queen",
  "prince",
  "princess",
  "warrior",
  "kingdom",
  "city",
  "forest",
  "river",
  "mountain",
  "temple",
  "pilgrimage",
  "ashrama",
  "battlefield",
  "dynasty",
  "event",
  "battle",
  "weapon",
  "scripture",
  "chapter",
  "verse",
  "concept",
  "other",
] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export const ENTITY_KIND_LABELS: Record<EntityKind, string> = {
  person: "Person",
  deity: "Deity",
  avatar: "Avatar",
  sage: "Sage",
  asura: "Asura",
  daitya: "Daitya",
  danava: "Dānava",
  rakshasa: "Rākṣasa",
  deva: "Deva",
  naga: "Nāga",
  yaksha: "Yakṣa",
  gandharva: "Gandharva",
  devi: "Devī",
  prajapati: "Prajāpati",
  manu: "Manu",
  king: "King",
  queen: "Queen",
  prince: "Prince",
  princess: "Princess",
  warrior: "Warrior",
  kingdom: "Kingdom",
  city: "City",
  forest: "Forest",
  river: "River",
  mountain: "Mountain",
  temple: "Temple",
  pilgrimage: "Pilgrimage",
  ashrama: "Āśrama",
  battlefield: "Battlefield",
  dynasty: "Dynasty",
  event: "Event",
  battle: "Battle",
  weapon: "Weapon",
  scripture: "Scripture",
  chapter: "Chapter",
  verse: "Verse",
  concept: "Concept",
  other: "Other",
};

/** Route segment for encyclopedia URLs (kind groups). */
export const ENTITY_KIND_ROUTE: Record<EntityKind, string> = {
  person: "person",
  deity: "deity",
  avatar: "avatar",
  sage: "sage",
  asura: "asura",
  daitya: "daitya",
  danava: "danava",
  rakshasa: "rakshasa",
  deva: "deva",
  naga: "naga",
  yaksha: "yaksha",
  gandharva: "gandharva",
  devi: "devi",
  prajapati: "prajapati",
  manu: "manu",
  king: "king",
  queen: "queen",
  prince: "prince",
  princess: "princess",
  warrior: "warrior",
  kingdom: "kingdom",
  city: "city",
  forest: "forest",
  river: "river",
  mountain: "mountain",
  temple: "temple",
  pilgrimage: "pilgrimage",
  ashrama: "ashrama",
  battlefield: "battlefield",
  dynasty: "dynasty",
  event: "event",
  battle: "battle",
  weapon: "weapon",
  scripture: "scripture",
  chapter: "chapter",
  verse: "verse",
  concept: "concept",
  other: "other",
};

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

export const ENTITY_STATUSES = ["published", "draft"] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

/** IDs: person.krishna, place.hastinapura, verse.bg.2.47 */
export const entityIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9.-]*)+$|^[a-z][a-z0-9-]+$/);

export const entitySlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const entityImageSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  placeholder: z.string().optional(),
});
export type EntityImage = z.infer<typeof entityImageSchema>;

export const entitySeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});
export type EntitySeo = z.infer<typeof entitySeoSchema>;

export const entityExternalRefsSchema = z.object({
  workCode: z.string().optional(),
  publicId: z.string().optional(),
  /** Legacy genealogy person id (e.g. krishna) for URL compatibility. */
  genealogyId: z.string().optional(),
});
export type EntityExternalRefs = z.infer<typeof entityExternalRefsSchema>;

/**
 * Atlas placement + educational modern context.
 * Stored on the shared entity — Atlas visualizes; Encyclopedia explains.
 * Coordinates are approximate traditional/educational placements, not survey GPS.
 */
export const entityAtlasSchema = z.object({
  /** Approximate latitude (WGS84) for education / projection. */
  latitude: z.number().min(-90).max(90),
  /** Approximate longitude (WGS84) for education / projection. */
  longitude: z.number().min(-180).max(180),
  /** Educational modern equivalent, e.g. "Near Meerut, Uttar Pradesh". */
  modernLocation: z.string().min(1),
  /** Optional kingdom affiliation (IAST label or entity id). */
  kingdom: z.string().optional(),
  /** Short note on scriptural significance for Atlas drawers. */
  scripturalSignificance: z.string().optional(),
  /** Atlas filter facet when kind alone is insufficient (battlefield, ashrama). */
  atlasCategory: z
    .enum([
      "kingdom",
      "city",
      "forest",
      "battlefield",
      "ashrama",
      "river",
      "mountain",
      "pilgrimage",
      "sacred",
    ])
    .optional(),
  /**
   * Placement certainty for the lat/lng pin.
   * Approximate / Traditional must never be presented as surveyed fact.
   */
  /** Omit or leave unset → treat as traditional in UI. */
  certainty: z.enum(["verified", "traditional", "approximate"]).optional(),
});
export type EntityAtlas = z.infer<typeof entityAtlasSchema>;

/**
 * Event hub metadata on shared KG entities (kind: event | battle).
 * Arrays hold entity ids (or verse public ids) resolved at render time —
 * Events visualizes; Encyclopedia / Atlas / Genealogy remain canonical surfaces.
 */
export const EVENT_TYPES = [
  "birth",
  "plot",
  "ceremony",
  "game",
  "exile",
  "embassy",
  "discourse",
  "battle",
  "death",
  "rite",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  birth: "Birth",
  plot: "Plot",
  ceremony: "Ceremony",
  game: "Game",
  exile: "Exile",
  embassy: "Embassy",
  discourse: "Discourse",
  battle: "Battle",
  death: "Death",
  rite: "Rite",
  other: "Event",
};

export const entityEventSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  /** Stable narrative order within the Mahābhārata timeline (1 = earliest). */
  timelineOrder: z.number().int().min(1),
  /** Person / deity entity ids. */
  participants: z.array(z.string()).default([]),
  /** Place-like entity ids (city, forest, pilgrimage, battlefield, …). */
  places: z.array(z.string()).default([]),
  /** Kingdom entity ids. */
  kingdoms: z.array(z.string()).default([]),
  /** Weapon entity ids. */
  weapons: z.array(z.string()).default([]),
  /** Scripture / work entity ids when present in the graph. */
  scriptures: z.array(z.string()).default([]),
  /** Related Bhagavad Gītā chapter numbers (1–18). */
  chapters: z.array(z.number().int().min(1).max(18)).default([]),
  /** Verse entity ids (e.g. verse.bg.2.47) or public ids. */
  verses: z.array(z.string()).default([]),
  /** Related event entity ids. */
  relatedEvents: z.array(z.string()).default([]),
});
export type EntityEvent = z.infer<typeof entityEventSchema>;

/** Philosophical / religious concept page fields (Concepts module). */
export const entityConceptSchema = z.object({
  /** Short formal definition. */
  definition: z.string().min(1),
  /** Expanded sense / interpretive meaning. */
  meaning: z.string().min(1),
  /** Word origin / Sanskrit root note when known. */
  etymology: z.string().optional(),
  /** Concrete illustrative examples (not separate entities). */
  examples: z.array(z.string()).default([]),
  /** Related Bhagavad Gītā chapter numbers (1–18). */
  chapters: z.array(z.number().int().min(1).max(18)).default([]),
});
export type EntityConcept = z.infer<typeof entityConceptSchema>;

/** Weapon catalog fields (Weapons module). */
export const WEAPON_CATEGORIES = [
  "astra",
  "bow",
  "mace",
  "sword",
  "spear",
  "conch",
  "chariot",
  "sacred-object",
] as const;
export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

export const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  astra: "Astras",
  bow: "Bows",
  mace: "Maces",
  sword: "Swords",
  spear: "Spears",
  conch: "Conches",
  chariot: "Chariots",
  "sacred-object": "Sacred Objects",
};

export const WEAPON_FOCUS = ["mahabharata", "broader-hindu"] as const;
export type WeaponFocus = (typeof WEAPON_FOCUS)[number];

export const WEAPON_FOCUS_LABELS: Record<WeaponFocus, string> = {
  mahabharata: "Mahabharata",
  "broader-hindu": "Broader Hindu tradition",
};

export const entityWeaponSchema = z.object({
  category: z.enum(WEAPON_CATEGORIES),
  /** Narrative focus — Mahābhārata-centric vs wider Purāṇic / Vedic tradition. */
  focus: z.enum(WEAPON_FOCUS).default("mahabharata"),
  /** Documented capabilities or effects. */
  powers: z.array(z.string()).default([]),
  /** Notable narrative uses (short phrases). */
  notableUses: z.array(z.string()).default([]),
  /** Counters or restraints described in scripture (text). */
  counters: z.array(z.string()).default([]),
  /** Optional linked weapon entity ids that counter this one. */
  counterWeaponIds: z.array(z.string()).default([]),
});
export type EntityWeapon = z.infer<typeof entityWeaponSchema>;

export const variantTraditionSchema = z.object({
  label: z.string(),
  description: z.string(),
  sources: z.array(scriptureReferenceSchema).min(1),
});
export type VariantTradition = z.infer<typeof variantTraditionSchema>;

export const knowledgeEntitySchema = z.object({
  id: z.string().min(1),
  slug: entitySlugSchema,
  kind: z.enum(ENTITY_KINDS),
  name: z.string().min(1),
  englishName: z.string().min(1),
  iastName: z.string().min(1),
  sanskritName: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  gender: z.enum(GENDERS).optional(),
  era: z.enum(ERAS).default("unspecified"),
  epithet: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  primaryScripture: z.string().min(1),
  scriptureSources: z.array(scriptureReferenceSchema).default([]),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  importance: z.number().int().min(1).max(5).default(3),
  image: entityImageSchema.optional(),
  seo: entitySeoSchema.default({}),
  externalRefs: entityExternalRefsSchema.optional(),
  /** Present when this entity appears on the Atlas map. */
  atlas: entityAtlasSchema.optional(),
  /** Present when this entity is a timeline Event / Battle hub node. */
  event: entityEventSchema.optional(),
  /** Present when this entity is a Concepts-module philosophical term. */
  concept: entityConceptSchema.optional(),
  /** Present when this entity is a Weapons-module armament. */
  weapon: entityWeaponSchema.optional(),
  variantTraditions: z.array(variantTraditionSchema).default([]),
  notes: z.string().optional(),
  status: z.enum(ENTITY_STATUSES).default("published"),
  schemaVersion: z.number().int().default(1),
});
export type KnowledgeEntity = z.infer<typeof knowledgeEntitySchema>;

export const knowledgeEntityCollectionSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  entities: z.array(knowledgeEntitySchema),
});
export type KnowledgeEntityCollection = z.infer<
  typeof knowledgeEntityCollectionSchema
>;

/** All searchable strings for an entity. */
export function entitySearchKeys(entity: KnowledgeEntity): string[] {
  return [
    entity.id,
    entity.slug,
    entity.name,
    entity.englishName,
    entity.iastName,
    entity.sanskritName ?? "",
    ...(entity.aliases ?? []),
    entity.epithet ?? "",
    entity.kind,
    ...(entity.tags ?? []),
  ]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const ENTITY_KIND_TOKENS: Record<
  EntityKind,
  { accent: string; tint: string; ring: string }
> = {
  person: { accent: "#6a4b1e", tint: "#f0e0bd", ring: "#a58a4f" },
  deity: { accent: "#7f4a2b", tint: "#f6dfcd", ring: "#c98860" },
  avatar: { accent: "#8a3b52", tint: "#f7d9dd", ring: "#c26580" },
  sage: { accent: "#5c6d80", tint: "#dce6ee", ring: "#8a9bad" },
  asura: { accent: "#6b3236", tint: "#e9c9cd", ring: "#a86369" },
  daitya: { accent: "#6b3236", tint: "#e9c9cd", ring: "#a86369" },
  danava: { accent: "#5a3a4a", tint: "#e8d0da", ring: "#9a6a7a" },
  rakshasa: { accent: "#5c2a2e", tint: "#e6c4c8", ring: "#9a555c" },
  deva: { accent: "#4d6a86", tint: "#d5e2ee", ring: "#7d95af" },
  naga: { accent: "#3f6a6a", tint: "#cee3e3", ring: "#729c9c" },
  yaksha: { accent: "#4b6c5f", tint: "#d4e5df", ring: "#7b9a8e" },
  gandharva: { accent: "#7c6c39", tint: "#eee4c0", ring: "#b8a76a" },
  devi: { accent: "#8c4573", tint: "#f4d3e2", ring: "#b876a0" },
  prajapati: { accent: "#5b6b3c", tint: "#e8ecd0", ring: "#98a26a" },
  manu: { accent: "#6f5b2f", tint: "#efe4c2", ring: "#b39a5d" },
  king: { accent: "#6a4b1e", tint: "#f0e0bd", ring: "#a58a4f" },
  queen: { accent: "#7a3d68", tint: "#f2d3e4", ring: "#b878a3" },
  prince: { accent: "#5d6e37", tint: "#e9edcc", ring: "#8f9b5c" },
  princess: { accent: "#8a5c78", tint: "#f2d8e6", ring: "#b389a4" },
  warrior: { accent: "#7c3f28", tint: "#f2d5c8", ring: "#b3745a" },
  kingdom: { accent: "#5a4a2a", tint: "#ebe0c8", ring: "#9a8760" },
  city: { accent: "#5a5560", tint: "#e4e0e8", ring: "#8a8490" },
  forest: { accent: "#3d5c3a", tint: "#d8e6d4", ring: "#6a8a65" },
  river: { accent: "#3a5c7a", tint: "#d4e4f0", ring: "#6a8aaa" },
  mountain: { accent: "#5c5040", tint: "#e8e0d4", ring: "#8a7a65" },
  temple: { accent: "#8b6d2c", tint: "#f8ecc9", ring: "#c9a548" },
  pilgrimage: { accent: "#7a5a2a", tint: "#efdfbd", ring: "#b39461" },
  ashrama: { accent: "#5a4a8a", tint: "#e0dced", ring: "#8a7aaa" },
  battlefield: { accent: "#8a2f22", tint: "#f0d4ce", ring: "#b86858" },
  dynasty: { accent: "#7a5a2a", tint: "#efdfbd", ring: "#b39461" },
  event: { accent: "#6a4530", tint: "#f0ddd0", ring: "#a87860" },
  battle: { accent: "#7c3f28", tint: "#f2d5c8", ring: "#b3745a" },
  weapon: { accent: "#5c4030", tint: "#e8d8cc", ring: "#8a6a55" },
  scripture: { accent: "#5c6d80", tint: "#dce6ee", ring: "#8a9bad" },
  chapter: { accent: "#4d6a86", tint: "#d5e2ee", ring: "#7d95af" },
  verse: { accent: "#3e5a70", tint: "#d3e0ea", ring: "#6f8a9f" },
  concept: { accent: "#5b4a6b", tint: "#e6dcec", ring: "#8a7a9a" },
  other: { accent: "#6a6a6a", tint: "#e2e2e2", ring: "#9a9a9a" },
};
