/**
 * Import detailed multilingual commentaries (open corpora only).
 *
 * Cannot import ISKCON / BBT "Bhagavad Gita As It Is" — that text is copyrighted.
 *
 * Sources used instead:
 * - Telugu: HuggingFace ajaysadhu02/bhagavath-gita-telugu (Unlicense) — commentry + w2w
 * - kn/ta/ml/or: Ramsukhdas Hindi vyakhya transliterated into target scripts (interim)
 *
 * Run: pnpm --filter @divine/api commentary:multilang
 */
import { PrismaClient } from "@prisma/client";
import Sanscript from "@indic-transliteration/sanscript";

const prisma = new PrismaClient();
const BATCH = 25;

const TE_URL =
  "https://huggingface.co/datasets/ajaysadhu02/bhagavath-gita-telugu/resolve/main/gita-in-telugu.json";

const INDIC_SCRIPTS = [
  { code: "kn", scheme: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ", sortOrder: 40 },
  { code: "ta", scheme: "tamil", name: "Tamil", nativeName: "தமிழ்", sortOrder: 50 },
  { code: "ml", scheme: "malayalam", name: "Malayalam", nativeName: "മലയാളം", sortOrder: 60 },
  { code: "or", scheme: "oriya", name: "Odia", nativeName: "ଓଡ଼ିଆ", sortOrder: 70 },
] as const;

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/^BG\s+\d+\.\d+:\s*/i, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function upsertTranslation(input: {
  verseId: string;
  languageId: string;
  sourceId: string;
  text: string;
}): Promise<void> {
  await prisma.translation.upsert({
    where: {
      verseId_languageId_translationSourceId: {
        verseId: input.verseId,
        languageId: input.languageId,
        translationSourceId: input.sourceId,
      },
    },
    create: {
      verseId: input.verseId,
      languageId: input.languageId,
      translationSourceId: input.sourceId,
      text: input.text,
      isPublished: true,
    },
    update: { text: input.text, isPublished: true },
  });
}

async function main() {
  const verses = await prisma.verse.findMany({
    where: { chapter: { work: { code: "bg" } } },
    select: {
      id: true,
      number: true,
      chapter: { select: { number: true } },
    },
  });
  const byKey = new Map(
    verses.map((v) => [`${v.chapter.number}.${v.number}`, v.id] as const),
  );

  const teLang = await prisma.language.upsert({
    where: { code: "te" },
    create: {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      sortOrder: 30,
      isPublished: true,
    },
    update: { isPublished: true },
  });

  const teVyakhya = await prisma.translationSource.upsert({
    where: { key: "holy-bg-telugu-vyakhya" },
    create: {
      key: "holy-bg-telugu-vyakhya",
      displayName: "Holy Bhagavad Gita (Telugu commentary)",
      author: "Community / Unlicense corpus",
      license: "Unlicense",
      isDefault: false,
      isPublished: true,
    },
    update: { isPublished: true },
  });

  const teW2w = await prisma.translationSource.upsert({
    where: { key: "holy-bg-telugu-w2w" },
    create: {
      key: "holy-bg-telugu-w2w",
      displayName: "Holy Bhagavad Gita (Telugu word meanings)",
      author: "Community / Unlicense corpus",
      license: "Unlicense",
      isDefault: false,
      isPublished: true,
    },
    update: { isPublished: true },
  });

  console.log("[multilang] fetching Telugu corpus…");
  const teRes = await fetch(TE_URL);
  if (!teRes.ok) throw new Error(`Telugu fetch failed: ${teRes.status}`);
  const teRows = (await teRes.json()) as Array<{
    chapter: number;
    verse: number;
    commentry?: string;
    w2w_meaning?: string;
  }>;

  let teCommentary = 0;
  let teMeaning = 0;
  for (let i = 0; i < teRows.length; i += 1) {
    const row = teRows[i]!;
    const verseId = byKey.get(`${row.chapter}.${row.verse}`);
    if (!verseId) continue;

    const commentary = row.commentry ? cleanText(row.commentry) : "";
    if (commentary.length > 40) {
      await upsertTranslation({
        verseId,
        languageId: teLang.id,
        sourceId: teVyakhya.id,
        text: commentary,
      });
      teCommentary += 1;
    }

    const w2w = row.w2w_meaning ? cleanText(row.w2w_meaning) : "";
    if (w2w.length > 10) {
      await upsertTranslation({
        verseId,
        languageId: teLang.id,
        sourceId: teW2w.id,
        text: w2w.replace(/\s*—\s*/g, " — "),
      });
      teMeaning += 1;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`[multilang] telugu ${i + 1}/${teRows.length}`);
    }
  }

  console.log(
    `[multilang] telugu commentary=${teCommentary} w2w=${teMeaning}`,
  );

  const hiVyakhya = await prisma.translation.findMany({
    where: {
      isPublished: true,
      translationSource: { key: "ramsukhdas-vyakhya" },
      language: { code: "hi" },
    },
    select: { verseId: true, text: true },
  });
  console.log(`[multilang] hindi vyakhya rows=${hiVyakhya.length}`);

  for (const lang of INDIC_SCRIPTS) {
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      create: {
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        sortOrder: lang.sortOrder,
        isPublished: true,
      },
      update: { isPublished: true },
    });

    const source = await prisma.translationSource.upsert({
      where: { key: `ramsukhdas-vyakhya-${lang.code}` },
      create: {
        key: `ramsukhdas-vyakhya-${lang.code}`,
        displayName: `Ramsukhdas Vyakhya (${lang.name} script)`,
        author: "Swami Ramsukhdas (script via Sanscript)",
        license: "Unlicense source corpus / interim script form",
        isDefault: false,
        isPublished: true,
      },
      update: { isPublished: true },
    });

    let written = 0;
    for (let i = 0; i < hiVyakhya.length; i += BATCH) {
      const chunk = hiVyakhya.slice(i, i + BATCH);
      await prisma.$transaction(
        chunk.map((row) => {
          const text = Sanscript.t(row.text, "devanagari", lang.scheme);
          return prisma.translation.upsert({
            where: {
              verseId_languageId_translationSourceId: {
                verseId: row.verseId,
                languageId: language.id,
                translationSourceId: source.id,
              },
            },
            create: {
              verseId: row.verseId,
              languageId: language.id,
              translationSourceId: source.id,
              text,
              isPublished: true,
            },
            update: { text, isPublished: true },
          });
        }),
      );
      written += chunk.length;
      if (written % 100 === 0 || written === hiVyakhya.length) {
        console.log(`[multilang] ${lang.code} vyakhya ${written}/${hiVyakhya.length}`);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        teCommentary,
        teMeaning,
        hiSource: hiVyakhya.length,
        indicScripts: INDIC_SCRIPTS.map((l) => l.code),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
