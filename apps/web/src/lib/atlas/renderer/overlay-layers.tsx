/**
 * MapLibre overlay sources + layers.
 * Knows only GeoJSON + layer ids — nothing about Mahābhārata content.
 * Basemap is never redrawn here.
 */
"use client";

import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
} from "@/lib/atlas/overlays/layer-catalog";

/** demotiles.maplibre.org provides Noto Sans (Open Sans 404s). */
const LABEL_FONT = ["Noto Sans Regular"] as const;
const LABEL_FONT_BOLD = ["Noto Sans Bold"] as const;

type Fc = FeatureCollection;

type OverlayLayersProps = {
  places: Fc;
  rivers: Fc;
  routes: Fc;
  routeStops: Fc;
  events: Fc;
  kingdoms: Fc;
  kingdomsSelected: Fc;
  traditionalLabels: Fc;
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

export function AtlasOverlayLayers({
  places,
  rivers,
  routes,
  routeStops,
  events,
  kingdoms,
  kingdomsSelected,
  traditionalLabels,
  showLabels,
  showRoutes,
  showEvents,
  showRivers,
  showKingdoms,
  selectedPlaceSlug,
  selectedRiverId,
  hoveredRiverId,
  hoveredKingdomId,
}: OverlayLayersProps) {
  return (
    <>
      <Source id={OVERLAY_SOURCE_IDS.kingdoms} type="geojson" data={kingdoms}>
        <Layer
          id={OVERLAY_LAYER_IDS.kingdomsFill}
          type="fill"
          layout={{ visibility: showKingdoms ? "visible" : "none" }}
          paint={{
            "fill-color": "#c47848",
            "fill-opacity": 0.1,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.kingdomsLine}
          type="line"
          layout={{ visibility: showKingdoms ? "visible" : "none" }}
          paint={{
            "line-color": "#a85a28",
            "line-width": 1.5,
            "line-opacity": 0.65,
            "line-dasharray": [2, 1.5],
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.kingdomsHover}
          type="fill"
          layout={{ visibility: showKingdoms ? "visible" : "none" }}
          filter={["==", ["get", "id"], hoveredKingdomId ?? ""]}
          paint={{
            "fill-color": "#c47848",
            "fill-opacity": 0.3,
          }}
        />
      </Source>

      <Source
        id={OVERLAY_SOURCE_IDS.kingdomsSelected}
        type="geojson"
        data={kingdomsSelected}
      >
        <Layer
          id={`${OVERLAY_LAYER_IDS.kingdomsFill}-selected`}
          type="fill"
          paint={{
            "fill-color": "#c47848",
            "fill-opacity": 0.28,
          }}
        />
        <Layer
          id={`${OVERLAY_LAYER_IDS.kingdomsLine}-selected`}
          type="line"
          paint={{
            "line-color": "#a85a28",
            "line-width": 2.5,
            "line-opacity": 0.95,
          }}
        />
      </Source>

      <Source
        id={OVERLAY_SOURCE_IDS.rivers}
        type="geojson"
        data={rivers}
        lineMetrics
      >
        <Layer
          id={OVERLAY_LAYER_IDS.rivers}
          type="line"
          layout={{
            visibility: showRivers ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": "#1a73e8",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              2,
              8,
              4,
            ],
            "line-opacity": 0.9,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.riversHover}
          type="line"
          layout={{
            visibility: showRivers ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          }}
          filter={["==", ["get", "id"], hoveredRiverId ?? ""]}
          paint={{
            "line-color": "#174ea6",
            "line-width": 6,
            "line-opacity": 0.95,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.riversHighlight}
          type="line"
          layout={{
            visibility: showRivers ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          }}
          filter={["==", ["get", "id"], selectedRiverId ?? ""]}
          paint={{
            "line-color": "#0b57d0",
            "line-width": 7,
            "line-opacity": 1,
          }}
        />
      </Source>

      <Source id={OVERLAY_SOURCE_IDS.routes} type="geojson" data={routes}>
        <Layer
          id={OVERLAY_LAYER_IDS.routes}
          type="line"
          layout={{
            visibility: showRoutes ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          }}
          filter={["!=", ["get", "category"], "active"]}
          paint={{
            "line-color": "#8a5a2b",
            "line-width": 2.5,
            "line-opacity": 0.75,
            "line-dasharray": [1.5, 1.5],
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.routesActive}
          type="line"
          layout={{
            visibility: showRoutes ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          }}
          filter={["==", ["get", "category"], "active"]}
          paint={{
            "line-color": "#e37400",
            "line-width": 4,
            "line-opacity": 0.95,
            "line-dasharray": [2, 1.25],
          }}
        />
      </Source>

      <Source id="atlas-src-route-stops" type="geojson" data={routeStops}>
        <Layer
          id={OVERLAY_LAYER_IDS.routeStops}
          type="circle"
          layout={{
            visibility: showRoutes ? "visible" : "none",
          }}
          paint={{
            "circle-radius": [
              "case",
              ["==", ["get", "category"], "active"],
              10,
              6,
            ],
            "circle-color": [
              "case",
              ["==", ["get", "category"], "active"],
              "#e89040",
              "#c47848",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>

      <Source
        id={OVERLAY_SOURCE_IDS.places}
        type="geojson"
        data={places}
        cluster
        clusterMaxZoom={9}
        clusterRadius={42}
      >
        <Layer
          id={OVERLAY_LAYER_IDS.placesClusters}
          type="circle"
          filter={["has", "point_count"]}
          paint={{
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
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.placesClusterCount}
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
            "text-font": [...LABEL_FONT_BOLD],
            "text-allow-overlap": true,
          }}
          paint={{ "text-color": "#202124" }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.places}
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              4.5,
              6,
              7,
              9,
              9,
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
            "circle-opacity": 0.95,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.placesHighlight}
          type="circle"
          filter={[
            "all",
            ["!", ["has", "point_count"]],
            ["==", ["get", "slug"], selectedPlaceSlug ?? ""],
          ]}
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              14,
              9,
              22,
            ],
            "circle-color": "#1a73e8",
            "circle-opacity": 0.22,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#1a73e8",
          }}
        />
        {/* Place names for cities, forests, ashramas, etc. */}
        <Layer
          id={OVERLAY_LAYER_IDS.placesLabels}
          type="symbol"
          filter={[
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
          ]}
          layout={{
            visibility: showLabels ? "visible" : "none",
            "text-field": ["get", "name"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              10,
              8,
              12,
              11,
              14,
            ],
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-optional": false,
            "text-padding": 2,
            "text-font": [...LABEL_FONT],
            "text-allow-overlap": false,
            "symbol-sort-key": ["-", ["get", "importance"]],
          }}
          paint={{
            "text-color": "#202124",
            "text-halo-color": "rgba(255,255,255,0.95)",
            "text-halo-width": 1.8,
          }}
          minzoom={4}
        />
      </Source>

      {/* Plate toponyms — kingdoms, rivers, regions from the old illustrated map */}
      <Source
        id={OVERLAY_SOURCE_IDS.traditionalLabels}
        type="geojson"
        data={traditionalLabels}
      >
        <Layer
          id={OVERLAY_LAYER_IDS.traditionalLabels}
          type="symbol"
          layout={{
            visibility: showLabels ? "visible" : "none",
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
            "text-font": [...LABEL_FONT_BOLD],
            "text-anchor": "center",
            "text-optional": false,
            "text-padding": 1,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "symbol-sort-key": [
              "match",
              ["get", "kind"],
              "sea",
              0,
              "kingdom",
              1,
              "region",
              1,
              "city",
              2,
              "river",
              3,
              "forest",
              4,
              "mountain",
              5,
              6,
            ],
          }}
          paint={{
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
            "text-opacity": 1,
          }}
          minzoom={3}
        />
      </Source>

      <Source id={OVERLAY_SOURCE_IDS.events} type="geojson" data={events}>
        <Layer
          id={OVERLAY_LAYER_IDS.eventsPulse}
          type="circle"
          layout={{ visibility: showEvents ? "visible" : "none" }}
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              10,
              9,
              16,
            ],
            "circle-color": "#c5221f",
            "circle-opacity": 0.22,
            "circle-stroke-width": 0,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.events}
          type="circle"
          layout={{ visibility: showEvents ? "visible" : "none" }}
          paint={{
            "circle-radius": 7,
            "circle-color": "#c5221f",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    </>
  );
}
