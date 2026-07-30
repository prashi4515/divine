import "server-only";
import { unstable_cache } from "next/cache";
import { getCollections } from "@/lib/knowledge/store";
import { getEvents } from "@/lib/events/store";
import type { KnowledgeEvent } from "@/lib/events/helpers";
import type { KnowledgeCollection } from "@/lib/knowledge/types";
import { layoutTimeline, type TimelineLayout } from "@/lib/timeline/layout";
import { toTimelineView, type TimelineView } from "@/lib/timeline/view-model";

export type TimelineBundle = {
  eras: KnowledgeCollection[];
  events: KnowledgeEvent[];
  layout: TimelineLayout;
  view: TimelineView;
};

async function loadTimelineBundle(): Promise<TimelineBundle> {
  const [collections, events] = await Promise.all([
    getCollections(),
    getEvents(),
  ]);

  const eras = collections
    .filter((c) => c.kind === "timeline-era" && c.status === "available")
    .sort((a, b) => a.order - b.order);

  const eventsById = new Map(events.map((e) => [e.id, e]));
  const layout = layoutTimeline(eras, eventsById);
  const view = toTimelineView(layout);

  return { eras, events, layout, view };
}

/**
 * Load timeline-era collections and resolve their entityIds to shared Events.
 * Cached across requests — avoids re-walking the KG on every navigation.
 */
export const getTimelineBundle = unstable_cache(
  loadTimelineBundle,
  ["knowledge-timeline-bundle-v2"],
  { revalidate: false },
);
