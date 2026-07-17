import { describe, expect, it } from "vitest";
import {
  expandWithBuiltins,
  isWorkAliasOnly,
  normalizeSearchQuery,
} from "./query-normalize";

describe("normalizeSearchQuery", () => {
  it("lowercases and strips Latin diacritics", () => {
    expect(normalizeSearchQuery("  Kṛṣṇa  ")).toBe("krsna");
  });
});

describe("spelling tolerance", () => {
  it("maps Gita spellings to the same expansion set", () => {
    const a = new Set(expandWithBuiltins(normalizeSearchQuery("bhagwat geeta")));
    const b = new Set(expandWithBuiltins(normalizeSearchQuery("bagavadgita")));
    const c = new Set(expandWithBuiltins(normalizeSearchQuery("bhagawad geetha")));
    expect(a.has("bhagavad gita")).toBe(true);
    expect(b.has("bhagavad gita")).toBe(true);
    expect(c.has("bhagavad gita")).toBe(true);
  });

  it("maps Krishna spellings together", () => {
    for (const q of ["krishna", "krsna", "krushna"]) {
      const expanded = expandWithBuiltins(normalizeSearchQuery(q));
      expect(expanded).toContain("krishna");
    }
  });

  it("maps English synonyms to Sanskrit concepts", () => {
    expect(expandWithBuiltins(normalizeSearchQuery("anger"))).toContain("krodha");
    expect(expandWithBuiltins(normalizeSearchQuery("peace"))).toContain("shanti");
    expect(expandWithBuiltins(normalizeSearchQuery("work"))).toContain("karma");
    expect(expandWithBuiltins(normalizeSearchQuery("knowledge"))).toContain("jnana");
    expect(expandWithBuiltins(normalizeSearchQuery("devotion"))).toContain("bhakti");
  });
});

describe("isWorkAliasOnly", () => {
  it("detects corpus-name queries", () => {
    expect(isWorkAliasOnly(normalizeSearchQuery("bhagwat geeta"))).toBe(true);
    expect(isWorkAliasOnly(normalizeSearchQuery("karma yoga"))).toBe(false);
  });
});
