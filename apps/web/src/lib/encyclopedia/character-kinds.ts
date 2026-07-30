import type { KnowledgeEntity } from "@/lib/knowledge/types";

const CHARACTER_KINDS = new Set([
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

/** Person-like encyclopedia subjects (characters). */
export function isCharacterEntity(entity: KnowledgeEntity): boolean {
  if (CHARACTER_KINDS.has(entity.kind)) return true;
  return (
    entity.id.startsWith("person.") ||
    Boolean(entity.externalRefs?.genealogyId)
  );
}

export function isWeaponEntity(entity: KnowledgeEntity): boolean {
  return entity.kind === "weapon";
}

export function isConceptEntity(entity: KnowledgeEntity): boolean {
  return entity.kind === "concept";
}

export function isPlaceLikeEntity(entity: KnowledgeEntity): boolean {
  return (
    entity.kind === "kingdom" ||
    entity.kind === "city" ||
    entity.kind === "forest" ||
    entity.kind === "river" ||
    entity.kind === "mountain" ||
    entity.kind === "temple" ||
    entity.kind === "pilgrimage" ||
    entity.kind === "battlefield" ||
    entity.kind === "ashrama" ||
    Boolean(entity.atlas)
  );
}

export function isEventLikeEntity(entity: KnowledgeEntity): boolean {
  return (
    entity.kind === "event" ||
    entity.kind === "battle" ||
    Boolean(entity.event)
  );
}

export function isVerseEntity(entity: KnowledgeEntity): boolean {
  return entity.kind === "verse" || entity.id.startsWith("verse.");
}

export function isDynastyEntity(entity: KnowledgeEntity): boolean {
  return entity.kind === "dynasty";
}
