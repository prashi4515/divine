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
import { resolveLocalizedName } from "@/lib/atlas/data/localized-name";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { OverlayToggleId } from "@/lib/atlas/overlays/layer-catalog";
import { OVERLAY_TOGGLES } from "@/lib/atlas/overlays/layer-catalog";
import { displayLocalizedName } from "@/lib/i18n/localize-entity";

export type AtlasFeatureProps = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  category?: string;
  importance?: number;
  certainty?: string;
  locationType?: string;
  coordinateConfidence?: string;
  sourceType?: string;
  modernName?: string;
  narrative?: string;
  sourceRefs?: unknown[];
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
  lang = "en",
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
        name: displayLocalizedName(p, lang),
        kind: "place",
        category,
        importance: p.importance,
        certainty: p.atlas.certainty ?? "traditional",
      },
    });
  }
  return { type: "FeatureCollection", features };
}

/**
 * Traditional plate toponyms — independent of KG place markers so the
 * basemap artwork can be swapped without losing names.
 */
export function traditionalLabelsToGeoJson(
  labels: readonly TraditionalAtlasLabel[],
  lang = "en",
  visibility?: Record<OverlayToggleId, boolean>,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: (labels ?? [])
      .filter((label) => {
        if (!visibility) return true;
        if (label.kind === "river") return visibility.rivers !== false;
        if (label.kind === "forest") return visibility.forests !== false;
        if (label.kind === "mountain") return visibility.mountains !== false;
        if (label.kind === "city") return visibility.cities !== false;
        if (label.kind === "kingdom" || label.kind === "region") {
          return visibility.kingdoms !== false;
        }
        return visibility.labels !== false;
      })
      .map((label) => ({
        type: "Feature" as const,
        id: label.id,
        geometry: {
          type: "Point" as const,
          coordinates: [label.lng, label.lat] as [number, number],
        },
        properties: {
          id: label.id,
          slug: label.id,
          name: resolveLocalizedName(label.name, lang, label.iast),
          kind: label.kind,
          category: label.kind,
        },
      })),
  };
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

const KNOWN_ROUTE_COORDS: Record<string, [number, number]> = {
  "city.indraprastha": [77.25, 28.61],
  "indraprastha": [77.25, 28.61],
  "forest.kamyaka": [76.30, 29.80],
  "kamyaka": [76.30, 29.80],
  "forest.dvaita": [75.80, 29.30],
  "dvaita": [75.80, 29.30],
  "kingdom.virata": [76.85, 26.90],
  "virata": [76.85, 26.90],
  "matsya": [76.85, 26.90],
  "city.hastinapura": [78.02, 29.17],
  "hastinapura": [78.02, 29.17],
  "place.kurukshetra": [76.82, 29.96],
  "kurukshetra": [76.82, 29.96],
  "place.gokula": [77.72, 27.43],
  "gokula": [77.72, 27.43],
  "place.vrindavana": [77.70, 27.58],
  "vrindavana": [77.70, 27.58],
  "city.mathura": [77.67, 27.49],
  "mathura": [77.67, 27.49],
  "city.dvaraka": [68.96, 22.24],
  "dvaraka": [68.96, 22.24],
  "kingdom.pancala": [79.40, 28.35],
  "pancala": [79.40, 28.35],
  "kingdom.kashi": [83.00, 25.31],
  "kashi": [83.00, 25.31],
  "kingdom.magadha": [85.30, 24.80],
  "magadha": [85.30, 24.80],
  "river.sarasvati": [76.50, 29.50],
  "sarasvati": [76.50, 29.50],
  "river.yamuna": [77.50, 28.50],
  "yamuna": [77.50, 28.50],
  "river.ganga": [78.50, 28.00],
  "ganga": [78.50, 28.00],
  "forest.naimisharanya": [80.48, 27.35],
  "naimisharanya": [80.48, 27.35],
};

export function routesToGeoJson(
  dataset: AtlasDataset,
  places: readonly AtlasPlace[],
  activeRouteId: string | null,
  visible: boolean,
): FeatureCollection {
  if (!visible && !activeRouteId) return emptyFc();
  const byId = new Map<string, AtlasPlace>();
  for (const p of places) {
    byId.set(p.id, p);
    byId.set(p.slug, p);
  }
  const features: FeatureCollection["features"] = [];

  for (const route of dataset.routes) {
    const coords: [number, number][] = [];
    if (route.stops && route.stops.length >= 2) {
      for (const stop of route.stops) {
        coords.push([stop.longitude, stop.latitude]);
      }
    } else {
      for (const pid of route.placeIds) {
        const bare = pid.replace(/^[a-z]+\./, "");
        const p = byId.get(pid) ?? byId.get(bare);
        if (p) {
          coords.push([p.atlas.longitude, p.atlas.latitude]);
        } else if (KNOWN_ROUTE_COORDS[pid] || KNOWN_ROUTE_COORDS[bare]) {
          coords.push(KNOWN_ROUTE_COORDS[pid] ?? KNOWN_ROUTE_COORDS[bare]!);
        }
      }
    }
    if (coords.length < 2) continue;
    const isActive =
      Boolean(activeRouteId) &&
      (activeRouteId === route.id || activeRouteId === route.slug);
    features.push({
      type: "Feature",
      id: route.id,
      geometry: { type: "LineString", coordinates: coords },
      properties: {
        id: route.id,
        slug: route.slug,
        name: route.title,
        kind: "route",
        category: isActive ? "active" : "idle",
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

  if (route.stops && route.stops.length > 0) {
    route.stops.forEach((stop, i) => {
      features.push({
        type: "Feature",
        id: `${route.id}-stop-${i}`,
        geometry: {
          type: "Point",
          coordinates: [stop.longitude, stop.latitude],
        },
        properties: {
          id: stop.id,
          slug: stop.placeId.replace(/^[a-z]+\./, ""),
          name: stop.ancientName,
          kind: "route-stop",
          category: activeStopIndex === i ? "active" : "stop",
          importance: i + 1,
          locationType: stop.locationType ?? "visited",
          coordinateConfidence: stop.coordinateConfidence ?? "traditional/approximate",
          sourceType: stop.sourceType ?? "primary-text",
          modernName: stop.modernName ?? "",
          narrative: stop.narrative ?? "",
          sourceRefs: stop.sourceRefs ?? [],
        },
      });
    });
    return { type: "FeatureCollection", features };
  }

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

function polygonToFeature(poly: AtlasPolygon) {
  const rings = poly.geometry.rings.map((ring) =>
    ring.map(([lat, lng]) => [lng, lat] as [number, number]),
  );
  return {
    type: "Feature" as const,
    id: poly.id,
    geometry: { type: "Polygon" as const, coordinates: rings },
    properties: {
      id: poly.id,
      slug: poly.slug,
      name: poly.title,
      kind: "kingdom",
      certainty: poly.confidence,
    },
  };
}

/**
 * All curated kingdom extents (JSON only — never procedural coastlines).
 * Shown faintly when the Kingdoms layer is on; hover/selection emphasize one.
 */
export function kingdomsToGeoJson(
  polygons: readonly AtlasPolygon[],
  visible: boolean,
): FeatureCollection {
  if (!visible || polygons.length === 0) return emptyFc();
  return {
    type: "FeatureCollection",
    features: polygons.map(polygonToFeature),
  };
}

/**
 * Selected kingdom extent highlight.
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
  return {
    type: "FeatureCollection",
    features: [polygonToFeature(match)],
  };
}
