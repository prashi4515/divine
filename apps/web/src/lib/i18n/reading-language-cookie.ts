import {
  isReadingLanguageCode,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";

/** Cookie so Server Components can SSR hub chrome in the active UI language. */
export const READING_LANGUAGE_COOKIE = "divine.reading-lang";

export function parseReadingLanguageCookie(
  value: string | undefined,
): ReadingLanguageCode | undefined {
  if (!value || !isReadingLanguageCode(value)) return undefined;
  return value;
}

export function readingLanguageCookieWrite(code: ReadingLanguageCode): string {
  return `${READING_LANGUAGE_COOKIE}=${code}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
