/**
 * Display helpers — plain modern English for educational UI.
 * Scholarly IAST may remain in iastName / sanskritName for search.
 */

/** Common IAST letters → readable English (before NFD strip). */
const IAST_TO_ASCII: Record<string, string> = {
  ā: "a",
  Ā: "A",
  ī: "i",
  Ī: "I",
  ū: "u",
  Ū: "U",
  ṛ: "ri",
  Ṛ: "Ri",
  ṝ: "ri",
  Ṝ: "Ri",
  ḷ: "li",
  Ḷ: "Li",
  ṅ: "n",
  Ṅ: "N",
  ñ: "n",
  Ñ: "N",
  ṭ: "t",
  Ṭ: "T",
  ḍ: "d",
  Ḍ: "D",
  ṇ: "n",
  Ṇ: "N",
  ś: "sh",
  Ś: "Sh",
  ṣ: "sh",
  Ṣ: "Sh",
  ḥ: "h",
  Ḥ: "H",
  ṃ: "m",
  Ṃ: "M",
  ṁ: "m",
  Ṁ: "M",
};

/** Strip IAST / combining marks into readable ASCII (ā → a, ś → sh, ṛ → ri). */
export function stripDiacritics(text: string): string {
  const mapped = text.replace(
    /[āīūṛṝḷṅñṭḍṇśṣḥṃṁĀĪŪṚṜḶṄÑṬḌṆŚṢḤṂṀ]/gu,
    (ch) => IAST_TO_ASCII[ch] ?? ch,
  );
  return mapped.normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Normalize for reader-facing English: no diacritics, no fancy punctuation,
 * no soft hyphens / zero-width junk that can render as "~" or odd marks.
 */
export function toModernEnglish(text: string | undefined | null): string {
  if (text == null) return "";
  return (
    stripDiacritics(text)
      // Soft hyphen, zero-width, BOM — often look like "~" or gaps
      .replace(/[\u00AD\u200B-\u200D\u2060\uFEFF]/g, "")
      // Fancy dashes → comma (avoid "word - word" clutter in reader UI)
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, ", ")
      // Stray tildes / swung dashes used as separators
      .replace(/[\u223C\uFF5E~]+/g, " ")
      .replace(/\u00A0/g, " ")
      .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
      .replace(/[\u2026]/g, "...")
      .replace(/\s+,/g, ",")
      .replace(/,\s*,+/g, ",")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim()
  );
}

/** Prefer englishName; fall back to folded scholarly name. */
export function displayEnglishName(entity: {
  englishName?: string;
  name: string;
}): string {
  const preferred = entity.englishName?.trim();
  if (preferred && preferred.length > 0) {
    return toModernEnglish(preferred);
  }
  return toModernEnglish(entity.name);
}
