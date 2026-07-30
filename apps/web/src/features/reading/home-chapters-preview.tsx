"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";
import {
  gitaChapterIntro,
  GITA_CHAPTER_TITLES,
} from "@/lib/i18n/gita-chapters";
import {
  isReadingLanguageCode,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { TRADITIONAL_VERSE_COUNTS } from "@/features/reading/chapter-reading";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

const CHAPTER_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1);

/**
 * Rich chapter cards inspired by holy-bhagavad-gita.org — number badge,
 * dual titles, description, verse-count and arrow CTA. Static layout (no
 * per-card scroll animations) so the grid stays calm while scrolling.
 */
export function HomeChaptersPreview() {
  const t = useMessages();
  const h = useHomeMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const lang: ReadingLanguageCode = isReadingLanguageCode(preferredLanguage)
    ? preferredLanguage
    : "en";
  const titleFont = readerFontClass(lang);

  return (
    <section
      className="page-gutter relative w-full py-16 sm:py-20 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, transparent, hsl(var(--muted) / 0.4) 20%, hsl(var(--muted) / 0.4) 80%, transparent)",
      }}
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-saffron text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.chaptersEyebrow ?? "The eighteen chapters"}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.chaptersHeading ?? "A map of the whole journey"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.chaptersSubheading ??
            "From Arjuna’s despair to the final teaching of surrender - every chapter is one step of the path."}
        </p>
      </header>

      <ul className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CHAPTER_NUMBERS.map((n) => {
          const primaryTitle =
            GITA_CHAPTER_TITLES[lang]?.[n] ??
            GITA_CHAPTER_TITLES.en[n] ??
            `Chapter ${n}`;
          const secondaryTitle =
            lang === "sa"
              ? GITA_CHAPTER_TITLES.en[n]
              : GITA_CHAPTER_TITLES.sa[n];
          const description = gitaChapterIntro(lang, n);
          const verseCount = TRADITIONAL_VERSE_COUNTS[n] ?? 0;

          return (
            <li key={n} className="h-full">
              <Link
                href={`/bhagavad-gita/chapter-${n}`}
                className={cn(
                  "group border-border/70 bg-card hover:border-saffron/40 transition-divine relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-xs hover:shadow-md sm:p-7",
                )}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 transition-divine group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.8), transparent)",
                  }}
                  aria-hidden
                />

                <div className="flex items-center gap-4">
                  <span
                    className="cta-saffron flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-serif text-xl leading-none text-white shadow-sm sm:h-14 sm:w-14 sm:text-2xl"
                    aria-hidden
                  >
                    {n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "text-foreground line-clamp-1 font-serif text-lg tracking-tight sm:text-xl",
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

                <p
                  className={cn(
                    "text-muted-foreground mt-5 line-clamp-3 flex-1 text-sm leading-relaxed sm:text-[0.9375rem]",
                    titleFont,
                  )}
                >
                  {description}
                </p>

                <div className="border-border/60 mt-6 flex items-end justify-between border-t pt-4">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs sm:text-sm">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    <span className="tabular-nums">{verseCount}</span>
                    <span>{t.verses}</span>
                  </span>
                  <span
                    className="cta-saffron flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-divine group-hover:translate-x-0.5 group-hover:shadow-md sm:h-10 sm:w-10"
                    aria-hidden
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex justify-center sm:mt-12">
        <Button asChild variant="outline" size="lg" className="border-border">
          <Link href="/bhagavad-gita">
            {h.viewAllChapters ?? t.allChapters ?? "Explore all chapters"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
