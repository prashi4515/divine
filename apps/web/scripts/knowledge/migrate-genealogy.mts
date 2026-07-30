/**
 * One-shot migration: genealogy people/modules → knowledge entity/relation packs.
 *
 * Usage: node scripts/knowledge/migrate-genealogy.mts
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  makeRelationId,
} from "./helpers.mts";

type EntityKind = string;
type RelationType = string;

type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
  note?: string;
};

type KnowledgeEntity = {
  id: string;
  slug: string;
  kind: EntityKind;
  name: string;
  englishName: string;
  iastName: string;
  sanskritName?: string;
  aliases: string[];
  gender?: string;
  era?: string;
  epithet?: string;
  summary: string;
  description: string;
  primaryScripture: string;
  scriptureSources: Cite[];
  tags: string[];
  categories: string[];
  importance: number;
  image?: { placeholder?: string };
  seo: { title?: string; description?: string };
  externalRefs?: { genealogyId?: string; workCode?: string; publicId?: string };
  variantTraditions: unknown[];
  notes?: string;
  status: "published" | "draft";
  schemaVersion: number;
};

type KnowledgeRelation = {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  confidence: "verified" | "traditional" | "variant";
  sources: Cite[];
  note?: string;
};

type KnowledgeCollection = {
  id: string;
  slug: string;
  title: string;
  kind: "genealogy-module";
  sanskritTitle?: string;
  eyebrow?: string;
  summary: string;
  description: string;
  status: "available" | "coming-soon";
  entityIds: string[];
  rootEntityId?: string;
  highlightPath?: string[];
  scriptureSources: Cite[];
  relatedGitaChapters?: number[];
  faq?: Array<{ question: string; answer: string }>;
  color?: { accent: string; tint: string };
  order: number;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "../..");
const GEN_PEOPLE = path.join(WEB_ROOT, "content/genealogy/people.json");
const GEN_MODULES = path.join(WEB_ROOT, "content/genealogy/modules.json");
const OUT = path.join(WEB_ROOT, "content/knowledge");

const CATEGORY_TO_KIND: Record<string, EntityKind> = {
  supreme: "deity",
  trimurti: "deity",
  avatar: "avatar",
  devi: "devi",
  prajapati: "prajapati",
  manu: "manu",
  rishi: "sage",
  saptarishi: "sage",
  king: "king",
  queen: "queen",
  prince: "prince",
  princess: "princess",
  warrior: "warrior",
  deva: "deva",
  daitya: "daitya",
  danava: "danava",
  rakshasa: "rakshasa",
  asura: "asura",
  yaksha: "yaksha",
  gandharva: "gandharva",
  naga: "naga",
  "dynasty-founder": "king",
  other: "person",
};

const REL_TYPE_MAP: Record<string, RelationType> = {
  father: "father",
  mother: "mother",
  spouse: "spouse",
  consort: "consort",
  brother: "brother",
  sister: "sister",
  son: "son",
  daughter: "daughter",
  "adoptive-father": "adoptive-father",
  "adoptive-mother": "adoptive-mother",
  "adoptive-son": "adoptive-son",
  "adoptive-daughter": "adoptive-daughter",
  guru: "guru",
  disciple: "disciple",
  ancestor: "ancestor",
  descendant: "descendant",
  "incarnation-of": "incarnation-of",
  "manifestation-of": "manifestation-of",
};

function personEntityId(oldId: string): string {
  return `person.${oldId}`;
}

type OldPerson = {
  id: string;
  slug?: string;
  name: string;
  englishName: string;
  iastName: string;
  sanskritName?: string;
  aliases?: string[];
  gender: string;
  category: string;
  dynasty?: string;
  era?: string;
  epithet?: string;
  description: string;
  primaryScripture: string;
  importance?: number;
  relationships?: Array<{
    type: string;
    personId: string;
    confidence: "verified" | "traditional" | "variant";
    sources: Array<{
      work: string;
      section?: string;
      chapter?: string;
      verse?: string;
      note?: string;
    }>;
    note?: string;
  }>;
  variantTraditions?: KnowledgeEntity["variantTraditions"];
  scriptureSources?: KnowledgeEntity["scriptureSources"];
  relatedVerses?: Array<{ workCode: string; publicId: string; label?: string }>;
  notes?: string;
  imagePlaceholder?: string;
};

async function main() {
  const peopleRaw = JSON.parse(await fs.readFile(GEN_PEOPLE, "utf8")) as {
    people: OldPerson[];
  };
  const modulesRaw = JSON.parse(await fs.readFile(GEN_MODULES, "utf8")) as {
    modules: Array<{
      slug: string;
      title: string;
      sanskritTitle?: string;
      eyebrow?: string;
      summary: string;
      description: string;
      status?: string;
      personIds: string[];
      rootPersonId?: string;
      highlightPath?: string[];
      scriptureSources?: KnowledgeEntity["scriptureSources"];
      relatedGitaChapters?: number[];
      faq?: Array<{ question: string; answer: string }>;
      color?: { accent: string; tint: string };
      order?: number;
    }>;
  };

  const entities: KnowledgeEntity[] = [];
  const relations: KnowledgeRelation[] = [];
  const verseStubIds = new Set<string>();
  const dynastyIds = new Set<string>();

  for (const p of peopleRaw.people) {
    const kind = CATEGORY_TO_KIND[p.category] ?? "person";
    const id = personEntityId(p.id);
    const tags = p.dynasty ? [`dynasty:${p.dynasty}`] : [];
    if (p.dynasty) dynastyIds.add(p.dynasty);

    entities.push({
      id,
      slug: p.slug ?? p.id,
      kind,
      name: p.name,
      englishName: p.englishName,
      iastName: p.iastName,
      sanskritName: p.sanskritName,
      aliases: p.aliases ?? [],
      gender: p.gender as KnowledgeEntity["gender"],
      era: (p.era as KnowledgeEntity["era"]) ?? "unspecified",
      epithet: p.epithet,
      summary: p.epithet ?? p.description.slice(0, 160),
      description: p.description,
      primaryScripture: p.primaryScripture,
      scriptureSources: p.scriptureSources ?? [],
      tags,
      categories: [p.category],
      importance: p.importance ?? 3,
      image: p.imagePlaceholder
        ? { placeholder: p.imagePlaceholder }
        : undefined,
      seo: {
        title: `${p.name} — Hindu encyclopedia`,
        description: p.description.slice(0, 160),
      },
      externalRefs: { genealogyId: p.id },
      variantTraditions: p.variantTraditions ?? [],
      notes: p.notes,
      status: "published",
      schemaVersion: 1,
    });

    for (const r of p.relationships ?? []) {
      const type = REL_TYPE_MAP[r.type];
      if (!type) continue;
      const toId = personEntityId(r.personId);
      const relId = makeRelationId(id, type, toId);
      relations.push({
        id: relId,
        fromId: id,
        toId,
        type,
        confidence: r.confidence,
        sources: r.sources,
        note: r.note,
      });
    }

    for (const v of p.relatedVerses ?? []) {
      const verseId = `verse.${v.publicId}`;
      verseStubIds.add(JSON.stringify({ verseId, publicId: v.publicId, workCode: v.workCode, label: v.label }));
      relations.push({
        id: makeRelationId(id, "appears-in", verseId),
        fromId: id,
        toId: verseId,
        type: "appears-in",
        confidence: "verified",
        sources: [{ work: "Bhagavad Gītā", chapter: v.publicId.replace(/^bg\./, "") }],
        note: v.label,
      });
    }

    if (p.dynasty) {
      const dynId = `dynasty.${p.dynasty}`;
      relations.push({
        id: makeRelationId(id, "belongs-to-dynasty", dynId),
        fromId: id,
        toId: dynId,
        type: "belongs-to-dynasty",
        confidence: "traditional",
        sources: p.scriptureSources?.length
          ? p.scriptureSources
          : [{ work: p.primaryScripture }],
      });
    }
  }

  const scriptureEntities: KnowledgeEntity[] = [
    {
      id: "scripture.bg",
      slug: "bhagavad-gita",
      kind: "scripture",
      name: "Bhagavad Gītā",
      englishName: "Bhagavad Gita",
      iastName: "Bhagavad Gītā",
      aliases: ["Gita", "Bhagavadgita", "Song of God"],
      summary: "The dialogue of Kṛṣṇa and Arjuna on the field of Kurukṣetra.",
      description:
        "The Bhagavad Gītā is a dialogue within the Mahābhārata in which Kṛṣṇa instructs Arjuna on dharma, yoga, and liberation.",
      primaryScripture: "Bhagavad Gītā",
      scriptureSources: [{ work: "Bhagavad Gītā" }],
      tags: ["gita"],
      categories: ["scripture"],
      importance: 5,
      seo: {
        title: "Bhagavad Gītā — Scripture",
        description: "The dialogue of Kṛṣṇa and Arjuna.",
      },
      externalRefs: { workCode: "bg", publicId: "bg" },
      status: "published",
      schemaVersion: 1,
      era: "dvapara-yuga",
      variantTraditions: [],
    },
  ];

  const verseEntities: KnowledgeEntity[] = [];
  for (const raw of verseStubIds) {
    const { verseId, publicId, workCode, label } = JSON.parse(raw) as {
      verseId: string;
      publicId: string;
      workCode: string;
      label?: string;
    };
    const m = /^bg\.(\d+)\.(\d+)$/i.exec(publicId);
    const slug = m ? `bg-${m[1]}-${m[2]}` : publicId.replace(/\./g, "-");
    verseEntities.push({
      id: verseId,
      slug,
      kind: "verse",
      name: label ?? `Bhagavad Gītā ${publicId.replace(/^bg\./i, "")}`,
      englishName: publicId,
      iastName: label ?? publicId,
      aliases: [publicId],
      summary: label ?? `Verse ${publicId}`,
      description: `Stub entity linking the knowledge graph to Gita verse ${publicId}. Full text lives in the reader corpus.`,
      primaryScripture: "Bhagavad Gītā",
      scriptureSources: [{ work: "Bhagavad Gītā", chapter: publicId.replace(/^bg\./, "") }],
      tags: ["gita", "verse"],
      categories: ["verse"],
      importance: 3,
      seo: { title: publicId },
      externalRefs: { workCode, publicId },
      status: "published",
      schemaVersion: 1,
      era: "dvapara-yuga",
      variantTraditions: [],
    });
    relations.push({
      id: makeRelationId(verseId, "appears-in", "scripture.bg"),
      fromId: verseId,
      toId: "scripture.bg",
      type: "appears-in",
      confidence: "verified",
      sources: [{ work: "Bhagavad Gītā" }],
    });
  }

  const dynastyLabels: Record<string, string> = {
    yadu: "Yadu",
    kuru: "Kuru",
    raghu: "Raghu",
    suryavamsa: "Sūryavaṃśa",
    chandravamsa: "Candravaṃśa",
    daitya: "Daitya",
    danava: "Dānava",
    rakshasa: "Rākṣasa",
    naga: "Nāga",
    aditya: "Āditya",
    kashyapa: "Kaśyapa",
    prajapati: "Prajāpati",
    paurava: "Paurava",
    yaksha: "Yakṣa",
    gandharva: "Gandharva",
    videha: "Videha",
  };

  const dynastyEntities: KnowledgeEntity[] = [...dynastyIds].map((d) => {
    const label = dynastyLabels[d] ?? d;
    return {
      id: `dynasty.${d}`,
      slug: d,
      kind: "dynasty" as const,
      name: label,
      englishName: label,
      iastName: label,
      aliases: [d],
      summary: `${label} dynasty / lineage.`,
      description: `The ${label} line as attested across epic and Purāṇic genealogies in Divine's knowledge graph.`,
      primaryScripture: "Bhāgavata Purāṇa",
      scriptureSources: [{ work: "Bhāgavata Purāṇa" }],
      tags: ["dynasty"],
      categories: ["dynasty"],
      importance: 3,
      seo: { title: `${label} dynasty` },
      status: "published" as const,
      schemaVersion: 1,
      era: "unspecified" as const,
      variantTraditions: [],
    };
  });

  const collections: KnowledgeCollection[] = modulesRaw.modules.map((m) => ({
    id: `genealogy.${m.slug}`,
    slug: m.slug,
    title: m.title,
    kind: "genealogy-module" as const,
    sanskritTitle: m.sanskritTitle,
    eyebrow: m.eyebrow,
    summary: m.summary,
    description: m.description,
    status: (m.status === "coming-soon" ? "coming-soon" : "available") as
      | "available"
      | "coming-soon",
    entityIds: m.personIds.map(personEntityId),
    rootEntityId: m.rootPersonId
      ? personEntityId(m.rootPersonId)
      : undefined,
    highlightPath: m.highlightPath?.map(personEntityId),
    scriptureSources: m.scriptureSources ?? [],
    relatedGitaChapters: m.relatedGitaChapters,
    faq: m.faq,
    color: m.color,
    order: m.order ?? 100,
  }));

  await fs.mkdir(path.join(OUT, "entities"), { recursive: true });
  await fs.mkdir(path.join(OUT, "relations"), { recursive: true });
  await fs.mkdir(path.join(OUT, "collections"), { recursive: true });

  await fs.writeFile(
    path.join(OUT, "entities/persons.json"),
    JSON.stringify({ schemaVersion: 1, entities }, null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(OUT, "entities/scriptures.json"),
    JSON.stringify(
      { schemaVersion: 1, entities: [...scriptureEntities, ...verseEntities] },
      null,
      2,
    ) + "\n",
  );
  await fs.writeFile(
    path.join(OUT, "entities/dynasties.json"),
    JSON.stringify({ schemaVersion: 1, entities: dynastyEntities }, null, 2) +
      "\n",
  );
  await fs.writeFile(
    path.join(OUT, "relations/kinship.json"),
    JSON.stringify({ schemaVersion: 1, relations }, null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(OUT, "collections/genealogy-modules.json"),
    JSON.stringify({ schemaVersion: 1, collections }, null, 2) + "\n",
  );

  console.log(
    `Migrated ${entities.length} persons, ${relations.length} relations, ${collections.length} genealogy modules, ${verseEntities.length} verse stubs, ${dynastyEntities.length} dynasties`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
