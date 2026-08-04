/**
 * Imperative MapLibre overlay install — more reliable than react-map-gl
 * <Source>/<Layer> children when the basemap style is a local StyleSpecification.
 */
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  LineLayerSpecification,
  CircleLayerSpecification,
  SymbolLayerSpecification,
  FillLayerSpecification,
} from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
} from "@/lib/atlas/overlays/layer-catalog";

const FONT = ["Noto Sans Regular"] as const;
const FONT_BOLD = ["Noto Sans Bold"] as const;

type OverlayData = {
  places: FeatureCollection;
  rivers: FeatureCollection;
  routes: FeatureCollection;
  routeStops: FeatureCollection;
  events: FeatureCollection;
  kingdoms: FeatureCollection;
  kingdomsSelected: FeatureCollection;
  traditionalLabels: FeatureCollection;
};

type OverlayVisibility = {
  showLabels: boolean;
  showRoutes: boolean;
  activeRouteId?: string | null;
  showEvents: boolean;
  showRivers: boolean;
  showKingdoms: boolean;
  selectedPlaceSlug: string | null;
  selectedRiverId: string | null;
  hoveredRiverId: string | null;
  hoveredKingdomId: string | null;
};

function setGeoJson(
  map: MapLibreMap,
  id: string,
  data: FeatureCollection,
  extra?: Record<string, unknown>,
): void {
  const existing = map.getSource(id) as GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
    return;
  }
  map.addSource(id, {
    type: "geojson",
    data,
    ...extra,
  });
}

function upsertLayer(
  map: MapLibreMap,
  layer:
    | LineLayerSpecification
    | CircleLayerSpecification
    | SymbolLayerSpecification
    | FillLayerSpecification,
): void {
  if (map.getLayer(layer.id)) {
    if ("filter" in layer) {
      map.setFilter(layer.id, layer.filter ?? null);
    }
    if ("layout" in layer && layer.layout) {
      const layout = layer.layout as Record<string, unknown>;
      for (const key of Object.keys(layout)) {
        try {
          map.setLayoutProperty(
            layer.id,
            key as never,
            layout[key] as never,
          );
        } catch {
          /* ignore unsupported live updates */
        }
      }
    }
    if ("paint" in layer && layer.paint) {
      const paint = layer.paint as Record<string, unknown>;
      for (const key of Object.keys(paint)) {
        try {
          map.setPaintProperty(
            layer.id,
            key as never,
            paint[key] as never,
          );
        } catch {
          /* ignore unsupported live updates */
        }
      }
    }
    return;
  }
  map.addLayer(layer);
}

/**
 * Install / refresh all atlas overlay sources + layers on a live MapLibre map.
 */
export function syncAtlasOverlays(
  map: MapLibreMap,
  data: OverlayData,
  vis: OverlayVisibility,
): void {
  if (!map.isStyleLoaded()) return;

  setGeoJson(map, OVERLAY_SOURCE_IDS.kingdoms, data.kingdoms);
  setGeoJson(map, OVERLAY_SOURCE_IDS.kingdomsSelected, data.kingdomsSelected);
  setGeoJson(map, OVERLAY_SOURCE_IDS.rivers, data.rivers);
  setGeoJson(map, OVERLAY_SOURCE_IDS.routes, data.routes);
  setGeoJson(map, OVERLAY_SOURCE_IDS.routeStops, data.routeStops);
  setGeoJson(map, OVERLAY_SOURCE_IDS.places, data.places, {
    cluster: true,
    clusterMaxZoom: 9,
    clusterRadius: 42,
  });
  setGeoJson(map, OVERLAY_SOURCE_IDS.traditionalLabels, data.traditionalLabels);
  setGeoJson(map, OVERLAY_SOURCE_IDS.events, data.events);

  const kingdomVis = vis.showKingdoms ? "visible" : "none";
  const riverVis = vis.showRivers ? "visible" : "none";
  const routeVis =
    vis.showRoutes || Boolean(vis.activeRouteId) ? "visible" : "none";
  const eventVis = vis.showEvents ? "visible" : "none";
  const labelVis = vis.showLabels ? "visible" : "none";

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.kingdomsFill,
    type: "fill",
    source: OVERLAY_SOURCE_IDS.kingdoms,
    layout: { visibility: kingdomVis },
    paint: { "fill-color": "#c47848", "fill-opacity": 0.1 },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.kingdomsLine,
    type: "line",
    source: OVERLAY_SOURCE_IDS.kingdoms,
    layout: { visibility: kingdomVis },
    paint: {
      "line-color": "#a85a28",
      "line-width": 1.5,
      "line-opacity": 0.65,
      "line-dasharray": [2, 1.5],
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.kingdomsHover,
    type: "fill",
    source: OVERLAY_SOURCE_IDS.kingdoms,
    layout: { visibility: kingdomVis },
    filter: ["==", ["get", "id"], vis.hoveredKingdomId ?? ""],
    paint: { "fill-color": "#c47848", "fill-opacity": 0.3 },
  });
  upsertLayer(map, {
    id: `${OVERLAY_LAYER_IDS.kingdomsFill}-selected`,
    type: "fill",
    source: OVERLAY_SOURCE_IDS.kingdomsSelected,
    paint: { "fill-color": "#c47848", "fill-opacity": 0.28 },
  });
  upsertLayer(map, {
    id: `${OVERLAY_LAYER_IDS.kingdomsLine}-selected`,
    type: "line",
    source: OVERLAY_SOURCE_IDS.kingdomsSelected,
    paint: {
      "line-color": "#a85a28",
      "line-width": 2.5,
      "line-opacity": 0.95,
    },
  });

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.rivers,
    type: "line",
    source: OVERLAY_SOURCE_IDS.rivers,
    layout: {
      visibility: riverVis,
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#1a73e8",
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2, 8, 4],
      "line-opacity": 0.9,
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.riversHover,
    type: "line",
    source: OVERLAY_SOURCE_IDS.rivers,
    layout: {
      visibility: riverVis,
      "line-cap": "round",
      "line-join": "round",
    },
    filter: ["==", ["get", "id"], vis.hoveredRiverId ?? ""],
    paint: { "line-color": "#174ea6", "line-width": 6, "line-opacity": 0.95 },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.riversHighlight,
    type: "line",
    source: OVERLAY_SOURCE_IDS.rivers,
    layout: {
      visibility: riverVis,
      "line-cap": "round",
      "line-join": "round",
    },
    filter: ["==", ["get", "id"], vis.selectedRiverId ?? ""],
    paint: { "line-color": "#0b57d0", "line-width": 7, "line-opacity": 1 },
  });

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.routes,
    type: "line",
    source: OVERLAY_SOURCE_IDS.routes,
    layout: {
      visibility: routeVis,
      "line-cap": "round",
      "line-join": "round",
    },
    filter: ["!=", ["get", "category"], "active"],
    paint: {
      "line-color": "#8a5a2b",
      "line-width": 2.5,
      "line-opacity": 0.8,
      "line-dasharray": [1.5, 1.5],
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.routesActive,
    type: "line",
    source: OVERLAY_SOURCE_IDS.routes,
    layout: {
      visibility: routeVis,
      "line-cap": "round",
      "line-join": "round",
    },
    filter: ["==", ["get", "category"], "active"],
    paint: {
      "line-color": "#e37400",
      "line-width": 4.5,
      "line-opacity": 1,
      "line-dasharray": [2, 1.2],
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.routeStops,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.routeStops,
    layout: { visibility: routeVis },
    paint: {
      "circle-radius": [
        "case",
        ["==", ["get", "category"], "active"],
        11,
        7,
      ],
      "circle-color": [
        "case",
        ["==", ["get", "category"], "active"],
        "#e89040",
        "#c47848",
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.placesClusters,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.places,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#f9ab00",
        8,
        "#e37400",
        20,
        "#c5221f",
      ],
      "circle-radius": ["step", ["get", "point_count"], 16, 8, 20, 20, 26],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.placesClusterCount,
    type: "symbol",
    source: OVERLAY_SOURCE_IDS.places,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 12,
      "text-font": [...FONT_BOLD],
      "text-allow-overlap": true,
    },
    paint: { "text-color": "#202124" },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.places,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.places,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 5, 6, 7.5, 9, 10],
      "circle-color": [
        "match",
        ["get", "category"],
        "kingdom",
        "#e37400",
        "city",
        "#1a73e8",
        "forest",
        "#188038",
        "battlefield",
        "#c5221f",
        "ashrama",
        "#9334e6",
        "river",
        "#039be5",
        "mountain",
        "#5f6368",
        "pilgrimage",
        "#f9ab00",
        "#80868b",
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.95,
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.placesHighlight,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.places,
    filter: [
      "all",
      ["!", ["has", "point_count"]],
      ["==", ["get", "slug"], vis.selectedPlaceSlug ?? ""],
    ],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 14, 9, 22],
      "circle-color": "#1a73e8",
      "circle-opacity": 0.22,
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "#1a73e8",
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.placesLabels,
    type: "symbol",
    source: OVERLAY_SOURCE_IDS.places,
    minzoom: 4,
    filter: [
      "all",
      ["!", ["has", "point_count"]],
      [
        "any",
        ["==", ["get", "category"], "city"],
        ["==", ["get", "category"], "forest"],
        ["==", ["get", "category"], "ashrama"],
        ["==", ["get", "category"], "battlefield"],
        ["==", ["get", "category"], "pilgrimage"],
        ["==", ["get", "category"], "mountain"],
      ],
    ],
    layout: {
      visibility: labelVis,
      "text-field": ["get", "name"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 12, 11, 14],
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-font": [...FONT],
      "text-allow-overlap": false,
      "symbol-sort-key": ["-", ["coalesce", ["get", "importance"], 0]],
    },
    paint: {
      "text-color": "#202124",
      "text-halo-color": "rgba(255,255,255,0.95)",
      "text-halo-width": 1.8,
    },
  });

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.traditionalLabels,
    type: "symbol",
    source: OVERLAY_SOURCE_IDS.traditionalLabels,
    minzoom: 3,
    layout: {
      visibility: labelVis,
      "text-field": ["get", "name"],
      "text-size": [
        "match",
        ["get", "kind"],
        "sea",
        13,
        "river",
        11,
        "forest",
        11,
        "mountain",
        11,
        "city",
        12,
        12,
      ],
      "text-font": [...FONT_BOLD],
      "text-anchor": "center",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": [
        "match",
        ["get", "kind"],
        "river",
        "#1a73e8",
        "forest",
        "#188038",
        "mountain",
        "#5f6368",
        "sea",
        "#1967d2",
        "city",
        "#202124",
        "#b06000",
      ],
      "text-halo-color": "rgba(255,255,255,0.96)",
      "text-halo-width": 2,
    },
  });

  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.eventsPulse,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.events,
    layout: { visibility: eventVis },
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 10, 9, 16],
      "circle-color": "#c5221f",
      "circle-opacity": 0.22,
    },
  });
  upsertLayer(map, {
    id: OVERLAY_LAYER_IDS.events,
    type: "circle",
    source: OVERLAY_SOURCE_IDS.events,
    layout: { visibility: eventVis },
    paint: {
      "circle-radius": 7,
      "circle-color": "#c5221f",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}
