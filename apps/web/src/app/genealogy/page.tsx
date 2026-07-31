import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { ModuleCard } from "@/features/genealogy/module-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getGenealogyModules } from "@/lib/genealogy/store";
import type { GenealogyModule } from "@/lib/genealogy/types";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

const MODULE_GROUPS: Array<{
  id: string;
  title: string;
  blurb: string;
  slugs: string[];
}> = [
  {
    id: "asura-lineages",
    title: "Asura lineages",
    blurb:
      "Daityas (Diti) and Danavas (Danu) are the Asura houses. Raksasas are listed next - a separate race, never merged.",
    slugs: ["asuras", "daityas", "danavas", "rakshasas"],
  },
  {
    id: "divine",
    title: "Divinity & creation",
    blurb: "Trimurti, Devis, Prajapatis, Manus, Saptarsis and Devas.",
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
    title: "Nagas, Yaksas & Gandharvas",
    blurb: "Separate celestial and subterranean races.",
    slugs: ["nagas", "yakshas", "gandharvas"],
  },
  {
    id: "dynasties",
    title: "Royal dynasties",
    blurb: "Solar, Lunar, Raghu, Yadu and Kuru houses.",
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
    title: "Epic families",
    blurb: "Pandavas, Kauravas, Krsna and Rama.",
    slugs: ["pandavas", "kauravas", "krishna-family", "rama-family"],
  },
  {
    id: "indexes",
    title: "Indexes",
    blurb: "Cross-cutting rsis and kings.",
    slugs: ["major-rishis", "major-kings"],
  },
];

export const metadata: Metadata = {
  title: "Genealogy - Hindu family trees, dynasties and lineages",
  description:
    "Interactive Hindu genealogy: Asuras (Daityas & Danavas), Raksasas, Devas, Solar and Lunar dynasties, Pandavas, Krsna and Rama - every relationship cited to scripture.",
  keywords: [
    "Hindu genealogy",
    "Asuras",
    "Daityas",
    "Danavas",
    "Rakshasas",
    "Hiranyakashipu",
    "Prahlada",
    "Mahabali",
    "Ravana",
    "Iksvaku dynasty",
    "Solar Dynasty",
    "Lunar Dynasty",
    "Pandavas family tree",
    "Krishna family",
  ],
  alternates: { canonical: "/genealogy" },
  openGraph: {
    title: "Genealogy - Hindu family trees, dynasties and lineages",
    description:
      "Asuras, Daityas, Danavas, Raksasas, Devas, Solar and Lunar dynasties - interactive, cited family trees.",
    url: `${SITE_URL}/genealogy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hindu Genealogy - interactive family trees",
    description:
      "Asuras (Daityas & Danavas), Raksasas, dynasties, Krsna and Rama - every relationship cited.",
  },
};

export default async function GenealogyLandingPage() {
  const modules = await getGenealogyModules();
  const bySlug = new Map(modules.map((m) => [m.slug, m] as const));
  const available = modules.filter((m) => m.status === "available");
  const upcoming = modules.filter((m) => m.status === "coming-soon");
  const groupedSlugs = new Set(MODULE_GROUPS.flatMap((g) => g.slugs));
  const leftover = available.filter((m) => !groupedSlugs.has(m.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Divine Genealogy",
    description:
      "An interactive, cited encyclopaedia of Hindu genealogy: Asuras, dynasties, deities, sages and their relationships.",
    url: `${SITE_URL}/genealogy`,
    hasPart: available.map((m) => ({
      "@type": "CreativeWork",
      name: m.title,
      description: m.summary,
      url: `${SITE_URL}/genealogy/${m.slug}`,
    })),
    isPartOf: {
      "@type": "WebSite",
      name: "Divine",
      url: SITE_URL,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Genealogy",
        item: `${SITE_URL}/genealogy`,
      },
    ],
  };

  let cardIndex = 0;

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="genealogy"
          actionLinks={[
            { href: "/encyclopedia", labelKey: "navEncyclopedia" },
            { href: "/bhagavad-gita", labelKey: "allChapters" },
          ]}
        />

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
                Explore a module
              </h2>
              <p className="text-muted-foreground hidden text-xs sm:block">
                {available.length} interactive · {upcoming.length} in preparation
              </p>
            </div>

            {MODULE_GROUPS.map((group) => {
              const mods = group.slugs
                .map((slug) => bySlug.get(slug))
                .filter((m): m is GenealogyModule => Boolean(m));
              if (mods.length === 0) return null;
              return (
                <div key={group.id} id={group.id}>
                  <div className="mb-4">
                    <h3 className="text-foreground font-serif text-lg tracking-tight sm:text-xl">
                      {group.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                      {group.blurb}
                    </p>
                  </div>
                  <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                    {mods.map((mod) => {
                      const index = cardIndex++;
                      return (
                        <li key={mod.slug} className="h-full">
                          <ModuleCard module={mod} index={index} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {leftover.length > 0 && (
              <div>
                <h3 className="text-foreground mb-4 font-serif text-lg tracking-tight">
                  More
                </h3>
                <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {leftover.map((mod) => {
                    const index = cardIndex++;
                    return (
                      <li key={mod.slug} className="h-full">
                        <ModuleCard module={mod} index={index} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>

        {upcoming.length > 0 && (
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
                  In preparation
                </h2>
                <p className="text-muted-foreground hidden text-xs sm:block">
                  Currently being cited and reviewed
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {upcoming.map((mod, i) => (
                  <li key={mod.slug} className="h-full">
                    <ModuleCard module={mod} index={available.length + i} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section
          className="page-gutter w-full pb-16 md:pb-20"
          aria-labelledby="genealogy-standards"
        >
          <div className="border-border/70 bg-card/70 mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8">
            <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
              Editorial standards
            </p>
            <h2
              id="genealogy-standards"
              className="text-foreground mt-2 font-serif text-xl tracking-tight sm:text-2xl"
            >
              Every relationship, cited.
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Genealogy in the Sanātana tradition is preserved not in one book
              but in many. Divine draws each relationship from an accepted
              scripture — Mahābhārata, Rāmāyaṇa, Bhāgavata Purāṇa, Viṣṇu
              Purāṇa, Harivaṃśa, Śiva Purāṇa and others — and cites the
              specific parva, skandha or kāṇḍa alongside the fact. Where
              traditions differ, we mark the entry as a{" "}
              <span className="text-foreground font-medium">Variant Tradition</span>{" "}
              and show the alternatives with citations rather than choosing one
              version as absolute. Asura houses (Daitya / Dānava) are never
              merged with Rākṣasas.
            </p>
            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" aria-hidden />
                Sources shown on every card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" aria-hidden />
                Variant traditions preserved, not hidden
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" aria-hidden />
                Linked to the Bhagavad Gītā where relevant
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}
