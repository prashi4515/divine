"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";

/**
 * Closing call-to-action steering readers into the Gita chapter index.
 */
export function HomeBrowseCta() {
  const t = useMessages();
  const h = useHomeMessages();

  return (
    <section className="page-gutter w-full pb-14 sm:pb-20 md:pb-24">
      <div
        className="border-border/70 relative w-full overflow-hidden rounded-2xl border px-5 py-10 text-center shadow-sm sm:px-10 sm:py-12 md:px-16"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--saffron) / 0.1), hsl(var(--gold) / 0.06) 55%, hsl(var(--card)))",
        }}
      >
        <div
          className="text-saffron/10 pointer-events-none absolute -right-10 -top-10 select-none font-serif text-[8rem] leading-none sm:text-[10rem]"
          aria-hidden
        >
          ॐ
        </div>
        <h2 className="font-serif text-2xl tracking-tight sm:text-3xl md:text-4xl">
          {h.browseHeading}
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed sm:text-base">
          {h.browseBody}
        </p>
        <Button asChild size="lg" className="cta-saffron mt-7 border-0 sm:mt-8">
          <Link href="/bhagavad-gita">
            {t.allChapters}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
