import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Chapter as PrismaChapter, Work as PrismaWork } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { ChapterResponseDto } from "./chapters.dto";

type ChapterWithWork = PrismaChapter & { work: PrismaWork };

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all published chapters, ordered by sortOrder ascending.
   * Includes parent work summary for list UIs.
   */
  async findPublished(): Promise<ChapterResponseDto[]> {
    try {
      const rows = await this.prisma.chapter.findMany({
        where: { isPublished: true },
        include: { work: true },
        orderBy: { sortOrder: "asc" },
      });

      return rows.map((row) => this.toDto(row));
    } catch (error: unknown) {
      this.logger.error(
        "Failed to list published chapters",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Returns a single published chapter by publicId (e.g. "bg.1").
   * Unpublished or missing chapters yield 404 — never leak drafts.
   */
  async findPublishedByPublicId(publicId: string): Promise<ChapterResponseDto> {
    try {
      const row = await this.prisma.chapter.findFirst({
        where: { publicId, isPublished: true },
        include: { work: true },
      });

      if (!row) {
        throw new NotFoundException(`Chapter "${publicId}" not found`);
      }

      return this.toDto(row);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to load chapter "${publicId}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private toDto(row: ChapterWithWork): ChapterResponseDto {
    return {
      id: row.id,
      publicId: row.publicId,
      number: row.number,
      title: row.title,
      verseCount: row.verseCount,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      work: {
        code: row.work.code,
        slug: row.work.slug,
        title: row.work.title,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
