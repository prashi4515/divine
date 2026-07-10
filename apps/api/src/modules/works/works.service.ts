import { Injectable, Logger } from "@nestjs/common";
import type { Work as PrismaWork } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { WorkResponseDto } from "./works.dto";

@Injectable()
export class WorksService {
  private readonly logger = new Logger(WorksService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all published works, ordered by sortOrder ascending.
   * Unpublished catalog rows are never exposed on this public endpoint.
   */
  async findPublished(): Promise<WorkResponseDto[]> {
    try {
      const rows = await this.prisma.work.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      });

      return rows.map((row) => this.toDto(row));
    } catch (error: unknown) {
      this.logger.error(
        "Failed to list published works",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private toDto(row: PrismaWork): WorkResponseDto {
    return {
      id: row.id,
      code: row.code,
      slug: row.slug,
      title: row.title,
      description: row.description,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
