"use client";

import { useHomeMessages } from "@/lib/i18n/use-messages";

type Wisdom = {
  quote: string;
  attribution: string;
  role: string;
};

/**
 * Historical voices — famous people (well-attributed) who found the Gita
 * meaningful. Static, editorial content lives here rather than a CMS for
 * now (see docs/Content-Import.md if this ever needs to grow).
 */
const WISDOM: readonly Wisdom[] = [
  {
    quote:
      "When I read the Bhagavad-Gita I ask myself - how God created the universe; everything else seems so superfluous.",
    attribution: "Albert Einstein",
    role: "Theoretical physicist",
  },
  {
    quote:
      "In the morning I bathe my intellect in the stupendous and cosmogonal philosophy of the Bhagavad Gita.",
    attribution: "Henry David Thoreau",
    role: "Essayist & philosopher",
  },
  {
    quote:
      "When doubts haunt me and I see not one ray of light, I turn to the Bhagavad-Gita and find a verse to comfort me.",
    attribution: "Mahatma Gandhi",
    role: "Leader of India’s freedom movement",
  },
  {
    quote:
      "I owed a magnificent day to the Bhagavad-Gita - the first of books, as if an empire spoke to us.",
    attribution: "Ralph Waldo Emerson",
    role: "American essayist",
  },
];

export function HomeWisdom() {
  const h = useHomeMessages();

  return (
    <section className="page-gutter relative w-full py-16 sm:py-20 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-saffron text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.wisdomEyebrow ?? "Read across the ages"}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.wisdomHeading ?? "What great minds have said about the Gita"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.wisdomSubheading ??
            "For two and a half millennia the Gita has quietly shaped the lives of seekers, scientists and statespeople across the world."}
        </p>
      </header>

      <ul className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2">
        {WISDOM.map((w) => (
          <li key={w.attribution}>
            <figure
              className="border-border/70 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-7 shadow-xs sm:p-8"
              style={{
                background:
                  "linear-gradient(160deg, hsl(var(--card)), hsl(var(--saffron) / 0.04) 60%, hsl(var(--card)))",
              }}
            >
              <span
                className="text-saffron/20 pointer-events-none absolute -left-2 -top-4 select-none font-serif text-[6rem] leading-none"
                aria-hidden
              >
                &ldquo;
              </span>
              <blockquote className="text-foreground/90 relative font-serif text-lg leading-relaxed sm:text-xl">
                {w.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="bg-saffron/70 h-8 w-px" aria-hidden />
                <div>
                  <p className="text-maroon text-sm font-medium">
                    {w.attribution}
                  </p>
                  <p className="text-muted-foreground text-xs">{w.role}</p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
