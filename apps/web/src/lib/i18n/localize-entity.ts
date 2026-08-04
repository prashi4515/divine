/**
 * Localized entity display — names in the active reading script,
 * summaries from overlay when available; otherwise IAST tokens in
 * the English summary are rewritten into the reading script.
 */
import { localizedEntityKindLabel } from "@/lib/i18n/knowledge-labels";
import { getEntityCopyOverlay } from "@/lib/i18n/entity-copy-overlay";
import {
  devanagariToReadingScript,
  readingLanguageScheme,
} from "@/lib/reading/shloka-script";
import {
  displayEnglishName,
  toModernEnglish,
} from "@/lib/text/modern-english";
import type { EntityKind, KnowledgeEntity } from "@/lib/knowledge/types";
import Sanscript from "@indic-transliteration/sanscript";

const IAST_TOKEN =
  /[A-Za-zĀāĪīŪūṚṛṜṝḶḷṄṅÑñṬṭḌḍṆṇŚśṢṣḤḥṂṃṀṁ][A-Za-zĀāĪīŪūṚṛṜṝḶḷṄṅÑñṬṭḌḍṆṇŚśṢṣḤḥṂṃṀṁ'’-]*/gu;

function iastToScript(iast: string, code: string): string | null {
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

/**
 * Prefer Indic script form of the name for non-English UI languages.
 */
export function displayLocalizedName(
  entity: Pick<
    KnowledgeEntity,
    "name" | "englishName" | "iastName" | "sanskritName"
  >,
  code: string,
): string {
  if (code === "en") return displayEnglishName(entity);

  if (entity.sanskritName) {
    if (code === "hi" || code === "sa") return entity.sanskritName;
    const proxied = devanagariToReadingScript(entity.sanskritName, code);
    if (proxied.trim()) return proxied;
  }

  if (entity.iastName) {
    const fromIast = iastToScript(entity.iastName, code);
    if (fromIast?.trim()) return fromIast;
  }

  return displayEnglishName(entity);
}

/** Rewrite scholarly IAST tokens inside a prose summary into the reading script. */
function rewriteIastTokens(summary: string, code: string): string {
  return summary.replace(IAST_TOKEN, (token) => {
    if (!/[ĀāĪīŪūṚṛṜṝḶḷṄṅÑñṬṭḌḍṆṇŚśṢṣḤḥṂṃṀṁ]/.test(token)) {
      return token;
    }
    return iastToScript(token, code) ?? token;
  });
}

export function displayLocalizedSummary(
  entity: Pick<KnowledgeEntity, "id" | "summary" | "name" | "iastName">,
  code: string,
): string {
  if (code === "en") return toModernEnglish(entity.summary);
  const overlay = getEntityCopyOverlay(entity.id, code);
  if (overlay?.summary) return overlay.summary;
  return toModernEnglish(rewriteIastTokens(entity.summary, code));
}

export function displayLocalizedKind(kind: EntityKind, code: string): string {
  return localizedEntityKindLabel(kind, code);
}
