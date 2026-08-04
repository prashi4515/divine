import type { AtlasFilter } from "@/lib/atlas/geo";
import type { Messages } from "@/lib/i18n/messages";

/** Live UI label for atlas category filters. */
export function atlasFilterLabel(t: Messages, filter: AtlasFilter): string {
  switch (filter) {
    case "kingdom":
      return t.filterKingdoms;
    case "city":
      return t.filterCities;
    case "forest":
      return t.filterForests;
    case "battlefield":
      return t.filterBattlefields;
    case "ashrama":
      return t.filterAshramas;
    case "river":
      return t.filterRivers;
    case "mountain":
      return t.filterMountains;
    case "pilgrimage":
      return t.filterPilgrimage;
  }
}

/** Live UI label for atlas dataset layer ids. */
export function atlasLayerLabel(
  t: Messages,
  layer: { id: string; title: string },
): string {
  switch (layer.id) {
    case "layer.kingdoms":
      return t.filterKingdoms;
    case "layer.rivers":
      return t.filterRivers;
    case "layer.routes":
      return t.travelPaths;
    case "layer.events":
      return t.navEvents;
    case "layer.places":
      return t.layerPlaces;
    case "layer.labels":
      return t.layerLabels;
    default:
      return layer.title;
  }
}

/** Live UI label for known atlas travel routes. */
export function atlasRouteLabel(
  t: Messages,
  route: { id: string; title: string },
): string {
  switch (route.id) {
    case "route.pandava-exile":
      return t.routePandavaExile;
    case "route.krishna-journey":
      return t.routeKrishnaJourney;
    case "route.arjuna-digvijaya":
      return t.routeArjunaDigvijaya;
    case "route.balarama-pilgrimage":
      return t.routeBalaramaPilgrimage;
    case "route.ashvamedha":
      return "Ashvamedha Horse";
    default:
      return route.title;
  }
}
