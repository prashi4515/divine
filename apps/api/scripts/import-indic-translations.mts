/**
 * Import Indic-language translations for Bhagavad Gita verses.
 *
 * Sources:
 * - Telugu (te): Unlicense HF dataset ajaysadhu02/bhagavath-gita-telugu
 * - Odia (or): Open JSON from naveennamani/gita-api-vercel
 * - Kannada / Tamil / Malayalam: Hindi (Ramsukhdas) meaning transliterated into
 *   the target Brahmic script via @indic-transliteration/sanscript so readers
 *   can follow in a familiar script until dedicated meaning corpora land.
 *
 * Run: pnpm --filter @divine/api indic:import
 */
import { PrismaClient } from "@prisma/client";
import Sanscript from "@indic-transliteration/sanscript";

const prisma = new PrismaClient();
const BATCH = 40;

/** Strip nukta / normalize punctuation before Sanscript → kn/ta/ml. */
function normalizeDevanagariForRescript(text: string): string {
  return text
    .replace(/\u093C/g, "")
    .replace(/\u0901/g, "\u0902")
    .replace(/\u0964/g, ".")
    .replace(/\u0965/g, "..");
}

function stripForeignIndicMarks(text: string): string {
  return text
    .replace(/\u093C/g, "")
    .replace(/[\u0900-\u097F]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hindiToScript(text: string, scheme: string): string {
  return stripForeignIndicMarks(
    Sanscript.t(normalizeDevanagariForRescript(text), "devanagari", scheme),
  );
}

const TE_URL =
  "https://huggingface.co/datasets/ajaysadhu02/bhagavath-gita-telugu/resolve/main/gita-in-telugu.json";
const OR_CHAPTER_URL = (n: number) =>
  `https://raw.githubusercontent.com/naveennamani/gita-api-vercel/main/verses_odia_json/${n}.json`;

const LANGUAGES = [
  { code: "te", name: "Telugu", nativeName: "తెలుగు", sortOrder: 30 },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", sortOrder: 40 },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", sortOrder: 50 },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", sortOrder: 60 },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", sortOrder: 70 },
] as const;

const SOURCES = [
  {
    key: "holy-bg-telugu",
    displayName: "Holy Bhagavad Gita (Telugu)",
    author: "Community / Unlicense corpus",
    license: "Unlicense",
    isDefault: false,
  },
  {
    key: "holy-bg-odia",
    displayName: "Holy Bhagavad Gita (Odia)",
    author: "Community open corpus",
    license: "Open / community",
    isDefault: false,
  },
  {
    key: "ramsukhdas-indic-script",
    displayName: "Ramsukhdas (Indic script)",
    author: "Swami Ramsukhdas (script via Sanscript)",
    license: "Public domain / Unlicense source corpus",
    isDefault: false,
  },
] as const;

type Pending = {
  verseId: string;
  languageId: string;
  translationSourceId: string;
  text: string;
};

function cleanText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/^BG\s+\d+\.\d+:\s*/i, "").trim();
}

async function ensureCatalog(): Promise<{
  languages: Map<string, string>;
  sources: Map<string, string>;
}> {
  const languages = new Map<string, string>();
  for (const lang of LANGUAGES) {
    const row = await prisma.language.upsert({
      where: { code: lang.code },
      create: { ...lang, isPublished: true },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        sortOrder: lang.sortOrder,
        isPublished: true,
      },
    });
    languages.set(lang.code, row.id);
  }

  const sources = new Map<string, string>();
  for (const source of SOURCES) {
    const row = await prisma.translationSource.upsert({
      where: { key: source.key },
      create: { ...source, isPublished: true },
      update: {
        displayName: source.displayName,
        author: source.author,
        license: source.license,
        isPublished: true,
      },
    });
    sources.set(source.key, row.id);
  }

  return { languages, sources };
}

async function flushBatch(batch: Pending[]): Promise<number> {
  if (batch.length === 0) return 0;
  await prisma.$transaction(
    batch.map((item) =>
      prisma.translation.upsert({
        where: {
          verseId_languageId_translationSourceId: {
            verseId: item.verseId,
            languageId: item.languageId,
            translationSourceId: item.translationSourceId,
          },
        },
        create: {
          verseId: item.verseId,
          languageId: item.languageId,
          translationSourceId: item.translationSourceId,
          text: item.text,
          isPublished: true,
        },
        update: {
          text: item.text,
          isPublished: true,
        },
      }),
    ),
  );
  return batch.length;
}

async function writeAll(items: Pending[], label: string): Promise<number> {
  let written = 0;
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    written += await flushBatch(chunk);
    if (written % 200 === 0 || i + BATCH >= items.length) {
      console.log(`[indic] ${label}: ${written}/${items.length}`);
    }
  }
  return written;
}

async function importTelugu(
  languageId: string,
  sourceId: string,
  verseByPublicId: Map<string, string>,
): Promise<number> {
  const res = await fetch(TE_URL);
  if (!res.ok) throw new Error(`Telugu fetch failed: ${res.status}`);
  const rows = (await res.json()) as Array<{
    chapter: number;
    verse: number;
    te_translation?: string;
  }>;

  const pending: Pending[] = [];
  for (const row of rows) {
    const verseId = verseByPublicId.get(`bg.${row.chapter}.${row.verse}`);
    const text = row.te_translation ? cleanText(row.te_translation) : "";
    if (!verseId || !text) continue;
    pending.push({
      verseId,
      languageId,
      translationSourceId: sourceId,
      text,
    });
  }
  return writeAll(pending, "telugu");
}

async function importOdia(
  languageId: string,
  sourceId: string,
  verseByPublicId: Map<string, string>,
): Promise<number> {
  const pending: Pending[] = [];
  for (let chapter = 1; chapter <= 18; chapter += 1) {
    const res = await fetch(OR_CHAPTER_URL(chapter));
    if (!res.ok) throw new Error(`Odia chapter ${chapter} fetch failed: ${res.status}`);
    const doc = (await res.json()) as Record<
      string,
      { chapter_no: number; verse_no: number; translation?: string }
    >;
    for (const row of Object.values(doc)) {
      const verseId = verseByPublicId.get(`bg.${row.chapter_no}.${row.verse_no}`);
      const text = row.translation ? cleanText(row.translation) : "";
      if (!verseId || !text) continue;
      pending.push({
        verseId,
        languageId,
        translationSourceId: sourceId,
        text,
      });
    }
    console.log(`[indic] odia chapter ${chapter} buffered (${pending.length} total)`);
  }
  return writeAll(pending, "odia");
}

async function importScriptFromHindi(
  targets: Array<{ code: string; scheme: string }>,
  languages: Map<string, string>,
  sourceId: string,
): Promise<Record<string, number>> {
  const hindi = await prisma.language.findUnique({ where: { code: "hi" } });
  if (!hindi) throw new Error("Hindi language missing — run seed/import first");

  const rows = await prisma.translation.findMany({
    where: {
      languageId: hindi.id,
      isPublished: true,
      verse: { chapter: { work: { code: "bg" } } },
    },
    select: { verseId: true, text: true },
  });

  const counts: Record<string, number> = {};
  for (const target of targets) {
    const languageId = languages.get(target.code);
    if (!languageId) continue;
    const pending: Pending[] = rows.map((row) => ({
      verseId: row.verseId,
      languageId,
      translationSourceId: sourceId,
      text: hindiToScript(row.text, target.scheme),
    }));
    counts[target.code] = await writeAll(pending, target.code);
  }
  return counts;
}

async function main(): Promise<void> {
  const { languages, sources } = await ensureCatalog();

  const verses = await prisma.verse.findMany({
    where: { chapter: { work: { code: "bg" } } },
    select: { id: true, publicId: true },
  });
  const verseByPublicId = new Map(verses.map((v) => [v.publicId, v.id]));
  console.log(`[indic] bg verses in DB: ${verseByPublicId.size}`);

  const teExisting = await prisma.translation.count({
    where: { language: { code: "te" }, verse: { chapter: { work: { code: "bg" } } } },
  });
  if (teExisting >= 701) {
    console.log(`[indic] telugu already complete (${teExisting}), skipping`);
  } else {
    const te = await importTelugu(
      languages.get("te")!,
      sources.get("holy-bg-telugu")!,
      verseByPublicId,
    );
    console.log(`[indic] telugu upserted: ${te}`);
  }

  const or = await importOdia(
    languages.get("or")!,
    sources.get("holy-bg-odia")!,
    verseByPublicId,
  );
  console.log(`[indic] odia upserted: ${or}`);

  const scriptCounts = await importScriptFromHindi(
    [
      { code: "kn", scheme: "kannada" },
      { code: "ta", scheme: "tamil" },
      { code: "ml", scheme: "malayalam" },
    ],
    languages,
    sources.get("ramsukhdas-indic-script")!,
  );
  console.log(`[indic] script-from-hindi:`, scriptCounts);

  const scripture = await prisma.scripture.findFirst({
    where: { work: { code: "bg" } },
  });
  if (scripture?.workId) {
    const translationCount = await prisma.translation.count({
      where: { verse: { chapter: { workId: scripture.workId } } },
    });
    await prisma.scripture.update({
      where: { id: scripture.id },
      data: { translationCount },
    });
    console.log(`[indic] scripture translationCount=${translationCount}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
