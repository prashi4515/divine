import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  knowledgeEntityCollectionSchema,
  knowledgeRelationCollectionSchema,
  knowledgeCollectionBundleSchema,
  PARENT_EDGE_TYPES,
  RELATION_TYPE_LABELS,
  type KnowledgeEntity,
  type KnowledgeRelation,
  type KnowledgeCollection,
  type RelationType,
  type RelationshipObject,
} from "@/lib/knowledge/types";
import {
  createRelationshipIndex,
  findAncestors,
  findBattlesInvolving,
  findDescendants,
  findDynastyMembers,
  findPlacesRuledBy,
  findRelatedByTypes,
  getChildren,
  getParents,
  getRelationships,
  traverseRelationships,
  type LineageHit,
  type RelatedMatch,
  type RelationshipHop,
  type RelationshipIndex,
  type TraverseOptions,
} from "@/lib/knowledge/relationship-engine";

import {
  modernizeKnowledgeCollection,
  modernizeKnowledgeEntity,
  modernizeKnowledgeRelation,
} from "@/lib/knowledge/modernize-content";

const CONTENT_CANDIDATES = [
  path.join(process.cwd(), "content", "knowledge"),
  path.join(process.cwd(), "apps", "web", "content", "knowledge"),
];

let resolvedContentRoot: string | null = null;

async function knowledgeContentRoot(): Promise<string> {
  if (resolvedContentRoot) return resolvedContentRoot;
  for (const candidate of CONTENT_CANDIDATES) {
    try {
      await fs.access(path.join(candidate, "entities.json"));
      resolvedContentRoot = candidate;
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(
    `[knowledge] entities.json not found (looked in ${CONTENT_CANDIDATES.join(", ")})`,
  );
}

function asEntityList(json: unknown): KnowledgeEntity[] {
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as { entities?: unknown }).entities)
  ) {
    return (json as { entities: KnowledgeEntity[] }).entities;
  }
  throw new Error("[knowledge] entities.json missing entities[]");
}

function asRelationList(json: unknown): KnowledgeRelation[] {
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as { relations?: unknown }).relations)
  ) {
    return (json as { relations: KnowledgeRelation[] }).relations;
  }
  throw new Error("[knowledge] relations.json missing relations[]");
}

function asCollectionList(json: unknown): KnowledgeCollection[] {
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as { collections?: unknown }).collections)
  ) {
    return (json as { collections: KnowledgeCollection[] }).collections;
  }
  throw new Error("[knowledge] collections.json missing collections[]");
}

export type RelatedEdge = {
  relation: KnowledgeRelation;
  other: KnowledgeEntity;
  direction: "out" | "in";
  /** Canonical relationship object (source / target / citation). */
  relationship: RelationshipObject;
};

export type EntityBundle = {
  entity: KnowledgeEntity;
  related: RelatedEdge[];
  grouped: Array<{ title: string; items: RelatedEdge[] }>;
  collections: KnowledgeCollection[];
};

type Store = {
  entities: readonly KnowledgeEntity[];
  entitiesById: ReadonlyMap<string, KnowledgeEntity>;
  /** genealogyId / bare slug → entity id */
  aliases: ReadonlyMap<string, string>;
  relations: readonly KnowledgeRelation[];
  relationshipIndex: RelationshipIndex;
  collections: readonly KnowledgeCollection[];
  collectionsBySlug: ReadonlyMap<string, KnowledgeCollection>;
};

type GlobalKg = typeof globalThis & {
  __divineKnowledgeStore?: Promise<Store>;
};

/** Survives HMR module re-evals so hubs don't re-parse ~800KB JSON every edit. */
function getStoreCache(): Promise<Store> | undefined {
  return (globalThis as GlobalKg).__divineKnowledgeStore;
}

function setStoreCache(value: Promise<Store> | undefined): void {
  (globalThis as GlobalKg).__divineKnowledgeStore = value;
}

async function loadStore(): Promise<Store> {
  const root = await knowledgeContentRoot();
  const [entitiesRaw, relationsRaw, collectionsRaw] = await Promise.all([
    fs.readFile(path.join(root, "entities.json"), "utf8"),
    fs.readFile(path.join(root, "relations.json"), "utf8"),
    fs.readFile(path.join(root, "collections.json"), "utf8"),
  ]);

  const entitiesJson: unknown = JSON.parse(entitiesRaw);
  const relationsJson: unknown = JSON.parse(relationsRaw);
  const collectionsJson: unknown = JSON.parse(collectionsRaw);

  // Zod validates the content boundary in development; production still
  // requires arrays to exist (never destructure blindly — Vercel build
  // previously crashed on undefined.map when shape/path was wrong).
  const rawEntities =
    process.env.NODE_ENV === "production"
      ? asEntityList(entitiesJson)
      : knowledgeEntityCollectionSchema.parse(entitiesJson).entities;
  const parsedRelations =
    process.env.NODE_ENV === "production"
      ? asRelationList(relationsJson)
      : knowledgeRelationCollectionSchema.parse(relationsJson).relations;
  const rawCollections =
    process.env.NODE_ENV === "production"
      ? asCollectionList(collectionsJson)
      : knowledgeCollectionBundleSchema.parse(collectionsJson).collections;

  // Reader-facing modern English — strip IAST / fancy punctuation once for all modules.
  const entities = rawEntities.map(modernizeKnowledgeEntity);
  const rawRelations = parsedRelations.map(modernizeKnowledgeRelation);
  const collections = rawCollections.map(modernizeKnowledgeCollection);

  const entitiesById = new Map<string, KnowledgeEntity>();
  const aliases = new Map<string, string>();
  for (const e of entities) {
    if (entitiesById.has(e.id)) {
      throw new Error(`[knowledge] duplicate entity id "${e.id}"`);
    }
    entitiesById.set(e.id, e);
    aliases.set(e.id, e.id);
    aliases.set(e.slug, e.id);
    if (e.externalRefs?.genealogyId) {
      aliases.set(e.externalRefs.genealogyId, e.id);
    }
  }

  for (const r of rawRelations) {
    if (!entitiesById.has(r.fromId) || !entitiesById.has(r.toId)) {
      throw new Error(`[knowledge] broken relation "${r.id}"`);
    }
    if (!r.sources?.length) {
      throw new Error(`[knowledge] relation "${r.id}" missing sources`);
    }
  }

  // Single relationship engine index — deduped; no parent arrays on entities.
  const relationshipIndex = createRelationshipIndex(rawRelations, {
    dedupe: true,
  });
  const relations = relationshipIndex.relations;

  const collectionsBySlug = new Map<string, KnowledgeCollection>();
  for (const c of collections) {
    collectionsBySlug.set(c.slug, c);
  }

  return {
    entities,
    entitiesById,
    aliases,
    relations,
    relationshipIndex,
    collections: [...collections].sort((a, b) => a.order - b.order),
    collectionsBySlug,
  };
}

function getStore(): Promise<Store> {
  const existing = getStoreCache();
  if (existing) return existing;
  const pending = loadStore().catch((err: unknown) => {
    setStoreCache(undefined);
    throw err;
  });
  setStoreCache(pending);
  return pending;
}

/** Batch entity lookup by id / slug / genealogy alias — one store load. */
export async function getEntitiesByIdsOrAliases(
  ids: readonly string[],
): Promise<KnowledgeEntity[]> {
  const store = await getStore();
  const out: KnowledgeEntity[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const resolved = store.aliases.get(id) ?? id;
    if (seen.has(resolved)) continue;
    const entity = store.entitiesById.get(resolved);
    if (entity) {
      seen.add(resolved);
      out.push(entity);
    }
  }
  return out;
}

export async function getRelationshipIndex(): Promise<RelationshipIndex> {
  return (await getStore()).relationshipIndex;
}

export async function getAllEntities(): Promise<readonly KnowledgeEntity[]> {
  return (await getStore()).entities;
}

export async function getAllRelations(): Promise<readonly KnowledgeRelation[]> {
  return (await getStore()).relations;
}

export async function getEntity(
  idOrSlug: string,
): Promise<KnowledgeEntity | undefined> {
  const store = await getStore();
  const id = store.aliases.get(idOrSlug) ?? idOrSlug;
  return store.entitiesById.get(id);
}

export async function getEntityByKindSlug(
  kind: string,
  slug: string,
): Promise<KnowledgeEntity | undefined> {
  const store = await getStore();
  return store.entities.find((e) => e.kind === kind && e.slug === slug);
}

export async function resolveEntityId(
  idOrAlias: string,
): Promise<string | undefined> {
  const store = await getStore();
  return store.aliases.get(idOrAlias) ?? store.entitiesById.get(idOrAlias)?.id;
}

export async function getCollections(): Promise<readonly KnowledgeCollection[]> {
  return (await getStore()).collections;
}

export async function getCollection(
  slug: string,
): Promise<KnowledgeCollection | undefined> {
  return (await getStore()).collectionsBySlug.get(slug);
}

export async function getCollectionsForEntity(
  entityId: string,
): Promise<KnowledgeCollection[]> {
  const store = await getStore();
  return store.collections.filter((c) =>
    Array.isArray(c.entityIds) ? c.entityIds.includes(entityId) : false,
  );
}

export async function getEntitiesByKind(
  kind: string,
): Promise<KnowledgeEntity[]> {
  const store = await getStore();
  return store.entities.filter(
    (e) => e.kind === kind && e.status === "published",
  );
}

function hopsToRelatedEdges(
  store: Store,
  hops: RelationshipHop[],
): RelatedEdge[] {
  const out: RelatedEdge[] = [];
  for (const hop of hops) {
    const other = store.entitiesById.get(hop.otherId);
    if (!other) continue;
    const raw =
      store.relationshipIndex.outEdges
        .get(hop.relationship.source)
        ?.find((r) => r.id === hop.relationship.id) ??
      store.relationshipIndex.inEdges
        .get(hop.relationship.target)
        ?.find((r) => r.id === hop.relationship.id);
    if (!raw) continue;
    out.push({
      relation: raw,
      other,
      direction: hop.direction,
      relationship: hop.relationship,
    });
  }
  return out;
}

export async function getRelated(
  entityId: string,
  types?: RelationType[],
): Promise<RelatedEdge[]> {
  const store = await getStore();
  const hops = getRelationships(store.relationshipIndex, entityId, types);
  return hopsToRelatedEdges(store, hops);
}

/**
 * Batch related-edge lookup — one store load, no per-entity await waterfall.
 */
export async function getRelatedMany(
  entityIds: readonly string[],
  types?: RelationType[],
): Promise<Map<string, RelatedEdge[]>> {
  const store = await getStore();
  const out = new Map<string, RelatedEdge[]>();
  for (const id of entityIds) {
    const hops = getRelationships(store.relationshipIndex, id, types);
    out.set(id, hopsToRelatedEdges(store, hops));
  }
  return out;
}

/** Direction-aware parents via the shared relationship engine. */
export async function getEntityParents(
  entityId: string,
): Promise<RelatedEdge[]> {
  const store = await getStore();
  return hopsToRelatedEdges(
    store,
    getParents(store.relationshipIndex, entityId),
  );
}

/** Direction-aware children via the shared relationship engine. */
export async function getEntityChildren(
  entityId: string,
): Promise<RelatedEdge[]> {
  const store = await getStore();
  return hopsToRelatedEdges(
    store,
    getChildren(store.relationshipIndex, entityId),
  );
}

export async function getEntityAncestors(
  entityId: string,
  opts?: { maxDepth?: number },
): Promise<Array<LineageHit & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return findAncestors(store.relationshipIndex, entityId, opts).map((h) => ({
    ...h,
    entity: store.entitiesById.get(h.id),
  }));
}

export async function getEntityDescendants(
  entityId: string,
  opts?: { maxDepth?: number },
): Promise<Array<LineageHit & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return findDescendants(store.relationshipIndex, entityId, opts).map((h) => ({
    ...h,
    entity: store.entitiesById.get(h.id),
  }));
}

export async function getBattlesInvolving(
  entityId: string,
): Promise<Array<RelatedMatch & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return findBattlesInvolving(store.relationshipIndex, entityId, (id) => {
    const e = store.entitiesById.get(id);
    return e?.kind === "battle" || e?.kind === "event";
  }).map((m) => ({ ...m, entity: store.entitiesById.get(m.entityId) }));
}

export async function getPlacesRuledBy(
  rulerIds: readonly string[],
): Promise<Array<RelatedMatch & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  const placeKinds = new Set([
    "city",
    "kingdom",
    "forest",
    "pilgrimage",
    "battlefield",
    "ashrama",
    "temple",
    "river",
    "mountain",
  ]);
  return findPlacesRuledBy(store.relationshipIndex, rulerIds, (id) => {
    const e = store.entitiesById.get(id);
    return Boolean(e && placeKinds.has(e.kind));
  }).map((m) => ({ ...m, entity: store.entitiesById.get(m.entityId) }));
}

export async function getDynastyMembers(
  dynastyId: string,
): Promise<Array<RelatedMatch & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return findDynastyMembers(store.relationshipIndex, dynastyId).map((m) => ({
    ...m,
    entity: store.entitiesById.get(m.entityId),
  }));
}

export async function traverseEntityRelationships(
  entityId: string,
  opts?: TraverseOptions,
): Promise<Array<LineageHit & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return traverseRelationships(store.relationshipIndex, entityId, opts).map(
    (h) => ({
      ...h,
      entity: store.entitiesById.get(h.id),
    }),
  );
}

export async function getRelatedByTypes(
  entityId: string,
  types: readonly RelationType[],
): Promise<Array<RelatedMatch & { entity?: KnowledgeEntity }>> {
  const store = await getStore();
  return findRelatedByTypes(store.relationshipIndex, entityId, types).map(
    (m) => ({ ...m, entity: store.entitiesById.get(m.entityId) }),
  );
}

/** Entities that cite / appear in a Gita verse stub (`verse.bg.2.47` or `bg.2.47`). */
export async function getEntitiesForVersePublicId(
  publicId: string,
): Promise<RelatedEdge[]> {
  const normalized = publicId.startsWith("bg.")
    ? publicId
    : publicId.match(/^\d+\.\d+$/)
      ? `bg.${publicId}`
      : publicId;
  const verseId = normalized.startsWith("verse.")
    ? normalized
    : `verse.${normalized}`;
  return getRelated(verseId, ["appears-in", "mentioned-in"]);
}

/** Unique entities linked to any verse stub in a Gita chapter. */
export async function getEntitiesForGitaChapter(
  chapterNumber: number,
): Promise<KnowledgeEntity[]> {
  const store = await getStore();
  const prefix = `verse.bg.${chapterNumber}.`;
  const byId = new Map<string, KnowledgeEntity>();
  for (const e of store.entities) {
    if (!e.id.startsWith(prefix)) continue;
    for (const edge of await getRelated(e.id, ["appears-in", "mentioned-in"])) {
      byId.set(edge.other.id, edge.other);
    }
  }
  return [...byId.values()].sort((a, b) => b.importance - a.importance);
}

const GROUP_ORDER: Array<{ title: string; match: (t: string) => boolean }> = [
  {
    title: "Parents",
    match: (t) =>
      t === "father" ||
      t === "mother" ||
      t === "parent" ||
      t === "adoptive-father" ||
      t === "adoptive-mother",
  },
  {
    title: "Children",
    match: (t) =>
      t === "son" ||
      t === "daughter" ||
      t === "child" ||
      t === "adoptive-son" ||
      t === "adoptive-daughter",
  },
  {
    title: "Spouses",
    match: (t) => t === "spouse" || t === "consort",
  },
  {
    title: "Siblings",
    match: (t) => t === "brother" || t === "sister" || t === "sibling",
  },
  {
    title: "Teachers & disciples",
    match: (t) => t === "guru" || t === "disciple",
  },
  {
    title: "Places",
    match: (t) =>
      t === "king-of" ||
      t === "queen-of" ||
      t === "resident-of" ||
      t === "visited" ||
      t === "located-in" ||
      t === "located-at" ||
      t === "born-at" ||
      t === "died-at" ||
      t === "capital-of" ||
      t === "fought-in" ||
      t === "occurred-at",
  },
  {
    title: "Events",
    match: (t) =>
      t === "participated-in" || t === "precedes" || t === "fought-in",
  },
  {
    title: "Dynasty",
    match: (t) => t === "belongs-to-dynasty",
  },
  {
    title: "Scripture",
    match: (t) => t === "appears-in" || t === "mentioned-in",
  },
  {
    title: "Identity",
    match: (t) =>
      t === "incarnation-of" ||
      t === "manifestation-of" ||
      t === "aspect-of",
  },
  {
    title: "Related",
    match: (t) =>
      t === "friend" ||
      t === "enemy" ||
      t === "ally" ||
      t === "connected-to" ||
      t === "fought" ||
      t === "wielded" ||
      t === "ancestor" ||
      t === "descendant" ||
      t === "ruled" ||
      t === "ruled-by",
  },
];

export async function getEntityBundle(
  idOrSlug: string,
): Promise<EntityBundle | undefined> {
  const store = await getStore();
  const id = store.aliases.get(idOrSlug) ?? idOrSlug;
  const entity = store.entitiesById.get(id);
  if (!entity) return undefined;

  const related = await getRelated(id);
  const consumed = new Set<RelatedEdge>();
  const grouped: EntityBundle["grouped"] = [];
  for (const { title, match } of GROUP_ORDER) {
    const items = related.filter((r) => match(r.relation.type));
    if (items.length === 0) continue;
    grouped.push({ title, items });
    items.forEach((i) => consumed.add(i));
  }
  const rest = related.filter((r) => !consumed.has(r));
  if (rest.length) grouped.push({ title: "Other", items: rest });

  const collections = store.collections.filter((c) =>
    Array.isArray(c.entityIds) ? c.entityIds.includes(id) : false,
  );

  return { entity, related, grouped, collections };
}

export async function getEntitiesForCollection(
  slug: string,
): Promise<KnowledgeEntity[]> {
  const store = await getStore();
  const col = store.collectionsBySlug.get(slug);
  if (!col) return [];
  return (col.entityIds ?? [])
    .map((id) => store.entitiesById.get(id))
    .filter((e): e is KnowledgeEntity => Boolean(e));
}

export function relationLabel(type: RelationType): string {
  return RELATION_TYPE_LABELS[type] ?? type;
}

export function isParentEdge(type: RelationType): boolean {
  return (PARENT_EDGE_TYPES as readonly string[]).includes(type);
}
