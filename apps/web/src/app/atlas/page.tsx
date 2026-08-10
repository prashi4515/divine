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
        <div className="sr-only">
          <h1>Ancient Bharata Atlas — Sacred Places, Kingdoms & Epic Journeys</h1>
          <p>{atlasIndexSeo().description}</p>
          <h2>Featured Ancient Places & Realms</h2>
          <ul>
            {places.slice(0, 60).map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> ({p.categories?.[0] ?? "place"}) — {p.summary}
              </li>
            ))}
          </ul>
          <h2>Historical Travel Routes & Pilgrimages</h2>
          <ul>
            {dataset.routes.map((r) => (
              <li key={r.id}>
                <strong>{r.title}</strong> — {r.summary}
              </li>
            ))}
          </ul>
        </div>
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
