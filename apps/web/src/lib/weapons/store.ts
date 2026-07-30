/**
 * Weapons module — sections resolve from shared Knowledge Graph JSON.
 */
import "server-only";
import {
  getAllEntities,
  getEntityByKindSlug,
  getRelated,
  type RelatedEdge,
} from "@/lib/knowledge/store";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { isKnowledgeEvent, type KnowledgeEvent } from "@/lib/events/helpers";
import { verseReaderHref } from "@/lib/events/helpers";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import {
  isKnowledgeWeapon,
  weaponCategory,
  weaponFocus,
  type KnowledgeWeapon,
} from "@/lib/weapons/helpers";

export type { KnowledgeWeapon } from "@/lib/weapons/helpers";
export {
  weaponHref,
  isKnowledgeWeapon,
  weaponCategory,
  weaponFocus,
  weaponCategoryLabel,
  weaponFocusLabel,
  WEAPON_CATEGORY_ORDER,
} from "@/lib/weapons/helpers";

export async function getWeapons(): Promise<KnowledgeWeapon[]> {
  const all = await getAllEntities();
  return all
    .filter(isKnowledgeWeapon)
    .sort(
      (a, b) =>
        b.importance - a.importance || a.name.localeCompare(b.name, "en"),
    );
}

export async function getWeaponBySlug(
  slug: string,
): Promise<KnowledgeWeapon | null> {
  const entity = await getEntityByKindSlug("weapon", slug);
  if (!entity || !isKnowledgeWeapon(entity)) return null;
  return entity;
}

export type WeaponResolvedLinks = {
  overview: {
    summary: string;
    description: string;
    primaryScripture: string;
    sources: KnowledgeEntity["scriptureSources"];
  };
  category: ReturnType<typeof weaponCategory>;
  focus: ReturnType<typeof weaponFocus>;
  powers: string[];
  notableUses: string[];
  counters: string[];
  counterWeapons: KnowledgeEntity[];
  owners: KnowledgeEntity[];
  origin: Array<{ entity: KnowledgeEntity; note?: string }>;
  battles: KnowledgeEvent[];
  events: KnowledgeEvent[];
  characters: KnowledgeEntity[];
  scriptures: KnowledgeEntity[];
  verses: Array<{
    id: string;
    entity: KnowledgeEntity | null;
    href: string | null;
    label: string;
  }>;
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

function isBattleEvent(e: KnowledgeEvent): boolean {
  return e.kind === "battle" || e.event.eventType === "battle";
}

function isScriptureEntity(e: KnowledgeEntity): boolean {
  return e.kind === "scripture" || e.kind === "chapter";
}

function isVerse(e: KnowledgeEntity): boolean {
  return e.kind === "verse" || e.id.startsWith("verse.");
}

function isOriginNote(note: string | undefined): boolean {
  if (!note) return false;
  return /^origin\b/i.test(note.trim());
}

export async function resolveWeaponLinks(
  weapon: KnowledgeWeapon,
): Promise<WeaponResolvedLinks> {
  const [all, related] = await Promise.all([
    getAllEntities(),
    getRelated(weapon.id),
  ]);
  const byId = new Map(all.map((e) => [e.id, e] as const));
  const meta = weapon.weapon;

  const owners: KnowledgeEntity[] = [];
  const origin: WeaponResolvedLinks["origin"] = [];
  const charactersFromEdges: KnowledgeEntity[] = [];
  const scripturesFromEdges: KnowledgeEntity[] = [];
  const verseHits: WeaponResolvedLinks["verses"] = [];

  for (const edge of related) {
    const other = edge.other;
    const t = edge.relation.type;
    const note = edge.relation.note;

    if (t === "wielded" && isCharacterEntity(other)) {
      owners.push(other);
      charactersFromEdges.push(other);
    }
    if (
      (t === "connected-to" || t === "wielded") &&
      isOriginNote(note) &&
      isCharacterEntity(other)
    ) {
      origin.push({ entity: other, note });
      charactersFromEdges.push(other);
    }
    if (isScriptureEntity(other)) scripturesFromEdges.push(other);
    if ((t === "appears-in" || t === "mentioned-in") && isVerse(other)) {
      const publicId =
        other.externalRefs?.publicId ?? other.id.replace(/^verse\./, "");
      verseHits.push({
        id: other.id,
        entity: other,
        href: verseReaderHref(publicId),
        label: other.name,
      });
    }
    if (isCharacterEntity(other)) charactersFromEdges.push(other);
  }

  const events: KnowledgeEvent[] = [];
  for (const e of all) {
    if (!isKnowledgeEvent(e) || e.status !== "published") continue;
    const listed = e.event.weapons.includes(weapon.id);
    const edged = related.some(
      (r) =>
        r.other.id === e.id &&
        (r.relation.type === "connected-to" ||
          r.relation.type === "fought-in" ||
          r.relation.type === "participated-in"),
    );
    if (listed || edged) events.push(e);
  }
  events.sort((a, b) => a.event.timelineOrder - b.event.timelineOrder);

  for (const ev of events) {
    for (const id of ev.event.participants) {
      const p = byId.get(id);
      if (p && isCharacterEntity(p)) charactersFromEdges.push(p);
    }
    for (const id of ev.event.verses) {
      const v = byId.get(id);
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

  const counterWeapons = (meta?.counterWeaponIds ?? [])
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEntity => Boolean(e));

  const verseSeen = new Set<string>();
  const verses = verseHits.filter((v) => {
    if (verseSeen.has(v.id)) return false;
    verseSeen.add(v.id);
    return true;
  });

  const originSeen = new Set<string>();
  const originDeduped = origin.filter((o) => {
    if (originSeen.has(o.entity.id)) return false;
    originSeen.add(o.entity.id);
    return true;
  });

  return {
    overview: {
      summary: weapon.summary,
      description: weapon.description,
      primaryScripture: weapon.primaryScripture,
      sources: weapon.scriptureSources ?? [],
    },
    category: weaponCategory(weapon),
    focus: weaponFocus(weapon),
    powers: meta?.powers ?? [],
    notableUses: meta?.notableUses ?? [],
    counters: meta?.counters ?? [],
    counterWeapons,
    owners: dedupeEntities(owners).sort(
      (a, b) => b.importance - a.importance,
    ),
    origin: originDeduped,
    battles: events.filter(isBattleEvent),
    events,
    characters: dedupeEntities(charactersFromEdges).sort(
      (a, b) => b.importance - a.importance,
    ),
    scriptures: dedupeEntities(scripturesFromEdges),
    verses,
    relatedEdges: related,
  };
}
