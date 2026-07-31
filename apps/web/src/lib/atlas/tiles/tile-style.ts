/**
 * Illustrated Ancient Bhārata basemap — MapLibre image source.
 * Artwork is display-only. Overlays come from JSON / KG, never from pixels.
 * Swap `baseMap.src` (or ACTIVE artwork path) without changing the engine.
 */
import type { StyleSpecification } from "maplibre-gl";
import type { AtlasBaseMap, AtlasProjection } from "@divine/types";
import {
  DEFAULT_ATLAS_BASE_MAP,
  DEFAULT_ATLAS_PROJECTION,
} from "@divine/types";

export type AtlasTileProviderId = "illustrated" | "bharata-tiles";

export type AtlasTileProvider = {
  id: AtlasTileProviderId;
  label: string;
};

/** Active provider label for UI chrome. */
export const ACTIVE_TILE_PROVIDER: AtlasTileProvider = {
  id: "illustrated",
  label: "Ancient Bhārata plate",
};

/**
 * Build a MapLibre style that shows one illustrated plate georeferenced to
 * the educational projection. No OSM. No procedural coastlines.
 */
export function buildIllustratedStyle(
  baseMap: AtlasBaseMap = DEFAULT_ATLAS_BASE_MAP,
  projection: AtlasProjection = DEFAULT_ATLAS_PROJECTION,
): StyleSpecification {
  const proj = baseMap.projection ?? projection;
  const src = baseMap.src;

  return {
    version: 8,
    name: "ancient-bharata-illustrated",
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "atlas-artwork": {
        type: "image",
        url: src,
        coordinates: [
          [proj.minLng, proj.maxLat],
          [proj.maxLng, proj.maxLat],
          [proj.maxLng, proj.minLat],
          [proj.minLng, proj.minLat],
        ],
      },
    },
    layers: [
      {
        id: "atlas-bg",
        type: "background",
        paint: { "background-color": "#1c1810" },
      },
      {
        id: "atlas-artwork",
        type: "raster",
        source: "atlas-artwork",
        paint: {
          "raster-opacity": 1,
          "raster-fade-duration": 0,
          "raster-resampling": "linear",
        },
      },
    ],
  };
}

export function atlasMaxBounds(
  projection: AtlasProjection = DEFAULT_ATLAS_PROJECTION,
): [number, number, number, number] {
  const padLng = (projection.maxLng - projection.minLng) * 0.08;
  const padLat = (projection.maxLat - projection.minLat) * 0.08;
  return [
    projection.minLng - padLng,
    projection.minLat - padLat,
    projection.maxLng + padLng,
    projection.maxLat + padLat,
  ];
}

export function atlasDefaultView(
  projection: AtlasProjection = DEFAULT_ATLAS_PROJECTION,
) {
  return {
    longitude: (projection.minLng + projection.maxLng) / 2,
    latitude: (projection.minLat + projection.maxLat) / 2,
    zoom: 4.35,
    bearing: 0,
    pitch: 0,
  } as const;
}

export const ATLAS_DEFAULT_VIEW = atlasDefaultView();
export const ATLAS_MAX_BOUNDS = atlasMaxBounds();

export const ATLAS_MIN_ZOOM = 3.2;
export const ATLAS_MAX_ZOOM = 11.5;

const VIEWPORT_KEY = "divine.atlas.viewport.v2";

export type StoredAtlasViewport = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export function loadStoredViewport(): StoredAtlasViewport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VIEWPORT_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredAtlasViewport;
    if (
      typeof v.longitude !== "number" ||
      typeof v.latitude !== "number" ||
      typeof v.zoom !== "number"
    ) {
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

export function saveStoredViewport(v: StoredAtlasViewport): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEWPORT_KEY, JSON.stringify(v));
  } catch {
    /* ignore quota */
  }
}
