import { describe, expect, it } from "vitest";
import {
  DEFAULT_ATLAS_ICONS,
  DEFAULT_ATLAS_LAYERS,
  DEFAULT_ATLAS_PROJECTION,
  buildAtlasScene,
  clusterMarkers,
  projectLatLng,
  semanticLevelFromScale,
  type AtlasDataset,
  type AtlasPlaceInput,
} from "./index";

const dataset: AtlasDataset = {
  schemaVersion: 2,
  id: "atlas.test",
  title: "Test",
  projection: DEFAULT_ATLAS_PROJECTION,
  layers: DEFAULT_ATLAS_LAYERS,
  icons: DEFAULT_ATLAS_ICONS,
  polygons: [
    {
      id: "polygon.kuru",
      slug: "kuru",
      title: "Kuru",
      layerId: "layer.kingdoms",
      entityId: "kingdom.kuru",
      geometry: {
        type: "Polygon",
        rings: [
          [
            [30.5, 75.8],
            [30.3, 78.5],
            [28.4, 78.8],
            [28.2, 76.0],
          ],
        ],
      },
      confidence: "traditional",
      sources: [],
      minLevel: 1,
      maxLevel: 5,
      order: 10,
    },
  ],
  routes: [
    {
      id: "route.test",
      slug: "test",
      title: "Test route",
      summary: "A to B",
      description: "Test",
      pathKind: "travel",
      layerId: "layer.routes",
      placeIds: ["city.a", "city.b"],
      waypoints: [],
      confidence: "traditional",
      sources: [{ work: "Mahābhārata" }],
      order: 1,
      minLevel: 1,
      maxLevel: 5,
    },
  ],
  rivers: [],
  events: [],
  cluster: { maxClusterLevel: 2, cellSize: 48, minPoints: 2 },
  baseMapProviderId: "placeholder",
};

const places: AtlasPlaceInput[] = [
  {
    id: "city.a",
    slug: "a",
    name: "A",
    englishName: "A",
    importance: 5,
    category: "city",
    latitude: 29,
    longitude: 77,
    href: "/atlas/a",
    entityId: "city.a",
  },
  {
    id: "city.b",
    slug: "b",
    name: "B",
    englishName: "B",
    importance: 4,
    category: "city",
    latitude: 29.05,
    longitude: 77.05,
    href: "/atlas/b",
    entityId: "city.b",
  },
  {
    id: "city.c",
    slug: "c",
    name: "C",
    englishName: "C",
    importance: 3,
    category: "city",
    latitude: 20,
    longitude: 80,
    href: "/atlas/c",
    entityId: "city.c",
  },
];

describe("atlas engine", () => {
  it("projects lat/lng into viewBox space", () => {
    const p = projectLatLng(DEFAULT_ATLAS_PROJECTION, 28.7, 77.2);
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(DEFAULT_ATLAS_PROJECTION.viewBoxWidth);
  });

  it("maps scale to semantic levels", () => {
    expect(semanticLevelFromScale(1)).toBe(1);
    expect(semanticLevelFromScale(2)).toBe(3);
    expect(semanticLevelFromScale(4)).toBe(5);
  });

  it("clusters nearby markers", () => {
    const projected = places.slice(0, 2).map((p) => ({
      ...p,
      point: projectLatLng(DEFAULT_ATLAS_PROJECTION, p.latitude, p.longitude),
    }));
    const { clusters, unclusteredIds } = clusterMarkers(
      projected,
      { maxClusterLevel: 2, cellSize: 80, minPoints: 2 },
      1,
    );
    expect(clusters.length + unclusteredIds.size).toBeGreaterThan(0);
  });

  it("buildAtlasScene emits polygons, paths, and markers", () => {
    const scene = buildAtlasScene({
      dataset,
      places,
      camera: { x: 0, y: 0, k: 2.5 },
      filters: {
        activeRouteId: "route.test",
        layerVisibility: new Map([["layer.kingdoms", true]]),
      },
    });
    expect(scene.schemaVersion).toBe(2);
    expect(scene.polygons.length).toBe(1);
    expect(scene.paths.some((p) => p.active)).toBe(true);
    expect(scene.markers.length + scene.clusters.length).toBeGreaterThan(0);
    expect(scene.rivers).toEqual([]);
    expect(scene.events).toEqual([]);
    expect(scene.layers.every((l) => typeof l.visible === "boolean")).toBe(true);
  });
});
