import type { Metadata } from "next";
import Link from "next/link";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { AtlasExplorer } from "@/features/atlas/atlas-explorer";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  buildRelatedPeopleMap,
  getAtlasDataset,
  getAtlasPlaces,
} from "@/lib/atlas/store";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Ancient Bharata Atlas - Mahabharata Era",
  description:
    "Explore the Ancient Bharata atlas - kingdoms, cities, rivers, forests, sacred places, and travel paths over a swappable map renderer.",
  alternates: { canonical: "/atlas" },
  openGraph: {
    title: "Ancient Bharata Atlas - Mahabharata Era",
    description:
      "Interactive atlas of the Mahabharata world - data-driven polygons, routes, layers, and semantic zoom.",
    url: `${SITE_URL}/atlas`,
    type: "website",
  },
};

export default async function AtlasPage() {
  const [dataset, places] = await Promise.all([
    getAtlasDataset(),
    getAtlasPlaces(),
  ]);
  const relatedByPlaceId = await buildRelatedPeopleMap(places);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Signature experience"
          title="Ancient Bharata Atlas"
          description="Atlas 2.0 - Knowledge Graph places, kingdom polygons, travel paths, layers, icons, semantic zoom, and marker clustering. The base map renderer is swappable; illustration can arrive later without changing data."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Atlas" },
          ]}
          actions={
            <>
              <Link
                href="/encyclopedia/section/places"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Encyclopedia places
              </Link>
              <Link
                href="/genealogy"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Genealogy
              </Link>
            </>
          }
        />

        <section className="page-gutter pb-12 pt-2">
          <div className="mx-auto max-w-[1400px]">
            <AtlasExplorer
              dataset={dataset}
              places={places}
              relatedByPlaceId={relatedByPlaceId}
            />
            <p className="text-muted-foreground mt-4 text-center text-xs leading-relaxed">
              Atlas 2.0 architecture · Structural renderer · KG places · Swappable
              illustrated plate later
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
