"use client";

import { Feather, Languages, ListTree } from "lucide-react";
import { useHomeMessages } from "@/lib/i18n/use-messages";

/**
 * Three calm value props. Static presentational cards — icons are tree-shaken
 * from lucide, no images, negligible client weight.
 */
export function HomeValues() {
  const h = useHomeMessages();

  const items = [
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
    <section className="page-gutter w-full py-12 sm:py-16 md:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-2xl tracking-tight sm:text-3xl md:text-4xl">
          {h.valuesHeading}
        </h2>
        <p className="text-muted-foreground mt-3 text-pretty text-sm leading-relaxed sm:text-base">
          {h.valuesSubheading}
        </p>
      </header>

      <ul className="mt-8 grid w-full grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 md:mt-12 md:gap-5">
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="border-border bg-card hover:border-saffron/30 transition-divine flex flex-col rounded-xl border p-5 shadow-xs hover:shadow-md sm:p-6"
          >
            <span
              className="text-saffron mb-4 flex h-10 w-10 items-center justify-center rounded-lg border sm:mb-5 sm:h-11 sm:w-11"
              style={{
                background: "hsl(var(--saffron) / 0.1)",
                borderColor: "hsl(var(--saffron) / 0.25)",
              }}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-lg tracking-tight">{title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
