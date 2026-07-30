/**
 * Primary + module surface hrefs for Knowledge Graph entities.
 * Used by the Related Content Engine rail and character links.
 */
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";
import { atlasHref, isAtlasPlace } from "@/lib/atlas/geo";
import {
  eventHref,
  genealogyPersonHref,
  gitaChapterHref,
  isKnowledgeEvent,
  verseReaderHref,
} from "@/lib/events/helpers";
import { kingdomHref, isKnowledgeKingdom } from "@/lib/kingdoms/helpers";
import { weaponHref, isKnowledgeWeapon } from "@/lib/weapons/helpers";
import { conceptHref, isKnowledgeConcept } from "@/lib/concepts/helpers";
import {
  isVerseEntity,
} from "@/lib/encyclopedia/character-kinds";
import type { RelatedContentBucket } from "@/lib/knowledge/types";
import { displayEnglishName } from "@/lib/text/modern-english";

export type ExploreLink = {
  href: string;
  label: string;
};

function labelFor(entity: KnowledgeEntity): string {
  return displayEnglishName(entity);
}

/**
 * Best product surface for a bucket + entity (module-aware).
 * Falls back to encyclopedia.
 */
export function exploreHrefForBucket(
  entity: KnowledgeEntity,
  bucket: RelatedContentBucket,
): ExploreLink {
  if (bucket === "chapters") {
    const m = /^gita\.chapter\.(\d{1,2})$/.exec(entity.id);
    if (m) {
      const n = Number(m[1]);
      return { href: gitaChapterHref(n), label: `Bhagavad Gita ${n}` };
    }
    if (entity.kind === "chapter") {
      const n =
        Number(/(\d{1,2})/.exec(entity.slug)?.[1] ?? 0) ||
        Number(/(\d{1,2})/.exec(entity.id)?.[1] ?? 0);
      if (n >= 1 && n <= 18) {
        return { href: gitaChapterHref(n), label: labelFor(entity) };
      }
    }
  }

  if (bucket === "atlas" && isAtlasPlace(entity)) {
    return { href: atlasHref(entity), label: labelFor(entity) };
  }
  if (bucket === "genealogy") {
    const g = genealogyPersonHref(entity);
    if (g) return { href: g, label: labelFor(entity) };
    if (entity.kind === "dynasty") {
      return { href: entityHref(entity), label: labelFor(entity) };
    }
  }
  if (bucket === "kingdoms" && isKnowledgeKingdom(entity)) {
    return { href: kingdomHref(entity), label: labelFor(entity) };
  }
  if (bucket === "weapons" && isKnowledgeWeapon(entity)) {
    return { href: weaponHref(entity), label: labelFor(entity) };
  }
  if (bucket === "concepts" && isKnowledgeConcept(entity)) {
    return { href: conceptHref(entity), label: labelFor(entity) };
  }
  if (bucket === "events" && isKnowledgeEvent(entity)) {
    return { href: eventHref(entity), label: labelFor(entity) };
  }
  if (bucket === "verses" && isVerseEntity(entity)) {
    const publicId =
      entity.externalRefs?.publicId ?? entity.id.replace(/^verse\./, "");
    const href = verseReaderHref(publicId) ?? entityHref(entity);
    return { href, label: labelFor(entity) };
  }
  if (bucket === "places" && isAtlasPlace(entity)) {
    return { href: atlasHref(entity), label: labelFor(entity) };
  }

  return { href: entityHref(entity), label: labelFor(entity) };
}

/** Prefer the dedicated module surface when one exists. */
export function primaryExploreHref(entity: KnowledgeEntity): ExploreLink {
  if (isKnowledgeWeapon(entity)) {
    return { href: weaponHref(entity), label: labelFor(entity) };
  }
  if (isKnowledgeConcept(entity)) {
    return { href: conceptHref(entity), label: labelFor(entity) };
  }
  if (isKnowledgeKingdom(entity)) {
    return { href: kingdomHref(entity), label: labelFor(entity) };
  }
  if (isKnowledgeEvent(entity)) {
    return { href: eventHref(entity), label: labelFor(entity) };
  }
  if (isVerseEntity(entity)) {
    const publicId =
      entity.externalRefs?.publicId ?? entity.id.replace(/^verse\./, "");
    const href = verseReaderHref(publicId) ?? entityHref(entity);
    return { href, label: labelFor(entity) };
  }
  if (isAtlasPlace(entity)) {
    return { href: atlasHref(entity), label: labelFor(entity) };
  }
  return { href: entityHref(entity), label: labelFor(entity) };
}
