import type { Metadata } from "next";
import { buildPageMetadata, hubIndexSeo } from "@/lib/seo";
import Link from "next/link";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { EventCard } from "@/features/events/event-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getEvents } from "@/lib/events/store";

export const dynamic = "force-dynamic";


export const metadata: Metadata = buildPageMetadata(hubIndexSeo("events"));


export default async function EventsIndexPage() {
  const events = await getEvents();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="events"
          actionLinks={[
            { href: "/encyclopedia", labelKey: "navEncyclopedia" },
            { href: "/atlas", labelKey: "navAtlas" },
            { href: "/genealogy", labelKey: "navGenealogy" },
          ]}
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
