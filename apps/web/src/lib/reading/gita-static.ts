import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Chapter, Verse } from "@divine/types";
import type { GitaChapterSnapshot } from "@/lib/reading/gita-static-schema";

export type GitaCommentaryEntry = {
  publicId: string;
  commentary: string | null;
  translations: Verse["translations"];
};

export type GitaCommentaryFile = {
  generatedAt: string;
  chapterNumber: number;
  byNumber: Record<string, GitaCommentaryEntry>;
};

const chapterMemo = new Map<number, GitaChapterSnapshot>();
const commentaryMemo = new Map<number, GitaCommentaryFile>();
let indexMemo: Chapter[] | null = null;
let resolvedContentDir: string | null = null;

/**
 * Resolve `content/gita` for local (apps/web cwd) and monorepo-root runners.
 * Vercel Root Directory is `apps/web`, so `cwd/content/gita` is the primary path.
 */
async function gitaContentDir(): Promise<string> {
  if (resolvedContentDir) return resolvedContentDir;

  const candidates = [
    path.join(process.cwd(), "content", "gita"),
    path.join(process.cwd(), "apps", "web", "content", "gita"),
  ];

  for (const candidate of candidates) {
    try {
      await access(path.join(candidate, "chapters.json"));
      resolvedContentDir = candidate;
      return candidate;
    } catch {
      // try next
    }
  }

  throw new Error(
    `Gita static snapshots not found (looked in ${candidates.join(", ")}). Run: pnpm --filter @divine/web generate:gita-static`,
  );
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

/** Slim chapter snapshot (no commentaries) — safe to pass into client components. */
export const getStaticGitaChapter = cache(
  async (chapterNumber: number): Promise<GitaChapterSnapshot> => {
    if (
      !Number.isInteger(chapterNumber) ||
      chapterNumber < 1 ||
      chapterNumber > 18
    ) {
      throw new Error(`Invalid Gita chapter number: ${chapterNumber}`);
    }

    if (process.env.NODE_ENV === "production") {
      const cached = chapterMemo.get(chapterNumber);
      if (cached) return cached;
    }

    const dir = await gitaContentDir();
    const filePath = path.join(dir, "reader", `bg.${chapterNumber}.json`);
    const json = (await readJsonFile(filePath)) as GitaChapterSnapshot;
    if (!json?.chapter || !Array.isArray(json.verses)) {
      throw new Error(`Corrupt Gita snapshot: bg.${chapterNumber}.json`);
    }
    if (process.env.NODE_ENV === "production") {
      chapterMemo.set(chapterNumber, json);
    }
    return json;
  },
);

/** Commentary-only file for a chapter (never pass this into a client component). */
export const getStaticGitaCommentary = cache(
  async (chapterNumber: number): Promise<GitaCommentaryFile> => {
    if (process.env.NODE_ENV === "production") {
      const cached = commentaryMemo.get(chapterNumber);
      if (cached) return cached;
    }
    const dir = await gitaContentDir();
    const filePath = path.join(dir, "commentary", `bg.${chapterNumber}.json`);
    const json = (await readJsonFile(filePath)) as GitaCommentaryFile;
    if (!json?.byNumber) {
      throw new Error(`Corrupt Gita commentary: bg.${chapterNumber}.json`);
    }
    if (process.env.NODE_ENV === "production") {
      commentaryMemo.set(chapterNumber, json);
    }
    return json;
  },
);

/** Single-verse commentary from the on-disk commentary snapshot. */
export async function getStaticGitaVerseCommentary(
  chapterNumber: number,
  verseNumber: number,
): Promise<GitaCommentaryEntry | null> {
  const file = await getStaticGitaCommentary(chapterNumber);
  return file.byNumber[String(verseNumber)] ?? null;
}

export const getStaticGitaChaptersIndex = cache(async (): Promise<Chapter[]> => {
  if (process.env.NODE_ENV === "production" && indexMemo) return indexMemo;
  const dir = await gitaContentDir();
  const filePath = path.join(dir, "chapters.json");
  const json = (await readJsonFile(filePath)) as { chapters?: Chapter[] };
  if (!Array.isArray(json.chapters)) {
    throw new Error("Corrupt Gita snapshot: chapters.json");
  }
  if (process.env.NODE_ENV === "production") {
    indexMemo = json.chapters;
  }
  return json.chapters;
});
