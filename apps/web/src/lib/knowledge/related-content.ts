/**
 * Server wrapper — Related Content Engine over the live Knowledge Graph store.
 */
import "server-only";
import {
  buildRelatedContent,
  RELATED_CONTENT_BUCKET_LABELS,
  type RelatedContentBucket,
  type RelatedContentHit,
  type RelatedContentOptions,
  type RelatedContentResult,
} from "@/lib/knowledge/types";
import {
  getAllEntities,
  getRelationshipIndex,
} from "@/lib/knowledge/store";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import {
  exploreHrefForBucket,
  type ExploreLink,
} from "@/lib/knowledge/explore-href";
import { gitaChapterHref } from "@/lib/events/helpers";
import { RELATION_TYPE_LABELS, type RelationType } from "@/lib/knowledge/types";

export type ResolvedRelatedHit = {
  entity: KnowledgeEntity | null;
  hit: RelatedContentHit;
  link: ExploreLink;
  relationLabel: string | null;
};

export type ResolvedRelatedBucket = {
  bucket: RelatedContentBucket;
  label: string;
  items: ResolvedRelatedHit[];
};

export type ResolvedRelatedContent = {
  rootId: string;
  buckets: ResolvedRelatedBucket[];
  raw: RelatedContentResult;
};

function relationLabelFromHit(hit: RelatedContentHit): string | null {
  const last = hit.via[hit.via.length - 1];
  if (!last) return null;
  return (
    RELATION_TYPE_LABELS[last.type as RelationType] ??
    last.type.replace(/-/g, " ")
  );
}

/**
 * Run the Related Content Engine for any entity id.
 * Graph-only — no hard-coded recommendations.
 */
export async function getRelatedContent(
  entityId: string,
  options: RelatedContentOptions = {},
): Promise<ResolvedRelatedContent> {
  const [index, entities] = await Promise.all([
    getRelationshipIndex(),
    getAllEntities(),
  ]);
  const entitiesById = new Map(entities.map((e) => [e.id, e] as const));

  const raw = buildRelatedContent(index, entityId, entitiesById, options);

  const buckets: ResolvedRelatedBucket[] = [];

  for (const group of raw.buckets) {
    const items: ResolvedRelatedHit[] = [];
    for (const hit of group.hits) {
      if (group.bucket === "chapters") {
        const m = /^gita\.chapter\.(\d{1,2})$/.exec(hit.entityId);
        if (!m) continue;
        const n = Number(m[1]);
        items.push({
          entity: null,
          hit,
          link: {
            href: gitaChapterHref(n),
            label: `Bhagavad Gita ${n}`,
          },
          relationLabel: null,
        });
        continue;
      }

      const entity = entitiesById.get(hit.entityId) ?? null;
      if (!entity) continue;
      items.push({
        entity,
        hit,
        link: exploreHrefForBucket(entity, group.bucket),
        relationLabel: relationLabelFromHit(hit),
      });
    }
    if (items.length === 0) continue;
    buckets.push({
      bucket: group.bucket,
      label: group.label || RELATED_CONTENT_BUCKET_LABELS[group.bucket],
      items,
    });
  }

  return { rootId: entityId, buckets, raw };
}

/** Resolve related content when you already have the entity. */
export async function getRelatedContentForEntity(
  entity: Pick<KnowledgeEntity, "id">,
  options?: RelatedContentOptions,
): Promise<ResolvedRelatedContent> {
  return getRelatedContent(entity.id, options);
}

export type { RelatedContentOptions };
