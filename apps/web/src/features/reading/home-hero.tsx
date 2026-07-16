"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/use-messages";

type HomeHeroProps = {
  ctaHref: string;
};

export function HomeHero({ ctaHref }: HomeHeroProps) {
  const t = useMessages();

  return (
    <section className="mx-auto flex w-full max-w-content flex-col items-center px-6 pb-6 pt-10 text-center md:pt-16">
      <p className="font-serif text-6xl tracking-tight sm:text-7xl md:text-8xl">Divine</p>
      <h1 className="text-muted-foreground mt-6 max-w-xl text-balance text-lg leading-relaxed sm:text-xl">
        {t.tagline}
      </h1>
      <div className="mt-10">
        <Button asChild size="lg">
          <Link href={ctaHref}>
            {t.beginReading}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
