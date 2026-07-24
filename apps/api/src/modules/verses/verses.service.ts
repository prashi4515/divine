import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  ContentRevisionDto,
  UpdateTranslationDto,
  UpdateVerseDto,
  VerseResponseDto,
  VerseTranslationDto,
} from "./verses.dto";

type VerseWithRelations = Prisma.VerseGetPayload<{
  include: {
    chapter: { include: { work: true } };
    translations: {
      include: { language: true; translationSource: true };
    };
  };
}>;

export type VerseIncludeMode = "full" | "reader";

/**
 * Native-content languages for the public reader payload.
 * kn/ta/ml meanings are derived client-side from Hindi — do NOT ship their
 * script-proxy rows (they were bloating chapter responses past 2MB and
 * defeating Next.js data cache).
 */
const READER_LANGUAGE_CODES = ["en", "hi", "te", "or"] as const;

/**
 * Script-proxy / heavy commentary — excluded from bulk reader payloads.
 * Commentary is lazy-loaded per verse on the client so chapter pages stay
 * under ~250KB and paint quickly (vyakhya alone was ~270KB of text on ch.2).
 */
const READER_EXCLUDED_SOURCE_KEYS = [
  "ramsukhdas-indic-script",
  "ramsukhdas-vyakhya",
  "ramsukhdas-vyakhya-kn",
  "ramsukhdas-vyakhya-ta",
  "ramsukhdas-vyakhya-ml",
  "ramsukhdas-vyakhya-or",
  "holy-bg-telugu-vyakhya",
] as const;

/** Languages exposed in the header switcher even when not in the payload. */
const READER_UI_LANGUAGES: Array<{
  code: string;
  name: string;
  nativeName: string | null;
}> = [
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
];

type PublishedChapterCacheEntry = {
  expiresAt: number;
  data: VerseResponseDto[];
  languages: Array<{ code: string; name: string; nativeName: string | null }>;
};

@Injectable()
export class VersesService implements OnModuleInit {
  private readonly logger = new Logger(VersesService.name);
  private readonly publishedChapterCache = new Map<string, PublishedChapterCacheEntry>();
  private readonly cacheTtlMs =
    process.env.NODE_ENV === "production" ? 600_000 : 120_000;
  private catalogLanguagesCache:
    | Array<{ code: string; name: string; nativeName: string | null }>
    | null = null;
  private catalogLanguagesExpiresAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Warm reader caches for all Gita chapters after boot so the first
   * visitor doesn't pay Neon cold-start + full chapter query latency.
   */
  onModuleInit(): void {
    void this.prewarmGitaReaderCache();
  }

  private async prewarmGitaReaderCache(): Promise<void> {
    const started = Date.now();
    try {
      for (let n = 1; n <= 18; n++) {
        await this.listByChapterPublicId(`bg.${n}`, {
          publishedOnly: true,
          include: "reader",
        });
      }
      this.logger.log(
        `Prewarmed Gita reader cache (18 chapters) in ${Date.now() - started}ms`,
      );
    } catch (error: unknown) {
      this.logger.warn(
        `Gita reader prewarm skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private cacheKey(chapterPublicId: string, include: VerseIncludeMode): string {
    // v5: reader drops all vyakhya (lazy-loaded per verse on the web).
    return `${chapterPublicId}:${include}:v5`;
  }

  private clearPublishedChapterCache(chapterPublicId?: string): void {
    if (!chapterPublicId) {
      this.publishedChapterCache.clear();
      return;
    }
    for (const key of this.publishedChapterCache.keys()) {
      if (key.startsWith(`${chapterPublicId}:`)) {
        this.publishedChapterCache.delete(key);
      }
    }
  }

  private async getCatalogLanguages(): Promise<
    Array<{ code: string; name: string; nativeName: string | null }>
  > {
    const now = Date.now();
    if (this.catalogLanguagesCache && now < this.catalogLanguagesExpiresAt) {
      return this.catalogLanguagesCache;
    }
    const rows = await this.prisma.language.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    this.catalogLanguagesCache = rows.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
    }));
    this.catalogLanguagesExpiresAt = now + this.cacheTtlMs;
    return this.catalogLanguagesCache;
  }

  async listByChapterPublicId(
    chapterPublicId: string,
    opts: { publishedOnly: boolean; include?: VerseIncludeMode },
  ): Promise<{ data: VerseResponseDto[]; languages: Array<{
    code: string;
    name: string;
    nativeName: string | null;
  }> }> {
    const include = opts.include ?? "reader";
    if (opts.publishedOnly) {
      const cached = this.publishedChapterCache.get(
        this.cacheKey(chapterPublicId, include),
      );
      if (cached && Date.now() < cached.expiresAt) {
        return { data: cached.data, languages: cached.languages };
      }
    }
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        publicId: chapterPublicId,
        ...(opts.publishedOnly ? { isPublished: true } : {}),
      },
      include: { work: true },
    });
    if (!chapter) {
      throw new NotFoundException(`Chapter "${chapterPublicId}" not found`);
    }

    const rows = await this.prisma.verse.findMany({
      where: {
        chapterId: chapter.id,
        ...(opts.publishedOnly ? { isPublished: true } : {}),
      },
      include: {
        translations: {
          where: opts.publishedOnly
            ? {
                isPublished: true,
                ...(include === "reader"
                  ? {
                      language: { code: { in: [...READER_LANGUAGE_CODES] } },
                      translationSource: {
                        key: { notIn: [...READER_EXCLUDED_SOURCE_KEYS] },
                      },
                    }
                  : {}),
              }
            : undefined,
          include: { language: true, translationSource: true },
          orderBy: [{ language: { sortOrder: "asc" } }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
    });

    const languageMap = new Map<
      string,
      { code: string; name: string; nativeName: string | null }
    >();
    languageMap.set("sa", {
      code: "sa",
      name: "Sanskrit",
      nativeName: "संस्कृतम्",
    });
    for (const row of rows) {
      for (const t of row.translations) {
        languageMap.set(t.language.code, {
          code: t.language.code,
          name: t.language.name,
          nativeName: t.language.nativeName,
        });
      }
    }

    // Reader: expose kn/ta/ml in the switcher even though their text is
    // derived client-side from Hindi (keeps payload under Next.js 2MB cache).
    if (include === "reader") {
      for (const lang of READER_UI_LANGUAGES) {
        if (!languageMap.has(lang.code)) {
          languageMap.set(lang.code, lang);
        }
      }
    }

    // Reader mode: skip scanning the full language catalog (extra round-trip).
    if (include === "full") {
      const catalog = await this.getCatalogLanguages();
      for (const lang of catalog) {
        if (!languageMap.has(lang.code)) {
          const has = rows.some((r) =>
            r.translations.some((t) => t.language.code === lang.code),
          );
          if (has || lang.code === "sa") {
            languageMap.set(lang.code, {
              code: lang.code,
              name: lang.name,
              nativeName: lang.nativeName,
            });
          }
        }
      }
    }

    const data = rows.map((row) => ({
      id: row.id,
      publicId: row.publicId,
      number: row.number,
      sanskritText: row.sanskritText,
      transliteration: row.transliteration,
      meaning: row.meaning,
      commentary: row.commentary,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      chapterPublicId: chapter.publicId,
      chapterNumber: chapter.number,
      workCode: chapter.work.code,
      translations: row.translations.map((t) => this.toTranslationDto(t)),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
    const languages = Array.from(languageMap.values());

    if (opts.publishedOnly) {
      this.publishedChapterCache.set(this.cacheKey(chapterPublicId, include), {
        expiresAt: Date.now() + this.cacheTtlMs,
        data,
        languages,
      });
    }

    return { data, languages };
  }

  async findPublishedByPublicId(publicId: string): Promise<VerseResponseDto> {
    const row = await this.prisma.verse.findFirst({
      where: { publicId, isPublished: true },
      include: {
        chapter: { include: { work: true } },
        translations: {
          where: { isPublished: true },
          include: { language: true, translationSource: true },
        },
      },
    });
    if (!row) throw new NotFoundException(`Verse "${publicId}" not found`);
    return this.toDto(row);
  }

  async getById(id: string): Promise<VerseResponseDto> {
    const row = await this.loadById(id);
    return this.toDto(row);
  }

  async update(
    id: string,
    input: UpdateVerseDto,
    createdBy?: string,
  ): Promise<VerseResponseDto> {
    const existing = await this.loadById(id);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.contentRevision.create({
          data: {
            entityType: "verse",
            entityId: existing.id,
            verseId: existing.id,
            createdBy: createdBy ?? null,
            note: input.note ?? "Autosave",
            snapshot: this.snapshot(existing),
          },
        });

        await tx.verse.update({
          where: { id },
          data: {
            sanskritText: input.sanskritText,
            transliteration: input.transliteration === undefined ? undefined : input.transliteration,
            meaning: input.meaning === undefined ? undefined : input.meaning,
            commentary: input.commentary === undefined ? undefined : input.commentary,
            seoTitle: input.seoTitle === undefined ? undefined : input.seoTitle,
            seoDescription:
              input.seoDescription === undefined ? undefined : input.seoDescription,
            sortOrder: input.sortOrder,
            isPublished: input.isPublished,
          },
        });

        if (input.translationText !== undefined) {
          const langCode = input.translationLanguageCode ?? "en";
          const language = await tx.language.findUnique({ where: { code: langCode } });
          if (!language) {
            throw new NotFoundException(`Language "${langCode}" not found`);
          }
          const source =
            (await tx.translationSource.findFirst({
              where: { isDefault: true },
            })) ??
            (await tx.translationSource.findFirst());
          if (!source) {
            throw new NotFoundException("No translation source configured");
          }

          const existingTranslation = await tx.translation.findFirst({
            where: {
              verseId: id,
              languageId: language.id,
              translationSourceId: source.id,
            },
          });

          if (existingTranslation) {
            await tx.contentRevision.create({
              data: {
                entityType: "translation",
                entityId: existingTranslation.id,
                verseId: id,
                createdBy: createdBy ?? null,
                note: input.note ?? "Translation update",
                snapshot: {
                  text: existingTranslation.text,
                  isPublished: existingTranslation.isPublished,
                },
              },
            });
            await tx.translation.update({
              where: { id: existingTranslation.id },
              data: { text: input.translationText },
            });
          } else {
            await tx.translation.create({
              data: {
                verseId: id,
                languageId: language.id,
                translationSourceId: source.id,
                text: input.translationText,
                isPublished: true,
              },
            });
          }
        }
      });

      await this.syncChapterVerseCount(existing.chapterId);
      this.clearPublishedChapterCache(existing.chapter.publicId);
      return this.getById(id);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update verse ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async updateTranslation(
    translationId: string,
    input: UpdateTranslationDto,
    createdBy?: string,
  ): Promise<VerseTranslationDto> {
    const existing = await this.prisma.translation.findUnique({
      where: { id: translationId },
      include: { language: true, translationSource: true },
    });
    if (!existing) throw new NotFoundException("Translation not found");

    await this.prisma.$transaction([
      this.prisma.contentRevision.create({
        data: {
          entityType: "translation",
          entityId: existing.id,
          verseId: existing.verseId,
          createdBy: createdBy ?? null,
          note: input.note ?? "Translation update",
          snapshot: { text: existing.text, isPublished: existing.isPublished },
        },
      }),
      this.prisma.translation.update({
        where: { id: translationId },
        data: {
          text: input.text,
          isPublished: input.isPublished,
        },
      }),
    ]);

    const updated = await this.prisma.translation.findUniqueOrThrow({
      where: { id: translationId },
      include: {
        language: true,
        translationSource: true,
        verse: { include: { chapter: true } },
      },
    });
    this.clearPublishedChapterCache(updated.verse.chapter.publicId);
    return this.toTranslationDto(updated);
  }

  async listRevisions(verseId: string): Promise<ContentRevisionDto[]> {
    await this.ensureVerse(verseId);
    const rows = await this.prisma.contentRevision.findMany({
      where: { verseId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((row) => ({
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
      snapshot: (row.snapshot ?? {}) as Record<string, unknown>,
    }));
  }

  private async loadById(id: string): Promise<VerseWithRelations> {
    const row = await this.prisma.verse.findUnique({
      where: { id },
      include: {
        chapter: { include: { work: true } },
        translations: {
          include: { language: true, translationSource: true },
          orderBy: [{ language: { sortOrder: "asc" } }],
        },
      },
    });
    if (!row) throw new NotFoundException(`Verse "${id}" not found`);
    return row;
  }

  private async ensureVerse(id: string): Promise<void> {
    const count = await this.prisma.verse.count({ where: { id } });
    if (!count) throw new NotFoundException(`Verse "${id}" not found`);
  }

  private async syncChapterVerseCount(chapterId: string): Promise<void> {
    const count = await this.prisma.verse.count({
      where: { chapterId, isPublished: true },
    });
    await this.prisma.chapter.update({
      where: { id: chapterId },
      data: { verseCount: count },
    });
  }

  private snapshot(row: VerseWithRelations): Prisma.InputJsonValue {
    return {
      publicId: row.publicId,
      number: row.number,
      sanskritText: row.sanskritText,
      transliteration: row.transliteration,
      meaning: row.meaning,
      commentary: row.commentary,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      translations: row.translations.map((t) => ({
        languageCode: t.language.code,
        sourceKey: t.translationSource.key,
        text: t.text,
        isPublished: t.isPublished,
      })),
    };
  }

  private toDto(row: VerseWithRelations): VerseResponseDto {
    return {
      id: row.id,
      publicId: row.publicId,
      number: row.number,
      sanskritText: row.sanskritText,
      transliteration: row.transliteration,
      meaning: row.meaning,
      commentary: row.commentary,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      chapterPublicId: row.chapter.publicId,
      chapterNumber: row.chapter.number,
      workCode: row.chapter.work.code,
      translations: row.translations.map((t) => this.toTranslationDto(t)),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toTranslationDto(
    t: VerseWithRelations["translations"][number],
  ): VerseTranslationDto {
    return {
      id: t.id,
      languageCode: t.language.code,
      languageName: t.language.name,
      sourceKey: t.translationSource.key,
      sourceDisplayName: t.translationSource.displayName,
      text: t.text,
      isPublished: t.isPublished,
    };
  }
}
