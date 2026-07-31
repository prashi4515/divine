import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { EntityCard } from "@/features/encyclopedia/entity-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getCollections, getAllEntities } from "@/lib/knowledge/store";
import { ENTITY_KIND_LABELS, type EntityKind } from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Encyclopedia - Hindu Knowledge Graph",
  description:
    "Interconnected encyclopedia of Hindu persons, places, concepts, dynasties and scriptures - every relationship cited to traditional sources.",
  alternates: { canonical: "/encyclopedia" },
  openGraph: {
    title: "Encyclopedia - Hindu Knowledge Graph",
    description:
      "Persons, places, concepts and scriptures as first-class entities in Divine's knowledge graph.",
    url: `${SITE_URL}/encyclopedia`,
    type: "website",
  },
};

export default async function EncyclopediaLandingPage() {
  const [collections, entities] = await Promise.all([
    getCollections(),
    getAllEntities(),
  ]);
  const sections = collections.filter((c) => c.kind === "encyclopedia-section");
  const featured = [...entities]
    .filter((e) => e.status === "published")
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 9);

  const kinds = [...new Set(entities.map((e) => e.kind))].sort() as EntityKind[];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="encyclopedia"
          actionLinks={[
            { href: "/genealogy", labelKey: "navGenealogy" },
            { href: "/atlas", labelKey: "navAtlas" },
          ]}
        />

        <section className="page-gutter py-10" aria-labelledby="sections">
          <div className="mx-auto max-w-6xl space-y-10">
            <div>
              <h2
                id="sections"
                className="text-foreground font-serif text-xl tracking-tight sm:text-2xl"
              >
                Browse by section
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/encyclopedia/section/${s.slug}`}
                      className="border-border/70 bg-card hover:border-saffron/40 block rounded-2xl border p-5 transition-divine"
                    >
                      <p className="text-saffron text-[10px] font-medium uppercase tracking-[0.16em]">
                        {s.eyebrow ?? "Section"}
                      </p>
                      <h3 className="text-foreground mt-2 font-serif text-lg">
                        {s.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {s.summary}
                      </p>
                      <p className="text-muted-foreground mt-3 text-xs">
                        {s.entityIds.length} entities
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-serif text-xl tracking-tight">
                By kind
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {kinds.map((k) => (
                  <li key={k}>
                    <Link
                      href={`/encyclopedia/${k}`}
                      className="border-border/70 hover:border-saffron/40 inline-flex rounded-full border px-3 py-1 text-xs transition-divine"
                    >
                      {ENTITY_KIND_LABELS[k]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-serif text-xl tracking-tight">
                Featured
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((e, i) => (
                  <li key={e.id} className="h-full">
                    <EntityCard entity={e} index={i} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
