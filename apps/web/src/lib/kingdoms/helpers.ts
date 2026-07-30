import type { KnowledgeEntity } from "@/lib/knowledge/types";

export type KnowledgeKingdom = KnowledgeEntity & {
  kind: "kingdom";
};

export function isKnowledgeKingdom(
  entity: KnowledgeEntity,
): entity is KnowledgeKingdom {
  return entity.kind === "kingdom" && entity.status === "published";
}

export function kingdomHref(
  entity: Pick<KnowledgeEntity, "slug"> | string,
): string {
  const slug = typeof entity === "string" ? entity : entity.slug;
  return `/kingdoms/${slug}`;
}

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Match city.atlas.kingdom labels to a kingdom entity without new edges. */
export function cityBelongsToKingdom(
  city: KnowledgeEntity,
  kingdom: KnowledgeEntity,
): boolean {
  const label = city.atlas?.kingdom?.trim();
  if (!label) return false;
  const candidates = [
    kingdom.name,
    kingdom.englishName,
    kingdom.iastName ?? "",
    ...(kingdom.aliases ?? []),
  ].filter(Boolean);
  const folded = fold(label);
  return candidates.some((c) => fold(c) === folded || fold(c).includes(folded) || folded.includes(fold(c)));
}
