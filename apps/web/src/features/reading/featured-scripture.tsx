"use client";

import Link from "next/link";
import type { Work } from "@divine/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  localizeWorkDescription,
  localizeWorkTitle,
  useMessages,
} from "@/lib/i18n/use-messages";
import { publicWorkPath } from "@/lib/reading/work-paths";

type FeaturedScriptureProps = {
  work: Work;
};

/**
 * Premium featured scripture block — one composition, interaction via CTA.
 */
export function FeaturedScripture({ work }: FeaturedScriptureProps) {
  const t = useMessages();
  const href = publicWorkPath(work);
  const title = localizeWorkTitle(t, work);
  const description = localizeWorkDescription(t, work);

  return (
    <section
      aria-labelledby="featured-scripture-heading"
      className="mx-auto w-full max-w-3xl px-6 pb-16 pt-8 md:pb-20"
    >
      <div className="border-border bg-card/60 relative overflow-hidden rounded-xl border p-8 shadow-sm md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 10% 0%, hsl(var(--muted) / 0.9), transparent 55%)",
          }}
        />
        <div className="relative">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
            {t.featuredScripture}
          </p>
          <h2
            id="featured-scripture-heading"
            className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-4 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
              {description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={href}>
                {t.beginReading}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <span className="text-muted-foreground font-mono text-xs">{work.code}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedScriptureEmpty() {
  const t = useMessages();
  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-28 pt-8">
      <div className="border-border rounded-xl border border-dashed px-8 py-16 text-center">
        <p className="font-serif text-xl tracking-tight">{t.scriptureSoon}</p>
        <p className="text-muted-foreground mt-2 text-sm">{t.scriptureSoonHint}</p>
      </div>
    </section>
  );
}
