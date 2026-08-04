import type { Metadata } from "next";
import { Suspense } from "react";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { TimelineChronicle } from "@/features/timeline/timeline-chronicle";
import { TimelineExplorer } from "@/features/timeline/timeline-explorer";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getTimelineBundle } from "@/lib/timeline/store";
import { eventHref } from "@/lib/events/helpers";
import { buildPageMetadata, getSiteUrl, timelineSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";


const PAGE_DESCRIPTION =
  "Explore Creation, dynasties, Krishna, the Pandavas and Kauravas, the war, the Gita, and aftermath. Filter by type, adjust detail, and open any event in the shared Knowledge Graph.";

export const metadata: Metadata = buildPageMetadata(timelineSeo());


export default async function TimelinePage() {
  const bundle = await getTimelineBundle();
  const view = bundle.view;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mahabharata Timeline",
    description: PAGE_DESCRIPTION,
    numberOfItems: view.nodes.length,
    itemListElement: view.nodes.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.event.name,
      url: `${getSiteUrl()}${eventHref(n.event.slug)}`,
    })),
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="timeline"
          actionLinks={[
            { href: "/events", labelKey: "eventsHub" },
            { href: "/atlas", labelKey: "navAtlas" },
            { href: "/genealogy", labelKey: "navGenealogy" },
          ]}
        />

        <section className="page-gutter pb-8 pt-2">
          <div className="mx-auto max-w-[1400px]">
            <Suspense
              fallback={
                <div className="border-border/70 bg-card/40 h-[420px] animate-pulse rounded-3xl border" />
              }
            >
              <TimelineExplorer view={view} />
            </Suspense>
          </div>
        </section>

        <TimelineChronicle
          eras={bundle.layout.eras}
          eventCount={view.nodes.length}
          eraCount={bundle.eras.length}
        />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
