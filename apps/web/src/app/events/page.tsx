import type { Metadata } from "next";
import Link from "next/link";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { EventCard } from "@/features/events/event-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getEvents } from "@/lib/events/store";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Mahabharata Events - Knowledge Graph Timeline",
  description:
    "Major Mahabharata events as a Knowledge Graph hub - people, places, kingdoms, weapons, Gita chapters, and verses linked from structured JSON.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Mahabharata Events",
    description:
      "Timeline hub connecting the Divine Knowledge Graph across people, places, and scripture.",
    url: `${SITE_URL}/events`,
    type: "website",
  },
};

export default async function EventsIndexPage() {
  const events = await getEvents();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Signature experience"
          title="Mahabharata Events"
          description="The central timeline hub of the Knowledge Graph - each event links people, places, kingdoms, weapons, Gita chapters, and verses. Encyclopedia explains; Atlas maps; Genealogy traces lineage."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Events" },
          ]}
          actions={
            <>
              <Link
                href="/timeline"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                Timeline
              </Link>
              <Link
                href="/encyclopedia"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                Encyclopedia
              </Link>
              <Link
                href="/atlas"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                Atlas
              </Link>
              <Link
                href="/genealogy"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                Genealogy
              </Link>
            </>
          }
        />

        <section className="page-gutter pb-16 pt-4">
          <div className="mx-auto max-w-6xl">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <li key={event.id}>
                  <EventCard event={event} index={i} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
