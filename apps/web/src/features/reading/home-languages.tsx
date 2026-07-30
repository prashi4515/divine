"use client";

import { useHomeMessages } from "@/lib/i18n/use-messages";
import { READING_LANGUAGES } from "@/lib/reading/languages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { cn } from "@/lib/utils";

/**
 * One-word greeting in each supported script, showing at a glance that the
 * reader is truly multilingual. Purely presentational — the language
 * switcher in the header is the interactive control.
 */
const GREETINGS: Record<string, string> = {
  en: "Peace",
  sa: "शान्तिः",
  hi: "शान्ति",
  te: "శాంతి",
  kn: "ಶಾಂತಿ",
  ta: "அமைதி",
  ml: "ശാന്തി",
  or: "ଶାନ୍ତି",
};

export function HomeLanguages() {
  const h = useHomeMessages();

  return (
    <section
      className="page-gutter relative w-full py-16 sm:py-20 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, transparent, hsl(var(--saffron) / 0.04) 30%, hsl(var(--saffron) / 0.04) 70%, transparent)",
      }}
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-saffron text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.languagesEyebrow ?? "Eight languages"}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.languagesHeading ?? "Read in the language you think in"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.languagesSubheading ??
            "Every verse comes with Sanskrit, translations, word-by-word meanings and commentary — in eight scripts."}
        </p>
      </header>

      <ul className="mx-auto mt-10 grid w-full max-w-5xl grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-4">
        {READING_LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <div
              className={cn(
                "border-border/70 bg-background/70 hover:border-saffron/40 transition-divine flex h-full flex-col items-center justify-center gap-2 rounded-xl border px-4 py-6 text-center shadow-xs backdrop-blur-sm sm:py-7",
              )}
            >
              <span
                className={cn(
                  "text-foreground text-2xl leading-tight sm:text-3xl",
                  readerFontClass(lang.code),
                )}
              >
                {GREETINGS[lang.code] ?? lang.nativeName}
              </span>
              <span
                className={cn(
                  "text-muted-foreground text-xs sm:text-sm",
                  readerFontClass(lang.code),
                )}
              >
                {lang.nativeName}
              </span>
              <span className="text-muted-foreground/70 mt-1 text-[10px] uppercase tracking-widest">
                {lang.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
