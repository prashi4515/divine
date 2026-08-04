/**
 * Full Atlas MapLibre style: clean basemap + all JSON overlays in one spec.
 * Overlays must live in the style object — imperative addLayer is wiped when
 * react-map-gl reapplies mapStyle.
 */
import type { StyleSpecification, LayerSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
} from "@/lib/atlas/overlays/layer-catalog";
import { buildCleanMapStyle } from "@/lib/atlas/tiles/tile-style";

const FONT = ["Noto Sans Regular"];
const FONT_BOLD = ["Noto Sans Bold"];

export type AtlasOverlayBundles = {
  places: FeatureCollection;
  rivers: FeatureCollection;
  routes: FeatureCollection;
  routeStops: FeatureCollection;
  events: FeatureCollection;
  kingdoms: FeatureCollection;
  kingdomsSelected: FeatureCollection;
  traditionalLabels: FeatureCollection;
};

export type AtlasOverlayVis = {
  showLabels: boolean;
  showRoutes: boolean;
  showEvents: boolean;
  showRivers: boolean;
  showKingdoms: boolean;
  selectedPlaceSlug: string | null;
  selectedRiverId: string | null;
  hoveredRiverId: string | null;
  hoveredKingdomId: string | null;
};

export function buildFullAtlasStyle(
  credit: string | undefined,
  data: AtlasOverlayBundles,
  vis: AtlasOverlayVis,
): StyleSpecification {
  const base = buildCleanMapStyle(credit);
  const kingdomVis = vis.showKingdoms ? "visible" : "none";
  const riverVis = vis.showRivers ? "visible" : "none";
  const routeVis = vis.showRoutes ? "visible" : "none";
  const eventVis = vis.showEvents ? "visible" : "none";
  const labelVis = vis.showLabels ? "visible" : "none";

  const overlayLayers: LayerSpecification[] = [
    {
      id: OVERLAY_LAYER_IDS.kingdomsFill,
      type: "fill",
      source: OVERLAY_SOURCE_IDS.kingdoms,
      layout: { visibility: kingdomVis },
      paint: { "fill-color": "#c47848", "fill-opacity": 0.12 },
    },
    {
      id: OVERLAY_LAYER_IDS.kingdomsLine,
      type: "line",
      source: OVERLAY_SOURCE_IDS.kingdoms,
      layout: { visibility: kingdomVis },
      paint: {
        "line-color": "#a85a28",
        "line-width": 1.5,
        "line-opacity": 0.7,
        "line-dasharray": [2, 1.5],
      },
    },
    {
      id: OVERLAY_LAYER_IDS.kingdomsHover,
      type: "fill",
      source: OVERLAY_SOURCE_IDS.kingdoms,
      layout: { visibility: kingdomVis },
      filter: ["==", ["get", "id"], vis.hoveredKingdomId ?? ""],
      paint: { "fill-color": "#c47848", "fill-opacity": 0.32 },
    },
    {
      id: `${OVERLAY_LAYER_IDS.kingdomsFill}-selected`,
      type: "fill",
      source: OVERLAY_SOURCE_IDS.kingdomsSelected,
      paint: { "fill-color": "#c47848", "fill-opacity": 0.28 },
    },
    {
      id: `${OVERLAY_LAYER_IDS.kingdomsLine}-selected`,
      type: "line",
      source: OVERLAY_SOURCE_IDS.kingdomsSelected,
      paint: {
        "line-color": "#a85a28",
        "line-width": 2.5,
        "line-opacity": 0.95,
      },
    },
    {
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
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.2, 8, 4.5],
        "line-opacity": 0.92,
      },
    },
    {
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
    },
    {
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
    },
    {
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
        "line-width": 2.8,
        "line-opacity": 0.85,
        "line-dasharray": [1.5, 1.5],
      },
    },
    {
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
        "line-width": 5,
        "line-opacity": 1,
        "line-dasharray": [2, 1.2],
      },
    },
    {
      id: OVERLAY_LAYER_IDS.routeStops,
      type: "circle",
      source: OVERLAY_SOURCE_IDS.routeStops,
      layout: { visibility: routeVis },
      paint: {
        "circle-radius": [
          "case",
          ["==", ["get", "category"], "active"],
          12,
          8,
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
    },
    {
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
    },
    {
      id: OVERLAY_LAYER_IDS.placesClusterCount,
      type: "symbol",
      source: OVERLAY_SOURCE_IDS.places,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 12,
        "text-font": FONT_BOLD,
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#202124" },
    },
    {
      id: OVERLAY_LAYER_IDS.places,
      type: "circle",
      source: OVERLAY_SOURCE_IDS.places,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          5.5,
          6,
          8,
          9,
          11,
        ],
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
        "circle-opacity": 1,
      },
    },
    {
      id: OVERLAY_LAYER_IDS.placesHighlight,
      type: "circle",
      source: OVERLAY_SOURCE_IDS.places,
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "slug"], vis.selectedPlaceSlug ?? ""],
      ],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 16, 9, 24],
        "circle-color": "#1a73e8",
        "circle-opacity": 0.25,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#1a73e8",
      },
    },
    {
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
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 8, 13],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
        "text-font": FONT,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#202124",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
      },
    },
    {
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
          "city",
          12,
          12,
        ],
        "text-font": FONT_BOLD,
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
        "text-halo-color": "#ffffff",
        "text-halo-width": 2.2,
      },
    },
    {
      id: OVERLAY_LAYER_IDS.eventsPulse,
      type: "circle",
      source: OVERLAY_SOURCE_IDS.events,
      layout: { visibility: eventVis },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 10, 9, 16],
        "circle-color": "#c5221f",
        "circle-opacity": 0.25,
      },
    },
    {
      id: OVERLAY_LAYER_IDS.events,
      type: "circle",
      source: OVERLAY_SOURCE_IDS.events,
      layout: { visibility: eventVis },
      paint: {
        "circle-radius": 8,
        "circle-color": "#c5221f",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    },
  ];

  return {
    ...base,
    sources: {
      ...base.sources,
      [OVERLAY_SOURCE_IDS.kingdoms]: {
        type: "geojson",
        data: data.kingdoms,
      },
      [OVERLAY_SOURCE_IDS.kingdomsSelected]: {
        type: "geojson",
        data: data.kingdomsSelected,
      },
      [OVERLAY_SOURCE_IDS.rivers]: {
        type: "geojson",
        data: data.rivers,
      },
      [OVERLAY_SOURCE_IDS.routes]: {
        type: "geojson",
        data: data.routes,
      },
      [OVERLAY_SOURCE_IDS.routeStops]: {
        type: "geojson",
        data: data.routeStops,
      },
      [OVERLAY_SOURCE_IDS.places]: {
        type: "geojson",
        data: data.places,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 42,
      },
      [OVERLAY_SOURCE_IDS.traditionalLabels]: {
        type: "geojson",
        data: data.traditionalLabels,
      },
      [OVERLAY_SOURCE_IDS.events]: {
        type: "geojson",
        data: data.events,
      },
    },
    layers: [...base.layers, ...overlayLayers],
  };
}
