import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { TimelineExplorer } from "@/features/timeline/timeline-explorer";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getTimelineBundle } from "@/lib/timeline/store";
import { eventHref, eventTypeLabel } from "@/lib/events/helpers";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

const PAGE_DESCRIPTION =
  "Explore Creation, dynasties, Krishna, the Pandavas and Kauravas, the war, the Gita, and aftermath. Filter by type, adjust detail, and open any event in the shared Knowledge Graph.";

export const metadata: Metadata = {
  title: "Mahabharata Timeline",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/timeline" },
  openGraph: {
    title: "Mahabharata Timeline",
    description:
      "Interactive chronicle of the Mahabharata: eras, battles, and the Gita.",
    url: `${SITE_URL}/timeline`,
    type: "website",
  },
};

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
      url: `${SITE_URL}${eventHref(n.event.slug)}`,
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

        <section className="page-gutter border-border/50 border-t pb-16 pt-10">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
              Full chronicle
            </h2>
            <ol className="mt-6 space-y-6">
              {bundle.layout.eras.map((era) => (
                <li key={era.collection.id}>
                  <h3 className="text-foreground font-serif text-lg">
                    {era.collection.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {era.events.map((ev) => (
                      <li key={ev.id}>
                        <Link
                          href={eventHref(ev)}
                          className="text-foreground hover:text-saffron inline-flex flex-wrap items-baseline gap-2 text-sm underline-offset-2 hover:underline"
                          prefetch
                        >
                          <span>{ev.name}</span>
                          <span className="text-muted-foreground text-[11px] uppercase tracking-wider no-underline">
                            {eventTypeLabel(ev.event.eventType)}
                          </span>
                        </Link>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                          {ev.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground mt-8 text-center text-xs">
              {view.nodes.length} events · {bundle.eras.length} eras · Shared
              Knowledge Graph
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
