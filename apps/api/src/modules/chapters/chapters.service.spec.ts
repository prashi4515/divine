import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChaptersService } from "./chapters.service";
import type { PrismaService } from "../../prisma/prisma.service";

const work = {
  id: "11111111-1111-1111-1111-111111111111",
  code: "bg",
  slug: "bhagavad-gita",
  title: "Bhagavad Gita",
  description: null,
  sortOrder: 10,
  isPublished: true,
  createdAt: new Date("2026-07-10T06:52:00.000Z"),
  updatedAt: new Date("2026-07-10T06:52:00.000Z"),
};

const chapterRow = {
  id: "22222222-2222-2222-2222-222222222222",
  workId: work.id,
  number: 1,
  publicId: "bg.1",
  title: "Opening",
  verseCount: 47,
  sortOrder: 1,
  isPublished: true,
  createdAt: new Date("2026-07-10T06:52:00.000Z"),
  updatedAt: new Date("2026-07-10T06:52:00.000Z"),
  work,
};

describe("ChaptersService", () => {
  const findMany = vi.fn();
  const findFirst = vi.fn();
  let service: ChaptersService;

  beforeEach(() => {
    findMany.mockReset();
    findFirst.mockReset();
    const prisma = {
      chapter: { findMany, findFirst },
    } as unknown as PrismaService;
    service = new ChaptersService(prisma);
  });

  it("findPublished returns mapped DTOs ordered by Prisma query", async () => {
    findMany.mockResolvedValue([chapterRow]);

    const result = await service.findPublished();

    expect(findMany).toHaveBeenCalledWith({
      where: { isPublished: true },
      include: { work: true },
      orderBy: { sortOrder: "asc" },
    });
    expect(result).toEqual([
      {
        id: chapterRow.id,
        publicId: "bg.1",
        number: 1,
        title: "Opening",
        verseCount: 47,
        sortOrder: 1,
        isPublished: true,
        work: { code: "bg", slug: "bhagavad-gita", title: "Bhagavad Gita" },
        createdAt: "2026-07-10T06:52:00.000Z",
        updatedAt: "2026-07-10T06:52:00.000Z",
      },
    ]);
  });

  it("findPublishedByPublicId returns a chapter when published", async () => {
    findFirst.mockResolvedValue(chapterRow);

    const result = await service.findPublishedByPublicId("bg.1");

    expect(findFirst).toHaveBeenCalledWith({
      where: { publicId: "bg.1", isPublished: true },
      include: { work: true },
    });
    expect(result.publicId).toBe("bg.1");
    expect(result.work.code).toBe("bg");
  });

  it("findPublishedByPublicId throws NotFoundException when missing", async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.findPublishedByPublicId("bg.99")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
