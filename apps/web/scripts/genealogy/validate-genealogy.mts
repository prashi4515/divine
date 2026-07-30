/**
 * Automated genealogy corpus validation.
 *
 * Checks: duplicate ids/names, missing refs, broken edges, invalid categories,
 * missing citations/confidence, parent-cycles, orphan module nodes.
 *
 * Usage: pnpm --filter @divine/web validate:genealogy
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../content/genealogy");

const CONFIDENCE = new Set(["verified", "traditional", "variant"]);
const CATEGORIES = new Set([
  "supreme",
  "trimurti",
  "avatar",
  "devi",
  "prajapati",
  "manu",
  "rishi",
  "saptarishi",
  "king",
  "queen",
  "prince",
  "princess",
  "warrior",
  "deva",
  "daitya",
  "danava",
  "rakshasa",
  "asura",
  "yaksha",
  "gandharva",
  "naga",
  "dynasty-founder",
  "other",
]);

const PARENT_TYPES = new Set([
  "son",
  "daughter",
  "adoptive-son",
  "adoptive-daughter",
  "descendant",
]);

type Rel = {
  type: string;
  personId: string;
  confidence?: string;
  sources?: Array<{ work: string }>;
  variant?: boolean;
};

type Person = {
  id: string;
  name: string;
  englishName?: string;
  iastName?: string;
  category: string;
  primaryScripture?: string;
  relationships: Rel[];
};

async function main() {
  const peopleRaw = JSON.parse(
    await fs.readFile(path.join(ROOT, "people.json"), "utf8"),
  );
  const modulesRaw = JSON.parse(
    await fs.readFile(path.join(ROOT, "modules.json"), "utf8"),
  );

  const people: Person[] = peopleRaw.people;
  const modules: Array<{
    slug: string;
    personIds: string[];
    rootPersonId?: string;
  }> = modulesRaw.modules;

  const errors: string[] = [];
  const warnings: string[] = [];

  const byId = new Map<string, Person>();
  const nameCounts = new Map<string, string[]>();

  for (const p of people) {
    if (byId.has(p.id)) errors.push(`duplicate id: ${p.id}`);
    byId.set(p.id, p);

    const key = p.name.trim().toLowerCase();
    const list = nameCounts.get(key) ?? [];
    list.push(p.id);
    nameCounts.set(key, list);

    if (!CATEGORIES.has(p.category)) {
      errors.push(`${p.id}: invalid category "${p.category}"`);
    }
    if (!p.englishName) errors.push(`${p.id}: missing englishName`);
    if (!p.iastName) errors.push(`${p.id}: missing iastName`);
    if (!p.primaryScripture) errors.push(`${p.id}: missing primaryScripture`);

    for (const r of p.relationships ?? []) {
      if (!byId.has(r.personId) && !people.some((x) => x.id === r.personId)) {
        // checked in second pass after map filled
      }
      if (!r.confidence || !CONFIDENCE.has(r.confidence)) {
        errors.push(`${p.id}→${r.personId}: missing/invalid confidence`);
      }
      if (!r.sources || r.sources.length < 1) {
        errors.push(`${p.id}→${r.personId} (${r.type}): missing citation`);
      } else if (r.sources.some((s) => !s.work)) {
        errors.push(`${p.id}→${r.personId}: citation missing work`);
      }
      if ("variant" in r && r.variant !== undefined) {
        warnings.push(
          `${p.id}→${r.personId}: legacy "variant" flag — use confidence:"variant"`,
        );
      }
    }
  }

  for (const p of people) {
    for (const r of p.relationships ?? []) {
      if (!byId.has(r.personId)) {
        errors.push(`${p.id}→${r.personId}: broken relationship`);
      }
    }
  }

  for (const [name, ids] of nameCounts) {
    if (ids.length > 1) {
      warnings.push(`duplicate display name "${name}": ${ids.join(", ")}`);
    }
  }

  // Parent-edge cycles (A son→B and B son→A, or longer loops).
  const adj = new Map<string, string[]>();
  for (const p of people) {
    for (const r of p.relationships ?? []) {
      if (PARENT_TYPES.has(r.type) && byId.has(r.personId)) {
        const list = adj.get(p.id) ?? [];
        list.push(r.personId);
        adj.set(p.id, list);
      }
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string, stack: string[]): void {
    if (visiting.has(id)) {
      errors.push(`parent cycle: ${[...stack, id].join(" → ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of adj.get(id) ?? []) {
      dfs(child, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) dfs(id, []);

  // Module integrity + orphans (person never referenced by any module).
  const inModule = new Set<string>();
  for (const m of modules) {
    for (const pid of m.personIds) {
      if (!byId.has(pid)) errors.push(`module ${m.slug}: unknown ${pid}`);
      inModule.add(pid);
    }
    if (m.rootPersonId && !byId.has(m.rootPersonId)) {
      errors.push(`module ${m.slug}: bad root ${m.rootPersonId}`);
    }
    // Orphan-within-module: no relationships connecting to other module members
    // (allowed for intentionally sparse modules like Gandharvas).
    if (m.personIds.length === 1) continue;
    const set = new Set(m.personIds);
    for (const pid of m.personIds) {
      const p = byId.get(pid);
      if (!p) continue;
      const linked = p.relationships.some((r) => set.has(r.personId));
      const linkedFrom = m.personIds.some((other) => {
        if (other === pid) return false;
        return (byId.get(other)?.relationships ?? []).some(
          (r) => r.personId === pid,
        );
      });
      if (!linked && !linkedFrom) {
        warnings.push(
          `module ${m.slug}: "${pid}" has no edges inside the module`,
        );
      }
    }
  }

  for (const id of byId.keys()) {
    if (!inModule.has(id)) {
      warnings.push(`orphan person (in no module): ${id}`);
    }
  }

  // Soft Zod-ish shape check for required relationship fields.
  const relShape = z.object({
    type: z.string(),
    personId: z.string(),
    confidence: z.enum(["verified", "traditional", "variant"]),
    sources: z.array(z.object({ work: z.string() })).min(1),
  });
  for (const p of people) {
    for (const r of p.relationships ?? []) {
      const parsed = relShape.safeParse(r);
      if (!parsed.success) {
        errors.push(`${p.id} relationship schema: ${parsed.error.message}`);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        people: people.length,
        modules: modules.length,
        errors: errors.length,
        warnings: warnings.length,
      },
      null,
      2,
    ),
  );
  if (errors.length) {
    console.error("\nERRORS:\n" + errors.map((e) => `  ✗ ${e}`).join("\n"));
  }
  if (warnings.length) {
    console.warn("\nWARNINGS:\n" + warnings.map((w) => `  • ${w}`).join("\n"));
  }
  if (errors.length) process.exit(1);
  console.log("\nGenealogy validation passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
