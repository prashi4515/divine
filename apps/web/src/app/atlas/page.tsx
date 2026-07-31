import type { Metadata } from "next";
import { AtlasArchitectureNote } from "@/features/atlas/atlas-architecture-note";
import { AtlasExplorer } from "@/features/atlas/atlas-explorer";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
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
    "Explore the Mahābhārata world on a modern slippy map — places, rivers, events, and journeys. Tile artwork is swappable.",
  alternates: { canonical: "/atlas" },
  openGraph: {
    title: "Ancient Bharata Atlas - Mahabharata Era",
    description:
      "Google Maps–class interaction for the Mahābhārata atlas — pan, zoom, search, layers, and animated routes.",
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
        <LocalizedModuleHeader
          module="atlas"
          actionLinks={[
            { href: "/encyclopedia/section/places", labelKey: "encyclopediaPlaces" },
            { href: "/genealogy", labelKey: "navGenealogy" },
          ]}
        />

        <section className="page-gutter pb-12 pt-2">
          <div className="mx-auto max-w-[1400px]">
            <AtlasExplorer
              dataset={dataset}
              places={places}
              relatedByPlaceId={relatedByPlaceId}
            />
            <AtlasArchitectureNote />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
