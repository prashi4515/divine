/**
 * Convert Atlas JSON / KG places into GeoJSON FeatureCollections.
 * MapLibre consumes these; this module has no MapLibre imports.
 */
import type {
  AtlasDataset,
  AtlasEvent,
  AtlasPolygon,
  AtlasRiver,
  AtlasRoute,
} from "@divine/types";
import type {
  FeatureCollection as GeoFeatureCollection,
  Geometry,
} from "geojson";
import type { AtlasPlace } from "@/lib/atlas/geo";
import { markerKindFor } from "@/lib/atlas/geo";
import type { OverlayToggleId } from "@/lib/atlas/overlays/layer-catalog";
import { OVERLAY_TOGGLES } from "@/lib/atlas/overlays/layer-catalog";

export type AtlasFeatureProps = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  category?: string;
  importance?: number;
  certainty?: string;
};

type FeatureCollection = GeoFeatureCollection<Geometry, AtlasFeatureProps>;

function emptyFc(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function placeCategoryAllowed(
  category: string,
  visibility: Record<OverlayToggleId, boolean>,
): boolean {
  for (const toggle of OVERLAY_TOGGLES) {
    if (!toggle.categories?.includes(category)) continue;
    return visibility[toggle.id] !== false;
  }
  return true;
}

export function placesToGeoJson(
  places: readonly AtlasPlace[],
  visibility: Record<OverlayToggleId, boolean>,
): FeatureCollection {
  const features: FeatureCollection["features"] = [];
  for (const p of places) {
    const category = markerKindFor(p);
    if (!placeCategoryAllowed(category, visibility)) continue;
    features.push({
      type: "Feature",
      id: p.id,
      geometry: {
        type: "Point",
        coordinates: [p.atlas.longitude, p.atlas.latitude],
      },
      properties: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        kind: "place",
        category,
        importance: p.importance,
        certainty: p.atlas.certainty ?? "traditional",
      },
    });
  }
  return { type: "FeatureCollection", features };
}

export function riversToGeoJson(
  rivers: readonly AtlasRiver[],
  visible: boolean,
): FeatureCollection {
  if (!visible) return emptyFc();
  return {
    type: "FeatureCollection",
    features: rivers
      .filter((r) => r.points.length >= 2)
      .map((r) => ({
        type: "Feature" as const,
        id: r.id,
        geometry: {
          type: "LineString" as const,
          // dataset stores [lat, lng]; GeoJSON needs [lng, lat]
          coordinates: r.points.map(([lat, lng]) => [lng, lat] as [number, number]),
        },
        properties: {
          id: r.id,
          slug: r.slug,
          name: r.name,
          kind: "river",
          certainty: r.certainty,
        },
      })),
  };
}

export function routesToGeoJson(
  dataset: AtlasDataset,
  places: readonly AtlasPlace[],
  activeRouteId: string | null,
  visible: boolean,
): FeatureCollection {
  if (!visible) return emptyFc();
  const byId = new Map(places.map((p) => [p.id, p] as const));
  const features: FeatureCollection["features"] = [];

  for (const route of dataset.routes) {
    const coords: [number, number][] = [];
    for (const pid of route.placeIds) {
      const p = byId.get(pid);
      if (!p) continue;
      coords.push([p.atlas.longitude, p.atlas.latitude]);
    }
    if (coords.length < 2) continue;
    features.push({
      type: "Feature",
      id: route.id,
      geometry: { type: "LineString", coordinates: coords },
      properties: {
        id: route.id,
        slug: route.slug,
        name: route.title,
        kind: "route",
        category: activeRouteId === route.id ? "active" : "idle",
        certainty: route.confidence === "variant" ? "approximate" : route.confidence,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

export function routeStopsToGeoJson(
  route: AtlasRoute | null | undefined,
  places: readonly AtlasPlace[],
  activeStopIndex: number | null,
): FeatureCollection {
  if (!route) return emptyFc();
  const byId = new Map(places.map((p) => [p.id, p] as const));
  const features: FeatureCollection["features"] = [];
  route.placeIds.forEach((pid, i) => {
    const p = byId.get(pid);
    if (!p) return;
    features.push({
      type: "Feature",
      id: `${route.id}-stop-${i}`,
      geometry: {
        type: "Point",
        coordinates: [p.atlas.longitude, p.atlas.latitude],
      },
      properties: {
        id: pid,
        slug: p.slug,
        name: p.name,
        kind: "route-stop",
        category: activeStopIndex === i ? "active" : "stop",
        importance: i + 1,
      },
    });
  });
  return { type: "FeatureCollection", features };
}

export function eventsToGeoJson(
  events: readonly AtlasEvent[],
  visible: boolean,
): FeatureCollection {
  if (!visible) return emptyFc();
  return {
    type: "FeatureCollection",
    features: events.map((ev) => ({
      type: "Feature" as const,
      id: ev.id,
      geometry: {
        type: "Point" as const,
        coordinates: [ev.longitude, ev.latitude] as [number, number],
      },
      properties: {
        id: ev.id,
        slug: ev.slug,
        name: ev.name,
        kind: "event",
        importance: ev.importance,
        certainty: ev.certainty,
      },
    })),
  };
}

/**
 * Selected kingdom extent only — never paint all borders permanently.
 * Polygon rings in the dataset are [lat, lng]; GeoJSON needs [lng, lat].
 */
export function selectedKingdomToGeoJson(
  polygons: readonly AtlasPolygon[],
  selectedPlace: AtlasPlace | null,
): FeatureCollection {
  if (!selectedPlace) return emptyFc();
  const match = polygons.find(
    (p) =>
      p.entityId === selectedPlace.id ||
      p.slug === selectedPlace.slug ||
      p.entityId === `kingdom.${selectedPlace.slug}`,
  );
  if (!match) return emptyFc();
  const rings = match.geometry.rings.map((ring) =>
    ring.map(([lat, lng]) => [lng, lat] as [number, number]),
  );
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: match.id,
        geometry: { type: "Polygon", coordinates: rings },
        properties: {
          id: match.id,
          slug: match.slug,
          name: match.title,
          kind: "kingdom",
          certainty: match.confidence,
        },
      },
    ],
  };
}
