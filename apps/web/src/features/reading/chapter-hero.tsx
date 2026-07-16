"use client";

import { Separator } from "@/components/ui/separator";
import {
  chapterIntro,
  chapterTitleDisplay,
  displayVerseCount,
  estimateReadingMinutes,
} from "@/features/reading/chapter-reading";
import { useMessages } from "@/lib/i18n/use-messages";

type ChapterHeroProps = {
  number: number;
  title: string | null;
  verseCount: number;
  workTitle: string;
  workCode?: string;
};

/**
 * Typography-led chapter opening — number, title, meta, intro.
 */
export function ChapterHero({
  number,
  title,
  verseCount,
  workTitle,
  workCode,
}: ChapterHeroProps) {
  const t = useMessages();
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
    <header className="animate-fade-up w-full text-center">
      <p className="text-muted-foreground font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
        {t.chapterFallback(number)}
      </p>

      <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
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
        <li aria-hidden className="text-border">
          ·
        </li>
        <li>{localizedWork}</li>
      </ul>

      <div className="mx-auto mt-6 max-w-[12rem]">
        <Separator className="bg-border/80" />
      </div>

      <p className="text-muted-foreground mx-auto mt-6 max-w-4xl text-pretty text-base leading-relaxed sm:text-lg">
        {intro}
      </p>
    </header>
  );
}
