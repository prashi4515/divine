import type { KnowledgeCollection } from "@/lib/knowledge/types";
import type { KnowledgeEvent } from "@/lib/events/helpers";
import type { EventType } from "@/lib/knowledge/types";

/** Detail bands for the interactive Timeline. */
export type TimelineZoomLevel = 1 | 2 | 3;

export const TIMELINE_ZOOM_LABELS: Record<TimelineZoomLevel, string> = {
  1: "Eras",
  2: "Major events",
  3: "Full chronicle",
};

/** Min importance visible at each zoom. */
export const TIMELINE_MIN_IMPORTANCE: Record<TimelineZoomLevel, number> = {
  1: 5,
  2: 4,
  3: 1,
};

export type TimelineFilter =
  | "all"
  | "battle"
  | "discourse"
  | "birth"
  | "dynasty"
  | "other";

export const TIMELINE_FILTER_LABELS: Record<TimelineFilter, string> = {
  all: "All",
  battle: "Battles",
  discourse: "Discourses",
  birth: "Births",
  dynasty: "Dynasties",
  other: "Other",
};

export type TimelineEraBand = {
  collection: KnowledgeCollection;
  events: KnowledgeEvent[];
};

export type TimelineNode = {
  event: KnowledgeEvent;
  eraSlug: string;
  eraTitle: string;
};

export type TimelineLayout = {
  eras: TimelineEraBand[];
  nodes: TimelineNode[];
};

function orderOf(e: KnowledgeEvent): number {
  return e.event.timelineOrder;
}

/**
 * Group events by era collections. Eras only reference shared event ids.
 */
export function layoutTimeline(
  eras: KnowledgeCollection[],
  eventsById: Map<string, KnowledgeEvent>,
): TimelineLayout {
  const sortedEras = [...eras].sort((a, b) => a.order - b.order);
  const bands: TimelineEraBand[] = [];
  const nodes: TimelineNode[] = [];
  const seen = new Set<string>();

  for (const col of sortedEras) {
    const eraEvents = col.entityIds
      .map((id) => eventsById.get(id))
      .filter((e): e is KnowledgeEvent => Boolean(e))
      .sort((a, b) => orderOf(a) - orderOf(b));

    if (eraEvents.length === 0) continue;
    bands.push({ collection: col, events: eraEvents });

    for (const event of eraEvents) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      nodes.push({
        event,
        eraSlug: col.slug,
        eraTitle: col.title,
      });
    }
  }

  return {
    eras: bands,
    nodes: nodes.sort((a, b) => orderOf(a.event) - orderOf(b.event)),
  };
}

export function eventMatchesFilter(
  event: KnowledgeEvent,
  filter: TimelineFilter,
): boolean {
  if (filter === "all") return true;
  const t = event.event.eventType;
  if (filter === "battle") {
    return t === "battle" || t === "death" || event.kind === "battle";
  }
  if (filter === "discourse") return t === "discourse";
  if (filter === "birth") return t === "birth";
  if (filter === "dynasty") {
    return (
      event.id.includes("dynast") ||
      event.slug.includes("dynast") ||
      event.tags?.includes("dynasty") === true
    );
  }
  const major: EventType[] = [
    "battle",
    "death",
    "discourse",
    "birth",
  ];
  return !major.includes(t);
}

export function filterTimelineNodes(
  layout: TimelineLayout,
  zoom: TimelineZoomLevel,
  filter: TimelineFilter,
): TimelineNode[] {
  const minImp = TIMELINE_MIN_IMPORTANCE[zoom];
  return layout.nodes.filter(
    (n) =>
      n.event.importance >= minImp && eventMatchesFilter(n.event, filter),
  );
}

/** @deprecated kept for any old camera imports */
export const TIMELINE_WORLD = {
  padX: 120,
  spineY: 220,
  eraH: 72,
  eraY: 48,
  unit: 28,
  height: 420,
} as const;

export function timelineZoomFromScale(scale: number): TimelineZoomLevel {
  if (scale < 1.2) return 1;
  if (scale < 2) return 2;
  return 3;
}

export function visibleTimelineNodes(
  layout: TimelineLayout,
  level: TimelineZoomLevel,
): TimelineLayout["nodes"] {
  return filterTimelineNodes(layout, level, "all");
}
