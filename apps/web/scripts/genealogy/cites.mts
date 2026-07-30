/**
 * Citation helpers for the rebuilt genealogy corpus.
 * Keep work titles identical to PRIMARY_WORKS / UI expectations.
 */

export type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
  note?: string;
};

export const BP = (
  skandha: string,
  chapter?: string,
  note?: string,
): Cite => ({
  work: "Bhāgavata Purāṇa",
  section: `Skandha ${skandha}`,
  ...(chapter ? { chapter } : {}),
  ...(note ? { note } : {}),
});

export const VP = (
  amsa: string,
  chapter?: string,
  note?: string,
): Cite => ({
  work: "Viṣṇu Purāṇa",
  section: `Aṃśa ${amsa}`,
  ...(chapter ? { chapter } : {}),
  ...(note ? { note } : {}),
});

export const MB = (
  parva: string,
  chapter?: string,
  note?: string,
): Cite => ({
  work: "Mahābhārata",
  section: parva,
  ...(chapter ? { chapter } : {}),
  ...(note ? { note } : {}),
});

export const RM = (
  kanda: string,
  chapter?: string,
  note?: string,
): Cite => ({
  work: "Rāmāyaṇa",
  section: kanda,
  ...(chapter ? { chapter } : {}),
  ...(note ? { note } : {}),
});

export const HV = (section?: string, chapter?: string): Cite => ({
  work: "Harivaṃśa",
  ...(section ? { section } : {}),
  ...(chapter ? { chapter } : {}),
});

export const SP = (section?: string): Cite => ({
  work: "Śiva Purāṇa",
  ...(section ? { section } : {}),
});

export const BG = (chapter: string, verse?: string): Cite => ({
  work: "Bhagavad Gītā",
  chapter,
  ...(verse ? { verse } : {}),
});

export type Confidence = "verified" | "traditional" | "variant";

export type Rel = {
  type: string;
  personId: string;
  confidence: Confidence;
  sources: Cite[];
  note?: string;
};

export function rel(
  type: string,
  personId: string,
  confidence: Confidence,
  sources: Cite[],
  note?: string,
): Rel {
  return { type, personId, confidence, sources, ...(note ? { note } : {}) };
}
