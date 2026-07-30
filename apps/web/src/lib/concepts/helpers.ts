import type { KnowledgeEntity } from "@/lib/knowledge/types";

export type KnowledgeConcept = KnowledgeEntity & {
  kind: "concept";
};

export function isKnowledgeConcept(
  entity: KnowledgeEntity,
): entity is KnowledgeConcept {
  return entity.kind === "concept" && entity.status === "published";
}

export function conceptHref(
  entity: Pick<KnowledgeEntity, "slug"> | string,
): string {
  const slug = typeof entity === "string" ? entity : entity.slug;
  return `/concepts/${slug}`;
}
