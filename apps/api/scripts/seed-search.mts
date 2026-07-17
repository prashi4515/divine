/**
 * Seeds intelligent search: topics, synonyms/spellings, verse↔topic links,
 * and denormalized verse keywords from real corpus text.
 *
 * Usage: pnpm --filter @divine/api search:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOPICS = [
  { slug: "duty", name: "Duty", sortOrder: 10 },
  { slug: "karma", name: "Karma", sortOrder: 20 },
  { slug: "bhakti", name: "Bhakti", sortOrder: 25 },
  { slug: "jnana", name: "Jnana", sortOrder: 28 },
  { slug: "meditation", name: "Meditation", sortOrder: 30 },
  { slug: "mind", name: "Mind", sortOrder: 35 },
  { slug: "wisdom", name: "Wisdom", sortOrder: 40 },
  { slug: "soul", name: "Soul", sortOrder: 45 },
  { slug: "death", name: "Death", sortOrder: 48 },
  { slug: "detachment", name: "Detachment", sortOrder: 50 },
  { slug: "peace", name: "Peace", sortOrder: 55 },
  { slug: "yoga", name: "Yoga", sortOrder: 60 },
  { slug: "dharma", name: "Dharma", sortOrder: 65 },
] as const;

const TERM_GROUPS: Array<{
  canonical: string;
  kind: string;
  terms: string[];
}> = [
  {
    canonical: "bhagavad gita",
    kind: "spelling",
    terms: [
      "bhagavad gita",
      "bhagavadgita",
      "bhagwat geeta",
      "bhagwatgita",
      "bagavadgita",
      "bagavad gita",
      "bhagawad geetha",
      "bhagawadgita",
      "bhagavad geeta",
      "bhagavad geetha",
      "geeta",
      "geetha",
    ],
  },
  {
    canonical: "krishna",
    kind: "spelling",
    terms: ["krishna", "krsna", "krushna", "krisna", "कृष्ण"],
  },
  {
    canonical: "arjuna",
    kind: "spelling",
    terms: ["arjuna", "arjun", "अर्जुन"],
  },
  {
    canonical: "krodha",
    kind: "synonym",
    terms: ["anger", "krodha", "wrath", "rage", "क्रोध"],
  },
  {
    canonical: "shanti",
    kind: "synonym",
    terms: ["peace", "shanti", "tranquility", "शान्ति", "శాంతి"],
  },
  {
    canonical: "karma",
    kind: "synonym",
    terms: ["work", "karma", "action", "कर्म", "కర్మ"],
  },
  {
    canonical: "jnana",
    kind: "synonym",
    terms: [
      "knowledge",
      "jnana",
      "wisdom",
      "\u091c\u094d\u091e\u093e\u0928",
      "\u0c1c\u0c4d\u0c1e\u0c3e\u0c28\u0c02",
    ],
  },
  {
    canonical: "bhakti",
    kind: "synonym",
    terms: [
      "devotion",
      "bhakti",
      "love",
      "\u092d\u0915\u094d\u0924\u093f",
      "\u0c2d\u0c15\u0c4d\u0c24\u0c3f",
    ],
  },
  {
    canonical: "atma",
    kind: "synonym",
    terms: [
      "soul",
      "atma",
      "self",
      "\u0906\u0924\u094d\u092e\u093e",
      "\u0c06\u0c24\u0c4d\u0c2e",
    ],
  },
  {
    canonical: "yoga",
    kind: "synonym",
    terms: ["yoga", "union", "discipline", "\u092f\u094b\u0917"],
  },
  {
    canonical: "dharma",
    kind: "synonym",
    terms: [
      "dharma",
      "righteousness",
      "duty",
      "\u0927\u0930\u094d\u092e",
      "\u0c27\u0c30\u0c4d\u0c2e\u0c02",
    ],
  },
  {
    canonical: "moksha",
    kind: "synonym",
    terms: ["liberation", "moksha", "freedom", "\u092e\u094b\u0915\u094d\u0937"],
  },
  {
    canonical: "death",
    kind: "synonym",
    terms: ["death", "dying", "mrtyu", "\u092e\u0943\u0924\u094d\u092f\u0941"],
  },
  {
    canonical: "mind",
    kind: "synonym",
    terms: ["mind", "manas", "\u092c\u0941\u0926\u094d\u0927\u093f", "\u092e\u0928"],
  },
  {
    canonical: "meditation",
    kind: "synonym",
    terms: ["meditation", "dhyana", "\u0927\u094d\u092f\u093e\u0928"],
  },
  {
    canonical: "detachment",
    kind: "synonym",
    terms: [
      "detachment",
      "vairagya",
      "renunciation",
      "\u0935\u0948\u0930\u093e\u0917\u094d\u092f",
    ],
  },
];

const TOPIC_RULES: Array<{ slug: string; keywords: string[] }> = [
  {
    slug: "karma",
    keywords: ["karma", "action", "work", "fruit of action", "renounce"],
  },
  {
    slug: "bhakti",
    keywords: ["devotee", "devotion", "worship", "bhakti", "love me", "surrender"],
  },
  {
    slug: "jnana",
    keywords: ["knowledge", "wisdom", "jnana", "knowing", "ignorance"],
  },
  {
    slug: "mind",
    keywords: ["mind", "senses", "intellect", "desire", "anger", "thought"],
  },
  {
    slug: "meditation",
    keywords: ["meditation", "meditate", "concentrat", "yogi", "absorb"],
  },
  {
    slug: "soul",
    keywords: ["soul", "self", "atman", "eternal", "indestructible", "embodied"],
  },
  {
    slug: "death",
    keywords: ["death", "die", "dying", "body", "birth", "mortal"],
  },
  {
    slug: "duty",
    keywords: ["duty", "dharma", "own duty", "prescribed", "warrior"],
  },
  {
    slug: "detachment",
    keywords: [
      "detach",
      "unattached",
      "without attachment",
      "renounce",
      "indifferent",
    ],
  },
  {
    slug: "peace",
    keywords: ["peace", "tranquil", "serene", "equanimity", "calm"],
  },
  {
    slug: "yoga",
    keywords: ["yoga", "yogi", "discipline", "union"],
  },
  {
    slug: "dharma",
    keywords: ["dharma", "righteous", "religion", "law"],
  },
  {
    slug: "wisdom",
    keywords: ["wise", "wisdom", "discriminat", "understanding"],
  },
];

function normalize(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 128);
}

async function seedTopics(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const topic of TOPICS) {
    const row = await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: {
        slug: topic.slug,
        name: topic.name,
        sortOrder: topic.sortOrder,
        isPublished: true,
      },
      update: {
        name: topic.name,
        sortOrder: topic.sortOrder,
        isPublished: true,
      },
    });
    map.set(topic.slug, row.id);
  }
  console.log(`[seed-search] topics: ${TOPICS.length}`);
  return map;
}

async function seedTerms(): Promise<void> {
  const rows = TERM_GROUPS.flatMap((group) =>
    group.terms
      .map((term) => normalize(term))
      .filter(Boolean)
      .map((term) => ({
        term,
        canonical: normalize(group.canonical),
        kind: group.kind,
        weight: group.kind === "spelling" ? 10 : 5,
      })),
  );

  // Upsert in small batches (unique on term+kind)
  for (const row of rows) {
    await prisma.searchTerm.upsert({
      where: { term_kind: { term: row.term, kind: row.kind } },
      create: row,
      update: { canonical: row.canonical, weight: row.weight },
    });
  }
  console.log(`[seed-search] search_terms: ${rows.length}`);
}

async function tagVersesAndKeywords(
  topicIds: Map<string, string>,
): Promise<void> {
  const verses = await prisma.verse.findMany({
    where: {
      isPublished: true,
      chapter: { work: { code: "bg" } },
    },
    include: {
      translations: {
        where: { isPublished: true },
        include: { language: true, translationSource: true },
      },
      verseTopics: { select: { topicId: true } },
      searchKeywords: { select: { keyword: true } },
    },
  });

  const topicCreates: Array<{ verseId: string; topicId: string; weight: number }> =
    [];
  const keywordCreates: Array<{
    verseId: string;
    keyword: string;
    language: string;
    weight: number;
  }> = [];

  for (const verse of verses) {
    const existingTopics = new Set(verse.verseTopics.map((vt) => vt.topicId));
    const existingKeywords = new Set(
      verse.searchKeywords.map((k) => k.keyword),
    );

    const en = verse.translations.find(
      (t) =>
        t.language.code === "en" &&
        !t.translationSource.key.includes("vyakhya") &&
        !t.translationSource.key.includes("w2w"),
    );
    const hay = [
      verse.meaning ?? "",
      verse.commentary ?? "",
      verse.transliteration ?? "",
      en?.text ?? "",
      ...verse.translations
        .filter((t) => t.translationSource.key.includes("w2w"))
        .map((t) => t.text),
    ]
      .join("\n")
      .toLowerCase();

    for (const rule of TOPIC_RULES) {
      const topicId = topicIds.get(rule.slug);
      if (!topicId || existingTopics.has(topicId)) continue;
      const hit = rule.keywords.some((kw) => hay.includes(kw.toLowerCase()));
      if (!hit) continue;
      topicCreates.push({ verseId: verse.id, topicId, weight: 1 });
      existingTopics.add(topicId);
    }

    const keywordCandidates = new Set<string>();
    if (verse.publicId) keywordCandidates.add(verse.publicId.toLowerCase());
    for (const token of (verse.transliteration ?? "")
      .toLowerCase()
      .split(/[\s,;|/]+/)
      .filter((t) => t.length >= 3 && t.length <= 40)
      .slice(0, 12)) {
      keywordCandidates.add(normalize(token));
    }
    for (const t of verse.translations) {
      if (
        !t.translationSource.key.includes("w2w") &&
        t.language.code !== "en"
      ) {
        continue;
      }
      for (const part of t.text.split(/[;—–\n]/).slice(0, 20)) {
        const word = normalize(part.split(/[=:]/)[0] ?? "");
        if (word.length >= 2 && word.length <= 48) keywordCandidates.add(word);
      }
    }

    for (const kw of [...keywordCandidates].slice(0, 24)) {
      if (!kw || existingKeywords.has(kw)) continue;
      keywordCreates.push({
        verseId: verse.id,
        keyword: kw,
        language: "mixed",
        weight: 1,
      });
      existingKeywords.add(kw);
    }
  }

  const chunk = 100;
  for (let i = 0; i < topicCreates.length; i += chunk) {
    await prisma.verseTopic.createMany({
      data: topicCreates.slice(i, i + chunk),
      skipDuplicates: true,
    });
  }
  for (let i = 0; i < keywordCreates.length; i += chunk) {
    await prisma.verseSearchKeyword.createMany({
      data: keywordCreates.slice(i, i + chunk),
      skipDuplicates: true,
    });
  }

  console.log(
    `[seed-search] verses=${verses.length} verse_topics+${topicCreates.length} keywords+${keywordCreates.length}`,
  );
}

async function main(): Promise<void> {
  console.log("[seed-search] starting…");
  const topicIds = await seedTopics();
  await seedTerms();
  await tagVersesAndKeywords(topicIds);
  console.log("[seed-search] done.");
}

main()
  .catch((error: unknown) => {
    console.error(
      "[seed-search] FAILED:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
