"use client";

import Link from "next/link";
import { eventHref, type KnowledgeEvent } from "@/lib/events/helpers";
import {
  localizedEventTypeLabel,
  localizedKnowledgeChrome,
} from "@/lib/i18n/knowledge-labels";
import {
  displayLocalizedName,
  displayLocalizedSummary,
} from "@/lib/i18n/localize-entity";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

/**
 * Timeline card — follows the UI language switcher.
 */
export function EventCard({
  event,
  index = 0,
}: {
  event: KnowledgeEvent;
  index?: number;
}) {
  const lang = useUiLanguage();
  const chrome = localizedKnowledgeChrome(lang);

  return (
    <Link
      href={eventHref(event)}
      style={{ ["--card-index" as string]: index }}
      className={cn(
        "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-xs",
        "hover:border-saffron/40 transition-divine hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 bg-[#6a4530]"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6a4530]">
          {localizedEventTypeLabel(event.event.eventType, lang)}
        </span>
        <span className="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">
          · {chrome.timeline} {event.event.timelineOrder}
        </span>
      </div>
      <h3 className="text-foreground mt-2 font-serif text-lg leading-tight tracking-tight">
        {displayLocalizedName(event, lang)}
      </h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
        {displayLocalizedSummary(event, lang)}
      </p>
      <p className="text-muted-foreground mt-3 text-[11px]">
        {event.event.participants.length} {chrome.people} ·{" "}
        {event.event.places.length} {chrome.places}
      </p>
    </Link>
  );
}
