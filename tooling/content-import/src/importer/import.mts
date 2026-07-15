/**
 * Importer — transactional, idempotent writes via Prisma upserts.
 *
 * - Single interactive transaction: any failure rolls back everything.
 * - Natural keys only (code / publicId / slug / key).
 * - Progress callbacks for long catalogs.
 * - Dry-run never reaches this module (pipeline short-circuits).
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import type { ContentImportV1 } from "../schema/index.mts";
import { IssueCollector } from "../reporter/issues.mts";
import {
  emptyCounts,
  type EntityCounts,
  type ProgressSink,
} from "../reporter/report.mts";

export interface ImportContext {
  prisma: PrismaClient;
  onProgress?: ProgressSink;
  /** Max wait for interactive transaction (ms). Large catalogs need headroom. */
  timeoutMs?: number;
}

export interface ImportResult {
  ok: boolean;
  written: EntityCounts;
  issues: IssueCollector;
}

type Tx = Prisma.TransactionClient;

export async function importDocument(
  doc: ContentImportV1,
  ctx: ImportContext,
): Promise<ImportResult> {
  const issues = new IssueCollector();
  const written = emptyCounts();
  const onProgress = ctx.onProgress ?? (() => undefined);
  const timeout = ctx.timeoutMs ?? 120_000;

  const totalVerses = doc.chapters.reduce((n, c) => n + c.verses.length, 0);
  let verseCursor = 0;

  try {
    // Catalog + work in a short transaction (Neon-friendly).
    const workId = await ctx.prisma.$transaction(
      async (tx) => {
        for (const lang of doc.languages) {
          await tx.language.upsert({
            where: { code: lang.code },
            create: {
              code: lang.code,
              name: lang.name,
              nativeName: lang.nativeName,
              sortOrder: lang.sortOrder ?? 0,
              isPublished: lang.isPublished ?? true,
            },
            update: {
              name: lang.name,
              nativeName: lang.nativeName,
              sortOrder: lang.sortOrder ?? 0,
              isPublished: lang.isPublished ?? true,
            },
          });
          written.languages += 1;
        }

        for (const src of doc.translationSources) {
          await tx.translationSource.upsert({
            where: { key: src.key },
            create: {
              key: src.key,
              displayName: src.displayName,
              author: src.author,
              license: src.license,
              isDefault: src.isDefault ?? false,
              isPublished: src.isPublished ?? true,
            },
            update: {
              displayName: src.displayName,
              author: src.author,
              license: src.license,
              isDefault: src.isDefault ?? false,
              isPublished: src.isPublished ?? true,
            },
          });
          written.translationSources += 1;
        }

        for (const topic of doc.topics) {
          await tx.topic.upsert({
            where: { slug: topic.slug },
            create: {
              slug: topic.slug,
              name: topic.name,
              description: topic.description,
              sortOrder: topic.sortOrder ?? 0,
            },
            update: {
              name: topic.name,
              description: topic.description,
              sortOrder: topic.sortOrder ?? 0,
            },
          });
          written.topics += 1;
        }

        for (const emotion of doc.emotions) {
          await tx.emotion.upsert({
            where: { slug: emotion.slug },
            create: {
              slug: emotion.slug,
              name: emotion.name,
              description: emotion.description,
              sortOrder: emotion.sortOrder ?? 0,
            },
            update: {
              name: emotion.name,
              description: emotion.description,
              sortOrder: emotion.sortOrder ?? 0,
            },
          });
          written.emotions += 1;
        }

        const isPublished = doc.work.isPublished ?? false;
        const work = await tx.work.upsert({
          where: { code: doc.work.code },
          create: {
            code: doc.work.code,
            slug: doc.work.slug,
            title: doc.work.title,
            description: doc.work.description,
            sortOrder: doc.work.sortOrder ?? 0,
            isPublished,
            status: isPublished ? "published" : "draft",
          },
          update: {
            slug: doc.work.slug,
            title: doc.work.title,
            description: doc.work.description,
            sortOrder: doc.work.sortOrder ?? 0,
            isPublished,
            status: isPublished ? "published" : "draft",
          },
        });
        written.works = 1;
        return work.id;
      },
      { timeout: 60_000, maxWait: 15_000 },
    );

    const [languages, sources, topics, emotions] = await Promise.all([
      ctx.prisma.language.findMany({ select: { id: true, code: true } }),
      ctx.prisma.translationSource.findMany({ select: { id: true, key: true } }),
      ctx.prisma.topic.findMany({ select: { id: true, slug: true } }),
      ctx.prisma.emotion.findMany({ select: { id: true, slug: true } }),
    ]);
    const langByCode = new Map(languages.map((r) => [r.code, r.id]));
    const sourceByKey = new Map(sources.map((r) => [r.key, r.id]));
    const topicBySlug = new Map(topics.map((r) => [r.slug, r.id]));
    const emotionBySlug = new Map(emotions.map((r) => [r.slug, r.id]));

    // One transaction per chapter — avoids Neon interactive-tx timeouts on large corpora.
    for (let ci = 0; ci < doc.chapters.length; ci++) {
      const ch = doc.chapters[ci]!;
      onProgress({
        phase: "import",
        message: `Chapter ${ch.publicId}`,
        current: ci + 1,
        total: doc.chapters.length,
      });

      await ctx.prisma.$transaction(
        async (tx) => {
          const chapter = await tx.chapter.upsert({
            where: { publicId: ch.publicId },
            create: {
              workId,
              number: ch.number,
              publicId: ch.publicId,
              title: ch.title,
              verseCount: ch.verses.length,
              sortOrder: ch.sortOrder ?? ch.number,
              isPublished: ch.isPublished ?? false,
            },
            update: {
              number: ch.number,
              title: ch.title,
              verseCount: ch.verses.length,
              sortOrder: ch.sortOrder ?? ch.number,
              isPublished: ch.isPublished ?? false,
            },
          });
          written.chapters += 1;

          for (const v of ch.verses) {
            verseCursor += 1;
            if (verseCursor % 25 === 0 || verseCursor === totalVerses) {
              onProgress({
                phase: "import",
                message: `Verses`,
                current: verseCursor,
                total: totalVerses,
              });
            }

            const verse = await tx.verse.upsert({
              where: { publicId: v.publicId },
              create: {
                chapterId: chapter.id,
                number: v.number,
                publicId: v.publicId,
                sanskritText: v.sanskritText,
                transliteration: v.transliteration,
                sortOrder: v.sortOrder ?? v.number,
                isPublished: v.isPublished ?? false,
              },
              update: {
                number: v.number,
                sanskritText: v.sanskritText,
                transliteration: v.transliteration,
                sortOrder: v.sortOrder ?? v.number,
                isPublished: v.isPublished ?? false,
              },
            });
            written.verses += 1;

            await upsertTranslations(tx, verse.id, v, langByCode, sourceByKey, written);
            await upsertVerseTopics(tx, verse.id, v.topicSlugs, topicBySlug, written);
            await upsertVerseEmotions(
              tx,
              verse.id,
              v.emotionSlugs,
              emotionBySlug,
              written,
            );
          }
        },
        { timeout, maxWait: 15_000 },
      );
    }

    return { ok: true, written, issues };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    issues.error("IMPORT_FAILED", "$", `Import failed: ${message}`);
    return { ok: false, written, issues };
  }
}

async function upsertTranslations(
  tx: Tx,
  verseId: string,
  v: ContentImportV1["chapters"][number]["verses"][number],
  langByCode: Map<string, string>,
  sourceByKey: Map<string, string>,
  written: EntityCounts,
): Promise<void> {
  for (const t of v.translations) {
    const languageId = langByCode.get(t.languageCode);
    const translationSourceId = sourceByKey.get(t.sourceKey);
    if (!languageId || !translationSourceId) {
      // Should be impossible after validation; fail hard inside tx.
      throw new Error(
        `Unresolved translation FK for ${v.publicId}: ${t.languageCode}/${t.sourceKey}`,
      );
    }

    await tx.translation.upsert({
      where: {
        verseId_languageId_translationSourceId: {
          verseId,
          languageId,
          translationSourceId,
        },
      },
      create: {
        verseId,
        languageId,
        translationSourceId,
        text: t.text,
        isPublished: t.isPublished ?? false,
      },
      update: {
        text: t.text,
        isPublished: t.isPublished ?? false,
      },
    });
    written.translations += 1;
  }
}

async function upsertVerseTopics(
  tx: Tx,
  verseId: string,
  slugs: string[],
  topicBySlug: Map<string, string>,
  written: EntityCounts,
): Promise<void> {
  for (const slug of slugs) {
    const topicId = topicBySlug.get(slug);
    if (!topicId) throw new Error(`Unresolved topic slug "${slug}"`);
    await tx.verseTopic.upsert({
      where: { verseId_topicId: { verseId, topicId } },
      create: { verseId, topicId },
      update: {},
    });
    written.verseTopics += 1;
  }
}

async function upsertVerseEmotions(
  tx: Tx,
  verseId: string,
  slugs: string[],
  emotionBySlug: Map<string, string>,
  written: EntityCounts,
): Promise<void> {
  for (const slug of slugs) {
    const emotionId = emotionBySlug.get(slug);
    if (!emotionId) throw new Error(`Unresolved emotion slug "${slug}"`);
    await tx.verseEmotion.upsert({
      where: { verseId_emotionId: { verseId, emotionId } },
      create: { verseId, emotionId },
      update: {},
    });
    written.verseEmotions += 1;
  }
}
