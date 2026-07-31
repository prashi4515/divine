"use client";

import Link from "next/link";
import type { Chapter } from "@divine/types";
import { ArrowRight, BookOpen } from "lucide-react";
import { useMessages, useReadingHydrated } from "@/lib/i18n/use-messages";
import {
  gitaChapterIntro,
  GITA_CHAPTER_TITLES,
} from "@/lib/i18n/gita-chapters";
import {
  isReadingLanguageCode,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";
import { chapterIntro } from "./chapter-reading";

type ChapterCardProps = {
  chapter: Chapter;
  /** Overrides default path derivation when set. */
  basePath?: string;
};

function chapterHref(chapter: Chapter, basePath?: string): string {
  if (basePath) return `${basePath}/chapter-${chapter.number}`;
  if (chapter.work.code === "bg")
    return `/bhagavad-gita/chapter-${chapter.number}`;
  return `/scriptures/${chapter.work.slug}/chapter-${chapter.number}`;
}

/**
 * Rich chapter tile — number badge, bilingual titles, intro paragraph, verse
 * count + saffron circular CTA. Inspired by holy-bhagavad-gita.org's card
 * pattern.
 */
export function ChapterCard({ chapter, basePath }: ChapterCardProps) {
  const t = useMessages();
  const hydrated = useReadingHydrated();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const lang: ReadingLanguageCode =
    hydrated && isReadingLanguageCode(preferredLanguage)
      ? preferredLanguage
      : "en";
  const titleFont = readerFontClass(lang);

  const href = chapterHref(chapter, basePath);
  const isGita = chapter.work.code === "bg";
  const primaryTitle = isGita
    ? t.chapterTitle(chapter.number, chapter.title)
    : chapter.title?.trim() || t.chapterFallback(chapter.number);
  // Sanskrit line beneath, matching bilingual reference layout.
  const secondaryTitle = isGita
    ? lang === "sa"
      ? GITA_CHAPTER_TITLES.en[chapter.number]
      : GITA_CHAPTER_TITLES.sa[chapter.number]
    : null;
  const description = isGita
    ? gitaChapterIntro(lang, chapter.number) || t.gitaBlurb
    : chapterIntro(chapter.number);
  const verseCount = chapter.verseCount;
  const verseLabel =
    verseCount === 1 ? t.verseSingular : t.verses;

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "group border-border/70 bg-card hover:border-saffron/40 relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-xs sm:p-7",
        "transition-divine hover:-translate-y-1 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
        {/* saffron top-rule on hover */}
        <span
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 opacity-0 transition-divine group-hover:scale-x-100 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.85), transparent)",
          }}
          aria-hidden
        />

        {/* soft wash on hover */}
        <span
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 transition-divine group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--saffron) / 0.14), transparent 70%)",
          }}
          aria-hidden
        />

        {/* header: number badge + titles */}
        <div className="relative flex items-start gap-4">
          <span
            className="cta-saffron flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-serif text-xl leading-none text-white shadow-sm transition-divine group-hover:scale-105 group-hover:shadow-md sm:h-14 sm:w-14 sm:text-2xl"
            aria-hidden
          >
            {chapter.number}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "text-foreground line-clamp-2 font-serif text-lg tracking-tight sm:text-xl",
                titleFont,
              )}
            >
              {primaryTitle}
            </h3>
            {secondaryTitle ? (
              <p
                className={cn(
                  "text-saffron/90 mt-0.5 line-clamp-1 text-xs sm:text-sm",
                  lang === "sa" ? "" : "font-reader-deva",
                )}
              >
                {secondaryTitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* intro */}
        <p
          className={cn(
            "text-muted-foreground mt-5 line-clamp-3 flex-1 text-sm leading-relaxed sm:text-[0.9375rem]",
            titleFont,
          )}
        >
          {description}
        </p>

        {/* footer: verse count + arrow */}
        <div className="border-border/60 mt-6 flex items-end justify-between border-t pt-4">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular-nums">{verseCount}</span>
            <span>{verseLabel}</span>
          </span>
          <span
            className="cta-saffron flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-divine group-hover:translate-x-0.5 group-hover:shadow-md sm:h-10 sm:w-10"
            aria-hidden
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
    </Link>
  );
}
