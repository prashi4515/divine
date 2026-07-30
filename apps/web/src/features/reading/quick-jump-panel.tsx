"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TRADITIONAL_VERSE_COUNTS } from "@/features/reading/chapter-reading";
import { useMessages } from "@/lib/i18n/use-messages";

type QuickJumpPanelProps = {
  chapterNumber: number;
  currentVerse: number;
  verseNumbers: number[];
  /** Total chapters in this work (Gita = 18). */
  totalChapters?: number;
  chapterHref: (n: number) => string;
  onJumpVerse: (verseNumber: number) => void;
};

/**
 * Sidebar “Quick Jump” — chapter + verse selectors above the number grid
 * (holy-bhagavad-gita.org pattern, Divine styling).
 */
export function QuickJumpPanel({
  chapterNumber,
  currentVerse,
  verseNumbers,
  totalChapters = 18,
  chapterHref,
  onJumpVerse,
}: QuickJumpPanelProps) {
  const t = useMessages();
  const router = useRouter();
  const [chapter, setChapter] = React.useState(chapterNumber);
  const [verse, setVerse] = React.useState(currentVerse);

  React.useEffect(() => {
    setChapter(chapterNumber);
  }, [chapterNumber]);

  React.useEffect(() => {
    setVerse(currentVerse);
  }, [currentVerse]);

  const verseCountForChapter =
    chapter === chapterNumber
      ? verseNumbers.length
      : (TRADITIONAL_VERSE_COUNTS[chapter] ?? 1);

  const verseOptions = React.useMemo(() => {
    if (chapter === chapterNumber) return verseNumbers;
    return Array.from({ length: verseCountForChapter }, (_, i) => i + 1);
  }, [chapter, chapterNumber, verseNumbers, verseCountForChapter]);

  React.useEffect(() => {
    if (!verseOptions.includes(verse)) {
      setVerse(verseOptions[0] ?? 1);
    }
  }, [verseOptions, verse]);

  function startReading() {
    if (chapter !== chapterNumber) {
      router.push(`${chapterHref(chapter)}#verse-${verse}`);
      return;
    }
    onJumpVerse(verse);
  }

  return (
    <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border p-5 shadow-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--saffron)), hsl(var(--gold)))",
        }}
        aria-hidden
      />

      <h3 className="text-center text-sm font-medium tracking-tight text-foreground sm:text-[0.9375rem]">
        {t.quickJump}
      </h3>

      <div
        className="text-saffron/45 mx-auto mt-2 flex items-center justify-center gap-1.5"
        aria-hidden
      >
        <span className="bg-saffron/40 h-1 w-1 rounded-full" />
        <span className="bg-saffron/55 h-1.5 w-1.5 rounded-full" />
        <span className="bg-saffron/40 h-1 w-1 rounded-full" />
      </div>

      <div className="mt-5 space-y-3">
        <label className="block space-y-1.5">
          <span className="text-muted-foreground text-[11px] uppercase tracking-[0.12em]">
            {t.chooseChapter}
          </span>
          <select
            className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-1"
            value={chapter}
            onChange={(e) => setChapter(Number.parseInt(e.target.value, 10))}
            aria-label={t.chooseChapter}
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {t.chapterFallback(n)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-muted-foreground text-[11px] uppercase tracking-[0.12em]">
            {t.selectVerse}
          </span>
          <select
            className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-1"
            value={verse}
            onChange={(e) => setVerse(Number.parseInt(e.target.value, 10))}
            aria-label={t.selectVerse}
          >
            {verseOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          className="cta-saffron mt-1 h-10 w-full border-0 font-medium"
          onClick={startReading}
        >
          {t.startReading}
        </Button>
      </div>
    </div>
  );
}
