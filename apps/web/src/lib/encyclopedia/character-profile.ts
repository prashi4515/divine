/**
 * Character encyclopedia profile — derived only from the shared Knowledge Graph.
 * No Neon. No duplicated narrative packs — classify existing edges + entity fields.
 */
import type { EntityBundle, RelatedEdge } from "@/lib/knowledge/store";
import type {
  ConfidenceLevel,
  KnowledgeCollection,
  KnowledgeEntity,
  RelationType,
  ScriptureReference,
} from "@/lib/knowledge/types";
import {
  isChildToParentType,
  isParentToChildType,
} from "@/lib/knowledge/types";
import { genealogyPersonHref } from "@/lib/events/helpers";
import { atlasHref, isAtlasPlace } from "@/lib/atlas/geo";
import { eventHref, isKnowledgeEvent } from "@/lib/events/helpers";
import { entityHref } from "@/lib/knowledge/search";
import { weaponHref } from "@/lib/weapons/helpers";
import { conceptHref } from "@/lib/concepts/helpers";
import {
  isCharacterEntity,
  isConceptEntity,
  isDynastyEntity,
  isEventLikeEntity,
  isPlaceLikeEntity,
  isVerseEntity,
  isWeaponEntity,
} from "@/lib/encyclopedia/character-kinds";

export type CharacterLink = {
  entity: KnowledgeEntity;
  href: string;
  relationType: RelationType;
  confidence: ConfidenceLevel;
  sources: ScriptureReference[];
  direction: "out" | "in";
  /** Secondary surface link (Atlas / Events / Genealogy / Gītā). */
  surface?: { href: string; label: string };
};

export type CharacterVerseLink = CharacterLink & {
  verseLabel: string;
  readerHref: string;
};

export type CharacterTimelineEntry = CharacterLink & {
  timelineOrder: number;
  eventHref: string;
};

export type CharacterProfile = {
  entity: KnowledgeEntity;
  biography: {
    summary: string;
    description: string;
    epithet?: string;
    aliases: string[];
    primaryScripture: string;
    sources: ScriptureReference[];
    variantTraditions: KnowledgeEntity["variantTraditions"];
  };
  family: {
    parents: CharacterLink[];
    children: CharacterLink[];
    spouses: CharacterLink[];
    siblings: CharacterLink[];
  };
  kingdom: CharacterLink[];
  dynasty: CharacterLink[];
  timeline: CharacterTimelineEntry[];
  events: CharacterLink[];
  weapons: CharacterLink[];
  teachers: CharacterLink[];
  students: CharacterLink[];
  friends: CharacterLink[];
  enemies: CharacterLink[];
  genealogy: {
    personHref: string | null;
    modules: KnowledgeCollection[];
  };
  atlas: CharacterLink[];
  verses: CharacterVerseLink[];
  concepts: CharacterLink[];
  relatedCharacters: CharacterLink[];
  identity: CharacterLink[];
  /** Ego graph neighbors (capped). */
  graphNeighbors: Array<{
    entity: KnowledgeEntity;
    relation: RelatedEdge["relation"];
  }>;
};

function verseReaderHref(entity: KnowledgeEntity): string {
  const publicId =
    entity.externalRefs?.publicId ??
    entity.id.replace(/^verse\./, "");
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (m) return `/bhagavad-gita/chapter-${m[1]}#verse-${m[2]}`;
  return "/bhagavad-gita";
}

function verseLabel(entity: KnowledgeEntity): string {
  const publicId =
    entity.externalRefs?.publicId ??
    entity.id.replace(/^verse\./, "");
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (m) return `Bhagavad Gītā ${m[1]}.${m[2]}`;
  return entity.name;
}

function toLink(edge: RelatedEdge): CharacterLink {
  const surface = (() => {
    if (isAtlasPlace(edge.other)) {
      return { href: atlasHref(edge.other), label: "Atlas" };
    }
    if (isKnowledgeEvent(edge.other)) {
      return { href: eventHref(edge.other), label: "Events" };
    }
    if (isWeaponEntity(edge.other)) {
      return { href: weaponHref(edge.other), label: "Weapons" };
    }
    if (isConceptEntity(edge.other)) {
      return { href: conceptHref(edge.other), label: "Concepts" };
    }
    if (isCharacterEntity(edge.other)) {
      const g = genealogyPersonHref(edge.other);
      if (g) return { href: g, label: "Genealogy" };
    }
    if (isVerseEntity(edge.other)) {
      return { href: verseReaderHref(edge.other), label: "Gītā" };
    }
    return undefined;
  })();

  return {
    entity: edge.other,
    href: isWeaponEntity(edge.other)
      ? weaponHref(edge.other)
      : isConceptEntity(edge.other)
        ? conceptHref(edge.other)
        : entityHref(edge.other),
    relationType: edge.relation.type,
    confidence: edge.relation.confidence,
    sources: edge.relation.sources,
    direction: edge.direction,
    ...(surface ? { surface } : {}),
  };
}

function dedupeLinks(links: CharacterLink[]): CharacterLink[] {
  const seen = new Set<string>();
  const out: CharacterLink[] = [];
  for (const link of links) {
    if (seen.has(link.entity.id)) continue;
    seen.add(link.entity.id);
    out.push(link);
  }
  return out;
}

function isSpouseType(t: RelationType): boolean {
  return t === "spouse" || t === "consort";
}

function isSiblingType(t: RelationType): boolean {
  return t === "sibling" || t === "brother" || t === "sister";
}

/**
 * Build a complete character encyclopedia profile from an entity bundle.
 * Pure classification of shared graph edges — invents nothing.
 */
export function buildCharacterProfile(bundle: EntityBundle): CharacterProfile {
  const { entity, related, collections } = bundle;

  const parents: CharacterLink[] = [];
  const children: CharacterLink[] = [];
  const spouses: CharacterLink[] = [];
  const siblings: CharacterLink[] = [];
  const kingdom: CharacterLink[] = [];
  const dynasty: CharacterLink[] = [];
  const events: CharacterLink[] = [];
  const weapons: CharacterLink[] = [];
  const teachers: CharacterLink[] = [];
  const students: CharacterLink[] = [];
  const friends: CharacterLink[] = [];
  const enemies: CharacterLink[] = [];
  const atlas: CharacterLink[] = [];
  const verses: CharacterVerseLink[] = [];
  const concepts: CharacterLink[] = [];
  const identity: CharacterLink[] = [];
  const relatedCharacters: CharacterLink[] = [];
  const consumed = new Set<string>();

  const mark = (id: string) => consumed.add(id);

  for (const edge of related) {
    const t = edge.relation.type;
    const link = toLink(edge);

    // Family — direction-aware
    if (
      (edge.direction === "out" && isChildToParentType(t)) ||
      (edge.direction === "in" && isParentToChildType(t))
    ) {
      parents.push(link);
      mark(edge.other.id);
      continue;
    }
    if (
      (edge.direction === "out" && isParentToChildType(t)) ||
      (edge.direction === "in" && isChildToParentType(t))
    ) {
      children.push(link);
      mark(edge.other.id);
      continue;
    }
    if (isSpouseType(t)) {
      spouses.push(link);
      mark(edge.other.id);
      continue;
    }
    if (isSiblingType(t)) {
      siblings.push(link);
      mark(edge.other.id);
      continue;
    }

    // Teachers / students
    if (
      (edge.direction === "out" && t === "guru") ||
      (edge.direction === "in" && t === "disciple")
    ) {
      teachers.push(link);
      mark(edge.other.id);
      continue;
    }
    if (
      (edge.direction === "out" && t === "disciple") ||
      (edge.direction === "in" && t === "guru")
    ) {
      students.push(link);
      mark(edge.other.id);
      continue;
    }

    if (t === "friend" || t === "ally") {
      friends.push(link);
      mark(edge.other.id);
      continue;
    }
    if (t === "enemy" || (t === "fought" && isCharacterEntity(edge.other))) {
      enemies.push(link);
      mark(edge.other.id);
      continue;
    }

    if (t === "wielded" || isWeaponEntity(edge.other)) {
      weapons.push(link);
      mark(edge.other.id);
      continue;
    }

    if (
      (t === "participated-in" ||
        t === "fought-in" ||
        t === "precedes" ||
        t === "connected-to") &&
      isEventLikeEntity(edge.other)
    ) {
      events.push(link);
      mark(edge.other.id);
      continue;
    }

    if (
      t === "king-of" ||
      t === "queen-of" ||
      t === "ruled" ||
      t === "ruled-by" ||
      (isPlaceLikeEntity(edge.other) &&
        (t === "resident-of" || t === "capital-of"))
    ) {
      kingdom.push(link);
      mark(edge.other.id);
      // Also surface atlas when place has atlas meta
      if (isAtlasPlace(edge.other)) atlas.push(link);
      continue;
    }

    if (t === "belongs-to-dynasty" || isDynastyEntity(edge.other)) {
      dynasty.push(link);
      mark(edge.other.id);
      continue;
    }

    if (
      isPlaceLikeEntity(edge.other) &&
      (t === "visited" ||
        t === "born-at" ||
        t === "died-at" ||
        t === "located-in" ||
        t === "located-at" ||
        t === "fought-in")
    ) {
      atlas.push(link);
      if (isAtlasPlace(edge.other) || edge.other.kind === "kingdom") {
        // kingdom already handled above for king-of; keep atlas list
      }
      mark(edge.other.id);
      continue;
    }

    if (
      (t === "appears-in" || t === "mentioned-in") &&
      isVerseEntity(edge.other)
    ) {
      verses.push({
        ...link,
        verseLabel: verseLabel(edge.other),
        readerHref: verseReaderHref(edge.other),
      });
      mark(edge.other.id);
      continue;
    }

    if (
      t === "incarnation-of" ||
      t === "manifestation-of" ||
      t === "aspect-of"
    ) {
      identity.push(link);
      mark(edge.other.id);
      continue;
    }

    if (isConceptEntity(edge.other)) {
      concepts.push(link);
      mark(edge.other.id);
      continue;
    }
  }

  // Related characters — leftover person-like edges
  for (const edge of related) {
    if (consumed.has(edge.other.id)) continue;
    if (!isCharacterEntity(edge.other)) continue;
    relatedCharacters.push(toLink(edge));
    mark(edge.other.id);
  }

  // Concepts leftover
  for (const edge of related) {
    if (consumed.has(edge.other.id)) continue;
    if (!isConceptEntity(edge.other)) continue;
    concepts.push(toLink(edge));
    mark(edge.other.id);
  }

  const timeline: CharacterTimelineEntry[] = dedupeLinks(events)
    .filter((e) => isKnowledgeEvent(e.entity))
    .map((e) => ({
      ...e,
      timelineOrder: e.entity.event?.timelineOrder ?? 9999,
      eventHref: eventHref(e.entity),
    }))
    .sort((a, b) => a.timelineOrder - b.timelineOrder);

  const genealogyModules = collections.filter(
    (c) => c.kind === "genealogy-module",
  );

  return {
    entity,
    biography: {
      summary: entity.summary,
      description: entity.description,
      ...(entity.epithet ? { epithet: entity.epithet } : {}),
      aliases: entity.aliases ?? [],
      primaryScripture: entity.primaryScripture,
      sources: entity.scriptureSources ?? [],
      variantTraditions: entity.variantTraditions ?? [],
    },
    family: {
      parents: dedupeLinks(parents),
      children: dedupeLinks(children),
      spouses: dedupeLinks(spouses),
      siblings: dedupeLinks(siblings),
    },
    kingdom: dedupeLinks(kingdom),
    dynasty: dedupeLinks(dynasty),
    timeline,
    events: dedupeLinks(events),
    weapons: dedupeLinks(weapons),
    teachers: dedupeLinks(teachers),
    students: dedupeLinks(students),
    friends: dedupeLinks(friends),
    enemies: dedupeLinks(enemies),
    genealogy: {
      personHref: genealogyPersonHref(entity),
      modules: genealogyModules,
    },
    atlas: dedupeLinks(atlas),
    verses: (() => {
      const seen = new Set<string>();
      const out: CharacterVerseLink[] = [];
      for (const v of verses) {
        if (seen.has(v.entity.id)) continue;
        seen.add(v.entity.id);
        out.push(v);
      }
      return out;
    })(),
    concepts: dedupeLinks(concepts),
    relatedCharacters: dedupeLinks(relatedCharacters),
    identity: dedupeLinks(identity),
    graphNeighbors: related.slice(0, 24).map((r) => ({
      entity: r.other,
      relation: r.relation,
    })),
  };
}

export function characterHasFamily(profile: CharacterProfile): boolean {
  const f = profile.family;
  return (
    f.parents.length +
      f.children.length +
      f.spouses.length +
      f.siblings.length >
    0
  );
}
