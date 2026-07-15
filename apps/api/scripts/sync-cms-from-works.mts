/**
 * After content-import loads Work/Chapter/Verse rows, link CMS Scriptures
 * so Library + public reader share one catalog.
 *
 * Run: pnpm --filter @divine/api exec node --env-file=.env scripts/sync-cms-from-works.mts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRESETS: Record<
  string,
  {
    name: string;
    religion: string;
    originalLanguage: string;
    structureLevels: string[];
    shortName?: string;
  }
> = {
  bg: {
    name: "Bhagavad Gita",
    religion: "Hinduism",
    originalLanguage: "sa",
    structureLevels: ["Chapter", "Verse"],
    shortName: "Gita",
  },
  quran: {
    name: "Quran",
    religion: "Islam",
    originalLanguage: "ar",
    structureLevels: ["Surah", "Verse"],
    shortName: "Quran",
  },
  bible: {
    name: "Bible",
    religion: "Christianity",
    originalLanguage: "en",
    structureLevels: ["Book", "Chapter", "Verse"],
    shortName: "Bible",
  },
};

async function syncWork(workCode: string): Promise<void> {
  const work = await prisma.work.findUnique({
    where: { code: workCode },
    include: { chapters: { orderBy: { sortOrder: "asc" } } },
  });
  if (!work) {
    console.log(`[sync] skip ${workCode}: work missing`);
    return;
  }

  const preset = PRESETS[workCode] ?? {
    name: work.title,
    religion: "Other",
    originalLanguage: "en",
    structureLevels: ["Chapter", "Verse"],
  };

  const [verseCount, translationCount] = await Promise.all([
    prisma.verse.count({ where: { chapter: { workId: work.id } } }),
    prisma.translation.count({
      where: { verse: { chapter: { workId: work.id } } },
    }),
  ]);

  const scripture = await prisma.scripture.upsert({
    where: { slug: work.slug },
    create: {
      workId: work.id,
      name: preset.name,
      slug: work.slug,
      shortName: preset.shortName ?? null,
      description: work.description,
      religion: preset.religion,
      originalLanguage: preset.originalLanguage,
      structureLevels: preset.structureLevels,
      status: work.isPublished ? "published" : "draft",
      isPublished: work.isPublished,
      visibility: work.isPublished ? "public" : "private",
      defaultLanguage: "en",
      readingDirection: workCode === "quran" ? "rtl" : "ltr",
      sortOrder: work.sortOrder,
      chapterCount: work.chapters.length,
      verseCount,
      translationCount,
    },
    update: {
      workId: work.id,
      name: preset.name,
      description: work.description,
      religion: preset.religion,
      originalLanguage: preset.originalLanguage,
      structureLevels: preset.structureLevels,
      status: work.isPublished ? "published" : "draft",
      isPublished: work.isPublished,
      visibility: work.isPublished ? "public" : "private",
      chapterCount: work.chapters.length,
      verseCount,
      translationCount,
      sortOrder: work.sortOrder,
    },
  });

  const chapterLabel =
    preset.structureLevels.find((l) =>
      ["Chapter", "Surah", "Section"].includes(l),
    ) ?? "Chapter";

  await prisma.scriptureNode.deleteMany({ where: { scriptureId: scripture.id } });
  let order = 0;
  for (const chapter of work.chapters) {
    await prisma.scriptureNode.create({
      data: {
        scriptureId: scripture.id,
        label: chapterLabel,
        title: chapter.title ?? `${chapterLabel} ${chapter.number}`,
        sortOrder: order++,
      },
    });
  }

  console.log(
    `[sync] ${workCode}: scripture=${scripture.id} chapters=${work.chapters.length} verses=${verseCount} translations=${translationCount}`,
  );
}

async function main(): Promise<void> {
  // Ensure Arabic exists for Quran samples
  await prisma.language.upsert({
    where: { code: "ar" },
    create: {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      sortOrder: 5,
      isPublished: true,
    },
    update: {
      name: "Arabic",
      nativeName: "العربية",
      isPublished: true,
    },
  });

  await prisma.language.upsert({
    where: { code: "sa" },
    create: {
      code: "sa",
      name: "Sanskrit",
      nativeName: "संस्कृतम्",
      sortOrder: 1,
      isPublished: true,
    },
    update: {
      name: "Sanskrit",
      nativeName: "संस्कृतम्",
      isPublished: true,
    },
  });

  for (const code of ["bg", "quran", "bible"]) {
    await syncWork(code);
  }
}

main()
  .catch((error: unknown) => {
    console.error("[sync] FAILED:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
