"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/**
 * Home brand hero — search lives in the site header on every page.
 */
export function HomeHero() {
  const t = useMessages();

  return (
    <section className="mx-auto flex w-full max-w-content flex-col items-center px-6 pb-16 pt-10 text-center md:pb-24 md:pt-20">
      <p className="font-serif text-6xl tracking-tight sm:text-7xl md:text-8xl">
        Divine
      </p>
      <h1 className="text-muted-foreground mt-6 max-w-xl text-balance text-lg leading-relaxed sm:text-xl">
        {t.tagline}
      </h1>
      <p className="text-muted-foreground mt-8 max-w-md text-sm leading-relaxed">
        Use search above to find verses by meaning, theme, or language — or open{" "}
        <Link
          href="/bhagavad-gita"
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t.gitaTitle}
        </Link>
        .
      </p>
    </section>
  );
}
