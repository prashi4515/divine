/**
 * Public reading languages shown in the site-wide header switcher.
 * Codes match BCP-47 / Language catalog rows used by verse translations.
 */
export const READING_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
] as const;

export type ReadingLanguageCode = (typeof READING_LANGUAGES)[number]["code"];

export const DEFAULT_READING_LANGUAGE: ReadingLanguageCode = "en";

export function isReadingLanguageCode(value: string): value is ReadingLanguageCode {
  return READING_LANGUAGES.some((lang) => lang.code === value);
}
