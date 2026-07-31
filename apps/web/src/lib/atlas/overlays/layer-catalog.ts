/**
 * Overlay layer catalog — renderer-agnostic ids.
 * The map engine toggles these; it does not know Mahābhārata semantics.
 */

export const OVERLAY_SOURCE_IDS = {
  places: "atlas-src-places",
  rivers: "atlas-src-rivers",
  routes: "atlas-src-routes",
  events: "atlas-src-events",
  kingdoms: "atlas-src-kingdoms",
} as const;

export const OVERLAY_LAYER_IDS = {
  placesClusters: "atlas-lyr-places-clusters",
  placesClusterCount: "atlas-lyr-places-cluster-count",
  places: "atlas-lyr-places",
  placesHighlight: "atlas-lyr-places-highlight",
  placesLabels: "atlas-lyr-places-labels",
  rivers: "atlas-lyr-rivers",
  riversHighlight: "atlas-lyr-rivers-highlight",
  routes: "atlas-lyr-routes",
  routesActive: "atlas-lyr-routes-active",
  routeStops: "atlas-lyr-route-stops",
  events: "atlas-lyr-events",
  eventsPulse: "atlas-lyr-events-pulse",
  kingdomsFill: "atlas-lyr-kingdoms-fill",
  kingdomsLine: "atlas-lyr-kingdoms-line",
} as const;

export type OverlayToggleId =
  | "kingdoms"
  | "cities"
  | "forests"
  | "ashramas"
  | "rivers"
  | "mountains"
  | "pilgrimage"
  | "battlefields"
  | "events"
  | "routes"
  | "labels";

export const OVERLAY_TOGGLES: readonly {
  id: OverlayToggleId;
  label: string;
  /** Place categories included (empty = N/A — geometric overlay). */
  categories?: readonly string[];
}[] = [
  { id: "kingdoms", label: "Kingdoms", categories: ["kingdom"] },
  { id: "cities", label: "Cities", categories: ["city"] },
  { id: "forests", label: "Forests", categories: ["forest"] },
  { id: "ashramas", label: "Ashramas", categories: ["ashrama"] },
  { id: "rivers", label: "Rivers", categories: ["river"] },
  { id: "mountains", label: "Mountains", categories: ["mountain"] },
  { id: "pilgrimage", label: "Pilgrimage", categories: ["pilgrimage", "sacred"] },
  { id: "battlefields", label: "Battlefields", categories: ["battlefield"] },
  { id: "events", label: "Events" },
  { id: "routes", label: "Travel Routes" },
  { id: "labels", label: "Labels" },
] as const;

export function defaultOverlayVisibility(): Record<OverlayToggleId, boolean> {
  return {
    kingdoms: true,
    cities: true,
    forests: true,
    ashramas: true,
    rivers: true,
    mountains: true,
    pilgrimage: true,
    battlefields: true,
    events: true,
    routes: true,
    labels: true,
  };
}
