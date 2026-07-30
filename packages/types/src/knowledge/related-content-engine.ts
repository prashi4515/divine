/**
 * Automatic Related Content Engine.
 *
 * Scores neighbors via graph traversal + relationship weights. Never invents
 * edges — only walks the cited relation index. Bucket classification is
 * kind/field-driven so future entity kinds can be registered without
 * rewriting page UI.
 */

import type { ConfidenceLevel, EntityKind, KnowledgeEntity } from "./entity";
import {
  getRelationships,
  type RelationshipIndex,
} from "./relationship-engine";
import type { RelationType, RelationshipObject } from "./relation";

/** Product buckets shown on every explore rail. */
export const RELATED_CONTENT_BUCKETS = [
  "characters",
  "events",
  "places",
  "kingdoms",
  "weapons",
  "concepts",
  "chapters",
  "verses",
  "atlas",
  "genealogy",
] as const;

export type RelatedContentBucket = (typeof RELATED_CONTENT_BUCKETS)[number];

export const RELATED_CONTENT_BUCKET_LABELS: Record<
  RelatedContentBucket,
  string
> = {
  characters: "Related Characters",
  events: "Related Events",
  places: "Related Places",
  kingdoms: "Related Kingdoms",
  weapons: "Related Weapons",
  concepts: "Related Concepts",
  chapters: "Related Chapters",
  verses: "Related Verses",
  atlas: "Related Atlas Locations",
  genealogy: "Related Genealogy",
};

/** Minimal entity shape required for scoring / classification. */
export type RelatedContentEntity = Pick<
  KnowledgeEntity,
  "id" | "kind" | "name" | "slug" | "importance" | "status"
> & {
  atlas?: KnowledgeEntity["atlas"];
  event?: KnowledgeEntity["event"];
  concept?: KnowledgeEntity["concept"];
  externalRefs?: KnowledgeEntity["externalRefs"];
};

const CHARACTER_KINDS = new Set<EntityKind>([
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
]);

const PLACE_KINDS = new Set<EntityKind>([
  "city",
  "forest",
  "river",
  "mountain",
  "temple",
  "pilgrimage",
  "battlefield",
  "ashrama",
]);

/**
 * Extensible kind → bucket map. Unknown future kinds fall through to
 * `classifyRelatedBuckets` heuristics (atlas / event / genealogy fields).
 */
export const ENTITY_KIND_BUCKETS: Partial<
  Record<EntityKind, readonly RelatedContentBucket[]>
> = {
  person: ["characters"],
  deity: ["characters"],
  avatar: ["characters"],
  sage: ["characters"],
  asura: ["characters"],
  daitya: ["characters"],
  danava: ["characters"],
  rakshasa: ["characters"],
  deva: ["characters"],
  naga: ["characters"],
  yaksha: ["characters"],
  gandharva: ["characters"],
  devi: ["characters"],
  prajapati: ["characters"],
  manu: ["characters"],
  king: ["characters"],
  queen: ["characters"],
  prince: ["characters"],
  princess: ["characters"],
  warrior: ["characters"],
  kingdom: ["kingdoms"],
  city: ["places"],
  forest: ["places"],
  river: ["places"],
  mountain: ["places"],
  temple: ["places"],
  pilgrimage: ["places"],
  battlefield: ["places"],
  ashrama: ["places"],
  event: ["events"],
  battle: ["events"],
  weapon: ["weapons"],
  concept: ["concepts"],
  verse: ["verses"],
  chapter: ["chapters"],
  scripture: [],
  dynasty: ["genealogy"],
  other: [],
};

/** Higher = stronger signal for recommendations. Default 1. */
export const RELATION_TYPE_WEIGHTS: Partial<Record<RelationType, number>> = {
  // Kinship / identity
  father: 1.35,
  mother: 1.35,
  parent: 1.3,
  son: 1.25,
  daughter: 1.25,
  child: 1.2,
  spouse: 1.25,
  consort: 1.2,
  sibling: 1.1,
  brother: 1.1,
  sister: 1.1,
  "incarnation-of": 1.4,
  "manifestation-of": 1.3,
  "aspect-of": 1.15,
  // Teaching / social
  guru: 1.25,
  disciple: 1.25,
  friend: 1.05,
  enemy: 1.15,
  ally: 1.1,
  // Place / rule
  "king-of": 1.3,
  "queen-of": 1.3,
  ruled: 1.2,
  "ruled-by": 1.2,
  "capital-of": 1.35,
  "located-in": 1.2,
  "located-at": 1.15,
  "resident-of": 1.1,
  visited: 0.95,
  "born-at": 1.25,
  "died-at": 1.15,
  // Narrative
  "fought-in": 1.35,
  fought: 1.25,
  wielded: 1.4,
  "belongs-to-dynasty": 1.2,
  "participated-in": 1.3,
  "occurred-at": 1.25,
  "appears-in": 1.15,
  "mentioned-in": 1.2,
  "connected-to": 1.0,
  precedes: 0.9,
};

const CONFIDENCE_WEIGHT: Record<ConfidenceLevel, number> = {
  verified: 1,
  traditional: 0.78,
  variant: 0.55,
};

const DEFAULT_RELATION_WEIGHT = 1;
const DEPTH_DECAY = 0.55;
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_PER_BUCKET = 8;

export type RelatedContentOptions = {
  /** Max graph hops (default 2). */
  maxDepth?: number;
  /** Max hits kept per bucket after ranking. */
  perBucketLimit?: number;
  /** Extra entity ids to exclude (besides the root). */
  excludeIds?: ReadonlySet<string> | readonly string[];
  /** Only follow these relation types (default: all). */
  types?: readonly RelationType[];
};

export type RelatedContentHit = {
  entityId: string;
  score: number;
  depth: number;
  /** Shortest scored path of relationships from the root. */
  via: RelationshipObject[];
  buckets: RelatedContentBucket[];
};

/** Gītā chapter derived from connected verse / concept / event metadata. */
export type RelatedChapterHit = {
  chapterNumber: number;
  score: number;
  depth: number;
  /** Entity ids that contributed (verses, concepts, events). */
  sourceEntityIds: string[];
};

export type RelatedContentBucketGroup = {
  bucket: RelatedContentBucket;
  label: string;
  hits: RelatedContentHit[];
};

export type RelatedContentResult = {
  rootId: string;
  buckets: RelatedContentBucketGroup[];
  /** Flat ranked hits (entities only). */
  hits: RelatedContentHit[];
  /** Chapter recommendations derived from the same graph walk. */
  chapters: RelatedChapterHit[];
};

function isPublished(entity: RelatedContentEntity): boolean {
  return entity.status === "published";
}

function isCharacterLike(entity: RelatedContentEntity): boolean {
  if (CHARACTER_KINDS.has(entity.kind)) return true;
  return (
    entity.id.startsWith("person.") ||
    Boolean(entity.externalRefs?.genealogyId)
  );
}

/**
 * Classify an entity into one or more recommendation buckets.
 * Future kinds: add to ENTITY_KIND_BUCKETS or rely on atlas/event/genealogy fields.
 */
export function classifyRelatedBuckets(
  entity: RelatedContentEntity,
): RelatedContentBucket[] {
  const out = new Set<RelatedContentBucket>();
  const mapped = ENTITY_KIND_BUCKETS[entity.kind];
  if (mapped) {
    for (const b of mapped) out.add(b);
  } else if (isCharacterLike(entity)) {
    out.add("characters");
  } else if (entity.event || entity.kind === "event" || entity.kind === "battle") {
    out.add("events");
  } else if (PLACE_KINDS.has(entity.kind)) {
    out.add("places");
  }

  if (entity.kind === "kingdom") out.add("kingdoms");
  if (entity.atlas) out.add("atlas");
  if (entity.externalRefs?.genealogyId || entity.kind === "dynasty") {
    out.add("genealogy");
  }
  if (entity.kind === "verse" || entity.id.startsWith("verse.")) {
    out.add("verses");
  }
  if (entity.kind === "chapter") out.add("chapters");
  if (entity.kind === "weapon") out.add("weapons");
  if (entity.kind === "concept") out.add("concepts");

  return [...out];
}

export function relationTypeWeight(type: RelationType): number {
  return RELATION_TYPE_WEIGHTS[type] ?? DEFAULT_RELATION_WEIGHT;
}

export function confidenceWeight(level: ConfidenceLevel): number {
  return CONFIDENCE_WEIGHT[level] ?? 0.6;
}

/**
 * Score a single hop: relation weight × confidence × depth decay × importance.
 */
export function scoreRelatedHop(input: {
  type: RelationType;
  confidence: ConfidenceLevel;
  depth: number;
  importance: number;
}): number {
  const depthFactor = Math.pow(DEPTH_DECAY, Math.max(0, input.depth - 1));
  const importanceFactor = 0.45 + 0.55 * (Math.min(5, Math.max(1, input.importance)) / 5);
  return (
    relationTypeWeight(input.type) *
    confidenceWeight(input.confidence) *
    depthFactor *
    importanceFactor
  );
}

function parseGitaChapter(entity: RelatedContentEntity): number | null {
  if (entity.kind === "chapter") {
    const m = /(\d{1,2})$/.exec(entity.slug) ?? /(\d{1,2})/.exec(entity.id);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 18) return n;
    }
  }
  if (entity.kind === "verse" || entity.id.startsWith("verse.")) {
    const publicId =
      entity.externalRefs?.publicId ?? entity.id.replace(/^verse\./, "");
    const m = /^(?:bg\.)?(\d{1,2})\./i.exec(publicId);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 18) return n;
    }
  }
  return null;
}

function chaptersFromEntity(entity: RelatedContentEntity): number[] {
  const out: number[] = [];
  const parsed = parseGitaChapter(entity);
  if (parsed) out.push(parsed);
  if (entity.concept?.chapters) out.push(...entity.concept.chapters);
  if (entity.event?.chapters) out.push(...entity.event.chapters);
  return out.filter((n) => n >= 1 && n <= 18);
}

type PathNode = {
  id: string;
  depth: number;
  score: number;
  via: RelationshipObject[];
};

/**
 * Build related-content recommendations from the shared relationship index.
 * Pure: no I/O, no hard-coded entity ids.
 */
export function buildRelatedContent(
  index: RelationshipIndex,
  rootId: string,
  entitiesById: ReadonlyMap<string, RelatedContentEntity>,
  options: RelatedContentOptions = {},
): RelatedContentResult {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const perBucket = options.perBucketLimit ?? DEFAULT_PER_BUCKET;
  const exclude = new Set<string>([rootId]);
  if (options.excludeIds) {
    for (const id of options.excludeIds) exclude.add(id);
  }

  const best = new Map<string, PathNode>();
  const queue: PathNode[] = [{ id: rootId, depth: 0, score: 1, via: [] }];
  const visitedAtDepth = new Map<string, number>();
  visitedAtDepth.set(rootId, 0);

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.depth >= maxDepth) continue;

    const hops = getRelationships(index, node.id, options.types);
    for (const hop of hops) {
      const nextId = hop.otherId;
      if (exclude.has(nextId)) continue;

      const entity = entitiesById.get(nextId);
      if (!entity || !isPublished(entity)) continue;

      const nextDepth = node.depth + 1;
      const hopScore = scoreRelatedHop({
        type: hop.relationship.type,
        confidence: hop.relationship.confidence,
        depth: nextDepth,
        importance: entity.importance,
      });
      // Path score: diminish prior path then add hop contribution
      const nextScore =
        node.depth === 0
          ? hopScore
          : node.score * DEPTH_DECAY * 0.85 + hopScore * 0.5;

      const prevBest = best.get(nextId);
      if (!prevBest || nextScore > prevBest.score) {
        const via = [...node.via, hop.relationship];
        best.set(nextId, {
          id: nextId,
          depth: nextDepth,
          score: nextScore,
          via,
        });
      }

      const seenDepth = visitedAtDepth.get(nextId);
      if (seenDepth !== undefined && seenDepth <= nextDepth) continue;
      visitedAtDepth.set(nextId, nextDepth);
      queue.push({
        id: nextId,
        depth: nextDepth,
        score: nextScore,
        via: [...node.via, hop.relationship],
      });
    }
  }

  const hits: RelatedContentHit[] = [];
  const chapterScores = new Map<
    number,
    { score: number; depth: number; sources: Set<string> }
  >();

  // Root entity may itself declare related Gītā chapters (concept / event meta)
  const rootEntity = entitiesById.get(rootId);
  if (rootEntity) {
    for (const ch of chaptersFromEntity(rootEntity)) {
      const cur = chapterScores.get(ch) ?? {
        score: 0,
        depth: 0,
        sources: new Set<string>(),
      };
      cur.score = Math.max(cur.score, 1.1);
      cur.sources.add(rootId);
      chapterScores.set(ch, cur);
    }
  }

  for (const node of best.values()) {
    const entity = entitiesById.get(node.id);
    if (!entity) continue;
    const buckets = classifyRelatedBuckets(entity);
    if (buckets.length === 0) continue;

    hits.push({
      entityId: node.id,
      score: node.score,
      depth: node.depth,
      via: node.via,
      buckets,
    });

    for (const ch of chaptersFromEntity(entity)) {
      const cur = chapterScores.get(ch) ?? {
        score: 0,
        depth: node.depth,
        sources: new Set<string>(),
      };
      cur.score = Math.max(cur.score, node.score * 0.95);
      cur.depth = Math.min(cur.depth, node.depth);
      cur.sources.add(node.id);
      chapterScores.set(ch, cur);
    }
  }

  hits.sort((a, b) => b.score - a.score || a.depth - b.depth);

  const byBucket = new Map<RelatedContentBucket, RelatedContentHit[]>();
  for (const bucket of RELATED_CONTENT_BUCKETS) {
    if (bucket === "chapters") continue; // handled separately
    byBucket.set(bucket, []);
  }

  for (const hit of hits) {
    for (const bucket of hit.buckets) {
      if (bucket === "chapters") continue;
      const list = byBucket.get(bucket);
      if (!list) continue;
      if (list.length >= perBucket) continue;
      if (list.some((h) => h.entityId === hit.entityId)) continue;
      list.push(hit);
    }
  }

  const chapters: RelatedChapterHit[] = [...chapterScores.entries()]
    .map(([chapterNumber, v]) => ({
      chapterNumber,
      score: v.score,
      depth: v.depth,
      sourceEntityIds: [...v.sources],
    }))
    .sort((a, b) => b.score - a.score || a.chapterNumber - b.chapterNumber)
    .slice(0, perBucket);

  const buckets: RelatedContentBucketGroup[] = RELATED_CONTENT_BUCKETS.filter(
    (b) => b !== "chapters",
  )
    .map((bucket) => ({
      bucket,
      label: RELATED_CONTENT_BUCKET_LABELS[bucket],
      hits: byBucket.get(bucket) ?? [],
    }))
    .filter((g) => g.hits.length > 0);

  if (chapters.length > 0) {
    buckets.push({
      bucket: "chapters",
      label: RELATED_CONTENT_BUCKET_LABELS.chapters,
      // Synthetic hits — entityId encodes chapter for UI resolution
      hits: chapters.map((c) => ({
        entityId: `gita.chapter.${c.chapterNumber}`,
        score: c.score,
        depth: c.depth,
        via: [],
        buckets: ["chapters" as const],
      })),
    });
  }

  // Stable product order
  buckets.sort(
    (a, b) =>
      RELATED_CONTENT_BUCKETS.indexOf(a.bucket) -
      RELATED_CONTENT_BUCKETS.indexOf(b.bucket),
  );

  return { rootId, buckets, hits, chapters };
}
