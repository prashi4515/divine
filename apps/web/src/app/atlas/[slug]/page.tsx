import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, Library, MapPin } from "lucide-react";
import { LocalizedAtlasPlaceHeader } from "@/features/atlas/localized-atlas-place-header";
import { AtlasExplorer } from "@/features/atlas/atlas-explorer";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { getTraditionalAtlasLabels } from "@/lib/atlas/data/traditional-labels";
import {
  atlasCategoryFor,
  atlasHref,
  buildRelatedPeopleMap,
  getAtlasDataset,
  getAtlasPlaceBundle,
  getAtlasPlaces,
} from "@/lib/atlas/store";
import { entityHref } from "@/lib/knowledge/search";
import {
  entityJsonLd,
  breadcrumbJsonLd,
} from "@/lib/knowledge/seo";
import { formatCitation } from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;


type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const places = await getAtlasPlaces();
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = (await getAtlasPlaces()).find((p) => p.slug === slug);
  if (!place) return { title: "Place not found" };
  const title =
    place.seo?.title ?? `${place.name} — Atlas | Divine`;
  const description =
    place.seo?.description ??
    `${place.summary} Approximate modern location: ${place.atlas.modernLocation}.`;
  return {
    title,
    description,
    alternates: { canonical: atlasHref(place) },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}${atlasHref(place)}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AtlasPlacePage({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getAtlasPlaceBundle(slug);
  if (!bundle) notFound();

  const { place, related, collections } = bundle;
  const [places, dataset, traditionalLabels] = await Promise.all([
    getAtlasPlaces(),
    getAtlasDataset(),
    getTraditionalAtlasLabels(),
  ]);
  const relatedByPlaceId = await buildRelatedPeopleMap([place]);

  const people = related.filter((r) => r.other.id.startsWith("person."));
  const verses = related.filter((r) => r.other.kind === "verse");
  const genealogyMods = collections.filter((c) => c.kind === "genealogy-module");

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Atlas", href: "/atlas" },
    { name: place.name },
  ];

  const placeJsonLd = {
    ...entityJsonLd(place),
    "@type": "Place",
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.atlas.latitude,
      longitude: place.atlas.longitude,
    },
    description: place.description,
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedAtlasPlaceHeader
          category={atlasCategoryFor(place)}
          title={place.name}
          description={place.summary}
          encyclopediaHref={entityHref(place)}
        />

        <section className="page-gutter pb-8 pt-4">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <AtlasExplorer
              dataset={dataset}
              places={places}
              traditionalLabels={traditionalLabels}
              initialSlug={place.slug}
              relatedByPlaceId={relatedByPlaceId}
            />

            <article className="space-y-6">
              <div className="border-border/70 rounded-2xl border p-5">
                <p className="text-foreground/90 text-sm leading-relaxed">
                  {place.description}
                </p>
                {place.atlas.scripturalSignificance && (
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                    {place.atlas.scripturalSignificance}
                  </p>
                )}
              </div>

              <div className="border-border/70 rounded-2xl border bg-muted/30 p-5">
                <p className="text-saffron flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                  <MapPin className="h-3 w-3" aria-hidden />
                  Approximate modern location
                </p>
                <p className="text-foreground mt-2 text-sm font-medium">
                  {place.atlas.modernLocation}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Educational context only — coordinates are approximate
                  traditional placements, not survey GPS.
                </p>
                {place.atlas.kingdom && (
                  <p className="text-muted-foreground mt-3 text-sm">
                    Kingdom · {place.atlas.kingdom}
                  </p>
                )}
              </div>

              {people.length > 0 && (
                <section>
                  <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
                    Related people
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {people.map((p) => (
                      <li key={p.relation.id}>
                        <Link
                          href={entityHref(p.other)}
                          className="text-foreground hover:underline text-sm"
                        >
                          {p.other.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {verses.length > 0 && (
                <section>
                  <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
                    Related chapters / verses
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {verses.map((v) => {
                      const publicId = v.other.externalRefs?.publicId;
                      const href = publicId
                        ? `/bhagavad-gita/chapter-${publicId.split(".")[1]}#verse-${publicId.split(".")[2]}`
                        : "/bhagavad-gita";
                      return (
                        <li key={v.relation.id}>
                          <Link
                            href={href}
                            className="text-foreground inline-flex items-center gap-1.5 text-sm hover:underline"
                          >
                            <BookOpen className="h-3.5 w-3.5" aria-hidden />
                            {v.other.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {genealogyMods.length > 0 && (
                <section>
                  <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
                    Genealogy
                  </h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {genealogyMods.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/genealogy/${m.slug}`}
                          className="border-border/70 hover:border-saffron/40 inline-flex rounded-full border px-3 py-1 text-xs transition-divine"
                        >
                          {m.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {place.scriptureSources.length > 0 && (
                <section>
                  <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
                    Sources
                  </h2>
                  <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
                    {place.scriptureSources.map((s, i) => (
                      <li key={i}>{formatCitation(s)}</li>
                    ))}
                  </ul>
                </section>
              )}

              <Link
                href={entityHref(place)}
                className="border-border/70 hover:border-saffron/40 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-divine"
              >
                <Library className="h-4 w-4" aria-hidden />
                Open in Encyclopedia
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </article>
          </div>
        </section>
        <RelatedContentSection entityId={place.id} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
    </div>
  );
}
