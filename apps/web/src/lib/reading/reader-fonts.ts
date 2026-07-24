/**
 * Maps reading language → CSS font family class for Indic-aware typography.
 * Fonts are injected on chapter layouts via next/font (see reader-font-vars).
 */
export function readerFontClass(language: string): string {
  switch (language) {
    case "hi":
    case "sa":
      return "font-reader-deva";
    case "kn":
      return "font-reader-kn";
    case "te":
      return "font-reader-te";
    case "ta":
      return "font-reader-ta";
    case "ml":
      return "font-reader-ml";
    case "gu":
      return "font-reader-gu";
    case "or":
      return "font-reader-or";
    default:
      return "font-reader-en";
  }
}

/** Sanskrit shloka always prefers Devanagari serif when available. */
export function shlokaFontClass(language: string): string {
  if (language === "en" || language === "sa" || language === "hi") {
    return "font-reader-deva";
  }
  return readerFontClass(language);
}
