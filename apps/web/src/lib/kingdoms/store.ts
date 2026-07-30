/**
 * Kingdoms module — all sections resolve from shared Knowledge Graph JSON.
 * No Neon. No parallel kingdom dataset.
 */
import "server-only";
import {
  getAllEntities,
  getCollections,
  getEntity,
  getRelated,
  type RelatedEdge,
} from "@/lib/knowledge/store";
import type {
  KnowledgeCollection,
  KnowledgeEntity,
  RelationType,
} from "@/lib/knowledge/types";
import { isKnowledgeEvent, type KnowledgeEvent } from "@/lib/events/helpers";
import { verseReaderHref } from "@/lib/events/helpers";
import { isAtlasPlace } from "@/lib/atlas/geo";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import {
  cityBelongsToKingdom,
  isKnowledgeKingdom,
  type KnowledgeKingdom,
} from "@/lib/kingdoms/helpers";

export type { KnowledgeKingdom } from "@/lib/kingdoms/helpers";
export { kingdomHref, isKnowledgeKingdom } from "@/lib/kingdoms/helpers";

export async function getKingdoms(): Promise<KnowledgeKingdom[]> {
  const all = await getAllEntities();
  return all
    .filter(isKnowledgeKingdom)
    .sort(
      (a, b) =>
        b.importance - a.importance || a.name.localeCompare(b.name, "en"),
    );
}

export async function getKingdomBySlug(
  slug: string,
): Promise<KnowledgeKingdom | null> {
  const kingdoms = await getKingdoms();
  return kingdoms.find((k) => k.slug === slug) ?? null;
}

export type KingdomResolvedLinks = {
  overview: {
    summary: string;
    description: string;
    primaryScripture: string;
    sources: KnowledgeEntity["scriptureSources"];
    era?: string;
    modernLocation?: string;
  };
  capital: KnowledgeEntity | null;
  rulers: KnowledgeEntity[];
  dynasty: KnowledgeEntity[];
  majorCities: KnowledgeEntity[];
  battles: KnowledgeEvent[];
  timeline: KnowledgeEvent[];
  events: KnowledgeEvent[];
  characters: KnowledgeEntity[];
  scriptures: KnowledgeEntity[];
  verses: Array<{
    id: string;
    entity: KnowledgeEntity | null;
    href: string | null;
    label: string;
  }>;
  genealogyModules: KnowledgeCollection[];
  atlasPlace: KnowledgeKingdom | null;
  relatedEdges: RelatedEdge[];
};

function dedupeEntities(list: KnowledgeEntity[]): KnowledgeEntity[] {
  const seen = new Set<string>();
  const out: KnowledgeEntity[] = [];
  for (const e of list) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
}

function isCity(e: KnowledgeEntity): boolean {
  return e.kind === "city";
}

function isBattleEvent(e: KnowledgeEvent): boolean {
  return e.kind === "battle" || e.event.eventType === "battle";
}

function isScriptureEntity(e: KnowledgeEntity): boolean {
  return e.kind === "scripture" || e.kind === "chapter";
}

function isDynasty(e: KnowledgeEntity): boolean {
  return e.kind === "dynasty";
}

function isVerse(e: KnowledgeEntity): boolean {
  return e.kind === "verse" || e.id.startsWith("verse.");
}

const RULE_TYPES = new Set<RelationType>([
  "king-of",
  "queen-of",
  "ruled",
  "ruled-by",
]);

/**
 * Resolve every kingdom page section from KG entities + relations + event hubs.
 */
export async function resolveKingdomLinks(
  kingdom: KnowledgeKingdom,
): Promise<KingdomResolvedLinks> {
  const [all, related, collections] = await Promise.all([
    getAllEntities(),
    getRelated(kingdom.id),
    getCollections(),
  ]);

  const byId = new Map(all.map((e) => [e.id, e] as const));

  // Cities affiliated via atlas.kingdom label (existing JSON field — not a duplicate pack)
  const affiliatedCities = all.filter(
    (e) => isCity(e) && e.status === "published" && cityBelongsToKingdom(e, kingdom),
  );

  // Graph: capital-of, located-in cities
  const capitalFromEdges: KnowledgeEntity[] = [];
  const citiesFromEdges: KnowledgeEntity[] = [];
  const rulersFromEdges: KnowledgeEntity[] = [];
  const dynastiesFromEdges: KnowledgeEntity[] = [];
  const charactersFromEdges: KnowledgeEntity[] = [];
  const scripturesFromEdges: KnowledgeEntity[] = [];
  const verseHits: KingdomResolvedLinks["verses"] = [];

  for (const edge of related) {
    const other = edge.other;
    const t = edge.relation.type;

    if (t === "capital-of") {
      // kingdom --capital-of--> city  OR  city --capital-of--> kingdom
      if (isCity(other)) capitalFromEdges.push(other);
    }
    if (
      (t === "located-in" || t === "located-at" || t === "capital-of") &&
      isCity(other)
    ) {
      citiesFromEdges.push(other);
    }
    if (RULE_TYPES.has(t) && isCharacterEntity(other)) {
      rulersFromEdges.push(other);
      charactersFromEdges.push(other);
    }
    if (
      (t === "resident-of" ||
        t === "visited" ||
        t === "born-at" ||
        t === "died-at" ||
        t === "fought") &&
      isCharacterEntity(other)
    ) {
      charactersFromEdges.push(other);
    }
    if (t === "belongs-to-dynasty" && isDynasty(other)) {
      dynastiesFromEdges.push(other);
    }
    if (isScriptureEntity(other)) {
      scripturesFromEdges.push(other);
    }
    if (
      (t === "appears-in" || t === "mentioned-in") &&
      isVerse(other)
    ) {
      const publicId =
        other.externalRefs?.publicId ?? other.id.replace(/^verse\./, "");
      verseHits.push({
        id: other.id,
        entity: other,
        href: verseReaderHref(publicId),
        label: other.name,
      });
    }
  }

  // Rulers of affiliated cities (person --king-of--> city)
  for (const city of [...affiliatedCities, ...citiesFromEdges, ...capitalFromEdges]) {
    const cityRelated = await getRelated(city.id, [
      "king-of",
      "queen-of",
      "ruled",
      "ruled-by",
    ]);
    for (const edge of cityRelated) {
      if (!isCharacterEntity(edge.other)) continue;
      // person --king-of--> city  ⇒ direction in on city
      if (
        edge.direction === "in" &&
        (edge.relation.type === "king-of" ||
          edge.relation.type === "queen-of" ||
          edge.relation.type === "ruled")
      ) {
        rulersFromEdges.push(edge.other);
        charactersFromEdges.push(edge.other);
      }
      if (
        edge.direction === "out" &&
        edge.relation.type === "ruled-by" &&
        isCharacterEntity(edge.other)
      ) {
        rulersFromEdges.push(edge.other);
        charactersFromEdges.push(edge.other);
      }
    }
  }

  // Dynasties via characters belonging to dynasty
  for (const person of dedupeEntities(charactersFromEdges)) {
    const personEdges = await getRelated(person.id, ["belongs-to-dynasty"]);
    for (const edge of personEdges) {
      if (isDynasty(edge.other)) dynastiesFromEdges.push(edge.other);
    }
  }

  // Events listing this kingdom in event.kingdoms OR connected-to edge
  const events: KnowledgeEvent[] = [];
  for (const e of all) {
    if (!isKnowledgeEvent(e) || e.status !== "published") continue;
    const listed = e.event.kingdoms.includes(kingdom.id);
    const edged = related.some(
      (r) =>
        r.other.id === e.id &&
        (r.relation.type === "connected-to" ||
          r.relation.type === "fought-in" ||
          r.relation.type === "participated-in" ||
          r.relation.type === "occurred-at"),
    );
    if (listed || edged) events.push(e);
  }
  events.sort((a, b) => a.event.timelineOrder - b.event.timelineOrder);

  // Characters from event participants for this kingdom's events
  for (const ev of events) {
    for (const id of ev.event.participants) {
      const p = byId.get(id);
      if (p && isCharacterEntity(p)) charactersFromEdges.push(p);
    }
    for (const id of ev.event.verses) {
      const v = byId.get(id) ?? (await getEntity(id));
      if (!v) {
        verseHits.push({
          id,
          entity: null,
          href: verseReaderHref(id),
          label: id.replace(/^verse\./, ""),
        });
        continue;
      }
      if (isVerse(v)) {
        const publicId =
          v.externalRefs?.publicId ?? v.id.replace(/^verse\./, "");
        verseHits.push({
          id: v.id,
          entity: v,
          href: verseReaderHref(publicId),
          label: v.name,
        });
      }
    }
    for (const id of ev.event.scriptures) {
      const s = byId.get(id);
      if (s && isScriptureEntity(s)) scripturesFromEdges.push(s);
    }
  }

  const majorCities = dedupeEntities([
    ...capitalFromEdges,
    ...citiesFromEdges,
    ...affiliatedCities,
  ]).sort((a, b) => b.importance - a.importance);

  // Capital: explicit edge, else city tagged capital, else highest-importance affiliated city
  let capital: KnowledgeEntity | null =
    capitalFromEdges[0] ??
    majorCities.find(
      (c) =>
        c.tags?.includes("capital") ||
        c.categories?.includes("capital") ||
        c.importance >= 5,
    ) ??
    majorCities[0] ??
    null;

  const battles = events.filter(isBattleEvent);
  const timeline = [...events];

  const genealogyModules = collections.filter(
    (c) =>
      c.kind === "genealogy-module" &&
      (c.entityIds.includes(kingdom.id) ||
        charactersFromEdges.some((ch) => c.entityIds.includes(ch.id))),
  );

  // Deduplicate verses
  const verseSeen = new Set<string>();
  const verses = verseHits.filter((v) => {
    if (verseSeen.has(v.id)) return false;
    verseSeen.add(v.id);
    return true;
  });

  return {
    overview: {
      summary: kingdom.summary,
      description: kingdom.description,
      primaryScripture: kingdom.primaryScripture,
      sources: kingdom.scriptureSources ?? [],
      ...(kingdom.era ? { era: kingdom.era } : {}),
      ...(kingdom.atlas?.modernLocation
        ? { modernLocation: kingdom.atlas.modernLocation }
        : {}),
    },
    capital,
    rulers: dedupeEntities(rulersFromEdges).sort(
      (a, b) => b.importance - a.importance,
    ),
    dynasty: dedupeEntities(dynastiesFromEdges),
    majorCities,
    battles,
    timeline,
    events,
    characters: dedupeEntities(charactersFromEdges).sort(
      (a, b) => b.importance - a.importance,
    ),
    scriptures: dedupeEntities(scripturesFromEdges),
    verses,
    genealogyModules,
    atlasPlace: isAtlasPlace(kingdom) ? kingdom : null,
    relatedEdges: related,
  };
}
