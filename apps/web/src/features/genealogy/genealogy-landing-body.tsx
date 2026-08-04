"use client";

import { ScrollText } from "lucide-react";
import { ModuleCard } from "@/features/genealogy/module-card";
import type { GenealogyModule } from "@/lib/genealogy/types";
import {
  genealogyGroupCopy,
  type GenealogyGroupId,
} from "@/lib/i18n/genealogy-ui-messages";
import { useGenealogyUiMessages } from "@/lib/i18n/use-messages";
import type { ReadingLanguageCode } from "@/lib/reading/languages";

const MODULE_GROUP_SLUGS: Array<{
  id: GenealogyGroupId;
  slugs: string[];
}> = [
  {
    id: "asura-lineages",
    slugs: ["asuras", "daityas", "danavas", "rakshasas"],
  },
  {
    id: "divine",
    slugs: [
      "cosmic-creation",
      "trimurti",
      "major-devis",
      "prajapatis",
      "manus",
      "saptarishis",
      "devas",
    ],
  },
  {
    id: "other-races",
    slugs: ["nagas", "yakshas", "gandharvas"],
  },
  {
    id: "dynasties",
    slugs: [
      "solar-dynasty",
      "lunar-dynasty",
      "raghu-dynasty",
      "yadu-dynasty",
      "kuru-dynasty",
    ],
  },
  {
    id: "epic-families",
    slugs: ["pandavas", "kauravas", "krishna-family", "rama-family"],
  },
  {
    id: "indexes",
    slugs: ["major-rishis", "major-kings"],
  },
];

type Props = {
  modules: GenealogyModule[];
  initialLanguage?: ReadingLanguageCode;
};

/**
 * Genealogy landing body — fully driven by the UI language switcher.
 * Module titles/summaries still come from the Knowledge Graph (source language).
 */
export function GenealogyLandingBody({ modules, initialLanguage }: Props) {
  const t = useGenealogyUiMessages(initialLanguage);

  const card = (mod: GenealogyModule, index: number) => (
    <li key={mod.slug} className="h-full">
      <ModuleCard
        module={mod}
        index={index}
        initialLanguage={initialLanguage}
      />
    </li>
  );

  const bySlug = new Map(modules.map((m) => [m.slug, m] as const));
  const available = modules.filter((m) => m.status === "available");
  const upcoming = modules.filter((m) => m.status === "coming-soon");
  const groupedSlugs = new Set(MODULE_GROUP_SLUGS.flatMap((g) => g.slugs));
  const leftover = available.filter((m) => !groupedSlugs.has(m.slug));

  let cardIndex = 0;

  return (
    <>
      <section
        className="page-gutter w-full py-8 md:py-12"
        aria-labelledby="available-modules"
      >
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="flex items-end justify-between">
            <h2
              id="available-modules"
              className="text-foreground font-serif text-xl tracking-tight sm:text-2xl"
            >
              {t.exploreModules}
            </h2>
            <p className="text-muted-foreground hidden text-xs sm:block">
              {t.interactiveCount(available.length, upcoming.length)}
            </p>
          </div>

          {MODULE_GROUP_SLUGS.map((group) => {
            const mods = group.slugs
              .map((slug) => bySlug.get(slug))
              .filter((m): m is GenealogyModule => Boolean(m));
            if (mods.length === 0) return null;
            const copy = genealogyGroupCopy(t, group.id);
            return (
              <div key={group.id} id={group.id}>
                <div className="mb-4">
                  <h3 className="text-foreground font-serif text-lg tracking-tight sm:text-xl">
                    {copy.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                    {copy.blurb}
                  </p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {mods.map((mod) => card(mod, cardIndex++))}
                </ul>
              </div>
            );
          })}

          {leftover.length > 0 ? (
            <div>
              <h3 className="text-foreground mb-4 font-serif text-lg tracking-tight">
                {t.more}
              </h3>
              <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {leftover.map((mod) => card(mod, cardIndex++))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {upcoming.length > 0 ? (
        <section
          className="page-gutter w-full pb-14 md:pb-20"
          aria-labelledby="upcoming-modules"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-end justify-between">
              <h2
                id="upcoming-modules"
                className="text-foreground/90 font-serif text-lg tracking-tight sm:text-xl"
              >
                {t.inPreparation}
              </h2>
              <p className="text-muted-foreground hidden text-xs sm:block">
                {t.currentlyCited}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {upcoming.map((mod, i) => card(mod, available.length + i))}
            </ul>
          </div>
        </section>
      ) : null}

      <section
        className="page-gutter w-full pb-16 md:pb-20"
        aria-labelledby="genealogy-standards"
      >
        <div className="border-border/70 bg-card/70 mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8">
          <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
            {t.editorialEyebrow}
          </p>
          <h2
            id="genealogy-standards"
            className="text-foreground mt-2 font-serif text-xl tracking-tight sm:text-2xl"
          >
            {t.editorialTitle}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {t.editorialBody}{" "}
            <span className="text-foreground font-medium">
              {t.editorialVariant}
            </span>
            .
          </p>
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <ScrollText className="h-3.5 w-3.5" aria-hidden />
              {t.sourcesOnEveryCard}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ScrollText className="h-3.5 w-3.5" aria-hidden />
              {t.variantsPreserved}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ScrollText className="h-3.5 w-3.5" aria-hidden />
              {t.linkedToGita}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
