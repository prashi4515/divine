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
  /** Left-align on large screens so the sidebar Quick Jump can sit opposite. */
  align?: "center" | "start";
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
  align = "center",
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
  const start = align === "start";

  return (
    <header
      className={cn(
        "animate-fade-up w-full",
        start ? "text-left lg:pr-4" : "text-center",
        bodyFont,
      )}
    >
      <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.2em]">
        {localizedWork}
      </p>

      <p
        className={cn(
          "text-muted-foreground indic-display mt-3 text-2xl sm:text-3xl md:text-4xl",
        )}
      >
        {t.chapterFallback(number)}
      </p>

      <h1 className="text-brand-display indic-display mt-2 text-3xl sm:text-4xl md:text-5xl">
        {displayTitle}
      </h1>

      <ul
        className={cn(
          "text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm",
          start ? "justify-start" : "justify-center",
        )}
        aria-label="Chapter details"
      >
        <li>{verseLabel}</li>
        <li aria-hidden className="text-border">
          ·
        </li>
        <li>{readLabel}</li>
      </ul>

      <div
        className={cn(
          "mt-6 flex max-w-[12rem] items-center gap-3",
          start ? "mr-auto" : "mx-auto",
        )}
      >
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

      <p
        className={cn(
          "text-muted-foreground mt-6 max-w-3xl text-pretty text-base leading-relaxed sm:text-lg",
          !start && "mx-auto max-w-4xl",
        )}
      >
        {intro}
      </p>

      <div
        className={cn("mt-8 max-w-xs", start ? "mr-auto" : "mx-auto")}
      >
        <Separator className="bg-border/60" />
      </div>
    </header>
  );
}
