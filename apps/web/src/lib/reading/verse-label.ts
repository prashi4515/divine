/**
 * Human-readable Gita chapter / verse labels for the public UI.
 * Stable public IDs (`bg.2.47`) stay in data/API — never show them to readers.
 */

const BG_VERSE = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i;
const BG_CHAPTER = /^(?:bg\.)(\d{1,2})$/i;

export function formatGitaVerseLabel(
  chapterNumber: number,
  verseNumber: number,
): string {
  return `Chapter ${chapterNumber}, Verse ${verseNumber}`;
}

export function formatGitaChapterLabel(chapterNumber: number): string {
  return `Chapter ${chapterNumber}`;
}

/**
 * Turn a public ID (`bg.2.47`, `bg.1`, `2.47`) into a clear reader label.
 * Returns the original string if it isn't a Gita ref.
 */
export function formatPublicIdLabel(publicId: string): string {
  const raw = publicId.trim();
  const verse = raw.match(BG_VERSE);
  if (verse) {
    return formatGitaVerseLabel(Number(verse[1]), Number(verse[2]));
  }
  const chapter = raw.match(BG_CHAPTER);
  if (chapter) {
    return formatGitaChapterLabel(Number(chapter[1]));
  }
  return raw;
}

/** True when the string looks like a `bg.*` / `N.M` corpus ref. */
export function isGitaPublicId(value: string): boolean {
  const raw = value.trim();
  return BG_VERSE.test(raw) || BG_CHAPTER.test(raw);
}
