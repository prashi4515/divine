import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { EventPageBody } from "@/features/events/event-page-body";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getEventBySlug,
  getEvents,
  resolveEventLinks,
} from "@/lib/events/store";
import { eventHref, eventTypeLabel } from "@/lib/events/helpers";
import { getEntityBundle } from "@/lib/knowledge/store";
import { breadcrumbJsonLd, entityJsonLd } from "@/lib/knowledge/seo";
import { formatCitation } from "@/lib/knowledge/types";
import { toModernEnglish } from "@/lib/text/modern-english";


type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  const title =
    event.seo?.title ?? `${event.name} - Mahabharata Events | Divine`;
  const description = toModernEnglish(
    event.seo?.description ?? event.summary.slice(0, 160),
  );
  return buildPageMetadata({
    title,
    description,
    path: eventHref(event),
    lang: "en",
    type: "article",
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [links, bundle] = await Promise.all([
    resolveEventLinks(event),
    getEntityBundle(event.id),
  ]);
  if (!bundle) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: event.name },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow={eventTypeLabel(event.event.eventType)}
          title={event.name}
          description={event.summary}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/events", label: "Events" },
            { label: event.name },
          ]}
          actions={
            <>
              <Link
                href="/events"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                All events
              </Link>
              {links.next ? (
                <Link
                  href={eventHref(links.next)}
                  className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                >
                  Next · {links.next.englishName}
                </Link>
              ) : null}
            </>
          }
        />
        <EventPageBody event={event} links={links} bundle={bundle} />
        <Suspense fallback={null}>
          <RelatedContentSection entityId={event.id} />
        </Suspense>
        {event.scriptureSources[0] ? (
          <p className="text-muted-foreground page-gutter mx-auto max-w-4xl pb-10 text-center text-[11px]">
            Primary citation ·{" "}
            {toModernEnglish(formatCitation(event.scriptureSources[0]))}
          </p>
        ) : null}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd(event, eventHref(event))),
        }}
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
