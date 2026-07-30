/**
 * Validate knowledge graph corpus (standalone zod — no @divine/types ESM).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../content/knowledge");

const PARENT_TYPES = new Set([
  "child",
  "son",
  "daughter",
  "adoptive-son",
  "adoptive-daughter",
  "descendant",
]);

const citeSchema = z.object({
  work: z.string().min(1),
  section: z.string().optional(),
  chapter: z.string().optional(),
  verse: z.string().optional(),
  note: z.string().optional(),
});

const entitySchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    kind: z.string().min(1),
    name: z.string().min(1),
    englishName: z.string().min(1),
    iastName: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().min(1),
    primaryScripture: z.string().min(1),
  })
  .passthrough();

const relationSchema = z.object({
  id: z.string().min(1),
  fromId: z.string().min(1),
  toId: z.string().min(1),
  type: z.string().min(1),
  confidence: z.enum(["verified", "traditional", "variant"]),
  sources: z.array(citeSchema).min(1),
  note: z.string().optional(),
});

const collectionSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    entityIds: z.array(z.string()).default([]),
    rootEntityId: z.string().optional(),
  })
  .passthrough();

async function main() {
  const entitiesRaw = JSON.parse(
    await fs.readFile(path.join(ROOT, "entities.json"), "utf8"),
  );
  const relationsRaw = JSON.parse(
    await fs.readFile(path.join(ROOT, "relations.json"), "utf8"),
  );
  const collectionsRaw = JSON.parse(
    await fs.readFile(path.join(ROOT, "collections.json"), "utf8"),
  );

  const entities = z.array(entitySchema).parse(entitiesRaw.entities);
  const relations = z.array(relationSchema).parse(relationsRaw.relations);
  const collections = z.array(collectionSchema).parse(collectionsRaw.collections);

  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = new Map(entities.map((e) => [e.id, e] as const));
  const slugKind = new Map<string, string>();

  for (const e of entities) {
    const sk = `${e.kind}:${e.slug}`;
    if (slugKind.has(sk)) errors.push(`duplicate kind+slug ${sk}`);
    slugKind.set(sk, e.id);
  }

  for (const r of relations) {
    if (!byId.has(r.fromId)) errors.push(`rel ${r.id}: missing from ${r.fromId}`);
    if (!byId.has(r.toId)) errors.push(`rel ${r.id}: missing to ${r.toId}`);
  }

  const semantic = new Map<string, string>();
  for (const r of relations) {
    const key = `${r.fromId}\0${r.type}\0${r.toId}`;
    if (semantic.has(key)) {
      errors.push(
        `duplicate relationship ${r.fromId} --${r.type}--> ${r.toId} (${semantic.get(key)} vs ${r.id})`,
      );
    } else {
      semantic.set(key, r.id);
    }
  }

  const adj = new Map<string, string[]>();
  for (const r of relations) {
    if (PARENT_TYPES.has(r.type)) {
      const list = adj.get(r.fromId) ?? [];
      list.push(r.toId);
      adj.set(r.fromId, list);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string, stack: string[]) {
    if (visiting.has(id)) {
      errors.push(`parent cycle: ${[...stack, id].join(" → ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const c of adj.get(id) ?? []) dfs(c, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) dfs(id, []);

  const inCollection = new Set<string>();
  for (const c of collections) {
    for (const id of c.entityIds) {
      if (!byId.has(id)) errors.push(`collection ${c.slug}: unknown ${id}`);
      inCollection.add(id);
    }
    if (c.rootEntityId && !byId.has(c.rootEntityId)) {
      errors.push(`collection ${c.slug}: bad root ${c.rootEntityId}`);
    }
  }
  for (const id of byId.keys()) {
    if (!inCollection.has(id))
      warnings.push(`orphan entity (no collection): ${id}`);
  }

  console.log(
    JSON.stringify(
      {
        entities: entities.length,
        relations: relations.length,
        collections: collections.length,
        errors: errors.length,
        warnings: warnings.length,
      },
      null,
      2,
    ),
  );
  if (errors.length) {
    console.error("\nERRORS:\n" + errors.map((e) => `  ✗ ${e}`).join("\n"));
    process.exit(1);
  }
  if (warnings.length) {
    console.warn(
      "\nWARNINGS:\n" +
        warnings.slice(0, 20).map((w) => `  • ${w}`).join("\n"),
    );
  }
  console.log("\nKnowledge validation passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
