/**
 * Display helpers for the public chapter reading experience.
 * Placeholder copy/counts are frontend-only until verse content exists.
 */

/** Traditional verse totals — used for hero metadata when the API count is still 0. */
export const TRADITIONAL_VERSE_COUNTS: Readonly<Record<number, number>> = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47,
  7: 30,
  8: 28,
  9: 34,
  10: 42,
  11: 55,
  12: 20,
  13: 35,
  14: 27,
  15: 20,
  16: 24,
  17: 28,
  18: 78,
};

const CHAPTER_INTROS: Readonly<Record<number, string>> = {
  1: "Arjuna stands on the field of Kurukshetra, overwhelmed by duty and compassion. This opening chapter sets the stage for a dialogue on courage, conscience, and the human heart.",
  2: "This chapter explores knowledge and wisdom — the eternal nature of the Self, the discipline of action, and the steady mind that remains unshaken amid joy and sorrow.",
  3: "Here the path of action unfolds: how to work without attachment, fulfill one’s duty, and turn everyday effort into a form of yoga.",
  4: "Wisdom and action meet. This chapter reveals how knowledge transforms work, how lineages of teaching endure, and how the divine appears across ages.",
  5: "Renunciation and engagement are reconciled. The chapter shows that true freedom lies not in withdrawal, but in acting with a quiet, detached mind.",
  6: "The yoga of meditation. Practice, posture, and the quieting of thought become a path toward inner stillness and union with the Self.",
  7: "Knowledge expands into realization. Creation, material nature, and the divine presence within all things come into clear view.",
  8: "Life, death, and the journey beyond. This chapter reflects on devotion at the final moment and the imperishable destination of the soul.",
  9: "The most confidential knowledge — the presence of the divine in all beings, and the simple, intimate path of loving devotion.",
  10: "Divine manifestations. The chapter invites contemplation of how the sacred shines through excellence, beauty, and power in the world.",
  11: "The cosmic vision. Arjuna is granted a glimpse of the universal form — awe, terror, and reverence in a single revelation.",
  12: "The path of devotion. Loving service, humility, and steadiness of heart are offered as a gentle and complete yoga.",
  13: "The field and the knower of the field. Nature, consciousness, and the distinction between body and Self are carefully drawn.",
  14: "The three qualities of nature — clarity, passion, and inertia — and how they color every thought, action, and destiny.",
  15: "The eternal tree of existence. Attachment is cut at the root, and the path leads upward to the imperishable person.",
  16: "Divine and demoniac natures. Character, restraint, and the quiet strength of virtue are weighed with clarity.",
  17: "Faith takes three forms. This chapter reflects on how belief, offering, and discipline shape the quality of a life.",
  18: "The culmination. Renunciation, duty, knowledge, and surrender gather into a final teaching on freedom and devotion.",
};

export function estimateReadingMinutes(verseCount: number): number | null {
  if (verseCount <= 0) return null;
  return Math.max(1, Math.ceil(verseCount / 3));
}

export function displayVerseCount(chapterNumber: number, verseCount: number): number {
  if (verseCount > 0) return verseCount;
  return TRADITIONAL_VERSE_COUNTS[chapterNumber] ?? 0;
}

export function chapterIntro(chapterNumber: number): string {
  return (
    CHAPTER_INTROS[chapterNumber] ??
    "This chapter invites quiet attention — a measured reading of wisdom meant to be absorbed slowly, verse by verse."
  );
}

export function chapterTitleDisplay(
  number: number,
  title: string | null | undefined,
): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : `Chapter ${number}`;
}
