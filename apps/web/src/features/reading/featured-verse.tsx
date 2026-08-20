"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  useHomeMessages,
  useMessages,
  useUiLanguage,
} from "@/lib/i18n/use-messages";
import {
  dailyVerseMeaning,
  getVerseOfTheDay,
  type DailyVerse,
} from "@/lib/reading/verse-of-the-day";
import { shlokaFontClass } from "@/lib/reading/reader-fonts";
import { localizePath } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type FeaturedVerseProps = {
  /** Server-computed verse for the current IST calendar day. */
  verse?: DailyVerse;
};

/**
 * Home “verse of the day” — rotates by Asia/Kolkata calendar day from a
 * curated catalog (no API call, so the landing page stays instant).
 */
export function FeaturedVerse({ verse: verseProp }: FeaturedVerseProps) {
  const lang = useUiLanguage();
  const h = useHomeMessages(lang);
  const t = useMessages(lang);
  const verse = verseProp ?? getVerseOfTheDay();
  const meaning = dailyVerseMeaning(verse, lang);
  const href = localizePath(
    `/bhagavad-gita/chapter-${verse.chapter}#verse-${verse.verse}`,
    lang,
  );

  return (
    <section
      id="verse-of-the-day"
      className="page-gutter w-full scroll-mt-24 py-14 sm:py-20 md:py-24"
    >
      <figure
        className="border-border/70 relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border px-5 py-10 text-center shadow-sm sm:px-12 sm:py-16 md:px-16 md:py-20"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--saffron) / 0.07), hsl(var(--card)) 55%, hsl(var(--gold) / 0.05))",
        }}
      >
        {/* Corner ornaments */}
        <span
          className="text-saffron/25 pointer-events-none absolute left-3 top-1 select-none font-serif text-6xl leading-none sm:left-5 sm:top-3 sm:text-8xl"
          aria-hidden
        >
          &ldquo;
        </span>
        <span
          className="text-saffron/25 pointer-events-none absolute bottom-1 right-3 select-none font-serif text-6xl leading-none sm:bottom-3 sm:right-5 sm:text-8xl"
          aria-hidden
        >
          &rdquo;
        </span>
        <span
          className="text-saffron/10 pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-serif text-[16rem] leading-none -translate-y-1/2 sm:text-[22rem]"
          aria-hidden
        >
          ॐ
        </span>

        <div className="relative">
          <p className="text-saffron inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
            <span className="bg-saffron/70 h-px w-6" aria-hidden />
            {h.verseForReflection}
            <span className="bg-saffron/70 h-px w-6" aria-hidden />
          </p>

          <blockquote className="mt-6 sm:mt-8">
            <p
              lang="sa"
              className={cn(
                "text-shloka whitespace-pre-line",
                shlokaFontClass("sa"),
              )}
            >
              {verse.sanskrit}
            </p>
            <p className="text-muted-foreground mt-5 whitespace-pre-line text-sm italic leading-relaxed sm:mt-6 sm:text-base">
              {verse.transliteration}
            </p>
            <div
              className="bg-border/70 mx-auto mt-6 h-px w-16 sm:mt-8"
              aria-hidden
            />
            <p className="text-foreground/90 mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed sm:mt-8 sm:text-xl" lang={lang}>
              {meaning}
            </p>
          </blockquote>

          <figcaption className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
            <cite className="border-maroon/25 bg-background/70 text-maroon inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] not-italic tracking-wide sm:text-xs">
              <BookOpen className="h-3 w-3" aria-hidden />
              {t.chapterFallback(verse.chapter)}, {t.verseSingular}{" "}
              {verse.verse}
            </cite>
            <Link
              href={href}
              className="cta-saffron transition-divine group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md"
            >
              {h.readInContext}
              <ArrowRight
                className="h-4 w-4 transition-divine group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
