import { describe, expect, it } from "vitest";
import {
  recentSearchesResponseSchema,
  relatedContentResponseSchema,
  searchSuggestResponseSchema,
  trendingSearchesResponseSchema,
  verseSearchResponseSchema,
} from "./search";

describe("verseSearchResponseSchema", () => {
  it("accepts a scored verse hit page", () => {
    const parsed = verseSearchResponseSchema.parse({
      data: [
        {
          publicId: "bg.2.47",
          chapterNumber: 2,
          verseNumber: 47,
          href: "/bhagavad-gita/chapter-2#verse-47",
          sanskrit: "कर्मण्येवाधिकारस्ते",
          transliteration: "karmany evadhikaras te",
          translation: "You have a right to action alone…",
          preview: "You have a right to action alone…",
          matchedKeywords: ["karma", "work"],
          topics: [{ slug: "karma", name: "Karma" }],
          score: 18.5,
          languageCode: "en",
        },
      ],
      meta: {
        query: "work",
        expandedTerms: ["work", "karma", "action"],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      },
    });
    expect(parsed.data[0]?.publicId).toBe("bg.2.47");
    expect(parsed.meta.expandedTerms).toContain("karma");
  });
});

describe("searchSuggestResponseSchema", () => {
  it("accepts mixed suggestion kinds", () => {
    const parsed = searchSuggestResponseSchema.parse({
      data: [
        { text: "karma", kind: "synonym", href: "/search?q=karma" },
        { text: "bg.2.47", kind: "verse", href: "/bhagavad-gita/chapter-2#verse-47" },
      ],
    });
    expect(parsed.data).toHaveLength(2);
  });
});

describe("related + trending + recent", () => {
  it("parses related content envelope", () => {
    relatedContentResponseSchema.parse({
      data: {
        relatedVerses: [
          {
            publicId: "bg.2.48",
            href: "/bhagavad-gita/chapter-2#verse-48",
            preview: "Perform action…",
            topics: [{ slug: "karma", name: "Karma" }],
            reason: "topic",
          },
        ],
        relatedTopics: [{ slug: "karma", name: "Karma" }],
        peopleAlsoRead: [],
      },
    });
  });

  it("parses trending and recent", () => {
    trendingSearchesResponseSchema.parse({
      data: [{ query: "karma", hitCount: 12 }],
    });
    recentSearchesResponseSchema.parse({
      data: [{ query: "krishna", createdAt: "2026-07-16T12:00:00.000Z" }],
    });
  });
});
