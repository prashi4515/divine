/**
 * Shared Knowledge Graph relationship engine.
 *
 * Every edge is a cited relationship object. Traversal helpers never invent
 * edges — they only walk what exists in the relation index.
 *
 * Storage fields: fromId / toId / sources
 * Product view:   source / target / citation  (via toRelationshipObject)
 */

import {
  BATTLE_EDGE_TYPES,
  RULE_EDGE_TYPES,
  dedupeRelations,
  isChildToParentType,
  isParentToChildType,
  toRelationshipObject,
  type KnowledgeRelation,
  type RelationType,
  type RelationshipObject,
} from "./relation";

export type RelationshipHop = {
  relationship: RelationshipObject;
  /** Neighbor entity id (the other end from `from`). */
  otherId: string;
  /** Direction relative to the query entity. */
  direction: "out" | "in";
};

export type RelationshipIndex = {
  relations: readonly KnowledgeRelation[];
  outEdges: ReadonlyMap<string, readonly KnowledgeRelation[]>;
  inEdges: ReadonlyMap<string, readonly KnowledgeRelation[]>;
};

export type TraverseOptions = {
  /** Max hops (default unlimited for lineage helpers that set their own). */
  maxDepth?: number;
  /** Only follow these relation types (either direction unless directed). */
  types?: readonly RelationType[];
  /** Restrict neighbor ids (e.g. module membership). */
  allowIds?: ReadonlySet<string>;
  /** When true, do not revisit an entity. Default true. */
  unique?: boolean;
};

export type LineageHit = {
  id: string;
  depth: number;
  via: RelationshipObject[];
};

/** Build adjacency maps; optionally dedupe first. */
export function createRelationshipIndex(
  relations: readonly KnowledgeRelation[],
  opts?: { dedupe?: boolean },
): RelationshipIndex {
  const list =
    opts?.dedupe === false
      ? [...relations]
      : dedupeRelations(relations);
  const outEdges = new Map<string, KnowledgeRelation[]>();
  const inEdges = new Map<string, KnowledgeRelation[]>();
  for (const r of list) {
    const out = outEdges.get(r.fromId) ?? [];
    out.push(r);
    outEdges.set(r.fromId, out);
    const inn = inEdges.get(r.toId) ?? [];
    inn.push(r);
    inEdges.set(r.toId, inn);
  }
  return { relations: list, outEdges, inEdges };
}

function typeAllowed(
  type: RelationType,
  types: readonly RelationType[] | undefined,
): boolean {
  if (!types || types.length === 0) return true;
  return (types as readonly string[]).includes(type);
}

/** One-hop neighbors as relationship objects (deduped by relation id). */
export function getRelationships(
  index: RelationshipIndex,
  entityId: string,
  types?: readonly RelationType[],
): RelationshipHop[] {
  const hops: RelationshipHop[] = [];
  const seen = new Set<string>();

  for (const r of index.outEdges.get(entityId) ?? []) {
    if (!typeAllowed(r.type, types)) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    hops.push({
      relationship: toRelationshipObject(r),
      otherId: r.toId,
      direction: "out",
    });
  }
  for (const r of index.inEdges.get(entityId) ?? []) {
    if (!typeAllowed(r.type, types)) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    hops.push({
      relationship: toRelationshipObject(r),
      otherId: r.fromId,
      direction: "in",
    });
  }
  return hops;
}

/**
 * Immediate parents — direction-aware.
 * Uses outgoing child→parent edges OR incoming parent→child edges.
 * Dedupes by parent id (father+son dual edges count once).
 */
export function getParents(
  index: RelationshipIndex,
  entityId: string,
): RelationshipHop[] {
  const byParent = new Map<string, RelationshipHop>();

  for (const r of index.outEdges.get(entityId) ?? []) {
    if (!isChildToParentType(r.type)) continue;
    if (!byParent.has(r.toId)) {
      byParent.set(r.toId, {
        relationship: toRelationshipObject(r),
        otherId: r.toId,
        direction: "out",
      });
    }
  }
  for (const r of index.inEdges.get(entityId) ?? []) {
    if (!isParentToChildType(r.type)) continue;
    if (!byParent.has(r.fromId)) {
      byParent.set(r.fromId, {
        relationship: toRelationshipObject(r),
        otherId: r.fromId,
        direction: "in",
      });
    }
  }
  return [...byParent.values()];
}

/**
 * Immediate children — direction-aware.
 * Uses outgoing parent→child edges OR incoming child→parent edges.
 */
export function getChildren(
  index: RelationshipIndex,
  entityId: string,
): RelationshipHop[] {
  const byChild = new Map<string, RelationshipHop>();

  for (const r of index.outEdges.get(entityId) ?? []) {
    if (!isParentToChildType(r.type)) continue;
    if (!byChild.has(r.toId)) {
      byChild.set(r.toId, {
        relationship: toRelationshipObject(r),
        otherId: r.toId,
        direction: "out",
      });
    }
  }
  for (const r of index.inEdges.get(entityId) ?? []) {
    if (!isChildToParentType(r.type)) continue;
    if (!byChild.has(r.fromId)) {
      byChild.set(r.fromId, {
        relationship: toRelationshipObject(r),
        otherId: r.fromId,
        direction: "in",
      });
    }
  }
  return [...byChild.values()];
}

function bfsLineage(
  index: RelationshipIndex,
  startId: string,
  next: (id: string) => RelationshipHop[],
  maxDepth = Number.POSITIVE_INFINITY,
  allowIds?: ReadonlySet<string>,
): LineageHit[] {
  const hits: LineageHit[] = [];
  const seen = new Set<string>([startId]);
  const queue: Array<{ id: string; depth: number; via: RelationshipObject[] }> =
    [{ id: startId, depth: 0, via: [] }];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.depth > 0) {
      hits.push({ id: cur.id, depth: cur.depth, via: cur.via });
    }
    if (cur.depth >= maxDepth) continue;
    for (const hop of next(cur.id)) {
      if (seen.has(hop.otherId)) continue;
      if (allowIds && !allowIds.has(hop.otherId)) continue;
      seen.add(hop.otherId);
      queue.push({
        id: hop.otherId,
        depth: cur.depth + 1,
        via: [...cur.via, hop.relationship],
      });
    }
  }
  return hits;
}

/** Multi-hop ancestors (parents of parents…). */
export function findAncestors(
  index: RelationshipIndex,
  entityId: string,
  opts?: { maxDepth?: number; allowIds?: ReadonlySet<string> },
): LineageHit[] {
  return bfsLineage(
    index,
    entityId,
    (id) => getParents(index, id),
    opts?.maxDepth ?? Number.POSITIVE_INFINITY,
    opts?.allowIds,
  );
}

/** Multi-hop descendants (children of children…). */
export function findDescendants(
  index: RelationshipIndex,
  entityId: string,
  opts?: { maxDepth?: number; allowIds?: ReadonlySet<string> },
): LineageHit[] {
  return bfsLineage(
    index,
    entityId,
    (id) => getChildren(index, id),
    opts?.maxDepth ?? Number.POSITIVE_INFINITY,
    opts?.allowIds,
  );
}

/**
 * Generic BFS over typed edges (either direction).
 * Useful for “everything connected by X within N hops”.
 */
export function traverseRelationships(
  index: RelationshipIndex,
  startId: string,
  opts: TraverseOptions = {},
): LineageHit[] {
  const maxDepth = opts.maxDepth ?? Number.POSITIVE_INFINITY;
  const unique = opts.unique !== false;
  const hits: LineageHit[] = [];
  const seen = new Set<string>([startId]);
  const queue: Array<{ id: string; depth: number; via: RelationshipObject[] }> =
    [{ id: startId, depth: 0, via: [] }];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.depth > 0) {
      hits.push({ id: cur.id, depth: cur.depth, via: cur.via });
    }
    if (cur.depth >= maxDepth) continue;
    for (const hop of getRelationships(index, cur.id, opts.types)) {
      if (unique && seen.has(hop.otherId)) continue;
      if (opts.allowIds && !opts.allowIds.has(hop.otherId)) continue;
      if (unique) seen.add(hop.otherId);
      queue.push({
        id: hop.otherId,
        depth: cur.depth + 1,
        via: [...cur.via, hop.relationship],
      });
    }
  }
  return hits;
}

export type RelatedMatch = {
  entityId: string;
  relationships: RelationshipObject[];
};

/**
 * Find entities linked to `entityId` by any of `types` (1 hop, either way).
 * Optional `otherIds` / kind filter applied by caller via predicate.
 */
export function findRelatedByTypes(
  index: RelationshipIndex,
  entityId: string,
  types: readonly RelationType[],
): RelatedMatch[] {
  const byOther = new Map<string, RelationshipObject[]>();
  for (const hop of getRelationships(index, entityId, types)) {
    const list = byOther.get(hop.otherId) ?? [];
    list.push(hop.relationship);
    byOther.set(hop.otherId, list);
  }
  return [...byOther.entries()].map(([entityId, relationships]) => ({
    entityId,
    relationships,
  }));
}

/**
 * Find all battles / events involving an entity
 * (fought-in, participated-in, fought).
 */
export function findBattlesInvolving(
  index: RelationshipIndex,
  entityId: string,
  isBattleOrEvent: (id: string) => boolean,
): RelatedMatch[] {
  return findRelatedByTypes(index, entityId, BATTLE_EDGE_TYPES).filter((m) =>
    isBattleOrEvent(m.entityId),
  );
}

/**
 * Find places / kingdoms ruled by any of the given rulers
 * (king-of, queen-of, ruled).
 */
export function findPlacesRuledBy(
  index: RelationshipIndex,
  rulerIds: readonly string[],
  isPlace: (id: string) => boolean,
): RelatedMatch[] {
  const byPlace = new Map<string, RelationshipObject[]>();
  for (const rulerId of rulerIds) {
    for (const hop of getRelationships(index, rulerId, RULE_EDGE_TYPES)) {
      if (hop.direction !== "out") continue;
      if (!isPlace(hop.otherId)) continue;
      const list = byPlace.get(hop.otherId) ?? [];
      // Dedupe identical relationship objects
      if (!list.some((r) => r.id === hop.relationship.id)) {
        list.push(hop.relationship);
      }
      byPlace.set(hop.otherId, list);
    }
    // Also: place --ruled-by--> ruler
    for (const hop of getRelationships(index, rulerId, ["ruled-by"])) {
      if (hop.direction !== "in") continue;
      if (!isPlace(hop.otherId)) continue;
      const list = byPlace.get(hop.otherId) ?? [];
      if (!list.some((r) => r.id === hop.relationship.id)) {
        list.push(hop.relationship);
      }
      byPlace.set(hop.otherId, list);
    }
  }
  return [...byPlace.entries()].map(([entityId, relationships]) => ({
    entityId,
    relationships,
  }));
}

/** Members of a dynasty via belongs-to-dynasty (either direction). */
export function findDynastyMembers(
  index: RelationshipIndex,
  dynastyId: string,
): RelatedMatch[] {
  return findRelatedByTypes(index, dynastyId, ["belongs-to-dynasty"]);
}

export {
  BATTLE_EDGE_TYPES,
  RULE_EDGE_TYPES,
  dedupeRelations,
  toRelationshipObject,
  isChildToParentType,
  isParentToChildType,
};
