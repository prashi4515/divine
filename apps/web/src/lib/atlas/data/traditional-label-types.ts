/**
 * Traditional plate label shape — shared by server loader + client GeoJSON.
 * Do not import the filesystem loader from client bundles.
 */
import { z } from "zod";
import { localizedNameSchema } from "@/lib/atlas/data/localized-name";

export const traditionalLabelSchema = z.object({
  id: z.string(),
  name: localizedNameSchema,
  iast: z.string().optional(),
  kind: z.enum([
    "kingdom",
    "region",
    "city",
    "river",
    "forest",
    "mountain",
    "sea",
  ]),
  lat: z.number(),
  lng: z.number(),
});

export const traditionalLabelBundleSchema = z.object({
  schemaVersion: z.number().int(),
  labels: z.array(traditionalLabelSchema),
});

export type TraditionalAtlasLabel = z.infer<typeof traditionalLabelSchema>;
