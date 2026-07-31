import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_ATLAS_BASE_MAP,
  DEFAULT_ATLAS_ICONS,
  DEFAULT_ATLAS_LAYERS,
  DEFAULT_ATLAS_PROJECTION,
  atlasBaseMapSchema,
  atlasDatasetSchema,
  atlasEventBundleSchema,
  atlasIconBundleSchema,
  atlasLayerBundleSchema,
  atlasPolygonBundleSchema,
  atlasRiverBundleSchema,
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
 * Load Atlas dataset (base plate, layers, rivers, events, routes, icons).
 * Place markers still come from KG entities via getAtlasPlaces().
 */
export async function getAtlasDataset(): Promise<AtlasDataset> {
  if (!datasetCache) {
    datasetCache = (async () => {
      const [
        layersRaw,
        polygonsRaw,
        routesRaw,
        iconsRaw,
        riversRaw,
        eventsRaw,
        baseMapRaw,
      ] = await Promise.all([
        readJson("layers.json").catch(() => null),
        readJson("overlays/kingdoms.json")
          .catch(() => readJson("polygons.json"))
          .catch(() => null),
        readJson("routes.json"),
        readJson("icons.json").catch(() => null),
        readJson("rivers.json").catch(() => null),
        readJson("events.json").catch(() => null),
        readJson("base-map.json").catch(() => null),
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
      const rivers = riversRaw
        ? atlasRiverBundleSchema.parse(riversRaw).rivers
        : [];
      const events = eventsRaw
        ? atlasEventBundleSchema.parse(eventsRaw).events
        : [];

      let baseMap = DEFAULT_ATLAS_BASE_MAP;
      if (baseMapRaw && typeof baseMapRaw === "object" && baseMapRaw !== null) {
        const wrapped = baseMapRaw as { baseMap?: unknown };
        if (wrapped.baseMap) {
          baseMap = atlasBaseMapSchema.parse(wrapped.baseMap);
        } else {
          baseMap = atlasBaseMapSchema.parse(baseMapRaw);
        }
      }

      return atlasDatasetSchema.parse({
        schemaVersion: 2,
        id: "atlas.mahabharata",
        title: "Ancient Bhārata — Mahābhārata era",
        projection: DEFAULT_ATLAS_PROJECTION,
        layers,
        icons,
        polygons,
        rivers,
        events,
        routes,
        cluster: {
          maxClusterLevel: 2,
          cellSize: 48,
          minPoints: 2,
        },
        baseMap,
        baseMapProviderId: "illustrated",
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
