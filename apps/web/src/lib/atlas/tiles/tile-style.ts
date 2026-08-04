/**
 * Atlas basemap — Google Maps–like light canvas (no modern place labels).
 *
 * Uses an inline MapLibre style + Carto light_nolabels raster tiles so the
 * map always loads without depending on a remote style.json. Ancient names
 * come only from overlay JSON.
 */
import type { StyleSpecification } from "maplibre-gl";
import type { AtlasBaseMap, AtlasProjection } from "@divine/types";
import {
  DEFAULT_ATLAS_BASE_MAP,
  DEFAULT_ATLAS_PROJECTION,
} from "@divine/types";

export type AtlasTileProviderId =
  | "clean-map"
  | "bharata-tiles"
  | "illustrated-fallback";

export type AtlasTileProvider = {
  id: AtlasTileProviderId;
  label: string;
};

export const ACTIVE_TILE_PROVIDER: AtlasTileProvider = {
  id: "clean-map",
  label: "Clean map",
};

export type AtlasMapStyle = string | StyleSpecification;

/** Light Google Maps–like raster tiles without place names. */
const CLEAN_RASTER_TILES = [
  "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
  "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
  "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
] as const;

/**
 * Self-contained clean basemap. Prefer this over remote style.json so glyphs
 * and layers are under our control and overlays always paint.
 */
export function buildCleanMapStyle(
  attribution =
    "© CARTO © OpenStreetMap — ancient names from Divine overlays",
): StyleSpecification {
  return {
    version: 8,
    name: "divine-atlas-clean",
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "atlas-basemap": {
        type: "raster",
        tiles: [...CLEAN_RASTER_TILES],
        tileSize: 256,
        attribution,
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "atlas-bg",
        type: "background",
        paint: { "background-color": "#e8eaed" },
      },
      {
        id: "atlas-basemap",
        type: "raster",
        source: "atlas-basemap",
        paint: {
          "raster-opacity": 1,
          "raster-fade-duration": 100,
        },
      },
    ],
  };
}

function buildRasterTileStyle(
  baseMap: AtlasBaseMap,
  projection: AtlasProjection,
): StyleSpecification {
  const tiles = baseMap.tiles!;
  const proj = baseMap.projection ?? projection;
  const attribution =
    tiles.attribution ?? baseMap.credit ?? "Ancient Bhārata";

  return {
    version: 8,
    name: "ancient-bharata-tiles",
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "atlas-tiles": {
        type: "raster",
        tiles: [tiles.url],
        tileSize: tiles.tileSize,
        minzoom: tiles.minZoom,
        maxzoom: tiles.maxZoom,
        scheme: tiles.scheme === "tms" ? "tms" : "xyz",
        bounds: [proj.minLng, proj.minLat, proj.maxLng, proj.maxLat],
        attribution,
      },
    },
    layers: [
      {
        id: "atlas-bg",
        type: "background",
        paint: { "background-color": "#e8eaed" },
      },
      {
        id: "atlas-tiles",
        type: "raster",
        source: "atlas-tiles",
        paint: {
          "raster-opacity": 1,
          "raster-fade-duration": 150,
          "raster-resampling": "linear",
        },
      },
    ],
  };
}

function buildImageFallbackStyle(
  baseMap: AtlasBaseMap,
  projection: AtlasProjection,
): StyleSpecification {
  const proj = baseMap.projection ?? projection;
  const src = baseMap.src!;

  return {
    version: 8,
    name: "ancient-bharata-image-fallback",
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
        paint: { "background-color": "#e8eaed" },
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

/**
 * Build the MapLibre style for the Atlas canvas.
 * Default: inline clean raster map (Google Maps–like, no modern labels).
 */
export function buildAtlasStyle(
  baseMap: AtlasBaseMap = DEFAULT_ATLAS_BASE_MAP,
  projection: AtlasProjection = DEFAULT_ATLAS_PROJECTION,
): AtlasMapStyle {
  if (baseMap.tiles?.url) {
    return buildRasterTileStyle(baseMap, projection);
  }
  if (baseMap.src) {
    return buildImageFallbackStyle(baseMap, projection);
  }
  // Remote style.json is optional; inline clean map is the reliable default.
  if (baseMap.styleUrl) {
    return baseMap.styleUrl;
  }
  return buildCleanMapStyle(baseMap.credit);
}

/** @deprecated Prefer `buildAtlasStyle`. */
export const buildIllustratedStyle = buildAtlasStyle;

export function atlasMaxBounds(
  projection: AtlasProjection = DEFAULT_ATLAS_PROJECTION,
): [number, number, number, number] {
  const padLng = (projection.maxLng - projection.minLng) * 0.15;
  const padLat = (projection.maxLat - projection.minLat) * 0.15;
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
    zoom: 4.6,
    bearing: 0,
    pitch: 0,
  } as const;
}

export const ATLAS_DEFAULT_VIEW = atlasDefaultView();
export const ATLAS_MAX_BOUNDS = atlasMaxBounds();

export const ATLAS_MIN_ZOOM = 3;
export const ATLAS_MAX_ZOOM = 14;

const VIEWPORT_KEY = "divine.atlas.viewport.v5";

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
