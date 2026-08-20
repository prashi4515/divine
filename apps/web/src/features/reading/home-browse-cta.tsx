"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useHomeMessages,
  useMessages,
  useUiLanguage,
} from "@/lib/i18n/use-messages";
import { getVerseOfTheDay } from "@/lib/reading/verse-of-the-day";
import { localizePath } from "@/lib/i18n/locales";

/**
 * Closing call-to-action steering readers into the Gita chapter index.
 */
export function HomeBrowseCta() {
  const lang = useUiLanguage();
  const t = useMessages(lang);
  const h = useHomeMessages(lang);
  const today = getVerseOfTheDay();
  const todayHref = localizePath(
    `/bhagavad-gita/chapter-${today.chapter}#verse-${today.verse}`,
    lang,
  );
  const browseHref = localizePath("/bhagavad-gita", lang);

  return (
    <section className="page-gutter w-full pb-16 pt-4 sm:pb-24 md:pb-28">
      <div
        className="border-border/70 relative w-full overflow-hidden rounded-3xl border px-6 py-14 text-center shadow-sm sm:px-10 sm:py-20 md:px-16 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--saffron) / 0.16), hsl(var(--gold) / 0.10) 45%, hsl(var(--card)))",
        }}
      >
        <div
          className="text-saffron/12 pointer-events-none absolute -right-8 -top-8 select-none font-serif text-[10rem] leading-none sm:text-[14rem]"
          aria-hidden
        >
          ॐ
        </div>
        <div
          className="text-saffron/10 pointer-events-none absolute -bottom-10 -left-6 select-none font-serif text-[8rem] leading-none sm:text-[12rem]"
          aria-hidden
        >
          ॐ
        </div>

        <p className="text-saffron relative text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.browseEyebrow ?? "Begin now"}
        </p>
        <h2 className="relative mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.browseHeading}
        </h2>
        <p className="text-muted-foreground relative mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.browseBody}
        </p>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="cta-saffron h-12 border-0 px-7 text-base shadow-md hover:shadow-lg"
          >
            <Link href={browseHref}>
              {t.allChapters}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="link"
            className="text-maroon hover:text-saffron h-12 px-3 text-base"
          >
            <Link href={todayHref}>
              {h.browseSecondaryCta ?? h.todaysVerse}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
