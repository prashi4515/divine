import type { Metadata } from "next";
import { AtlasExplorer } from "@/features/atlas/atlas-explorer";
import { SiteHeader } from "@/features/reading/site-header";
import { JsonLd } from "@/components/json-ld";
import { getTraditionalAtlasLabels } from "@/lib/atlas/data/traditional-labels";
import {
  buildRelatedPeopleMap,
  getAtlasDataset,
  getAtlasPlaces,
} from "@/lib/atlas/store";
import {
  atlasIndexSeo,
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(atlasIndexSeo());

export default async function AtlasPage() {
  const [dataset, places, traditionalLabels] = await Promise.all([
    getAtlasDataset(),
    getAtlasPlaces(),
    getTraditionalAtlasLabels(),
  ]);
  const relatedByPlaceId = await buildRelatedPeopleMap(places);

  return (
    <div className="relative flex h-svh flex-col overflow-hidden">
      <SiteHeader />
      <main id="main-content" className="min-h-0 flex-1">
        <AtlasExplorer
          dataset={dataset}
          places={places}
          traditionalLabels={traditionalLabels}
          relatedByPlaceId={relatedByPlaceId}
        />
      </main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Atlas" },
          ]),
          collectionPageJsonLd({
            name: "Ancient Bharata Atlas",
            description: atlasIndexSeo().description,
            path: "/atlas",
          }),
        ]}
      />
    </div>
  );
}
