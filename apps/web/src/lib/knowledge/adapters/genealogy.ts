/**
 * Genealogy adapter — collections + entities → shapes genealogy UI expects.
 */
import {
  getCollection,
  getCollections,
  getCollectionsForEntity,
  getEntitiesByIdsOrAliases,
  getEntitiesForCollection,
  getEntity,
  getRelated,
  getRelatedMany,
  resolveEntityId,
} from "@/lib/knowledge/store";
import type { KnowledgeEntity, KnowledgeCollection } from "@/lib/knowledge/types";
import type {
  GenealogyModule,
  Person,
  PersonCategory,
  Relationship,
  RelationshipType,
} from "@/lib/genealogy/types";
import { RELATIONSHIP_TYPES } from "@/lib/genealogy/types";
import type { RelatedEdge } from "@/lib/knowledge/store";

const KIND_TO_CATEGORY: Record<string, PersonCategory> = {
  deity: "trimurti",
  avatar: "avatar",
  sage: "rishi",
  prajapati: "prajapati",
  manu: "manu",
  king: "king",
  queen: "queen",
  prince: "prince",
  princess: "princess",
  warrior: "warrior",
  deva: "deva",
  daitya: "daitya",
  danava: "danava",
  rakshasa: "rakshasa",
  asura: "asura",
  yaksha: "yaksha",
  gandharva: "gandharva",
  naga: "naga",
  devi: "devi",
  person: "other",
};

function legacyPersonId(entity: KnowledgeEntity): string {
  return (
    entity.externalRefs?.genealogyId ??
    (entity.id.startsWith("person.")
      ? entity.id.slice("person.".length)
      : entity.slug)
  );
}

function isPersonLike(entity: KnowledgeEntity): boolean {
  return (
    entity.id.startsWith("person.") || Boolean(entity.externalRefs?.genealogyId)
  );
}

function entityToPersonFromRelated(
  entity: KnowledgeEntity,
  related: RelatedEdge[],
): Person {
  const outRels: Relationship[] = [];
  const relatedVerses: Person["relatedVerses"] = [];
  for (const edge of related) {
    if (edge.direction !== "out") continue;
    if (
      (edge.relation.type === "appears-in" ||
        edge.relation.type === "mentioned-in") &&
      edge.other.kind === "verse" &&
      edge.other.externalRefs?.publicId
    ) {
      const publicId = edge.other.externalRefs.publicId;
      const m = /^bg\.(\d+)\.(\d+)$/i.exec(publicId);
      relatedVerses.push({
        workCode: "bg",
        publicId,
        label: m ? `BG ${m[1]}.${m[2]}` : publicId,
      });
      continue;
    }
    if (!isPersonLike(edge.other)) continue;
    const type = edge.relation.type as RelationshipType;
    if (!(RELATIONSHIP_TYPES as readonly string[]).includes(type)) continue;
    outRels.push({
      type,
      personId: legacyPersonId(edge.other),
      confidence: edge.relation.confidence,
      sources: edge.relation.sources,
      note: edge.relation.note,
    });
  }
  return {
    id: legacyPersonId(entity),
    slug: entity.slug,
    name: entity.name,
    englishName: entity.englishName,
    iastName: entity.iastName,
    sanskritName: entity.sanskritName,
    aliases: entity.aliases ?? [],
    gender: entity.gender ?? "unknown",
    category: KIND_TO_CATEGORY[entity.kind] ?? "other",
    era: entity.era ?? "unspecified",
    epithet: entity.epithet,
    description: entity.description,
    primaryScripture: entity.primaryScripture,
    importance: entity.importance,
    relationships: outRels,
    variantTraditions: entity.variantTraditions ?? [],
    scriptureSources: entity.scriptureSources ?? [],
    relatedStories: [],
    relatedVerses,
    notes: entity.notes,
    imagePlaceholder: entity.image?.placeholder,
    encyclopediaHref: `/encyclopedia/${entity.kind}/${entity.slug}`,
  };
}

async function entityToPerson(entity: KnowledgeEntity): Promise<Person> {
  const related = await getRelated(entity.id);
  return entityToPersonFromRelated(entity, related);
}

function collectionToModule(c: KnowledgeCollection): GenealogyModule {
  return {
    slug: c.slug,
    title: c.title,
    sanskritTitle: c.sanskritTitle,
    eyebrow: c.eyebrow,
    summary: c.summary,
    description: c.description,
    status: c.status,
    personIds: c.entityIds
      .filter((id) => id.startsWith("person."))
      .map((id) => id.replace(/^person\./, "")),
    rootPersonId: c.rootEntityId?.replace(/^person\./, ""),
    highlightPath: c.highlightPath
      ?.filter((id) => id.startsWith("person."))
      .map((id) => id.replace(/^person\./, "")),
    scriptureSources: c.scriptureSources ?? [],
    relatedGitaChapters: c.relatedGitaChapters,
    faq: c.faq,
    color: c.color,
    order: c.order,
  };
}

export async function getGenealogyModulesFromKnowledge(): Promise<
  GenealogyModule[]
> {
  const cols = await getCollections();
  return cols
    .filter((c) => c.kind === "genealogy-module")
    .map(collectionToModule)
    .sort((a, b) => a.order - b.order);
}

export async function getGenealogyModuleFromKnowledge(
  slug: string,
): Promise<GenealogyModule | undefined> {
  const c = await getCollection(slug);
  if (!c || c.kind !== "genealogy-module") return undefined;
  return collectionToModule(c);
}

export async function getPeopleForGenealogyModule(
  slug: string,
): Promise<Person[]> {
  const entities = (await getEntitiesForCollection(slug)).filter(isPersonLike);
  if (entities.length === 0) return [];
  const relatedMap = await getRelatedMany(entities.map((e) => e.id));
  return entities.map((entity) =>
    entityToPersonFromRelated(entity, relatedMap.get(entity.id) ?? []),
  );
}

/** Legacy person ids only — cheap for generateStaticParams. */
export async function listGenealogyPersonIds(): Promise<string[]> {
  const modules = await getGenealogyModulesFromKnowledge();
  const ids = new Set<string>();
  for (const mod of modules) {
    for (const id of mod.personIds) ids.add(id);
  }
  return [...ids];
}

/** Resolve a small set of people by legacy id (neighbors on a person page). */
export async function getGenealogyPeopleByLegacyIds(
  legacyIds: readonly string[],
): Promise<Person[]> {
  const unique = [...new Set(legacyIds)];
  if (unique.length === 0) return [];
  const entities = (await getEntitiesByIdsOrAliases(unique)).filter(isPersonLike);
  if (entities.length === 0) return [];
  const relatedMap = await getRelatedMany(entities.map((e) => e.id));
  return entities.map((entity) =>
    entityToPersonFromRelated(entity, relatedMap.get(entity.id) ?? []),
  );
}

export async function getGenealogyPersonFromKnowledge(
  legacyId: string,
): Promise<Person | undefined> {
  const entityId = await resolveEntityId(legacyId);
  if (!entityId) return undefined;
  const entity = await getEntity(entityId);
  if (!entity || !isPersonLike(entity)) return undefined;
  return entityToPerson(entity);
}

export async function getGenealogyModulesForPerson(
  legacyId: string,
): Promise<GenealogyModule[]> {
  const entityId = await resolveEntityId(legacyId);
  if (!entityId) return [];
  const cols = await getCollectionsForEntity(entityId);
  return cols
    .filter((c) => c.kind === "genealogy-module")
    .map(collectionToModule);
}

/** Canonical Encyclopedia URL for a legacy genealogy person id. */
export async function getEncyclopediaHrefForGenealogyId(
  legacyId: string,
): Promise<string | undefined> {
  const entityId = await resolveEntityId(legacyId);
  if (!entityId) return undefined;
  const entity = await getEntity(entityId);
  if (!entity) return undefined;
  return `/encyclopedia/${entity.kind}/${entity.slug}`;
}
