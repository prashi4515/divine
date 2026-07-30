import { z } from "zod";
import {
  CONFIDENCE_LEVELS,
  scriptureReferenceSchema,
} from "./entity";

/**
 * Directed knowledge-graph edges.
 * Every edge MUST carry confidence + at least one scripture citation.
 */
export const RELATION_TYPES = [
  // Kinship (canonical + typed)
  "parent",
  "child",
  "father",
  "mother",
  "son",
  "daughter",
  "spouse",
  "consort",
  "sibling",
  "brother",
  "sister",
  "ancestor",
  "descendant",
  "adoptive-father",
  "adoptive-mother",
  "adoptive-son",
  "adoptive-daughter",
  // Teaching
  "guru",
  "disciple",
  // Social
  "friend",
  "enemy",
  "ally",
  // Identity
  "incarnation-of",
  "manifestation-of",
  "aspect-of",
  // Place / rule
  "king-of",
  "queen-of",
  "ruled",
  "ruled-by",
  "resident-of",
  "capital-of",
  "located-in",
  "located-at",
  "visited",
  "born-at",
  "died-at",
  // Narrative
  "appears-in",
  "mentioned-in",
  "fought-in",
  "fought",
  "wielded",
  "belongs-to-dynasty",
  "connected-to",
  "participated-in",
  "occurred-at",
  "precedes",
] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  parent: "Parent",
  child: "Child",
  father: "Father",
  mother: "Mother",
  son: "Son",
  daughter: "Daughter",
  spouse: "Spouse",
  consort: "Consort",
  sibling: "Sibling",
  brother: "Brother",
  sister: "Sister",
  ancestor: "Ancestor",
  descendant: "Descendant",
  "adoptive-father": "Adoptive father",
  "adoptive-mother": "Adoptive mother",
  "adoptive-son": "Adoptive son",
  "adoptive-daughter": "Adoptive daughter",
  guru: "Guru",
  disciple: "Disciple",
  friend: "Friend",
  enemy: "Enemy",
  ally: "Ally",
  "incarnation-of": "Incarnation of",
  "manifestation-of": "Manifestation of",
  "aspect-of": "Aspect of",
  "king-of": "King of",
  "queen-of": "Queen of",
  ruled: "Ruled",
  "ruled-by": "Ruled by",
  "resident-of": "Resident of",
  "capital-of": "Capital of",
  "located-in": "Located in",
  "located-at": "Located at",
  visited: "Visited",
  "born-at": "Born at",
  "died-at": "Died at",
  "appears-in": "Appears in",
  "mentioned-in": "Mentioned in",
  "fought-in": "Fought in",
  fought: "Fought",
  wielded: "Wielded",
  "belongs-to-dynasty": "Belongs to dynasty",
  "connected-to": "Connected to",
  "participated-in": "Participated in",
  "occurred-at": "Occurred at",
  precedes: "Precedes",
};

/**
 * Parent → child edge types (`fromId` is parent, `toId` is child).
 * Used for layout / descendant walks.
 */
export const PARENT_EDGE_TYPES: readonly RelationType[] = [
  "child",
  "son",
  "daughter",
  "adoptive-son",
  "adoptive-daughter",
  "descendant",
] as const;

/**
 * Child → parent edge types (`fromId` is child, `toId` is parent).
 * Used for ancestor walks.
 */
export const CHILD_TO_PARENT_EDGE_TYPES: readonly RelationType[] = [
  "parent",
  "father",
  "mother",
  "adoptive-father",
  "adoptive-mother",
  "ancestor",
] as const;

/** Place / rule edge types (person/place → place). */
export const RULE_EDGE_TYPES: readonly RelationType[] = [
  "king-of",
  "queen-of",
  "ruled",
] as const;

/** Battle / event participation types. */
export const BATTLE_EDGE_TYPES: readonly RelationType[] = [
  "fought-in",
  "participated-in",
  "fought",
] as const;

/** Place-location edge types. */
export const LOCATION_EDGE_TYPES: readonly RelationType[] = [
  "located-in",
  "located-at",
  "resident-of",
  "visited",
  "born-at",
  "died-at",
  "occurred-at",
  "capital-of",
] as const;

/** Symmetric types — loader may materialize reverse edge. */
export const SYMMETRIC_RELATION_TYPES: readonly RelationType[] = [
  "spouse",
  "consort",
  "sibling",
  "brother",
  "sister",
  "friend",
  "ally",
  "enemy",
] as const;

/** Documented inverse pairs (fromType → toType when flipping). */
export const RELATION_INVERSES: Partial<Record<RelationType, RelationType>> = {
  parent: "child",
  child: "parent",
  father: "child",
  mother: "child",
  son: "parent",
  daughter: "parent",
  "adoptive-father": "adoptive-son",
  "adoptive-mother": "adoptive-daughter",
  "adoptive-son": "adoptive-father",
  "adoptive-daughter": "adoptive-mother",
  guru: "disciple",
  disciple: "guru",
  ancestor: "descendant",
  descendant: "ancestor",
  "king-of": "ruled-by",
  "queen-of": "ruled-by",
  ruled: "ruled-by",
  "ruled-by": "ruled",
  "resident-of": "connected-to",
  "capital-of": "located-in",
  "located-in": "located-at",
  "located-at": "located-in",
  "born-at": "connected-to",
  "died-at": "connected-to",
  "participated-in": "connected-to",
  "occurred-at": "connected-to",
  precedes: "connected-to",
};

export const knowledgeRelationSchema = z.object({
  id: z.string().min(1),
  /** Relationship source entity id (product alias: `source`). */
  fromId: z.string().min(1),
  /** Relationship target entity id (product alias: `target`). */
  toId: z.string().min(1),
  type: z.enum(RELATION_TYPES),
  confidence: z.enum(CONFIDENCE_LEVELS),
  /** Citations (product alias: `citation`). At least one required. */
  sources: z.array(scriptureReferenceSchema).min(1),
  note: z.string().optional(),
  /** When true, store may skip auto-inverse (already present). */
  bidirectional: z.boolean().optional(),
});
export type KnowledgeRelation = z.infer<typeof knowledgeRelationSchema>;

/**
 * Canonical relationship object view.
 * Prefer this shape in product code; JSON storage keeps fromId/toId/sources.
 */
export type RelationshipObject = {
  id: string;
  type: RelationType;
  source: string;
  target: string;
  citation: z.infer<typeof scriptureReferenceSchema>[];
  confidence: (typeof CONFIDENCE_LEVELS)[number];
  note?: string;
};

export function toRelationshipObject(
  rel: KnowledgeRelation,
): RelationshipObject {
  return {
    id: rel.id,
    type: rel.type,
    source: rel.fromId,
    target: rel.toId,
    citation: rel.sources,
    confidence: rel.confidence,
    ...(rel.note ? { note: rel.note } : {}),
  };
}

/** Stable identity for dedupe: source + type + target (ignores id). */
export function relationDedupeKey(
  rel: Pick<KnowledgeRelation, "fromId" | "type" | "toId">,
): string {
  return `${rel.fromId}\0${rel.type}\0${rel.toId}`;
}

/**
 * Deduplicate relations by (source, type, target).
 * On clash, prefers verified > traditional > variant.
 */
export function dedupeRelations(
  relations: readonly KnowledgeRelation[],
): KnowledgeRelation[] {
  const rank: Record<string, number> = {
    verified: 3,
    traditional: 2,
    variant: 1,
  };
  const map = new Map<string, KnowledgeRelation>();
  for (const r of relations) {
    const key = relationDedupeKey(r);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, r);
      continue;
    }
    if ((rank[r.confidence] ?? 0) > (rank[prev.confidence] ?? 0)) {
      map.set(key, r);
    }
  }
  return [...map.values()];
}

export function isParentToChildType(type: RelationType): boolean {
  return (PARENT_EDGE_TYPES as readonly string[]).includes(type);
}

export function isChildToParentType(type: RelationType): boolean {
  return (CHILD_TO_PARENT_EDGE_TYPES as readonly string[]).includes(type);
}

export const knowledgeRelationCollectionSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  relations: z.array(knowledgeRelationSchema),
});
export type KnowledgeRelationCollection = z.infer<
  typeof knowledgeRelationCollectionSchema
>;

export function makeRelationId(
  fromId: string,
  type: RelationType,
  toId: string,
): string {
  return `rel.${fromId}.${type}.${toId}`;
}
