"use client";

import { Feather, Languages, ListTree, type LucideIcon } from "lucide-react";
import { useHomeMessages, useUiLanguage } from "@/lib/i18n/use-messages";

type Value = {
  icon: LucideIcon;
  title: string;
  body: string;
};

/**
 * Three calm value props. Static presentational cards — icons are tree-shaken
 * from lucide, no images, negligible client weight.
 */
export function HomeValues() {
  const lang = useUiLanguage();
  const h = useHomeMessages(lang);

  const items: Value[] = [
    {
      icon: Languages,
      title: h.multilingualTitle,
      body: h.multilingualBody,
    },
    {
      icon: ListTree,
      title: h.meaningsTitle,
      body: h.meaningsBody,
    },
    {
      icon: Feather,
      title: h.focusTitle,
      body: h.focusBody,
    },
  ];

  return (
    <section className="page-gutter relative w-full py-16 sm:py-20 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-saffron text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
          {h.valuesEyebrow ?? "Built for calm reading"}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {h.valuesHeading}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          {h.valuesSubheading}
        </p>
      </header>

      <ul className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="group border-border/70 bg-card hover:border-saffron/40 transition-divine relative flex flex-col rounded-2xl border p-6 shadow-xs hover:shadow-md sm:p-7"
          >
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 transition-divine group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.7), transparent)",
              }}
              aria-hidden
            />
            <span
              className="text-saffron mb-5 flex h-12 w-12 items-center justify-center rounded-xl border"
              style={{
                background: "hsl(var(--saffron) / 0.1)",
                borderColor: "hsl(var(--saffron) / 0.25)",
              }}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-xl tracking-tight sm:text-2xl">
              {title}
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
