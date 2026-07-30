import Sanscript from "@indic-transliteration/sanscript";
import { repairIndicOrthography } from "@/lib/reading/repair-indic-orthography";

/** Sanscript schemes for public reading languages. */
const LANGUAGE_SCHEME: Record<string, string> = {
  sa: "devanagari",
  hi: "devanagari",
  te: "telugu",
  kn: "kannada",
  ta: "tamil",
  ml: "malayalam",
  or: "oriya",
  en: "iast",
};

/**
 * Collapse blank lines so shloka couplets sit like print editions
 * (DB often stores `\n\n` between pādas, which looks huge with pre-line).
 * Also repairs broken virama+matra sequences (dotted-circle glyphs).
 */
export function formatShlokaDisplay(text: string): string {
  return repairIndicOrthography(
    text
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim(),
  );
}

/**
 * Sanscript → Telugu keeps Sanskrit class-nasals (సఞ్జయ). Print Telugu
 * (holy-bhagavad-gita.org) uses anusvara (సంజయ). Same for other vargas.
 */
export function normalizeTeluguShlokaOrthography(text: string): string {
  return text
    .replace(/\u0C3D/g, "") // avagraha ఽ
    .replace(/ఙ్(?=[కఖగఘ])/gu, "ం")
    .replace(/ఞ్(?=[చఛజఝ])/gu, "ం")
    .replace(/ణ్(?=[టఠడఢ])/gu, "ం")
    .replace(/న్(?=[తథదధ])/gu, "ం")
    .replace(/మ్(?=[పఫబభ])/gu, "ం");
}

/**
 * Render the Sanskrit shloka in the script matching the reading language
 * (stotranidhi-style: Telugu → Telugu script, English → IAST, etc.).
 */
export function shlokaInLanguage(
  sanskritText: string,
  language: string,
  iastFromDb?: string | null,
): string {
  const scheme = LANGUAGE_SCHEME[language] ?? "devanagari";
  // Fix Devanagari before any script conversion so te/kn/ta/ml/or inherit it.
  const source = repairIndicOrthography(sanskritText);

  if (scheme === "devanagari") {
    return formatShlokaDisplay(source);
  }

  if (scheme === "iast") {
    const stored = iastFromDb?.trim();
    if (stored) return formatShlokaDisplay(stored);
  }

  try {
    let converted = Sanscript.t(source, "devanagari", scheme);
    if (scheme === "telugu") {
      converted = normalizeTeluguShlokaOrthography(converted);
    }
    return formatShlokaDisplay(converted);
  } catch {
    return formatShlokaDisplay(source);
  }
}

/** Whether the reading language uses a non-Devanagari Brahmic script. */
export function isIndicScriptLanguage(language: string): boolean {
  return ["te", "kn", "ta", "ml", "or"].includes(language);
}

/**
 * Convert Devanagari lemmas in a padacheda string ("word — gloss; …") into the
 * reading language script so kn/ta/ml tables resemble Telugu word meanings.
 */
export function localizePadachedaLemmas(
  text: string,
  language: string,
): string {
  const scheme = LANGUAGE_SCHEME[language];
  if (!scheme || scheme === "devanagari" || scheme === "iast") return text;

  return text
    .split(/[;|]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
      if (emDash) {
        const word = emDash[1]!.trim();
        const gloss = emDash[3]!.trim();
        try {
          let converted = stripForeignIndicMarks(
            Sanscript.t(
              normalizeDevanagariForRescript(word),
              "devanagari",
              scheme,
            ),
          );
          if (scheme === "telugu") {
            converted = normalizeTeluguShlokaOrthography(converted);
          }
          return `${converted} — ${gloss}`;
        } catch {
          return chunk;
        }
      }
      // Sivananda often uses "word gloss" without an em dash.
      const space = chunk.match(
        /^([\u0900-\u097F][\u0900-\u097F\s]*)\s+(.+)$/u,
      );
      if (space) {
        try {
          let converted = stripForeignIndicMarks(
            Sanscript.t(
              normalizeDevanagariForRescript(space[1]!.trim()),
              "devanagari",
              scheme,
            ),
          );
          if (scheme === "telugu") {
            converted = normalizeTeluguShlokaOrthography(converted);
          }
          return `${converted} — ${space[2]!.trim()}`;
        } catch {
          return chunk;
        }
      }
      return chunk;
    })
    .join("; ");
}

/**
 * Re-script an entire padacheda string from one Brahmic scheme to another
 * (used to adapt Telugu word-meanings into kn/ta/ml/or).
 */
export function rescriptPadacheda(
  text: string,
  fromScheme: string,
  toScheme: string,
): string {
  if (fromScheme === toScheme) return text;
  return text
    .split(/[;|]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
      if (!emDash) {
        try {
          let out = stripForeignIndicMarks(
            Sanscript.t(chunk, fromScheme, toScheme),
          );
          if (toScheme === "telugu") {
            out = normalizeTeluguShlokaOrthography(out);
          }
          return out;
        } catch {
          return chunk;
        }
      }
      try {
        let word = stripForeignIndicMarks(
          Sanscript.t(emDash[1]!.trim(), fromScheme, toScheme),
        );
        let gloss = stripForeignIndicMarks(
          Sanscript.t(emDash[3]!.trim(), fromScheme, toScheme),
        );
        if (toScheme === "telugu") {
          word = normalizeTeluguShlokaOrthography(word);
          gloss = normalizeTeluguShlokaOrthography(gloss);
        }
        return `${word} — ${gloss}`;
      } catch {
        return chunk;
      }
    })
    .join("; ");
}

export function readingLanguageScheme(language: string): string | null {
  return LANGUAGE_SCHEME[language] ?? null;
}

/**
 * Prepare Devanagari (usually Hindi) before Sanscript → kn/ta/ml.
 * Nukta consonants otherwise produce unreadable glyphs like Tamil "லட़".
 */
export function normalizeDevanagariForRescript(text: string): string {
  return repairIndicOrthography(
    text
      .replace(/\u093C/g, "") // nukta ़
      .replace(/\u0901/g, "\u0902") // candrabindu ँ → anusvara ं
      .replace(/\u0964/g, ".") // danda ।
      .replace(/\u0965/g, ".."), // double danda ॥
  );
}

/**
 * Remove leftover Devanagari / nukta after a Brahmic rescript.
 */
export function stripForeignIndicMarks(text: string): string {
  return text
    .replace(/\u093C/g, "")
    .replace(/[\u0900-\u097F]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Convert Devanagari Hindi (or Sanskrit) into a reading-language Brahmic script
 * without nukta / Devanagari leftovers that break Tamil/Kannada/Malayalam fonts.
 */
export function devanagariToReadingScript(
  text: string,
  language: string,
): string {
  const scheme = LANGUAGE_SCHEME[language];
  if (!scheme || scheme === "devanagari" || scheme === "iast") {
    return text;
  }
  try {
    const prepared = normalizeDevanagariForRescript(text);
    let out = stripForeignIndicMarks(
      Sanscript.t(prepared, "devanagari", scheme),
    );
    if (scheme === "telugu") {
      out = normalizeTeluguShlokaOrthography(out);
    }
    return out;
  } catch {
    return stripForeignIndicMarks(text);
  }
}

/**
 * Clean already-stored script-proxy rows (Sanscript artifacts in DB).
 */
export function normalizeScriptProxyText(text: string): string {
  return stripForeignIndicMarks(
    repairIndicOrthography(
      text.replace(/\u0964/g, ".").replace(/\u0965/g, ".."),
    ),
  );
}
