import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Verse } from "@divine/types";

type CorrectionMap = Record<string, Record<string, string>>;

let correctionsMemo: CorrectionMap | null | undefined;

/**
 * Native-speaker text fixes layered on top of imported corpora.
 * See `content/gita/corrections/README.md`.
 */
export async function loadContentCorrections(
  contentDir: string,
): Promise<CorrectionMap> {
  if (correctionsMemo !== undefined) {
    return correctionsMemo ?? {};
  }
  try {
    const raw = await readFile(
      path.join(contentDir, "corrections", "overrides.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as unknown;
    correctionsMemo =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as CorrectionMap)
        : {};
  } catch {
    correctionsMemo = {};
  }
  return correctionsMemo;
}

/** Apply sourceKey overrides onto a verse's translation rows (mutates copy). */
export function applyTranslationCorrections(
  publicId: string,
  translations: Verse["translations"],
  corrections: CorrectionMap,
): Verse["translations"] {
  const bySource = corrections[publicId];
  if (!bySource) return translations;
  return translations.map((row) => {
    const next = bySource[row.sourceKey];
    if (!next) return row;
    return { ...row, text: next };
  });
}
