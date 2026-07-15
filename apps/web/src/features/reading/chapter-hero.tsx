import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  chapterIntro,
  chapterTitleDisplay,
  displayVerseCount,
  estimateReadingMinutes,
} from "@/features/reading/chapter-reading";

type ChapterHeroProps = {
  number: number;
  title: string | null;
  verseCount: number;
  workTitle: string;
  chaptersHref?: string;
};

/**
 * Typography-led chapter opening — number, title, meta, intro, CTAs.
 */
export function ChapterHero({
  number,
  title,
  verseCount,
  workTitle,
  chaptersHref = "/bhagavad-gita",
}: ChapterHeroProps) {
  const displayTitle = chapterTitleDisplay(number, title);
  const verses = displayVerseCount(number, verseCount);
  const minutes = estimateReadingMinutes(verses);
  const intro = chapterIntro(number);
  const verseLabel = verses === 1 ? "1 verse" : `${verses} verses`;
  const readLabel = minutes === null ? "Reading time TBD" : `~${minutes} min read`;

  return (
    <header className="animate-fade-up mx-auto max-w-2xl text-center">
      <p className="text-muted-foreground font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl">
        Chapter {number}
      </p>

      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl md:text-[3.25rem]">
        {displayTitle}
      </h1>

      <ul
        className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm"
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
        <li>{workTitle}</li>
      </ul>

      <div className="mx-auto mt-10 max-w-[12rem]">
        <Separator className="bg-border/80" />
      </div>

      <p className="text-muted-foreground mx-auto mt-10 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
        {intro}
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="min-w-[10.5rem]">
          <a href="#reader-preview">
            Begin Reading
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="min-w-[10.5rem]">
          <Link href={chaptersHref}>Back to Chapters</Link>
        </Button>
      </div>
    </header>
  );
}
