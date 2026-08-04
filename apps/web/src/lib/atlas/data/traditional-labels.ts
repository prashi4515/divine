/**
 * Traditional plate labels — kingdoms, rivers, forests, mountains, seas.
 * Loaded separately from AtlasDataset so we can swap basemap artwork freely.
 */
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  traditionalLabelBundleSchema,
  type TraditionalAtlasLabel,
} from "@/lib/atlas/data/traditional-label-types";

export type { TraditionalAtlasLabel };

const FILE = path.join(
  process.cwd(),
  "content",
  "knowledge",
  "atlas",
  "overlays",
  "traditional-labels.json",
);

let cache: Promise<readonly TraditionalAtlasLabel[]> | null = null;

export async function getTraditionalAtlasLabels(): Promise<
  readonly TraditionalAtlasLabel[]
> {
  if (!cache) {
    cache = (async () => {
      const raw = await fs.readFile(FILE, "utf8");
      const parsed = traditionalLabelBundleSchema.parse(JSON.parse(raw));
      return parsed.labels;
    })().catch((err: unknown) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
