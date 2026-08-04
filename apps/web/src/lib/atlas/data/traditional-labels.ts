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

const TRADITIONAL_LABELS_CANDIDATES = [
  path.join(
    process.cwd(),
    "content",
    "knowledge",
    "atlas",
    "overlays",
    "traditional-labels.json",
  ),
  path.join(
    process.cwd(),
    "apps",
    "web",
    "content",
    "knowledge",
    "atlas",
    "overlays",
    "traditional-labels.json",
  ),
];

async function resolveTraditionalLabelsFile(): Promise<string> {
  for (const candidate of TRADITIONAL_LABELS_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(
    `[atlas] traditional-labels.json not found (looked in ${TRADITIONAL_LABELS_CANDIDATES.join(", ")})`,
  );
}

let cache: Promise<readonly TraditionalAtlasLabel[]> | null = null;

export async function getTraditionalAtlasLabels(): Promise<
  readonly TraditionalAtlasLabel[]
> {
  if (!cache) {
    cache = (async () => {
      const file = await resolveTraditionalLabelsFile();
      const raw = await fs.readFile(file, "utf8");
      const parsed = traditionalLabelBundleSchema.parse(JSON.parse(raw));
      return parsed.labels ?? [];
    })().catch((err: unknown) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}

