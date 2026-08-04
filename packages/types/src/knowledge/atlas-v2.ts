/**
 * Atlas 2.0 — data contracts.
 *
 * Locations remain Knowledge Graph entities (`entity.atlas` lat/lng).
 * Polygons, routes, rivers, events, layers, and icon tokens live in atlas JSON packs.
 * The illustrated base plate is a separate, swappable artwork asset — renderers
 * must never invent coastlines or kingdom boundaries from code.
 */
import { z } from "zod";
import { scriptureReferenceSchema } from "./entity";

/** Educational WGS84 point as [latitude, longitude]. */
export const atlasLatLngSchema = z.tuple([
  z.number().min(-90).max(90),
  z.number().min(-180).max(180),
]);
export type AtlasLatLng = z.infer<typeof atlasLatLngSchema>;

/** Closed or open ring of lat/lng pairs. */
export const atlasRingSchema = z.array(atlasLatLngSchema).min(2);
export type AtlasRing = z.infer<typeof atlasRingSchema>;

export const atlasPolygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  /** rings[0] = outer boundary; further rings = holes (rarely used). */
  rings: z.array(atlasRingSchema).min(1),
});
export type AtlasPolygonGeometry = z.infer<typeof atlasPolygonGeometrySchema>;

/** Semantic zoom bands — engine maps camera scale → level. */
export const ATLAS_SEMANTIC_LEVELS = [1, 2, 3, 4, 5] as const;
export type AtlasSemanticLevel = (typeof ATLAS_SEMANTIC_LEVELS)[number];

export const ATLAS_PLACE_CATEGORIES = [
  "kingdom",
  "city",
  "forest",
  "battlefield",
  "ashrama",
  "river",
  "mountain",
  "pilgrimage",
  "sacred",
] as const;
export type AtlasPlaceCategory = (typeof ATLAS_PLACE_CATEGORIES)[number];

/**
 * Icon tokens — identifiers only. Artwork lives in the renderer pack.
 * Swapping illustrated assets must not change these ids.
 */
export const ATLAS_ICON_IDS = [
  "icon.kingdom",
  "icon.city",
  "icon.forest",
  "icon.battlefield",
  "icon.ashrama",
  "icon.river",
  "icon.mountain",
  "icon.pilgrimage",
  "icon.sacred",
  "icon.default",
  "icon.cluster",
] as const;
export type AtlasIconId = (typeof ATLAS_ICON_IDS)[number];

export const atlasIconDefinitionSchema = z.object({
  id: z.enum(ATLAS_ICON_IDS),
  category: z.enum(ATLAS_PLACE_CATEGORIES).optional(),
  label: z.string().min(1),
  /** First semantic level at which this icon may appear. */
  minLevel: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .optional(),
});
export type AtlasIconDefinition = z.infer<typeof atlasIconDefinitionSchema>;

export const ATLAS_LAYER_KINDS = [
  "base",
  "kingdoms",
  "places",
  "routes",
  "rivers",
  "events",
  "labels",
  "custom",
] as const;
export type AtlasLayerKind = (typeof ATLAS_LAYER_KINDS)[number];

export const atlasLayerSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  kind: z.enum(ATLAS_LAYER_KINDS),
  zIndex: z.number().int(),
  defaultVisible: z.boolean().default(true),
  minLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(1),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(5),
  /** Opaque style token interpreted by the active renderer. */
  styleToken: z.string().optional(),
  summary: z.string().optional(),
});
export type AtlasLayer = z.infer<typeof atlasLayerSchema>;

/** Kingdom / region polygon feature (data — not artwork). */
export const atlasPolygonSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  iastTitle: z.string().optional(),
  /** Optional link to a KG place/kingdom entity. */
  entityId: z.string().optional(),
  layerId: z.string().min(1).default("layer.kingdoms"),
  geometry: atlasPolygonGeometrySchema,
  styleToken: z.string().optional(),
  confidence: z.enum(["verified", "traditional", "variant"]).default("traditional"),
  sources: z.array(scriptureReferenceSchema).default([]),
  minLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(1),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(5),
  order: z.number().int().default(100),
});
export type AtlasPolygon = z.infer<typeof atlasPolygonSchema>;

export const ATLAS_PATH_KINDS = [
  "travel",
  "campaign",
  "pilgrimage",
  "exile",
  "other",
] as const;
export type AtlasPathKind = (typeof ATLAS_PATH_KINDS)[number];

/**
 * Travel / campaign path.
 * Prefer `placeIds` resolved against KG entities; optional `waypoints` for
 * intermediate geography not modeled as places.
 */
export const atlasRouteSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  iastTitle: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  pathKind: z.enum(ATLAS_PATH_KINDS).default("travel"),
  layerId: z.string().min(1).default("layer.routes"),
  /** Ordered place entity ids along the path. */
  placeIds: z.array(z.string()).min(2),
  /** Optional intermediate lat/lng between places. */
  waypoints: z.array(atlasLatLngSchema).default([]),
  confidence: z.enum(["verified", "traditional", "variant"]),
  sources: z.array(scriptureReferenceSchema).min(1),
  /** Renderer style token (not a CSS color requirement). */
  styleToken: z.string().optional(),
  /** @deprecated Prefer styleToken — kept for existing routes.json. */
  stroke: z.string().optional(),
  order: z.number().int().default(100),
  minLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(2),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(5),
});
export type AtlasRoute = z.infer<typeof atlasRouteSchema>;

export const atlasRouteBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.number().int().optional(),
  routes: z.array(atlasRouteSchema),
});
export type AtlasRouteBundle = z.infer<typeof atlasRouteBundleSchema>;

export const atlasPolygonBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.literal(2).default(2),
  polygons: z.array(atlasPolygonSchema),
});
export type AtlasPolygonBundle = z.infer<typeof atlasPolygonBundleSchema>;

export const atlasLayerBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.literal(2).default(2),
  layers: z.array(atlasLayerSchema),
});
export type AtlasLayerBundle = z.infer<typeof atlasLayerBundleSchema>;

export const atlasIconBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.literal(2).default(2),
  icons: z.array(atlasIconDefinitionSchema),
});
export type AtlasIconBundle = z.infer<typeof atlasIconBundleSchema>;

export const atlasProjectionSchema = z.object({
  /** Educational equirectangular frame (not a survey CRS). */
  minLat: z.number(),
  maxLat: z.number(),
  minLng: z.number(),
  maxLng: z.number(),
  viewBoxWidth: z.number().positive(),
  viewBoxHeight: z.number().positive(),
});
export type AtlasProjection = z.infer<typeof atlasProjectionSchema>;

/**
 * Placement certainty for overlay geometry and atlas markers.
 * Never present Approximate / Traditional locations as surveyed fact.
 */
export const ATLAS_CERTAINTY_LEVELS = [
  "verified",
  "traditional",
  "approximate",
] as const;
export type AtlasCertainty = (typeof ATLAS_CERTAINTY_LEVELS)[number];

/**
 * XYZ raster tile source for an optional future illustrated plate.
 * Tiles are Web Mercator; overlay JSON stays independent of artwork.
 */
export const atlasTileSourceSchema = z.object({
  /** Template URL: `/tiles/ancient-bharata/{z}/{x}/{y}.webp` */
  url: z.string().min(1),
  tileSize: z.union([z.literal(256), z.literal(512)]).default(256),
  minZoom: z.number().int().min(0).max(22).default(3),
  maxZoom: z.number().int().min(0).max(22).default(10),
  scheme: z.enum(["xyz", "tms"]).default("xyz"),
  attribution: z.string().optional(),
});
export type AtlasTileSource = z.infer<typeof atlasTileSourceSchema>;

/**
 * Swappable basemap. Default is an inline clean Google Maps–like raster style
 * (no modern labels). Optional `tiles` / `src` for a future illustrated plate.
 * Optional `styleUrl` for a remote MapLibre style.
 */
export const atlasBaseMapSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /**
   * Optional remote MapLibre style URL. Prefer omitting this — the app builds
   * a reliable inline clean style by default.
   */
  styleUrl: z.string().url().optional(),
  /** Optional future XYZ plate pyramid (not the default). */
  tiles: atlasTileSourceSchema.optional(),
  /** Legacy single-image plate (not the default). */
  src: z.string().min(1).optional(),
  credit: z.string().optional(),
  intrinsicWidth: z.number().positive().optional(),
  intrinsicHeight: z.number().positive().optional(),
  masterWidth: z.number().positive().optional(),
  masterHeight: z.number().positive().optional(),
  projection: atlasProjectionSchema.optional(),
});
export type AtlasBaseMap = z.infer<typeof atlasBaseMapSchema>;

/** Interactive river polyline overlay (not coastline artwork). */
export const atlasRiverSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  iastName: z.string().optional(),
  entityId: z.string().optional(),
  layerId: z.string().min(1).default("layer.rivers"),
  /** Open polyline [lat, lng][]. Educational / traditional placement. */
  points: atlasRingSchema,
  width: z.number().positive().default(2),
  certainty: z.enum(ATLAS_CERTAINTY_LEVELS).default("traditional"),
  summary: z.string().optional(),
  order: z.number().int().default(100),
  minLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(1),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(5),
});
export type AtlasRiver = z.infer<typeof atlasRiverSchema>;

export const atlasRiverBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.literal(2).default(2),
  rivers: z.array(atlasRiverSchema),
});
export type AtlasRiverBundle = z.infer<typeof atlasRiverBundleSchema>;

/** Map-pinned Mahābhārata event (overlay marker). */
export const atlasEventSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  iastName: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  certainty: z.enum(ATLAS_CERTAINTY_LEVELS).default("traditional"),
  placeId: z.string().optional(),
  relatedPeople: z.array(z.string()).default([]),
  relatedPlaces: z.array(z.string()).default([]),
  relatedVerses: z.array(z.string()).default([]),
  sources: z.array(scriptureReferenceSchema).default([]),
  importance: z.number().min(0).max(1).default(0.7),
  layerId: z.string().min(1).default("layer.events"),
  order: z.number().int().default(100),
  minLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(2),
  maxLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(5),
});
export type AtlasEvent = z.infer<typeof atlasEventSchema>;

export const atlasEventBundleSchema = z.object({
  generatedAt: z.string().optional(),
  schemaVersion: z.literal(2).default(2),
  events: z.array(atlasEventSchema),
});
export type AtlasEventBundle = z.infer<typeof atlasEventBundleSchema>;

export const atlasClusterConfigSchema = z.object({
  /** Enable grid clustering below this semantic level (inclusive). */
  maxClusterLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(2),
  /** Grid cell size in projected units at level 1 (scaled by camera). */
  cellSize: z.number().positive().default(48),
  minPoints: z.number().int().positive().default(2),
});
export type AtlasClusterConfig = z.infer<typeof atlasClusterConfigSchema>;

/**
 * Full Atlas 2.0 dataset.
 * Place markers still resolve from KG entities with `entity.atlas`.
 * Base artwork is referenced via `baseMap` — never procedurally invented.
 */
export const atlasDatasetSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1).default("atlas.mahabharata"),
  title: z.string().min(1),
  projection: atlasProjectionSchema,
  layers: z.array(atlasLayerSchema),
  icons: z.array(atlasIconDefinitionSchema),
  polygons: z.array(atlasPolygonSchema).default([]),
  rivers: z.array(atlasRiverSchema).default([]),
  events: z.array(atlasEventSchema).default([]),
  routes: z.array(atlasRouteSchema),
  cluster: atlasClusterConfigSchema.default({}),
  /** Basemap metadata (clean styleUrl preferred). */
  baseMap: atlasBaseMapSchema.optional(),
  /** Renderer id — `clean-map` = Google Maps–like canvas; overlays are JSON. */
  baseMapProviderId: z.string().default("clean-map"),
});
export type AtlasDataset = z.infer<typeof atlasDatasetSchema>;

/** Educational frame focused on Ancient Bhārata. */
export const DEFAULT_ATLAS_PROJECTION: AtlasProjection = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 66.5,
  maxLng: 97.5,
  viewBoxWidth: 1000,
  viewBoxHeight: 1174,
};

export const DEFAULT_ATLAS_BASE_MAP: AtlasBaseMap = {
  id: "basemap.clean-bharata",
  title: "Ancient Bhārata — clean map canvas",
  credit:
    "© CARTO © OpenStreetMap — ancient names from Divine overlays only",
};

export const DEFAULT_ATLAS_ICONS: AtlasIconDefinition[] = [
  { id: "icon.kingdom", category: "kingdom", label: "Kingdom", minLevel: 1 },
  { id: "icon.city", category: "city", label: "City", minLevel: 1 },
  { id: "icon.mountain", category: "mountain", label: "Mountain", minLevel: 1 },
  { id: "icon.river", category: "river", label: "River", minLevel: 2 },
  { id: "icon.pilgrimage", category: "pilgrimage", label: "Pilgrimage", minLevel: 2 },
  { id: "icon.forest", category: "forest", label: "Forest", minLevel: 2 },
  { id: "icon.battlefield", category: "battlefield", label: "Battlefield", minLevel: 3 },
  { id: "icon.ashrama", category: "ashrama", label: "Ashrama", minLevel: 3 },
  { id: "icon.sacred", category: "sacred", label: "Sacred", minLevel: 2 },
  { id: "icon.default", label: "Place", minLevel: 1 },
  { id: "icon.cluster", label: "Cluster", minLevel: 1 },
];

export const DEFAULT_ATLAS_LAYERS: AtlasLayer[] = [
  {
    id: "layer.base",
    slug: "base",
    title: "Base map",
    kind: "base",
    zIndex: 0,
    defaultVisible: true,
    minLevel: 1,
    maxLevel: 5,
    styleToken: "base.default",
  },
  {
    id: "layer.kingdoms",
    slug: "kingdoms",
    title: "Kingdoms",
    kind: "kingdoms",
    zIndex: 10,
    /** Kingdom boundaries live on the illustrated plate — markers only. */
    defaultVisible: false,
    minLevel: 1,
    maxLevel: 5,
    styleToken: "kingdoms.markers",
  },
  {
    id: "layer.rivers",
    slug: "rivers",
    title: "Rivers",
    kind: "rivers",
    zIndex: 15,
    defaultVisible: true,
    minLevel: 1,
    maxLevel: 5,
    styleToken: "rivers.overlay",
  },
  {
    id: "layer.routes",
    slug: "routes",
    title: "Travel paths",
    kind: "routes",
    zIndex: 20,
    defaultVisible: true,
    minLevel: 2,
    maxLevel: 5,
    styleToken: "routes.travel",
  },
  {
    id: "layer.events",
    slug: "events",
    title: "Events",
    kind: "events",
    zIndex: 25,
    defaultVisible: true,
    minLevel: 2,
    maxLevel: 5,
    styleToken: "events.markers",
  },
  {
    id: "layer.places",
    slug: "places",
    title: "Places",
    kind: "places",
    zIndex: 30,
    defaultVisible: true,
    minLevel: 1,
    maxLevel: 5,
    styleToken: "places.markers",
  },
  {
    id: "layer.labels",
    slug: "labels",
    title: "Labels",
    kind: "labels",
    zIndex: 40,
    defaultVisible: true,
    minLevel: 2,
    maxLevel: 5,
    styleToken: "labels.default",
  },
];

export function iconIdForCategory(category: AtlasPlaceCategory): AtlasIconId {
  const match = DEFAULT_ATLAS_ICONS.find((i) => i.category === category);
  return match?.id ?? "icon.default";
}
