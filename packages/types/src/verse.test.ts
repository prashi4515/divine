import { z } from "zod";
import { describe, expect, it } from "vitest";
import { verseSchema, searchHitSchema } from "./verse";

describe("verseSchema", () => {
  it("accepts a public verse payload", () => {
    const parsed = verseSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      publicId: "bg.2.47",
      number: 47,
      sanskritText: "कर्मण्येवाधिकारस्ते",
      transliteration: "karmaṇy-evādhikāras-te",
      meaning: "You have a right to perform your duty.",
      commentary: null,
      seoTitle: null,
      seoDescription: null,
      sortOrder: 47,
      isPublished: true,
      chapterPublicId: "bg.2",
      chapterNumber: 2,
      workCode: "bg",
      translations: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          languageCode: "en",
          languageName: "English",
          sourceKey: "sivananda",
          sourceDisplayName: "Swami Sivananda",
          text: "Thy right is to work only.",
          isPublished: true,
        },
      ],
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-07-14T00:00:00.000Z",
    });
    expect(parsed.publicId).toBe("bg.2.47");
  });
});

describe("searchHitSchema", () => {
  it("accepts navigation hits", () => {
    const hit = searchHitSchema.parse({
      type: "verse",
      id: "bg.2.47",
      title: "bg.2.47",
      subtitle: "Karma yoga",
      href: "/bhagavad-gita/chapter-2#verse-47",
    });
    expect(hit.type).toBe("verse");
  });
});
