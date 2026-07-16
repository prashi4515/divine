/**
 * Import verse word-meanings + commentaries from the Unlicense gita-data corpus
 * (same lineage as gita/gita — not copyrighted Gita Press print editions).
 *
 * - Swami Sivananda (EN): word-by-word → Verse.meaning, explanation → Verse.commentary
 * - Swami Ramsukhdas (HI): long vyakhya → Translation (source: ramsukhdas-vyakhya)
 *   shown when Hindi is selected (Gita Press–style clarity).
 *
 * Run: pnpm --filter @divine/api commentary:import
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE = "https://ravisiyer.github.io/gita-data/v1/commentaries";
const SIVANANDA_AUTHOR = 16;
const RAMSUKHDAS_AUTHOR = 1;
const LANG_EN = 1;
const LANG_HI = 2;

type CommentaryRow = {
  verseNumber: number;
  verse_id?: number;
  description: string;
};

function cleanWhitespace(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * gita-data `verseNumber` is a global id (1–701). Prefer chapter.verse from the
 * description prefix (`13.1 …`, `।।2.47।। …`).
 */
function parseChapterVerse(
  description: string,
  chapterFallback: number,
): { chapter: number; verse: number } | null {
  const dotted = description.match(/^\s*(?:।।)?\s*(\d+)\s*[.।]\s*(\d+)/u);
  if (dotted) {
    return {
      chapter: Number.parseInt(dotted[1]!, 10),
      verse: Number.parseInt(dotted[2]!, 10),
    };
  }
  // Ramsukhdas sometimes opens with `1।।व्याख्या` (verse only in chapter file).
  const verseOnly = description.match(/^\s*(?:।।)?\s*(\d+)\s*।।/u);
  if (verseOnly) {
    return {
      chapter: chapterFallback,
      verse: Number.parseInt(verseOnly[1]!, 10),
    };
  }
  return null;
}

/** Strip leading verse markers like `1.1` or `1।।`. */
function stripVersePrefix(text: string): string {
  return text
    .replace(/^\s*(?:।।)?\s*\d+\s*[.।]\s*\d+\s*(?:।।)?\s*/u, "")
    .replace(/^\s*\d+\s*(?:।।)?\s*/u, "")
    .trim();
}

/**
 * Sivananda rows mix padacheda + optional commentary, separated by "Commentary".
 */
function parseSivananda(raw: string): { meaning: string | null; commentary: string | null } {
  let text = stripVersePrefix(cleanWhitespace(raw));
  text = text.replace(/\.?\s*No Commentary\.?\s*$/i, "").trim();
  if (!text) return { meaning: null, commentary: null };

  const split = text.split(/\.?\s*Commentary\s+/i);
  const head = (split[0] ?? "")
    .replace(/\?\s*/g, "; ")
    .replace(/;\s*$/, "")
    .replace(/\.?\s*No Commentary\.?\s*$/i, "")
    .trim();
  const tail = split
    .slice(1)
    .join(" ")
    .replace(/^No Commentary\.?\s*/i, "")
    .trim();

  const meaning = head.length > 0 ? head : null;
  if (!tail) return { meaning, commentary: null };
  return { meaning, commentary: cleanWhitespace(tail) };
}

function parseRamsukhdas(raw: string): string | null {
  let text = stripVersePrefix(cleanWhitespace(raw));
  text = text.replace(/^व्याख्या--\s*/u, "").trim();
  // Drop footnote markers like (टिप्पणी प0 2.1)
  text = text.replace(/\(टिप्पणी[^)]*\)/gu, "").trim();
  if (!text || text.length < 20) return null;
  return text;
}

async function fetchChapter(
  authorId: number,
  langId: number,
  chapter: number,
): Promise<CommentaryRow[]> {
  const url = `${BASE}/author${authorId}/lang${langId}/chapter${chapter}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed ${url}: ${res.status}`);
  }
  const data = (await res.json()) as CommentaryRow[];
  return data;
}

async function main() {
  const verses = await prisma.verse.findMany({
    where: { chapter: { work: { code: "bg" } } },
    select: {
      id: true,
      number: true,
      publicId: true,
      chapter: { select: { number: true } },
    },
  });

  const byChapterVerse = new Map<string, string>();
  for (const v of verses) {
    byChapterVerse.set(`${v.chapter.number}.${v.number}`, v.id);
  }

  const hi = await prisma.language.upsert({
    where: { code: "hi" },
    create: {
      code: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      sortOrder: 20,
      isPublished: true,
    },
    update: { isPublished: true },
  });

  const vyakhyaSource = await prisma.translationSource.upsert({
    where: { key: "ramsukhdas-vyakhya" },
    create: {
      key: "ramsukhdas-vyakhya",
      displayName: "Ramsukhdas Vyakhya (Hindi)",
      author: "Swami Ramsukhdas",
      license: "Unlicense (gita/gita corpus)",
      isDefault: false,
      isPublished: true,
    },
    update: {
      displayName: "Ramsukhdas Vyakhya (Hindi)",
      author: "Swami Ramsukhdas",
      license: "Unlicense (gita/gita corpus)",
      isPublished: true,
    },
  });

  let enMeaning = 0;
  let enCommentary = 0;
  let hiVyakhya = 0;

  for (let chapter = 1; chapter <= 18; chapter++) {
    const sivananda = await fetchChapter(SIVANANDA_AUTHOR, LANG_EN, chapter);
    for (const row of sivananda) {
      const ref = parseChapterVerse(row.description, chapter);
      if (!ref) continue;
      const verseId = byChapterVerse.get(`${ref.chapter}.${ref.verse}`);
      if (!verseId) continue;
      const parsed = parseSivananda(row.description);
      if (!parsed.meaning && !parsed.commentary) continue;
      await prisma.verse.update({
        where: { id: verseId },
        data: {
          meaning: parsed.meaning,
          commentary: parsed.commentary,
        },
      });
      if (parsed.meaning) enMeaning += 1;
      if (parsed.commentary) enCommentary += 1;
    }

    const ramsukhdas = await fetchChapter(RAMSUKHDAS_AUTHOR, LANG_HI, chapter);
    for (const row of ramsukhdas) {
      const ref = parseChapterVerse(row.description, chapter);
      if (!ref) continue;
      const verseId = byChapterVerse.get(`${ref.chapter}.${ref.verse}`);
      if (!verseId) continue;
      const text = parseRamsukhdas(row.description);
      if (!text) continue;
      await prisma.translation.upsert({
        where: {
          verseId_languageId_translationSourceId: {
            verseId,
            languageId: hi.id,
            translationSourceId: vyakhyaSource.id,
          },
        },
        create: {
          verseId,
          languageId: hi.id,
          translationSourceId: vyakhyaSource.id,
          text,
          isPublished: true,
        },
        update: { text, isPublished: true },
      });
      hiVyakhya += 1;
    }

    console.log(`chapter ${chapter}: done`);
  }

  console.log(
    JSON.stringify(
      { enMeaning, enCommentary, hiVyakhya, verses: verses.length },
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
