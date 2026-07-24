"use client";

import { Separator } from "@/components/ui/separator";
import {
  chapterIntro,
  chapterTitleDisplay,
  displayVerseCount,
  estimateReadingMinutes,
} from "@/features/reading/chapter-reading";
import { useMessages } from "@/lib/i18n/use-messages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

type ChapterHeroProps = {
  number: number;
  title: string | null;
  verseCount: number;
  workTitle: string;
  workCode?: string;
};

/**
 * Typography-led chapter opening — number, title, meta, intro.
 * Uses the active reading-language Noto / Cormorant face.
 */
export function ChapterHero({
  number,
  title,
  verseCount,
  workTitle,
  workCode,
}: ChapterHeroProps) {
  const t = useMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const bodyFont = readerFontClass(preferredLanguage);
  const displayTitle =
    workCode === "bg"
      ? t.chapterTitle(number, title)
      : chapterTitleDisplay(number, title);
  const verses = displayVerseCount(number, verseCount);
  const minutes = estimateReadingMinutes(verses);
  const intro = workCode === "bg" ? t.chapterIntro(number) : chapterIntro(number);
  const verseLabel =
    verses === 1 ? `1 ${t.verseSingular}` : `${verses} ${t.verses}`;
  const readLabel = minutes === null ? "—" : t.minutes(minutes);
  const localizedWork =
    workCode != null
      ? (t.workTitles[workCode] ?? workTitle)
      : workTitle;

  return (
    <header className={cn("animate-fade-up w-full text-center", bodyFont)}>
      <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.2em]">
        {localizedWork}
      </p>

      <p className="text-muted-foreground indic-display mt-3 text-2xl sm:text-3xl md:text-4xl">
        {t.chapterFallback(number)}
      </p>

      <h1 className="text-brand-display indic-display mt-2 text-3xl sm:text-4xl md:text-5xl">
        {displayTitle}
      </h1>

      <ul
        className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm"
        aria-label="Chapter details"
      >
        <li>{verseLabel}</li>
        <li aria-hidden className="text-border">
          ·
        </li>
        <li>{readLabel}</li>
      </ul>

      <div className="mx-auto mt-6 flex max-w-[12rem] items-center gap-3">
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.55))",
          }}
        />
        <span className="text-saffron font-serif text-sm leading-none" aria-hidden>
          ॐ
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--saffron) / 0.55), transparent)",
          }}
        />
      </div>

      <p className="text-muted-foreground mx-auto mt-6 max-w-4xl text-pretty text-base leading-relaxed sm:text-lg">
        {intro}
      </p>

      <div className="mx-auto mt-8 max-w-xs">
        <Separator className="bg-border/60" />
      </div>
    </header>
  );
}
