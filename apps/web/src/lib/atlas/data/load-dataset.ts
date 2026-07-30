import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_ATLAS_ICONS,
  DEFAULT_ATLAS_LAYERS,
  DEFAULT_ATLAS_PROJECTION,
  atlasDatasetSchema,
  atlasIconBundleSchema,
  atlasLayerBundleSchema,
  atlasPolygonBundleSchema,
  atlasRouteBundleSchema,
  type AtlasDataset,
  type AtlasRoute,
} from "@divine/types";

const ATLAS_ROOT = path.join(process.cwd(), "content", "knowledge", "atlas");

let datasetCache: Promise<AtlasDataset> | null = null;

async function readJson(file: string): Promise<unknown> {
  const raw = await fs.readFile(path.join(ATLAS_ROOT, file), "utf8");
  return JSON.parse(raw);
}

/**
 * Load Atlas 2.0 dataset (layers, polygons, routes, icons, projection).
 * Place markers still come from KG entities via getAtlasPlaces().
 */
export async function getAtlasDataset(): Promise<AtlasDataset> {
  if (!datasetCache) {
    datasetCache = (async () => {
      const [layersRaw, polygonsRaw, routesRaw, iconsRaw] = await Promise.all([
        readJson("layers.json").catch(() => null),
        readJson("polygons.json").catch(() => null),
        readJson("routes.json"),
        readJson("icons.json").catch(() => null),
      ]);

      const layers = layersRaw
        ? atlasLayerBundleSchema.parse(layersRaw).layers
        : DEFAULT_ATLAS_LAYERS;
      const polygons = polygonsRaw
        ? atlasPolygonBundleSchema.parse(polygonsRaw).polygons
        : [];
      const routes = atlasRouteBundleSchema.parse(routesRaw).routes;
      const icons = iconsRaw
        ? atlasIconBundleSchema.parse(iconsRaw).icons
        : DEFAULT_ATLAS_ICONS;

      return atlasDatasetSchema.parse({
        schemaVersion: 2,
        id: "atlas.mahabharata",
        title: "Ancient Bhārata — Mahābhārata era",
        projection: DEFAULT_ATLAS_PROJECTION,
        layers,
        icons,
        polygons,
        routes,
        cluster: {
          maxClusterLevel: 2,
          cellSize: 48,
          minPoints: 2,
        },
        baseMapProviderId: "placeholder",
      });
    })().catch((err: unknown) => {
      datasetCache = null;
      throw err;
    });
  }
  return datasetCache;
}

export async function getAtlasRoutesFromDataset(): Promise<readonly AtlasRoute[]> {
  const dataset = await getAtlasDataset();
  return [...dataset.routes].sort((a, b) => a.order - b.order);
}
