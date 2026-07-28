/**
 * Fetch published Gita payloads and write:
 * - `content/gita/reader/bg.N.json` — slim (meanings only) for instant chapter HTML
 * - `content/gita/commentary/bg.N.json` — commentaries only (served by /api/gita/commentary)
 *
 * Usage (API must be running):
 *   pnpm --filter @divine/web generate:gita-static
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const outDir = path.join(webRoot, "content", "gita");
const readerDir = path.join(outDir, "reader");
const commentaryDir = path.join(outDir, "commentary");

const baseUrl = (process.env.DIVINE_API_URL ?? "http://127.0.0.1:8080").replace(
  /\/$/,
  "",
);

const MEANING_SOURCE_KEYS = new Set([
  "sivananda",
  "ramsukhdas",
  "holy-bg-telugu",
  "holy-bg-telugu-w2w",
  "holy-bg-odia",
]);

const COMMENTARY_SOURCE_KEYS = new Set([
  "ramsukhdas-vyakhya",
  "holy-bg-telugu-vyakhya",
]);

const KEEP_LANGUAGE_CODES = new Set(["en", "hi", "te", "or"]);

const READER_LANGUAGES = [
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
];

async function fetchJson(pathname: string): Promise<unknown> {
  const url = `${baseUrl}${pathname}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }
  return res.json();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new Error("Expected JSON object");
  }
  return value as Record<string, unknown>;
}

function filterTranslations(
  raw: unknown,
  keys: Set<string>,
): Record<string, unknown>[] {
  const verse = asRecord(raw);
  if (!Array.isArray(verse.translations)) return [];
  return verse.translations
    .filter((row) => {
      const t = asRecord(row);
      return (
        KEEP_LANGUAGE_CODES.has(String(t.languageCode)) &&
        keys.has(String(t.sourceKey))
      );
    })
    .map((row) => ({ ...asRecord(row) }));
}

async function main(): Promise<void> {
  console.log(`Generating Gita static snapshots from ${baseUrl}`);
  await mkdir(readerDir, { recursive: true });
  await mkdir(commentaryDir, { recursive: true });

  const chaptersPayload = asRecord(await fetchJson("/v1/chapters"));
  const chaptersList = chaptersPayload.data;
  if (!Array.isArray(chaptersList)) {
    throw new Error("GET /v1/chapters: missing data array");
  }

  const gitaChapters = chaptersList
    .filter((c) => asRecord(asRecord(c).work).code === "bg")
    .sort(
      (a, b) => Number(asRecord(a).sortOrder) - Number(asRecord(b).sortOrder),
    );

  const generatedAt = new Date().toISOString();
  await writeFile(
    path.join(outDir, "chapters.json"),
    JSON.stringify({ generatedAt, chapters: gitaChapters }),
    "utf8",
  );
  console.log(`Wrote chapters.json (${gitaChapters.length} chapters)`);

  for (const chapterRow of gitaChapters) {
    const n = Number(asRecord(chapterRow).number);
    const publicId = `bg.${n}`;
    const [detailPayload, versesPayload] = await Promise.all([
      asRecord(await fetchJson(`/v1/chapters/${encodeURIComponent(publicId)}`)),
      asRecord(
        await fetchJson(
          `/v1/verses?chapterPublicId=${encodeURIComponent(publicId)}&include=full`,
        ),
      ),
    ]);

    const rawVerses = versesPayload.data;
    if (!Array.isArray(rawVerses)) {
      throw new Error(`Chapter ${publicId}: verses.data missing`);
    }

    const readerVerses = rawVerses.map((raw) => {
      const verse = asRecord(raw);
      return {
        ...verse,
        commentary: null,
        seoTitle: null,
        seoDescription: null,
        translations: filterTranslations(raw, MEANING_SOURCE_KEYS),
      };
    });

    const commentaryByNumber: Record<
      string,
      {
        publicId: string;
        commentary: string | null;
        translations: Record<string, unknown>[];
      }
    > = {};

    for (const raw of rawVerses) {
      const verse = asRecord(raw);
      const num = String(verse.number);
      commentaryByNumber[num] = {
        publicId: String(verse.publicId),
        commentary:
          typeof verse.commentary === "string" ? verse.commentary : null,
        translations: filterTranslations(raw, COMMENTARY_SOURCE_KEYS),
      };
    }

    const readerBody = JSON.stringify({
      generatedAt,
      chapter: detailPayload.data,
      verses: readerVerses,
      languages: READER_LANGUAGES,
    });
    const commentaryBody = JSON.stringify({
      generatedAt,
      chapterNumber: n,
      byNumber: commentaryByNumber,
    });

    await writeFile(path.join(readerDir, `bg.${n}.json`), readerBody, "utf8");
    await writeFile(
      path.join(commentaryDir, `bg.${n}.json`),
      commentaryBody,
      "utf8",
    );

    console.log(
      `Wrote bg.${n}: reader ${Math.round(Buffer.byteLength(readerBody) / 1024)} KB, commentary ${Math.round(Buffer.byteLength(commentaryBody) / 1024)} KB (${rawVerses.length} verses)`,
    );
  }

  console.log("Done.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
