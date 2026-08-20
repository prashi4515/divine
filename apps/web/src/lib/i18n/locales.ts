import { type ReadingLanguageCode } from "@/lib/reading/languages";

/** Non-English supported language prefixes for routing (`/hi`, `/te`, `/sa`, etc.). */
export const SUPPORTED_LOCALES = [
  "sa",
  "hi",
  "te",
  "kn",
  "ta",
  "ml",
  "or",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Get language code from a URL pathname if present (e.g. `/hi/bhagavad-gita` -> `hi`). */
export function getLocaleFromPathname(
  pathname?: string | null,
): ReadingLanguageCode | null {
  if (!pathname) return null;
  const raw = pathname.split("?")[0].split("#")[0];
  const segments = raw.split("/").filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    return segments[0] as ReadingLanguageCode;
  }
  return null;
}

/** Get localized path prefix for a route (empty string for 'en'). */
export function getLocalePathPrefix(lang: ReadingLanguageCode): string {
  if (lang === "en" || !isSupportedLocale(lang)) return "";
  return `/${lang}`;
}

/** Prepend language prefix to a clean path (e.g. `/bhagavad-gita` -> `/hi/bhagavad-gita`). */
export function localizePath(path: string, lang: ReadingLanguageCode): string {
  const clean = normalizeCleanPath(path);
  if (lang === "en" || !isSupportedLocale(lang)) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip any leading locale prefix from a path if present. */
export function normalizeCleanPath(path: string): string {
  const raw = path.split("?")[0].split("#")[0];
  const segments = raw.split("/").filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    const stripped = "/" + segments.slice(1).join("/");
    return stripped === "" ? "/" : stripped;
  }
  return raw === "" ? "/" : raw;
}
