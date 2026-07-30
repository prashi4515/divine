/**
 * Atlas 2.0 scene engine — projects data into a renderer-agnostic view model.
 * No React. No artwork. Clustering + semantic zoom live here.
 */
import {
  DEFAULT_ATLAS_ICONS,
  iconIdForCategory,
  type AtlasClusterConfig,
  type AtlasDataset,
  type AtlasIconId,
  type AtlasLatLng,
  type AtlasLayer,
  type AtlasPlaceCategory,
  type AtlasPolygon,
  type AtlasProjection,
  type AtlasRoute,
  type AtlasSemanticLevel,
} from "./atlas-v2";

export type ProjectedPoint = { x: number; y: number };

export type AtlasPlaceInput = {
  id: string;
  slug: string;
  name: string;
  englishName: string;
  importance: number;
  category: AtlasPlaceCategory;
  latitude: number;
  longitude: number;
  href: string;
  entityId: string;
};

export type AtlasCameraInput = {
  /** Pan x in projected space. */
  x: number;
  /** Pan y in projected space. */
  y: number;
  /** Scale factor (1 = fit projection). */
  k: number;
};

export type AtlasSceneFilters = {
  /** Category chips — empty/absent = all. */
  categories?: ReadonlySet<AtlasPlaceCategory>;
  /** Layer id → visible override. */
  layerVisibility?: ReadonlyMap<string, boolean>;
  /** Highlight a single route. */
  activeRouteId?: string | null;
  /** Selected place slug. */
  selectedSlug?: string | null;
};

export type SceneLayer = AtlasLayer & { visible: boolean };

export type ScenePolygon = {
  id: string;
  title: string;
  entityId?: string;
  layerId: string;
  styleToken?: string;
  /** Projected rings (outer first). */
  rings: ProjectedPoint[][];
};

export type SceneMarker = {
  id: string;
  slug: string;
  name: string;
  category: AtlasPlaceCategory;
  iconId: AtlasIconId;
  point: ProjectedPoint;
  importance: number;
  href: string;
  selected: boolean;
  labelVisible: boolean;
};

export type SceneCluster = {
  id: string;
  point: ProjectedPoint;
  count: number;
  /** Member place ids. */
  placeIds: string[];
  iconId: AtlasIconId;
};

export type ScenePath = {
  id: string;
  title: string;
  layerId: string;
  styleToken?: string;
  active: boolean;
  /** Projected polyline (places + waypoints interleaved by engine order). */
  points: ProjectedPoint[];
};

export type AtlasScene = {
  schemaVersion: 2;
  semanticLevel: AtlasSemanticLevel;
  projection: AtlasProjection;
  layers: SceneLayer[];
  polygons: ScenePolygon[];
  markers: SceneMarker[];
  clusters: SceneCluster[];
  paths: ScenePath[];
  /** Provider hint for optional illustrated base (renderer may ignore). */
  baseMapProviderId: string;
};

export function projectLatLng(
  projection: AtlasProjection,
  latitude: number,
  longitude: number,
): ProjectedPoint {
  const { minLat, maxLat, minLng, maxLng, viewBoxWidth, viewBoxHeight } =
    projection;
  const x = ((longitude - minLng) / (maxLng - minLng)) * viewBoxWidth;
  const y = ((maxLat - latitude) / (maxLat - minLat)) * viewBoxHeight;
  return { x, y };
}

export function semanticLevelFromScale(scale: number): AtlasSemanticLevel {
  if (scale < 1.15) return 1;
  if (scale < 1.65) return 2;
  if (scale < 2.25) return 3;
  if (scale < 3.0) return 4;
  return 5;
}

const CATEGORY_MIN_LEVEL: Record<AtlasPlaceCategory, AtlasSemanticLevel> = {
  kingdom: 1,
  city: 1,
  mountain: 1,
  river: 2,
  pilgrimage: 2,
  forest: 2,
  sacred: 2,
  battlefield: 3,
  ashrama: 3,
};

function levelInRange(
  level: AtlasSemanticLevel,
  min: AtlasSemanticLevel,
  max: AtlasSemanticLevel,
): boolean {
  return level >= min && level <= max;
}

function layerVisible(
  layer: AtlasLayer,
  level: AtlasSemanticLevel,
  overrides?: ReadonlyMap<string, boolean>,
): boolean {
  if (!levelInRange(level, layer.minLevel, layer.maxLevel)) return false;
  if (overrides?.has(layer.id)) return overrides.get(layer.id)!;
  return layer.defaultVisible;
}

function projectRing(
  projection: AtlasProjection,
  ring: AtlasLatLng[],
): ProjectedPoint[] {
  return ring.map(([lat, lng]) => projectLatLng(projection, lat, lng));
}

function resolveRoutePoints(
  projection: AtlasProjection,
  route: AtlasRoute,
  placesById: ReadonlyMap<string, AtlasPlaceInput>,
): ProjectedPoint[] {
  const fromPlaces = route.placeIds
    .map((id) => placesById.get(id))
    .filter((p): p is AtlasPlaceInput => Boolean(p))
    .map((p) => projectLatLng(projection, p.latitude, p.longitude));

  if (!route.waypoints?.length) return fromPlaces;

  // Interleave: place₀, waypoints…, place₁, … (simple: append waypoints after first place)
  if (fromPlaces.length === 0) {
    return route.waypoints.map(([lat, lng]) =>
      projectLatLng(projection, lat, lng),
    );
  }
  const [first, ...rest] = fromPlaces;
  const mids = route.waypoints.map(([lat, lng]) =>
    projectLatLng(projection, lat, lng),
  );
  return [first!, ...mids, ...rest];
}

/**
 * Grid clustering in projected space.
 * Returns clusters + leftover unclustered place ids.
 */
export function clusterMarkers(
  places: Array<AtlasPlaceInput & { point: ProjectedPoint }>,
  config: AtlasClusterConfig,
  scale: number,
): { clusters: SceneCluster[]; unclusteredIds: Set<string> } {
  const cell = config.cellSize / Math.max(scale, 0.5);
  const buckets = new Map<
    string,
    Array<AtlasPlaceInput & { point: ProjectedPoint }>
  >();

  for (const p of places) {
    const cx = Math.floor(p.point.x / cell);
    const cy = Math.floor(p.point.y / cell);
    const key = `${cx}:${cy}`;
    const list = buckets.get(key) ?? [];
    list.push(p);
    buckets.set(key, list);
  }

  const clusters: SceneCluster[] = [];
  const unclusteredIds = new Set<string>();

  for (const [key, members] of buckets) {
    if (members.length < config.minPoints) {
      for (const m of members) unclusteredIds.add(m.id);
      continue;
    }
    let sx = 0;
    let sy = 0;
    for (const m of members) {
      sx += m.point.x;
      sy += m.point.y;
    }
    clusters.push({
      id: `cluster.${key}`,
      point: { x: sx / members.length, y: sy / members.length },
      count: members.length,
      placeIds: members.map((m) => m.id),
      iconId: "icon.cluster",
    });
  }

  return { clusters, unclusteredIds };
}

export type BuildAtlasSceneInput = {
  dataset: AtlasDataset;
  places: readonly AtlasPlaceInput[];
  camera: AtlasCameraInput;
  filters?: AtlasSceneFilters;
};

/**
 * Build a renderer-ready scene from dataset + KG places + camera.
 */
export function buildAtlasScene(input: BuildAtlasSceneInput): AtlasScene {
  const { dataset, places, camera, filters } = input;
  const level = semanticLevelFromScale(camera.k);
  const projection = dataset.projection;
  const categories = filters?.categories;

  const layers: SceneLayer[] = [...dataset.layers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer) => ({
      ...layer,
      visible: layerVisible(layer, level, filters?.layerVisibility),
    }));

  const kingdomsVisible =
    layers.find((l) => l.id === "layer.kingdoms")?.visible ?? true;
  const placesVisible =
    layers.find((l) => l.id === "layer.places")?.visible ?? true;
  const routesVisible =
    layers.find((l) => l.id === "layer.routes")?.visible ?? true;
  const labelsVisible =
    layers.find((l) => l.id === "layer.labels")?.visible ?? true;

  const polygons: ScenePolygon[] = [];
  if (kingdomsVisible) {
    const sorted = [...dataset.polygons].sort((a, b) => a.order - b.order);
    for (const poly of sorted) {
      if (!levelInRange(level, poly.minLevel, poly.maxLevel)) continue;
      polygons.push({
        id: poly.id,
        title: poly.title,
        ...(poly.entityId ? { entityId: poly.entityId } : {}),
        layerId: poly.layerId,
        ...(poly.styleToken ? { styleToken: poly.styleToken } : {}),
        rings: poly.geometry.rings.map((r) => projectRing(projection, r)),
      });
    }
  }

  const placesById = new Map(places.map((p) => [p.id, p] as const));
  const iconByCategory = new Map(
    (dataset.icons.length ? dataset.icons : DEFAULT_ATLAS_ICONS)
      .filter((i) => i.category)
      .map((i) => [i.category!, i.id] as const),
  );

  const candidatePlaces = places.filter((p) => {
    if (categories && categories.size > 0 && !categories.has(p.category)) {
      return false;
    }
    return level >= CATEGORY_MIN_LEVEL[p.category];
  });

  const projected = candidatePlaces.map((p) => ({
    ...p,
    point: projectLatLng(projection, p.latitude, p.longitude),
  }));

  let clusters: SceneCluster[] = [];
  let visiblePlaces = projected;

  if (
    placesVisible &&
    level <= dataset.cluster.maxClusterLevel &&
    projected.length > 0
  ) {
    const result = clusterMarkers(projected, dataset.cluster, camera.k);
    clusters = result.clusters;
    visiblePlaces = projected.filter((p) => result.unclusteredIds.has(p.id));
  } else if (!placesVisible) {
    visiblePlaces = [];
    clusters = [];
  }

  // Label budget by semantic level
  const maxLabels =
    level <= 1 ? 8 : level === 2 ? 16 : level === 3 ? 28 : level === 4 ? 48 : 80;
  const labelEligible = [...visiblePlaces].sort(
    (a, b) => b.importance - a.importance,
  );
  const labeled = new Set(
    labelsVisible ? labelEligible.slice(0, maxLabels).map((p) => p.id) : [],
  );

  const markers: SceneMarker[] = visiblePlaces.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    iconId: iconByCategory.get(p.category) ?? iconIdForCategory(p.category),
    point: p.point,
    importance: p.importance,
    href: p.href,
    selected: filters?.selectedSlug === p.slug,
    labelVisible: labeled.has(p.id),
  }));

  const paths: ScenePath[] = [];
  if (routesVisible) {
    for (const route of dataset.routes) {
      if (!levelInRange(level, route.minLevel, route.maxLevel)) continue;
      const points = resolveRoutePoints(projection, route, placesById);
      if (points.length < 2) continue;
      paths.push({
        id: route.id,
        title: route.title,
        layerId: route.layerId,
        styleToken: route.styleToken ?? route.stroke,
        active: filters?.activeRouteId === route.id,
        points,
      });
    }
  }

  return {
    schemaVersion: 2,
    semanticLevel: level,
    projection,
    layers,
    polygons,
    markers,
    clusters,
    paths,
    baseMapProviderId: dataset.baseMapProviderId,
  };
}

/** Convert a polygon pack into dataset polygons (helper for loaders). */
export function sortPolygons(polygons: readonly AtlasPolygon[]): AtlasPolygon[] {
  return [...polygons].sort((a, b) => a.order - b.order);
}
