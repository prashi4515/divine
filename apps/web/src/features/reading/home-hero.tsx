"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

/**
 * Landing hero — full-bleed art on the right, calm copy on the left. Copy
 * column stays inside a max-width so the art stays readable and un-obscured.
 * Scales down to 320px (art fades under a strong veil).
 */
export function HomeHero() {
  const t = useMessages();
  const h = useHomeMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const titleFont = readerFontClass(preferredLanguage);

  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-krishna-arjuna.jpg"
          alt="Lord Krishna and Arjuna on the chariot at sunrise on the field of Kurukshetra"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-right"
        />
        {/* Desktop: soft fade only on the left third so the art stays fully
            visible on the right. Mobile: heavier veil for legibility. */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.9) 30%, hsl(var(--background) / 0.35) 55%, transparent 78%)",
          }}
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background) / 0.94) 0%, hsl(var(--background) / 0.82) 40%, hsl(var(--background) / 0.62) 68%, hsl(var(--background) / 0.9) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, hsl(var(--background)) 0%, transparent 28%)",
          }}
        />
      </div>

      <div className="page-gutter relative flex min-h-[70svh] w-full flex-col justify-center py-14 sm:min-h-[78svh] sm:py-20 md:min-h-[82svh] md:py-24">
        <div className="w-full max-w-2xl lg:max-w-3xl">
          <span
            className={cn(
              "border-saffron/25 bg-background/85 text-saffron inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase backdrop-blur-sm sm:text-xs",
              titleFont,
            )}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="indic-display normal-case tracking-normal">
              {h.heroEyebrow}
            </span>
          </span>

          <h1
            className={cn(
              "text-brand-display indic-display mt-6 text-4xl leading-[1.05] sm:mt-7 sm:text-6xl md:text-7xl lg:text-[5.25rem]",
              titleFont,
            )}
          >
            {t.gitaTitle}
          </h1>

          <p
            className={cn(
              "text-foreground/80 mt-6 max-w-xl text-pretty text-base leading-relaxed sm:mt-7 sm:text-lg md:text-xl",
              titleFont,
            )}
          >
            {h.heroSubtitle ?? t.tagline}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:max-w-md sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className={cn(
                "cta-saffron h-12 w-full border-0 px-7 text-base shadow-md hover:shadow-lg sm:w-auto",
                titleFont,
              )}
            >
              <Link href="/bhagavad-gita">
                {h.startReading}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "border-border/70 bg-background/70 hover:border-saffron/40 h-12 w-full px-7 backdrop-blur-sm sm:w-auto",
                titleFont,
              )}
            >
              <Link href="#verse-of-the-day">{h.todaysVerse}</Link>
            </Button>
          </div>

          <dl className="mt-10 grid w-full max-w-lg grid-cols-4 gap-x-3 gap-y-2 sm:mt-14 sm:flex sm:max-w-none sm:items-end sm:gap-10 md:gap-14">
            {[
              { value: "18", label: h.chaptersLabel },
              { value: "700", label: h.versesLabel },
              { value: "8", label: h.languagesLabel },
              { value: "2500", label: h.yearsLabel ?? "Years timeless" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="text-maroon font-serif text-2xl tabular-nums leading-none sm:text-3xl md:text-4xl">
                  {stat.value}
                </dt>
                <dd
                  className={cn(
                    "text-muted-foreground indic-display mt-1.5 text-[10px] normal-case tracking-wide sm:text-xs",
                    titleFont,
                  )}
                >
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
