import {
  Injectable,
  Logger,
  NotFoundException,
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
      include: { language: true, translationSource: true };
    };
  };
}>;

@Injectable()
export class VersesService {
  private readonly logger = new Logger(VersesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listByChapterPublicId(
    chapterPublicId: string,
    opts: { publishedOnly: boolean },
  ): Promise<{ data: VerseResponseDto[]; languages: Array<{
    code: string;
    name: string;
    nativeName: string | null;
  }> }> {
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
        chapter: { include: { work: true } },
        translations: {
          where: opts.publishedOnly ? { isPublished: true } : undefined,
          include: { language: true, translationSource: true },
          orderBy: [{ language: { sortOrder: "asc" } }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
    });

    const languageMap = new Map<string, { code: string; name: string; nativeName: string | null }>();
    languageMap.set("sa", { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" });
    for (const row of rows) {
      for (const t of row.translations) {
        languageMap.set(t.language.code, {
          code: t.language.code,
          name: t.language.name,
          nativeName: t.language.nativeName,
        });
      }
    }

    // Always expose catalog languages that exist for this work's translations
    const catalog = await this.prisma.language.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    for (const lang of catalog) {
      if (!languageMap.has(lang.code)) {
        // include only if at least one translation exists in this chapter
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

    return {
      data: rows.map((row) => this.toDto(row)),
      languages: Array.from(languageMap.values()),
    };
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
      include: { language: true, translationSource: true },
    });
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
