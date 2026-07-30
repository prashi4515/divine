/**
 * Merge knowledge packs → content/knowledge/{entities,relations,collections}.json
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  PLACE_ENTITIES,
  CONCEPT_ENTITIES,
  PLACE_CONCEPT_RELATIONS,
  ENCYCLOPEDIA_SECTIONS,
} from "./seed-places-concepts.mts";
import {
  CONCEPT_RELATIONS,
  CONCEPTS_COLLECTION,
} from "./seed-concepts.mts";
import {
  ATLAS_PLACE_ENTITIES,
  ATLAS_RELATIONS,
  ATLAS_COLLECTION,
  ATLAS_ROUTES,
  ATLAS_VERSE_STUB_ENTITIES,
} from "./seed-atlas.mts";
import {
  MAHAJANAPADA_ENTITIES,
  MAHAJANAPADA_RELATIONS,
} from "./seed-mahajanapadas.mts";
import {
  DENSE_ATLAS_ENTITIES,
  DENSE_ATLAS_RELATIONS,
} from "./seed-mahabharata-dense.mts";
import {
  EVENT_ENTITIES,
  EVENT_SUPPORT_ENTITIES,
  EVENT_RELATIONS,
  EVENTS_COLLECTION,
  TIMELINE_ERA_COLLECTIONS,
} from "./seed-events.mts";
import {
  WEAPON_ENTITIES,
  WEAPON_RELATIONS,
  WEAPONS_COLLECTION,
} from "./seed-weapons.mts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../content/knowledge");

const citeSchema = z.object({
  work: z.string(),
  section: z.string().optional(),
  chapter: z.string().optional(),
  verse: z.string().optional(),
  note: z.string().optional(),
});

const entitySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    kind: z.string(),
    name: z.string(),
    englishName: z.string(),
    iastName: z.string(),
    summary: z.string(),
    description: z.string(),
    primaryScripture: z.string(),
    status: z.string().default("published"),
  })
  .passthrough();

const relationSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  type: z.string(),
  confidence: z.enum(["verified", "traditional", "variant"]),
  sources: z.array(citeSchema).min(1),
  note: z.string().optional(),
});

const collectionSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    kind: z.string(),
    summary: z.string(),
    description: z.string(),
    entityIds: z.array(z.string()).default([]),
    order: z.number().default(100),
  })
  .passthrough();

type Entity = z.infer<typeof entitySchema> & Record<string, unknown>;
type Relation = z.infer<typeof relationSchema>;
type Collection = z.infer<typeof collectionSchema> & Record<string, unknown>;

async function readJsonSafe(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function loadPacks(
  sub: string,
  key: "entities" | "relations" | "collections",
): Promise<unknown[]> {
  const dir = path.join(ROOT, sub);
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const out: unknown[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const raw = (await readJsonSafe(path.join(dir, f))) as Record<
      string,
      unknown[]
    > | null;
    if (!raw?.[key]) continue;
    out.push(...raw[key]!);
  }
  return out;
}

const PERSON_LIKE = new Set([
  "person",
  "deity",
  "avatar",
  "sage",
  "asura",
  "daitya",
  "danava",
  "rakshasa",
  "deva",
  "naga",
  "yaksha",
  "gandharva",
  "devi",
  "prajapati",
  "manu",
  "king",
  "queen",
  "prince",
  "princess",
  "warrior",
]);
const PLACE_LIKE = new Set([
  "kingdom",
  "city",
  "forest",
  "river",
  "mountain",
  "temple",
  "pilgrimage",
  "ashrama",
  "battlefield",
]);

async function main() {
  let entities = [
    ...(await loadPacks("entities", "entities")),
    ...PLACE_ENTITIES,
    ...CONCEPT_ENTITIES,
    ...ATLAS_PLACE_ENTITIES,
    ...MAHAJANAPADA_ENTITIES,
    ...DENSE_ATLAS_ENTITIES,
    ...EVENT_SUPPORT_ENTITIES,
    ...WEAPON_ENTITIES,
    ...EVENT_ENTITIES,
    ...ATLAS_VERSE_STUB_ENTITIES,
  ].map((e) => entitySchema.parse(e)) as Entity[];

  let relations = [
    ...(await loadPacks("relations", "relations")),
    ...PLACE_CONCEPT_RELATIONS,
    ...ATLAS_RELATIONS,
    ...MAHAJANAPADA_RELATIONS,
    ...DENSE_ATLAS_RELATIONS,
    ...EVENT_RELATIONS,
    ...WEAPON_RELATIONS,
    ...CONCEPT_RELATIONS,
  ].map((r) => relationSchema.parse(r));

  let collections = (await loadPacks("collections", "collections")).map((c) =>
    collectionSchema.parse(c),
  ) as Collection[];

  const entityMap = new Map<string, Entity>();
  for (const e of entities) entityMap.set(e.id, e);
  if (!entityMap.has("verse.bg.2.47")) {
    entityMap.set(
      "verse.bg.2.47",
      entitySchema.parse({
        id: "verse.bg.2.47",
        slug: "bg-2-47",
        kind: "verse",
        name: "You have a right to action alone",
        englishName: "bg.2.47",
        iastName: "karmaṇy-evādhikāras-te",
        aliases: ["bg.2.47"],
        summary: "Famous karma-yoga verse of the Bhagavad Gītā.",
        description:
          "Stub linking the knowledge graph to Bhagavad Gītā 2.47. Full text is in the reader corpus.",
        primaryScripture: "Bhagavad Gītā",
        scriptureSources: [
          { work: "Bhagavad Gītā", chapter: "2", verse: "47" },
        ],
        tags: ["gita", "verse"],
        categories: ["verse"],
        importance: 5,
        externalRefs: { workCode: "bg", publicId: "bg.2.47" },
        status: "published",
        era: "dvapara-yuga",
        variantTraditions: [],
        schemaVersion: 1,
      }) as Entity,
    );
  }
  entities = [...entityMap.values()].sort((a, b) => a.id.localeCompare(b.id));

  const relMap = new Map<string, Relation>();
  const semanticKey = (r: Relation) => `${r.fromId}\0${r.type}\0${r.toId}`;
  const bySemantic = new Map<string, Relation>();
  const confidenceRank: Record<string, number> = {
    verified: 3,
    traditional: 2,
    variant: 1,
  };
  for (const r of relations) {
    // Prefer stable id map, then collapse semantic duplicates (source+type+target).
    const prevId = relMap.get(r.id);
    if (!prevId) relMap.set(r.id, r);
    const sk = semanticKey(r);
    const prev = bySemantic.get(sk);
    if (
      !prev ||
      (confidenceRank[r.confidence] ?? 0) > (confidenceRank[prev.confidence] ?? 0)
    ) {
      bySemantic.set(sk, r);
    }
  }
  relations = [...bySemantic.values()].sort((a, b) => a.id.localeCompare(b.id));
  if (relMap.size !== bySemantic.size) {
    console.warn(
      `Deduped relations: ${relMap.size} ids → ${bySemantic.size} unique (source,type,target)`,
    );
  }

  const ids = new Set(entities.map((e) => e.id));
  const before = relations.length;
  relations = relations.filter((r) => ids.has(r.fromId) && ids.has(r.toId));
  if (relations.length < before) {
    console.warn(
      `Dropped ${before - relations.length} relations with missing endpoints`,
    );
  }

  const byKind = (pred: (k: string) => boolean) =>
    entities.filter((e) => pred(e.kind)).map((e) => e.id);

  const encSections = ENCYCLOPEDIA_SECTIONS.map((s) => {
    let entityIds: string[] = [];
    if (s.slug === "persons-and-deities")
      entityIds = byKind((k) => PERSON_LIKE.has(k));
    else if (s.slug === "places") entityIds = byKind((k) => PLACE_LIKE.has(k));
    else if (s.slug === "concepts") entityIds = byKind((k) => k === "concept");
    else if (s.slug === "dynasties") entityIds = byKind((k) => k === "dynasty");
    else if (s.slug === "scriptures")
      entityIds = byKind((k) =>
        k === "scripture" || k === "chapter" || k === "verse",
      );
    return collectionSchema.parse({ ...s, entityIds }) as Collection;
  });

  const atlasEntityIds = entities
    .filter((e) => Boolean((e as { atlas?: unknown }).atlas))
    .map((e) => e.id);

  const atlasCol = collectionSchema.parse({
    ...ATLAS_COLLECTION,
    entityIds: [...new Set([...ATLAS_COLLECTION.entityIds, ...atlasEntityIds])],
  }) as Collection;

  const eventEntityIds = entities
    .filter((e) => Boolean((e as { event?: unknown }).event))
    .map((e) => e.id);

  const eventsCol = collectionSchema.parse({
    ...EVENTS_COLLECTION,
    entityIds: [
      ...new Set([...EVENTS_COLLECTION.entityIds, ...eventEntityIds]),
    ],
  }) as Collection;

  const weaponEntityIds = entities
    .filter((e) => e.kind === "weapon")
    .map((e) => e.id);

  const weaponsCol = collectionSchema.parse({
    ...WEAPONS_COLLECTION,
    entityIds: [
      ...new Set([...WEAPONS_COLLECTION.entityIds, ...weaponEntityIds]),
    ],
  }) as Collection;

  const conceptEntityIds = entities
    .filter((e) => e.kind === "concept")
    .map((e) => e.id);

  const conceptsCol = collectionSchema.parse({
    ...CONCEPTS_COLLECTION,
    entityIds: [
      ...new Set([...CONCEPTS_COLLECTION.entityIds, ...conceptEntityIds]),
    ],
  }) as Collection;

  const timelineEras = TIMELINE_ERA_COLLECTIONS.map((c) =>
    collectionSchema.parse(c),
  ) as Collection[];

  collections = [
    ...collections.filter(
      (c) =>
        c.kind !== "encyclopedia-section" &&
        c.kind !== "atlas-layer" &&
        c.kind !== "events-layer" &&
        c.kind !== "weapons-layer" &&
        c.kind !== "concepts-layer" &&
        c.kind !== "timeline-era",
    ),
    ...encSections,
    ...timelineEras,
    eventsCol,
    weaponsCol,
    conceptsCol,
    atlasCol,
  ].sort((a, b) => Number(a.order) - Number(b.order));

  for (const c of collections) {
    c.entityIds = (c.entityIds as string[]).filter((id) => ids.has(id));
  }

  const placeEntities = entities.filter((e) => PLACE_LIKE.has(e.kind));

  const generatedAt = new Date().toISOString();
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(
    path.join(ROOT, "entities.json"),
    JSON.stringify({ generatedAt, schemaVersion: 1, entities }, null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "relations.json"),
    JSON.stringify({ generatedAt, schemaVersion: 1, relations }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "collections.json"),
    JSON.stringify({ generatedAt, schemaVersion: 1, collections }, null, 2) +
      "\n",
  );

  await fs.mkdir(path.join(ROOT, "atlas"), { recursive: true });
  await fs.writeFile(
    path.join(ROOT, "atlas/routes.json"),
    JSON.stringify(
      { generatedAt, schemaVersion: 1, routes: ATLAS_ROUTES },
      null,
      2,
    ) + "\n",
  );

  await fs.mkdir(path.join(ROOT, "collections"), { recursive: true });
  await fs.writeFile(
    path.join(ROOT, "collections/encyclopedia-sections.json"),
    JSON.stringify({ schemaVersion: 1, collections: encSections }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "collections/atlas-layers.json"),
    JSON.stringify({ schemaVersion: 1, collections: [atlasCol] }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "collections/events-layers.json"),
    JSON.stringify({ schemaVersion: 1, collections: [eventsCol] }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "collections/timeline-eras.json"),
    JSON.stringify({ schemaVersion: 1, collections: timelineEras }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "relations/events-links.json"),
    JSON.stringify({ schemaVersion: 1, relations: EVENT_RELATIONS }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "entities/places.json"),
    JSON.stringify({ schemaVersion: 1, entities: placeEntities }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "entities/concepts.json"),
    JSON.stringify({ schemaVersion: 1, entities: CONCEPT_ENTITIES }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "relations/places-concepts.json"),
    JSON.stringify(
      { schemaVersion: 1, relations: PLACE_CONCEPT_RELATIONS },
      null,
      2,
    ) + "\n",
  );
  await fs.writeFile(
    path.join(ROOT, "relations/atlas-links.json"),
    JSON.stringify({ schemaVersion: 1, relations: ATLAS_RELATIONS }, null, 2) +
      "\n",
  );

  console.log(
    `Wrote ${entities.length} entities, ${relations.length} relations, ${collections.length} collections, ${ATLAS_ROUTES.length} atlas routes → ${ROOT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
