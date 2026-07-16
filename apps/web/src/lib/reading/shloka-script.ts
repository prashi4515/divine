import Sanscript from "@indic-transliteration/sanscript";

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
 * Render the Sanskrit shloka in the script matching the reading language
 * (stotranidhi-style: Telugu → Telugu script, English → IAST, etc.).
 */
export function shlokaInLanguage(
  sanskritText: string,
  language: string,
  iastFromDb?: string | null,
): string {
  const scheme = LANGUAGE_SCHEME[language] ?? "devanagari";

  if (scheme === "devanagari") {
    return sanskritText;
  }

  if (scheme === "iast") {
    const stored = iastFromDb?.trim();
    if (stored) return stored;
  }

  try {
    return Sanscript.t(sanskritText, "devanagari", scheme);
  } catch {
    return sanskritText;
  }
}

/** Whether the reading language uses a non-Devanagari Brahmic script. */
export function isIndicScriptLanguage(language: string): boolean {
  return ["te", "kn", "ta", "ml", "or"].includes(language);
}
