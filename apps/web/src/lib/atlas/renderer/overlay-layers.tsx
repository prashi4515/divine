/**
 * MapLibre overlay sources + layers.
 * Knows only GeoJSON + layer ids — nothing about Mahābhārata content.
 * Base artwork is never redrawn here.
 */
"use client";

import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
} from "@/lib/atlas/overlays/layer-catalog";

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
  showLabels: boolean;
  showRoutes: boolean;
  showEvents: boolean;
  showRivers: boolean;
  selectedPlaceSlug: string | null;
  selectedRiverId: string | null;
};

export function AtlasOverlayLayers({
  places,
  rivers,
  routes,
  routeStops,
  events,
  kingdoms,
  showLabels,
  showRoutes,
  showEvents,
  showRivers,
  selectedPlaceSlug,
  selectedRiverId,
}: OverlayLayersProps) {
  return (
    <>
      <Source id={OVERLAY_SOURCE_IDS.kingdoms} type="geojson" data={kingdoms}>
        <Layer
          id={OVERLAY_LAYER_IDS.kingdomsFill}
          type="fill"
          paint={{
            "fill-color": "#c47848",
            "fill-opacity": 0.22,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.kingdomsLine}
          type="line"
          paint={{
            "line-color": "#a85a28",
            "line-width": 2.5,
            "line-opacity": 0.9,
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
            "line-color": "#1a6a9a",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              1.5,
              8,
              3.2,
            ],
            "line-opacity": 0.85,
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
            "line-color": "#0a8ad0",
            "line-width": 6,
            "line-opacity": 0.95,
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
            "line-width": 2,
            "line-opacity": 0.4,
            "line-dasharray": [2, 2],
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
            "line-color": "#c47848",
            "line-width": 4.5,
            "line-opacity": 0.95,
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
            "circle-stroke-color": "#fff8f0",
          }}
        />
      </Source>

      <Source
        id={OVERLAY_SOURCE_IDS.places}
        type="geojson"
        data={places}
        cluster
        clusterMaxZoom={10}
        clusterRadius={52}
      >
        <Layer
          id={OVERLAY_LAYER_IDS.placesClusters}
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#c4a060",
              8,
              "#a87840",
              20,
              "#8a5a2b",
            ],
            "circle-radius": ["step", ["get", "point_count"], 16, 8, 20, 20, 26],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff8f0",
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
          paint={{ "text-color": "#1a1208" }}
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
              3.5,
              6,
              5.5,
              9,
              8,
            ],
            "circle-color": [
              "match",
              ["get", "category"],
              "kingdom",
              "#c47848",
              "city",
              "#3d6a8a",
              "forest",
              "#3d6a40",
              "battlefield",
              "#8a3030",
              "ashrama",
              "#6a4a8a",
              "river",
              "#1a6a9a",
              "mountain",
              "#5a4030",
              "#8a6a40",
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#fff8f0",
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
              20,
            ],
            "circle-color": "#e89040",
            "circle-opacity": 0.28,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#e89040",
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.placesLabels}
          type="symbol"
          filter={[
            "all",
            ["!", ["has", "point_count"]],
            [">=", ["get", "importance"], 3],
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
            "text-offset": [0, 1.15],
            "text-anchor": "top",
            "text-optional": true,
            "text-padding": 4,
            "text-font": [...LABEL_FONT],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "symbol-sort-key": ["-", ["get", "importance"]],
          }}
          paint={{
            "text-color": "#1a1208",
            "text-halo-color": "rgba(255,248,230,0.92)",
            "text-halo-width": 1.6,
            "text-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3.8,
              0,
              4.4,
              1,
            ],
          }}
          minzoom={4}
        />
        <Layer
          id={`${OVERLAY_LAYER_IDS.placesLabels}-detail`}
          type="symbol"
          filter={[
            "all",
            ["!", ["has", "point_count"]],
            ["<", ["get", "importance"], 3],
          ]}
          layout={{
            visibility: showLabels ? "visible" : "none",
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-offset": [0, 1.15],
            "text-anchor": "top",
            "text-optional": true,
            "text-padding": 6,
            "text-font": [...LABEL_FONT],
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#2a2010",
            "text-halo-color": "rgba(255,248,230,0.9)",
            "text-halo-width": 1.4,
          }}
          minzoom={7}
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
            "circle-color": "#c04030",
            "circle-opacity": 0.22,
            "circle-stroke-width": 0,
          }}
        />
        <Layer
          id={OVERLAY_LAYER_IDS.events}
          type="circle"
          layout={{ visibility: showEvents ? "visible" : "none" }}
          paint={{
            "circle-radius": 6.5,
            "circle-color": "#c04030",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff8f0",
          }}
        />
      </Source>
    </>
  );
}
