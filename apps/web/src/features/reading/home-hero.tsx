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
 * Home hero — full-bleed image with left-aligned copy.
 * Stronger overlay on small screens so text stays readable over the art.
 */
export function HomeHero() {
  const t = useMessages();
  const h = useHomeMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const titleFont = readerFontClass(preferredLanguage);

  return (
    <section className="relative isolate w-full">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/hero-krishna-arjuna.jpg"
          alt="Lord Krishna and Arjuna on the chariot at sunrise on the field of Kurukshetra"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-right"
        />
        {/* Desktop: soft left fade. Mobile: heavier veil so copy stays clear. */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.88) 32%, hsl(var(--background) / 0.35) 58%, transparent 82%)",
          }}
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.78) 42%, hsl(var(--background) / 0.55) 70%, hsl(var(--background) / 0.85) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(0deg, hsl(var(--background)) 0%, transparent 28%)",
          }}
        />
      </div>

      <div className="page-gutter flex min-h-[70svh] w-full flex-col justify-center py-12 sm:min-h-[78svh] sm:py-16 md:min-h-[85svh] md:py-20">
        <div className="w-full max-w-2xl lg:max-w-3xl">
          <span
            className={cn(
              "border-border/70 bg-background/80 text-muted-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm sm:text-xs",
              titleFont,
            )}
          >
            <Sparkles className="text-saffron h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="indic-display">{h.heroEyebrow}</span>
          </span>

          <h1
            className={cn(
              "text-brand-display indic-display mt-5 text-4xl sm:mt-6 sm:text-6xl md:text-7xl lg:text-8xl",
              titleFont,
            )}
          >
            {t.gitaTitle}
          </h1>

          <p
            className={cn(
              "text-foreground/80 mt-4 max-w-lg text-pretty text-base leading-relaxed sm:mt-5 sm:text-lg md:text-xl",
              titleFont,
            )}
          >
            {t.tagline}
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:max-w-md sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className={cn("cta-saffron w-full border-0 sm:w-auto", titleFont)}
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
                "bg-background/70 hover:border-saffron/40 w-full backdrop-blur-sm sm:w-auto",
                titleFont,
              )}
            >
              <Link href="#verse-of-the-day">{h.todaysVerse}</Link>
            </Button>
          </div>

          <dl className="mt-10 grid w-full max-w-md grid-cols-3 gap-3 sm:mt-12 sm:flex sm:max-w-none sm:items-center sm:gap-10 md:gap-14">
            {[
              { value: "18", label: h.chaptersLabel },
              { value: "700", label: h.versesLabel },
              { value: "8", label: h.languagesLabel },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="text-maroon font-serif text-xl tabular-nums sm:text-2xl md:text-3xl">
                  {stat.value}
                </dt>
                <dd
                  className={cn(
                    "text-muted-foreground indic-display text-[10px] normal-case tracking-normal sm:text-xs",
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
