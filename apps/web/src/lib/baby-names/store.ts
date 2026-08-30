import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  babyNameCollectionSchema,
  type BabyNameRecord,
} from "@/lib/knowledge/types";

const NAMES_CANDIDATES = [
  path.join(process.cwd(), "content", "baby-names"),
  path.join(process.cwd(), "apps", "web", "content", "baby-names"),
];

let cachedNames: BabyNameRecord[] | null = null;
let cachedNamesMap: Map<string, BabyNameRecord> | null = null;
let cachedSlugMap: Map<string, BabyNameRecord> | null = null;

async function resolveNamesPath(): Promise<string> {
  for (const candidate of NAMES_CANDIDATES) {
    try {
      const fullPath = path.join(candidate, "names.json");
      await fs.access(fullPath);
      return fullPath;
    } catch {
      // try next
    }
  }
  throw new Error(`[baby-names] names.json not found in ${NAMES_CANDIDATES.join(", ")}`);
}

export async function getAllBabyNames(): Promise<BabyNameRecord[]> {
  if (cachedNames) return cachedNames;
  const filePath = await resolveNamesPath();
  const raw = await fs.readFile(filePath, "utf8");
  const json = JSON.parse(raw);
  const parsed = babyNameCollectionSchema.parse(json);
  
  cachedNames = parsed.names;
  cachedNamesMap = new Map(cachedNames.map((item) => [item.id, item]));
  cachedSlugMap = new Map(cachedNames.map((item) => [item.slug, item]));
  
  return cachedNames;
}

export async function getBabyNameBySlug(slug: string): Promise<BabyNameRecord | null> {
  await getAllBabyNames();
  return cachedSlugMap?.get(slug.toLowerCase().trim()) || null;
}

export async function getBabyNameById(id: string): Promise<BabyNameRecord | null> {
  await getAllBabyNames();
  return cachedNamesMap?.get(id) || null;
}

export async function getBabyNamesByCategory(
  category: "boy" | "girl" | "unisex" | "mahabharata" | "bhagavad-gita" | "ramayana" | "sanskrit"
): Promise<BabyNameRecord[]> {
  const all = await getAllBabyNames();
  const cat = category.toLowerCase();
  
  if (cat === "boy" || cat === "girl" || cat === "unisex") {
    return all.filter((item) => item.genderUsage === cat);
  }
  
  if (cat === "mahabharata") {
    return all.filter(
      (item) =>
        item.primaryScripture.toLowerCase().includes("mahabharata") ||
        item.citations.some((c) => c.scriptureId === "mahabharata")
    );
  }
  
  if (cat === "bhagavad-gita") {
    return all.filter(
      (item) =>
        item.primaryScripture.toLowerCase().includes("bhagavad gita") ||
        item.citations.some((c) => c.scriptureId === "bhagavad-gita")
    );
  }
  
  if (cat === "ramayana") {
    return all.filter(
      (item) =>
        item.primaryScripture.toLowerCase().includes("ramayana") ||
        item.citations.some((c) => c.scriptureId === "ramayana")
    );
  }

  if (cat === "sanskrit") {
    return all.filter(
      (item) =>
        item.classification === "SANSKRIT_LEXICAL" ||
        item.classification === "SANSKRIT_DERIVED_MODERN"
    );
  }

  return all;
}
