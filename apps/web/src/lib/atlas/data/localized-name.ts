/**
 * Localized atlas toponyms — JSON name maps + runtime resolution.
 */
import {
  devanagariToReadingScript,
  readingLanguageScheme,
} from "@/lib/reading/shloka-script";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import Sanscript from "@indic-transliteration/sanscript";
import { z } from "zod";

export const localizedNameSchema = z.union([
  z.string().min(1),
  z
    .record(z.string(), z.string())
    .refine((o) => typeof o.en === "string" && o.en.length > 0, {
      message: "Localized name map requires en",
    }),
]);

export type LocalizedName = z.infer<typeof localizedNameSchema>;

const LANG_FALLBACK: ReadingLanguageCode[] = [
  "en",
  "hi",
  "sa",
  "te",
  "ta",
  "kn",
  "ml",
  "or",
];

function iastToReadingScript(iast: string, code: string): string | null {
  const scheme = readingLanguageScheme(code);
  if (!scheme || scheme === "iast") return null;
  try {
    if (scheme === "devanagari") {
      return Sanscript.t(iast, "iast", "devanagari");
    }
    const deva = Sanscript.t(iast, "iast", "devanagari");
    return devanagariToReadingScript(deva, code);
  } catch {
    return null;
  }
}

/** Pick the display string for the active reading language. */
export function resolveLocalizedName(
  name: LocalizedName,
  lang: string,
  iast?: string,
): string {
  if (typeof name === "string") {
    if (lang === "en") return name;
    if (iast) {
      const fromIast = iastToReadingScript(iast, lang);
      if (fromIast?.trim()) return fromIast;
    }
    return name;
  }

  const direct = name[lang];
  if (direct?.trim()) return direct;

  for (const code of LANG_FALLBACK) {
    const hit = name[code];
    if (hit?.trim()) {
      if (lang !== "en" && code === "en" && iast) {
        const fromIast = iastToReadingScript(iast, lang);
        if (fromIast?.trim()) return fromIast;
      }
      if (lang !== "en" && (code === "hi" || code === "sa")) {
        const proxied = devanagariToReadingScript(hit, lang);
        if (proxied.trim()) return proxied;
      }
      return hit;
    }
  }

  return Object.values(name)[0] ?? "";
}

/** Flatten all spellings for search matching. */
export function localizedNameKeys(
  name: LocalizedName,
  iast?: string,
): string[] {
  const keys =
    typeof name === "string" ? [name] : Object.values(name).filter(Boolean);
  if (iast) keys.push(iast);
  return keys;
}
