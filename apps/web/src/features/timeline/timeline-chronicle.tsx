"use client";

import Link from "next/link";
import { useHubUiMessages } from "@/lib/i18n/use-messages";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { eventHref, eventTypeLabel } from "@/lib/events/helpers";
import type { KnowledgeEvent } from "@/lib/events/helpers";
import type { KnowledgeCollection } from "@/lib/knowledge/types";

type EraBlock = {
  collection: KnowledgeCollection;
  events: KnowledgeEvent[];
};

export function TimelineChronicle({
  eras,
  eventCount,
  eraCount,
  initialLanguage,
}: {
  eras: EraBlock[];
  eventCount: number;
  eraCount: number;
  initialLanguage?: ReadingLanguageCode;
}) {
  const t = useHubUiMessages(initialLanguage);

  return (
    <section className="page-gutter border-border/50 border-t pb-16 pt-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
          {t.fullChronicle}
        </h2>
        <ol className="mt-6 space-y-6">
          {eras.map((era) => (
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
          {eventCount} events · {eraCount} eras · Shared Knowledge Graph
        </p>
      </div>
    </section>
  );
}
