import "server-only";
import {
  getAllEntities,
  getCollection,
  getEntity,
  getEntityByKindSlug,
} from "@/lib/knowledge/store";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import {
  isKnowledgeEvent,
  verseReaderHref,
  type KnowledgeEvent,
} from "@/lib/events/helpers";

export type {
  KnowledgeEvent,
} from "@/lib/events/helpers";
export {
  eventHref,
  eventTypeLabel,
  gitaChapterHref,
  verseReaderHref,
  genealogyPersonHref,
  isKnowledgeEvent,
} from "@/lib/events/helpers";

/**
 * All published Mahābhārata Events, ordered by timelineOrder.
 */
export async function getEvents(): Promise<KnowledgeEvent[]> {
  const collection = await getCollection("mahabharata-events");
  const all = await getAllEntities();
  const byId = new Map(all.map((e) => [e.id, e]));

  const fromCollection = (collection?.entityIds ?? [])
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEvent => e != null && isKnowledgeEvent(e));

  const fallback = all.filter(isKnowledgeEvent);
  const merged = new Map<string, KnowledgeEvent>();
  for (const e of [...fromCollection, ...fallback]) {
    if (e.status === "published") merged.set(e.id, e);
  }

  return [...merged.values()].sort(
    (a, b) => a.event.timelineOrder - b.event.timelineOrder,
  );
}

export async function getEventBySlug(
  slug: string,
): Promise<KnowledgeEvent | null> {
  for (const kind of ["event", "battle"] as const) {
    const entity = await getEntityByKindSlug(kind, slug);
    if (entity && isKnowledgeEvent(entity)) return entity;
  }
  return null;
}

export type ResolvedEventLinks = {
  participants: KnowledgeEntity[];
  places: KnowledgeEntity[];
  kingdoms: KnowledgeEntity[];
  weapons: KnowledgeEntity[];
  scriptures: KnowledgeEntity[];
  relatedEvents: KnowledgeEvent[];
  verses: Array<{
    id: string;
    entity: KnowledgeEntity | null;
    href: string | null;
  }>;
  chapters: number[];
  prev: KnowledgeEvent | null;
  next: KnowledgeEvent | null;
};

/**
 * Resolve event JSON id arrays against the shared Knowledge Graph.
 */
export async function resolveEventLinks(
  event: KnowledgeEvent,
): Promise<ResolvedEventLinks> {
  const timeline = await getEvents();
  const idx = timeline.findIndex((e) => e.id === event.id);

  async function many(ids: string[]): Promise<KnowledgeEntity[]> {
    const out: KnowledgeEntity[] = [];
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const e = await getEntity(id);
      if (e && e.status === "published") out.push(e);
    }
    return out;
  }

  const relatedRaw = await many(event.event.relatedEvents);
  const relatedEvents = relatedRaw.filter(isKnowledgeEvent);

  const verses = await Promise.all(
    event.event.verses.map(async (id) => {
      const entity = (await getEntity(id)) ?? null;
      return {
        id,
        entity,
        href: verseReaderHref(entity?.externalRefs?.publicId ?? id),
      };
    }),
  );

  return {
    participants: await many(event.event.participants),
    places: await many(event.event.places),
    kingdoms: await many(event.event.kingdoms),
    weapons: await many(event.event.weapons),
    scriptures: await many(event.event.scriptures),
    relatedEvents,
    verses,
    chapters: [...event.event.chapters],
    prev: idx > 0 ? timeline[idx - 1]! : null,
    next: idx >= 0 && idx < timeline.length - 1 ? timeline[idx + 1]! : null,
  };
}
