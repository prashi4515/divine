"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeMessages } from "@/lib/i18n/use-messages";

/**
 * A single, curated highlight verse (BG 2.47) rendered statically — no API call,
 * so the landing page stays instant. Sanskrit + transliteration are constant;
 * only the short gloss + labels localize.
 */
export function FeaturedVerse() {
  const h = useHomeMessages();

  return (
    <section
      id="verse-of-the-day"
      className="page-gutter w-full scroll-mt-24 py-8 sm:py-12"
    >
      <figure
        className="border-border/80 relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border px-5 py-9 text-center shadow-sm sm:px-10 sm:py-12 md:px-16"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--saffron) / 0.06), hsl(var(--card)))",
        }}
      >
        <span
          className="text-saffron/25 pointer-events-none absolute -left-1 top-2 select-none font-serif text-6xl leading-none sm:text-7xl"
          aria-hidden
        >
          &ldquo;
        </span>

        <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.2em]">
          {h.verseForReflection}
        </p>

        <blockquote className="mt-5 sm:mt-6">
          <p
            lang="sa"
            className="font-serif text-xl leading-relaxed tracking-tight sm:text-2xl sm:leading-[1.9] md:text-[1.75rem]"
          >
            कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
            <br />
            मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
          </p>
          <p className="text-muted-foreground mt-4 text-sm italic leading-relaxed sm:mt-5 sm:text-base">
            karmaṇy-evādhikāras te mā phaleṣu kadācana
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:mt-5 sm:text-lg">
            {h.featuredMeaning}
          </p>
        </blockquote>

        <figcaption className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:gap-4">
          <cite className="text-maroon font-mono text-xs not-italic tracking-wide">
            bg.2.47
          </cite>
          <Link
            href="/bhagavad-gita/chapter-2#verse-47"
            className="text-maroon group inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            {h.readInContext}
            <ArrowRight
              className="h-3.5 w-3.5 transition-divine group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </figcaption>
      </figure>
    </section>
  );
}
