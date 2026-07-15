import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChaptersController } from "./chapters.controller";
import type { ChaptersService } from "./chapters.service";
import type { ChapterResponseDto } from "./chapters.dto";

const sample: ChapterResponseDto = {
  id: "22222222-2222-2222-2222-222222222222",
  publicId: "bg.1",
  number: 1,
  title: "Opening",
  verseCount: 47,
  sortOrder: 1,
  isPublished: true,
  work: { code: "bg", slug: "bhagavad-gita", title: "Bhagavad Gita" },
  createdAt: "2026-07-10T06:52:00.000Z",
  updatedAt: "2026-07-10T06:52:00.000Z",
};

describe("ChaptersController", () => {
  const findPublished = vi.fn();
  const findPublishedByPublicId = vi.fn();
  let controller: ChaptersController;

  beforeEach(() => {
    findPublished.mockReset();
    findPublishedByPublicId.mockReset();
    const service = {
      findPublished,
      findPublishedByPublicId,
    } as unknown as ChaptersService;
    controller = new ChaptersController(service);
  });

  it("list wraps service results in { data }", async () => {
    findPublished.mockResolvedValue([sample]);

    await expect(controller.list()).resolves.toEqual({ data: [sample] });
    expect(findPublished).toHaveBeenCalledOnce();
  });

  it("getByPublicId wraps a single chapter in { data }", async () => {
    findPublishedByPublicId.mockResolvedValue(sample);

    await expect(controller.getByPublicId("bg.1")).resolves.toEqual({
      data: sample,
    });
    expect(findPublishedByPublicId).toHaveBeenCalledWith("bg.1");
  });

  it("getByPublicId propagates NotFoundException", async () => {
    findPublishedByPublicId.mockRejectedValue(
      new NotFoundException('Chapter "bg.99" not found'),
    );

    await expect(controller.getByPublicId("bg.99")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
