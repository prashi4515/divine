/**
 * Validator — semantic + referential integrity over a parsed document.
 *
 * Runs AFTER Parser. May query the DB for existing natural keys so
 * references can resolve against either the file OR the catalog.
 *
 * Does NOT write. Duplicate-in-file and publicId format live here.
 */

import type { PrismaClient } from "@prisma/client";
import type { ContentImportV1 } from "../schema/index.mts";
import { IssueCollector } from "../reporter/issues.mts";
import { emptyCounts, type EntityCounts } from "../reporter/report.mts";

export interface ValidateContext {
  prisma: PrismaClient;
  /** When true, treat existing DB rows as OK for idempotent re-import (info, not error). */
  allowDbDuplicates: boolean;
}

export interface ValidateResult {
  ok: boolean;
  issues: IssueCollector;
  planned: EntityCounts;
}

function publicIdForChapter(workCode: string, chapterNumber: number): string {
  return `${workCode}.${chapterNumber}`;
}

function publicIdForVerse(
  workCode: string,
  chapterNumber: number,
  verseNumber: number,
): string {
  return `${workCode}.${chapterNumber}.${verseNumber}`;
}

export async function validateDocument(
  doc: ContentImportV1,
  ctx: ValidateContext,
): Promise<ValidateResult> {
  const issues = new IssueCollector();
  const planned = emptyCounts();

  planned.works = 1;
  planned.languages = doc.languages.length;
  planned.translationSources = doc.translationSources.length;
  planned.topics = doc.topics.length;
  planned.emotions = doc.emotions.length;
  planned.chapters = doc.chapters.length;

  // --- In-file catalogs (natural keys) ---------------------------------
  const langCodes = new Set<string>();
  for (let i = 0; i < doc.languages.length; i++) {
    const code = doc.languages[i]!.code;
    if (langCodes.has(code)) {
      issues.error(
        "DUP_IN_FILE",
        `$.languages[${i}].code`,
        `Duplicate language code "${code}" in file`,
      );
    }
    langCodes.add(code);
  }

  const sourceKeys = new Set<string>();
  for (let i = 0; i < doc.translationSources.length; i++) {
    const key = doc.translationSources[i]!.key;
    if (sourceKeys.has(key)) {
      issues.error(
        "DUP_IN_FILE",
        `$.translationSources[${i}].key`,
        `Duplicate translation source key "${key}" in file`,
      );
    }
    sourceKeys.add(key);
  }

  const topicSlugs = new Set<string>();
  for (let i = 0; i < doc.topics.length; i++) {
    const slug = doc.topics[i]!.slug;
    if (topicSlugs.has(slug)) {
      issues.error(
        "DUP_IN_FILE",
        `$.topics[${i}].slug`,
        `Duplicate topic slug "${slug}" in file`,
      );
    }
    topicSlugs.add(slug);
  }

  const emotionSlugs = new Set<string>();
  for (let i = 0; i < doc.emotions.length; i++) {
    const slug = doc.emotions[i]!.slug;
    if (emotionSlugs.has(slug)) {
      issues.error(
        "DUP_IN_FILE",
        `$.emotions[${i}].slug`,
        `Duplicate emotion slug "${slug}" in file`,
      );
    }
    emotionSlugs.add(slug);
  }

  // --- Chapters / verses uniqueness + publicId format ------------------
  const chapterNumbers = new Set<number>();
  const chapterPublicIds = new Set<string>();
  const versePublicIds = new Set<string>();

  for (let ci = 0; ci < doc.chapters.length; ci++) {
    const ch = doc.chapters[ci]!;
    const chPath = `$.chapters[${ci}]`;

    if (chapterNumbers.has(ch.number)) {
      issues.error(
        "DUP_IN_FILE",
        `${chPath}.number`,
        `Duplicate chapter number ${ch.number}`,
      );
    }
    chapterNumbers.add(ch.number);

    if (chapterPublicIds.has(ch.publicId)) {
      issues.error(
        "DUP_IN_FILE",
        `${chPath}.publicId`,
        `Duplicate chapter publicId "${ch.publicId}"`,
      );
    }
    chapterPublicIds.add(ch.publicId);

    const expectedChId = publicIdForChapter(doc.work.code, ch.number);
    if (ch.publicId !== expectedChId) {
      issues.error(
        "PUBLIC_ID_FORMAT",
        `${chPath}.publicId`,
        `Expected "${expectedChId}", got "${ch.publicId}"`,
        "publicId must be {workCode}.{chapterNumber}",
      );
    }

    const verseNumbers = new Set<number>();
    for (let vi = 0; vi < ch.verses.length; vi++) {
      const v = ch.verses[vi]!;
      const vPath = `${chPath}.verses[${vi}]`;
      planned.verses += 1;
      planned.translations += v.translations.length;
      planned.verseTopics += v.topicSlugs.length;
      planned.verseEmotions += v.emotionSlugs.length;

      if (verseNumbers.has(v.number)) {
        issues.error(
          "DUP_IN_FILE",
          `${vPath}.number`,
          `Duplicate verse number ${v.number} in chapter ${ch.number}`,
        );
      }
      verseNumbers.add(v.number);

      if (versePublicIds.has(v.publicId)) {
        issues.error(
          "DUP_IN_FILE",
          `${vPath}.publicId`,
          `Duplicate verse publicId "${v.publicId}"`,
        );
      }
      versePublicIds.add(v.publicId);

      const expectedVId = publicIdForVerse(doc.work.code, ch.number, v.number);
      if (v.publicId !== expectedVId) {
        issues.error(
          "PUBLIC_ID_FORMAT",
          `${vPath}.publicId`,
          `Expected "${expectedVId}", got "${v.publicId}"`,
          "publicId must be {workCode}.{chapterNumber}.{verseNumber}",
        );
      }

      // Translation refs + in-verse duplicate (lang, source) pairs
      const translationPairs = new Set<string>();
      for (let ti = 0; ti < v.translations.length; ti++) {
        const t = v.translations[ti]!;
        const tPath = `${vPath}.translations[${ti}]`;
        const pair = `${t.languageCode}::${t.sourceKey}`;
        if (translationPairs.has(pair)) {
          issues.error(
            "DUP_IN_FILE",
            tPath,
            `Duplicate translation for language "${t.languageCode}" + source "${t.sourceKey}"`,
          );
        }
        translationPairs.add(pair);
      }

      // Topic / emotion slug dups within verse
      const seenTopics = new Set<string>();
      for (let si = 0; si < v.topicSlugs.length; si++) {
        const slug = v.topicSlugs[si]!;
        if (seenTopics.has(slug)) {
          issues.error(
            "DUP_IN_FILE",
            `${vPath}.topicSlugs[${si}]`,
            `Duplicate topic slug "${slug}" on verse`,
          );
        }
        seenTopics.add(slug);
      }
      const seenEmotions = new Set<string>();
      for (let si = 0; si < v.emotionSlugs.length; si++) {
        const slug = v.emotionSlugs[si]!;
        if (seenEmotions.has(slug)) {
          issues.error(
            "DUP_IN_FILE",
            `${vPath}.emotionSlugs[${si}]`,
            `Duplicate emotion slug "${slug}" on verse`,
          );
        }
        seenEmotions.add(slug);
      }
    }
  }

  // --- DB lookups for referential integrity ----------------------------
  let dbLanguages: { code: string }[];
  let dbSources: { key: string }[];
  let dbTopics: { slug: string }[];
  let dbEmotions: { slug: string }[];
  let existingWork: { id: string; code: string; slug: string } | null;
  let existingChapters: { publicId: string }[];
  let existingVerses: { publicId: string }[];

  try {
    [dbLanguages, dbSources, dbTopics, dbEmotions, existingWork, existingChapters, existingVerses] =
      await Promise.all([
        ctx.prisma.language.findMany({ select: { code: true } }),
        ctx.prisma.translationSource.findMany({ select: { key: true } }),
        ctx.prisma.topic.findMany({ select: { slug: true } }),
        ctx.prisma.emotion.findMany({ select: { slug: true } }),
        ctx.prisma.work.findUnique({
          where: { code: doc.work.code },
          select: { id: true, code: true, slug: true },
        }),
        ctx.prisma.chapter.findMany({
          where: { publicId: { in: [...chapterPublicIds] } },
          select: { publicId: true },
        }),
        ctx.prisma.verse.findMany({
          where: { publicId: { in: [...versePublicIds] } },
          select: { publicId: true },
        }),
      ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    issues.error(
      "REF_MISSING",
      "$",
      `Cannot reach database for referential checks: ${message.split("\n")[0]}`,
      "Ensure DIVINE_DATABASE_URL is set and Neon is reachable",
    );
    return { ok: false, issues, planned };
  }

  const dbLangSet = new Set(dbLanguages.map((r) => r.code));
  const dbSourceSet = new Set(dbSources.map((r) => r.key));
  const dbTopicSet = new Set(dbTopics.map((r) => r.slug));
  const dbEmotionSet = new Set(dbEmotions.map((r) => r.slug));
  const dbChapterSet = new Set(existingChapters.map((r) => r.publicId));
  const dbVerseSet = new Set(existingVerses.map((r) => r.publicId));

  const resolvableLang = new Set([...langCodes, ...dbLangSet]);
  const resolvableSource = new Set([...sourceKeys, ...dbSourceSet]);
  const resolvableTopic = new Set([...topicSlugs, ...dbTopicSet]);
  const resolvableEmotion = new Set([...emotionSlugs, ...dbEmotionSet]);

  // Work slug collision with a different code
  if (existingWork && existingWork.slug !== doc.work.slug) {
    const other = await ctx.prisma.work.findUnique({
      where: { slug: doc.work.slug },
      select: { code: true },
    });
    if (other && other.code !== doc.work.code) {
      issues.error(
        "DUP_IN_DB",
        "$.work.slug",
        `Slug "${doc.work.slug}" already used by work "${other.code}"`,
      );
    }
  } else if (!existingWork) {
    const slugOwner = await ctx.prisma.work.findUnique({
      where: { slug: doc.work.slug },
      select: { code: true },
    });
    if (slugOwner) {
      issues.error(
        "DUP_IN_DB",
        "$.work.slug",
        `Slug "${doc.work.slug}" already used by work "${slugOwner.code}"`,
      );
    }
  }

  if (existingWork && ctx.allowDbDuplicates) {
    issues.info(
      "DUP_IN_DB",
      "$.work.code",
      `Work "${doc.work.code}" already exists — will upsert (idempotent)`,
    );
  }

  for (const publicId of chapterPublicIds) {
    if (dbChapterSet.has(publicId) && ctx.allowDbDuplicates) {
      issues.info(
        "DUP_IN_DB",
        `$.chapters[publicId=${publicId}]`,
        `Chapter already exists — will upsert`,
      );
    }
  }
  for (const publicId of versePublicIds) {
    if (dbVerseSet.has(publicId) && ctx.allowDbDuplicates) {
      issues.info(
        "DUP_IN_DB",
        `$.verses[publicId=${publicId}]`,
        `Verse already exists — will upsert`,
      );
    }
  }

  // Resolve translation / taxonomy refs
  for (let ci = 0; ci < doc.chapters.length; ci++) {
    const ch = doc.chapters[ci]!;
    for (let vi = 0; vi < ch.verses.length; vi++) {
      const v = ch.verses[vi]!;
      const vPath = `$.chapters[${ci}].verses[${vi}]`;

      for (let ti = 0; ti < v.translations.length; ti++) {
        const t = v.translations[ti]!;
        const tPath = `${vPath}.translations[${ti}]`;
        if (!resolvableLang.has(t.languageCode)) {
          issues.error(
            "REF_MISSING",
            `${tPath}.languageCode`,
            `Language "${t.languageCode}" not in file or database`,
            "Declare it under $.languages or seed the catalog first",
          );
        }
        if (!resolvableSource.has(t.sourceKey)) {
          issues.error(
            "REF_MISSING",
            `${tPath}.sourceKey`,
            `Translation source "${t.sourceKey}" not in file or database`,
            "Declare it under $.translationSources or seed the catalog first",
          );
        }
      }

      for (let si = 0; si < v.topicSlugs.length; si++) {
        const slug = v.topicSlugs[si]!;
        if (!resolvableTopic.has(slug)) {
          issues.error(
            "REF_MISSING",
            `${vPath}.topicSlugs[${si}]`,
            `Topic "${slug}" not in file or database`,
          );
        }
      }
      for (let si = 0; si < v.emotionSlugs.length; si++) {
        const slug = v.emotionSlugs[si]!;
        if (!resolvableEmotion.has(slug)) {
          issues.error(
            "REF_MISSING",
            `${vPath}.emotionSlugs[${si}]`,
            `Emotion "${slug}" not in file or database`,
          );
        }
      }
    }
  }

  return { ok: !issues.hasErrors, issues, planned };
}
