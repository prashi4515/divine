/**
 * Build a lightweight static Knowledge Search index from:
 * - content/knowledge/entities.json
 * - content/gita/reader/bg.*.json
 *
 * No Neon. Run after generate:knowledge (and optionally generate:gita-static).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const KNOWLEDGE = path.join(WEB_ROOT, "content/knowledge/entities.json");
const GITA_READER = path.join(WEB_ROOT, "content/gita/reader");
const OUT = path.join(WEB_ROOT, "content/search/knowledge-index.json");

const GROUPS = ["people", "places", "events", "verses", "concepts"] as const;
type Group = (typeof GROUPS)[number];

const PEOPLE = new Set([
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
const PLACES = new Set([
  "kingdom",
  "city",
  "forest",
  "river",
  "mountain",
  "temple",
  "pilgrimage",
  "battlefield",
  "ashrama",
]);
const EVENTS = new Set(["event", "battle"]);
const CONCEPTS = new Set([
  "concept",
  "weapon",
  "dynasty",
  "scripture",
  "chapter",
  "other",
]);

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function groupForKind(kind: string): Group | null {
  if (PEOPLE.has(kind)) return "people";
  if (PLACES.has(kind)) return "places";
  if (EVENTS.has(kind)) return "events";
  if (kind === "verse") return "verses";
  if (CONCEPTS.has(kind)) return "concepts";
  return "concepts";
}

type Entity = {
  id: string;
  slug: string;
  kind: string;
  name: string;
  englishName: string;
  iastName?: string;
  sanskritName?: string;
  aliases?: string[];
  epithet?: string;
  summary: string;
  tags?: string[];
  categories?: string[];
  importance?: number;
  status?: string;
  atlas?: unknown;
  event?: unknown;
  externalRefs?: { genealogyId?: string; publicId?: string; workCode?: string };
};

type Doc = {
  id: string;
  group: Group;
  kind: string;
  title: string;
  englishTitle: string;
  iast?: string;
  sanskrit?: string;
  aliases: string[];
  summary: string;
  href: string;
  surfaces: string[];
  importance: number;
  searchText: string;
  searchTextRaw: string;
};

function entityHref(e: Entity): string {
  if (e.kind === "event" || e.kind === "battle") {
    return `/events/${e.slug}`;
  }
  return `/encyclopedia/${e.kind}/${e.slug}`;
}

function surfacesFor(e: Entity): string[] {
  const out = new Set<string>(["encyclopedia"]);
  if (e.atlas) out.add("atlas");
  if (e.event || e.kind === "event" || e.kind === "battle") {
    out.add("events");
    out.add("timeline");
  }
  if (e.externalRefs?.genealogyId || PEOPLE.has(e.kind)) {
    out.add("genealogy");
  }
  if (e.kind === "verse" || e.externalRefs?.workCode === "bg") out.add("gita");
  return [...out];
}

function docFromEntity(e: Entity): Doc | null {
  if (e.status && e.status !== "published") return null;
  const group = groupForKind(e.kind);
  if (!group) return null;

  const aliases = [...(e.aliases ?? [])];
  if (e.epithet) aliases.push(e.epithet);

  const rawParts = [
    e.id,
    e.slug,
    e.name,
    e.englishName,
    e.iastName ?? "",
    e.sanskritName ?? "",
    ...aliases,
    e.summary,
    ...(e.tags ?? []),
    ...(e.categories ?? []),
    e.kind,
  ].filter(Boolean);

  const href =
    e.kind === "verse" && e.externalRefs?.publicId
      ? verseHref(e.externalRefs.publicId)
      : entityHref(e);

  return {
    id: e.id,
    group: e.kind === "verse" ? "verses" : group,
    kind: e.kind,
    title: e.name,
    englishTitle: e.englishName,
    ...(e.iastName ? { iast: e.iastName } : {}),
    ...(e.sanskritName ? { sanskrit: e.sanskritName } : {}),
    aliases,
    summary: e.summary,
    href,
    surfaces: surfacesFor(e),
    importance: e.importance ?? 3,
    searchText: fold(rawParts.join(" ")),
    searchTextRaw: rawParts.join(" ").toLowerCase(),
  };
}

function verseHref(publicId: string): string {
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (!m) return "/bhagavad-gita";
  return `/bhagavad-gita/chapter-${m[1]}#verse-${m[2]}`;
}

async function loadVerseDocs(): Promise<Doc[]> {
  const docs: Doc[] = [];
  for (let n = 1; n <= 18; n++) {
    const file = path.join(GITA_READER, `bg.${n}.json`);
    let raw: string;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch {
      continue;
    }
    const json = JSON.parse(raw) as {
      verses?: Array<{
        publicId: string;
        number: number;
        sanskritText?: string;
        transliteration?: string | null;
        translations?: Array<{ languageCode: string; text: string }>;
      }>;
    };
    for (const v of json.verses ?? []) {
      const en =
        v.translations?.find((t) => t.languageCode === "en")?.text ?? "";
      const preview = en.slice(0, 180) || (v.transliteration ?? "").slice(0, 180);
      const sa = (v.sanskritText ?? "").slice(0, 240);
      const iast = (v.transliteration ?? "").slice(0, 240);
      const rawParts = [
        v.publicId,
        `bg.${n}.${v.number}`,
        `chapter ${n} verse ${v.number}`,
        sa,
        iast,
        en.slice(0, 400),
      ];
      docs.push({
        id: `verse.${v.publicId}`,
        group: "verses",
        kind: "verse",
        title: `Bhagavad Gītā ${n}.${v.number}`,
        englishTitle: `bg.${n}.${v.number}`,
        ...(iast
          ? { iast: iast.split("\n")[0]!.slice(0, 120) }
          : {}),
        ...(sa
          ? { sanskrit: sa.split("\n")[0]!.slice(0, 80) }
          : {}),
        aliases: [`bg.${n}.${v.number}`, `${n}.${v.number}`],
        summary: preview,
        href: verseHref(v.publicId),
        surfaces: ["gita", "encyclopedia"],
        importance: 3,
        searchText: fold(rawParts.join(" ")),
        searchTextRaw: rawParts.join(" ").toLowerCase(),
      });
    }
  }
  return docs;
}

async function main() {
  const entitiesRaw = JSON.parse(await fs.readFile(KNOWLEDGE, "utf8")) as {
    entities: Entity[];
  };

  const entityDocs = entitiesRaw.entities
    .map(docFromEntity)
    .filter((d): d is Doc => Boolean(d));

  // Prefer full Gita verse docs over thin verse stubs from KG
  const withoutVerseStubs = entityDocs.filter((d) => d.kind !== "verse");
  const verseDocs = await loadVerseDocs();

  const byId = new Map<string, Doc>();
  for (const d of [...withoutVerseStubs, ...verseDocs]) {
    byId.set(d.id, d);
  }
  const documents = [...byId.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  // Light validation
  z.array(
    z.object({
      id: z.string(),
      group: z.enum(GROUPS),
      kind: z.string(),
      title: z.string(),
      href: z.string(),
      searchText: z.string(),
    }),
  ).parse(documents);

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  // Compact JSON — keep the deploy artifact lean (~half of pretty-print).
  await fs.writeFile(
    OUT,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      schemaVersion: 1,
      documents,
    }) + "\n",
  );

  const counts = Object.fromEntries(
    GROUPS.map((g) => [g, documents.filter((d) => d.group === g).length]),
  );
  console.log(
    `Wrote ${documents.length} search docs → ${OUT}`,
    JSON.stringify(counts),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
