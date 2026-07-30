import type { KnowledgeCollection } from "@/lib/knowledge/types";
import type { KnowledgeEvent } from "@/lib/events/helpers";
import type { EventType } from "@/lib/knowledge/types";
import type {
  TimelineFilter,
  TimelineLayout,
  TimelineZoomLevel,
} from "@/lib/timeline/layout";
import {
  TIMELINE_MIN_IMPORTANCE,
  eventMatchesFilter,
} from "@/lib/timeline/layout";

/**
 * Lightweight DTOs for the Timeline client island.
 * Avoid shipping full KnowledgeEntity graphs over the RSC boundary.
 */
export type TimelineEventCard = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  eventType: EventType;
  importance: number;
  timelineOrder: number;
  chapters: number[];
  kind: KnowledgeEvent["kind"];
  tags: string[];
};

export type TimelineEraCard = {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  summary: string;
};

export type TimelineViewNode = {
  event: TimelineEventCard;
  eraSlug: string;
  eraTitle: string;
};

export type TimelineView = {
  eras: Array<{ era: TimelineEraCard; eventIds: string[] }>;
  nodes: TimelineViewNode[];
};

function toEventCard(event: KnowledgeEvent): TimelineEventCard {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    summary: event.summary,
    eventType: event.event.eventType,
    importance: event.importance,
    timelineOrder: event.event.timelineOrder,
    chapters: event.event.chapters ?? [],
    kind: event.kind,
    tags: event.tags ?? [],
  };
}

function toEraCard(collection: KnowledgeCollection): TimelineEraCard {
  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    eyebrow: collection.eyebrow,
    summary: collection.summary,
  };
}

export function toTimelineView(layout: TimelineLayout): TimelineView {
  return {
    eras: layout.eras.map((band) => ({
      era: toEraCard(band.collection),
      eventIds: band.events.map((e) => e.id),
    })),
    nodes: layout.nodes.map((n) => ({
      event: toEventCard(n.event),
      eraSlug: n.eraSlug,
      eraTitle: n.eraTitle,
    })),
  };
}

export function filterTimelineViewNodes(
  view: TimelineView,
  zoom: TimelineZoomLevel,
  filter: TimelineFilter,
): TimelineViewNode[] {
  const minImp = TIMELINE_MIN_IMPORTANCE[zoom];
  return view.nodes.filter((n) => {
    if (n.event.importance < minImp) return false;
    // Adapt slim card to the filter helper shape.
    const proxy = {
      id: n.event.id,
      slug: n.event.slug,
      kind: n.event.kind,
      tags: n.event.tags,
      event: { eventType: n.event.eventType },
    } as KnowledgeEvent;
    return eventMatchesFilter(proxy, filter);
  });
}
