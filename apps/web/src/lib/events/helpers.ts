import type { EntityEvent, KnowledgeEntity } from "@/lib/knowledge/types";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/knowledge/types";

export type KnowledgeEvent = KnowledgeEntity & {
  event: EntityEvent;
};

export function isKnowledgeEvent(
  entity: KnowledgeEntity,
): entity is KnowledgeEvent {
  return (
    Boolean(entity.event) &&
    (entity.kind === "event" || entity.kind === "battle")
  );
}

export function eventHref(
  entity: Pick<KnowledgeEntity, "slug"> | string,
): string {
  const slug = typeof entity === "string" ? entity : entity.slug;
  return `/events/${slug}`;
}

export function eventTypeLabel(type: EventType): string {
  return EVENT_TYPE_LABELS[type];
}

export function gitaChapterHref(chapter: number): string {
  return `/bhagavad-gita/chapter-${chapter}`;
}

export function verseReaderHref(verseIdOrPublicId: string): string | null {
  const raw = verseIdOrPublicId.replace(/^verse\./, "");
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(raw);
  if (!m) return null;
  return `/bhagavad-gita/chapter-${m[1]}#verse-${m[2]}`;
}

export function genealogyPersonHref(entity: KnowledgeEntity): string | null {
  const gid = entity.externalRefs?.genealogyId;
  if (gid) return `/genealogy/person/${gid}`;
  if (
    entity.kind === "person" ||
    entity.kind === "avatar" ||
    entity.kind === "deity" ||
    entity.kind === "sage" ||
    entity.kind === "warrior" ||
    entity.kind === "king" ||
    entity.kind === "queen" ||
    entity.kind === "deva" ||
    entity.kind === "devi"
  ) {
    return `/genealogy/person/${entity.slug}`;
  }
  return null;
}
