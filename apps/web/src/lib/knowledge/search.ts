import {
  entitySearchKeys,
  type KnowledgeEntity,
  type EntityKind,
} from "@/lib/knowledge/types";

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export type EntitySearchHit = {
  id: string;
  slug: string;
  kind: EntityKind;
  name: string;
  englishName: string;
  summary: string;
  href: string;
  score: number;
};

export function entityHref(entity: KnowledgeEntity): string {
  const k = entity.kind;
  if (k === "kingdom") return `/kingdoms/${entity.slug}`;
  if (k === "weapon") return `/weapons/${entity.slug}`;
  if (k === "concept") return `/concepts/${entity.slug}`;
  if (k === "event" || k === "battle") return `/events/${entity.slug}`;
  if (
    [
      "city",
      "forest",
      "mountain",
      "river",
      "pilgrimage",
      "ashrama",
      "battlefield",
      "place",
      "sacred-site",
      "realm",
      "ocean",
      "region",
      "tirtha",
      "island",
    ].includes(k)
  ) {
    if (entity.slug === "ayodhya") return `/encyclopedia/${k}/${entity.slug}`;
    return `/atlas/${entity.slug}`;
  }
  return `/encyclopedia/${k}/${entity.slug}`;
}

export function searchEntities(
  entities: readonly KnowledgeEntity[],
  query: string,
  limit = 20,
): EntitySearchHit[] {
  const q = query.trim();
  if (!q) {
    return entities
      .filter((e) => e.status === "published")
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit)
      .map((e) => ({
        id: e.id,
        slug: e.slug,
        kind: e.kind,
        name: e.name,
        englishName: e.englishName,
        summary: e.summary,
        href: entityHref(e),
        score: e.importance,
      }));
  }

  const qFold = fold(q);
  const scored: EntitySearchHit[] = [];
  for (const e of entities) {
    if (e.status !== "published") continue;
    let score = 0;
    for (const key of entitySearchKeys(e)) {
      const k = fold(key);
      if (k === qFold) score += 8;
      else if (k.startsWith(qFold)) score += 5;
      else if (k.includes(qFold)) score += 3;
    }
    if (fold(e.summary).includes(qFold)) score += 1;
    if (score > 0) {
      scored.push({
        id: e.id,
        slug: e.slug,
        kind: e.kind,
        name: e.name,
        englishName: e.englishName,
        summary: e.summary,
        href: entityHref(e),
        score: score + e.importance * 0.1,
      });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
