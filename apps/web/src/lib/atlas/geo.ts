/**
 * Client-safe Atlas place helpers (categories, hrefs).
 * Projection & semantic zoom live in the Atlas 2.0 scene engine.
 */
import type { KnowledgeEntity, AtlasPlaceCategory } from "@/lib/knowledge/types";
import { DEFAULT_ATLAS_PROJECTION } from "@divine/types";

export const ATLAS_FILTERS = [
  "kingdom",
  "city",
  "forest",
  "battlefield",
  "ashrama",
  "river",
  "mountain",
  "pilgrimage",
] as const;
export type AtlasFilter = (typeof ATLAS_FILTERS)[number];

export const ATLAS_FILTER_LABELS: Record<AtlasFilter, string> = {
  kingdom: "Kingdoms",
  city: "Cities",
  forest: "Forests",
  battlefield: "Battlefields",
  ashrama: "Ashramas",
  river: "Rivers",
  mountain: "Mountains",
  pilgrimage: "Pilgrimage",
};

/** @deprecated Prefer dataset.projection — kept for camera fit helpers. */
export const ATLAS_BOUNDS = {
  minLat: DEFAULT_ATLAS_PROJECTION.minLat,
  maxLat: DEFAULT_ATLAS_PROJECTION.maxLat,
  minLng: DEFAULT_ATLAS_PROJECTION.minLng,
  maxLng: DEFAULT_ATLAS_PROJECTION.maxLng,
} as const;

/** @deprecated Prefer dataset.projection.viewBox* */
export const ATLAS_VIEWBOX = {
  width: DEFAULT_ATLAS_PROJECTION.viewBoxWidth,
  height: DEFAULT_ATLAS_PROJECTION.viewBoxHeight,
} as const;

export type Point = { x: number; y: number };

/** @deprecated Prefer projectLatLng from the scene engine with dataset.projection */
export function projectLatLng(latitude: number, longitude: number): Point {
  const { minLat, maxLat, minLng, maxLng } = ATLAS_BOUNDS;
  const { width, height } = ATLAS_VIEWBOX;
  const x = ((longitude - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - latitude) / (maxLat - minLat)) * height;
  return { x, y };
}

export type SemanticLevel = 1 | 2 | 3 | 4 | 5;

export function semanticLevelFromScale(scale: number): SemanticLevel {
  if (scale < 1.15) return 1;
  if (scale < 1.65) return 2;
  if (scale < 2.25) return 3;
  if (scale < 3.0) return 4;
  return 5;
}

export function atlasCategoryFor(entity: KnowledgeEntity): AtlasFilter {
  const fromAtlas = entity.atlas?.atlasCategory;
  if (fromAtlas && (ATLAS_FILTERS as readonly string[]).includes(fromAtlas)) {
    return fromAtlas as AtlasFilter;
  }
  if (entity.categories.includes("battlefield")) return "battlefield";
  if (entity.categories.includes("ashrama")) return "ashrama";
  if (entity.kind === "kingdom") return "kingdom";
  if (entity.kind === "city") return "city";
  if (entity.kind === "forest") return "forest";
  if (entity.kind === "river") return "river";
  if (entity.kind === "mountain") return "mountain";
  if (entity.kind === "pilgrimage" || entity.kind === "temple")
    return "pilgrimage";
  return "pilgrimage";
}

export const CATEGORY_MIN_LEVEL: Record<AtlasFilter, SemanticLevel> = {
  kingdom: 1,
  city: 1,
  mountain: 1,
  river: 2,
  pilgrimage: 2,
  forest: 2,
  battlefield: 3,
  ashrama: 3,
};

export function atlasHref(entity: Pick<KnowledgeEntity, "slug">): string {
  return `/atlas/${entity.slug}`;
}

export function isAtlasPlace(entity: KnowledgeEntity): boolean {
  return Boolean(entity.atlas);
}

export type AtlasPlace = KnowledgeEntity & {
  atlas: NonNullable<KnowledgeEntity["atlas"]>;
};

export function markerKindFor(place: AtlasPlace): AtlasPlaceCategory {
  return atlasCategoryFor(place);
}
