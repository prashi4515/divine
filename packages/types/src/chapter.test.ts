import { describe, expect, it } from "vitest";
import {
  chapterDetailResponseSchema,
  chapterSchema,
  chaptersListResponseSchema,
} from "./chapter";

const sampleChapter = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  publicId: "bg.1",
  number: 1,
  title: "Arjuna Vishada Yoga",
  verseCount: 47,
  sortOrder: 1,
  isPublished: true,
  work: {
    code: "bg",
    slug: "bhagavad-gita",
    title: "Bhagavad Gita",
  },
  createdAt: "2026-07-10T06:52:00.000Z",
  updatedAt: "2026-07-10T06:52:00.000Z",
};

describe("chapterSchema", () => {
  it("accepts a valid chapter", () => {
    expect(chapterSchema.parse(sampleChapter).publicId).toBe("bg.1");
  });

  it("rejects missing work summary", () => {
    const { work: _work, ...rest } = sampleChapter;
    expect(() => chapterSchema.parse(rest)).toThrow();
  });
});

describe("chaptersListResponseSchema", () => {
  it("wraps chapters in data", () => {
    const parsed = chaptersListResponseSchema.parse({ data: [sampleChapter] });
    expect(parsed.data).toHaveLength(1);
  });
});

describe("chapterDetailResponseSchema", () => {
  it("wraps a single chapter in data", () => {
    const parsed = chapterDetailResponseSchema.parse({ data: sampleChapter });
    expect(parsed.data.publicId).toBe("bg.1");
  });
});
