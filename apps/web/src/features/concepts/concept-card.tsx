"use client";

import Link from "next/link";
import { conceptHref, type KnowledgeConcept } from "@/lib/concepts/helpers";
import { localizedKnowledgeChrome } from "@/lib/i18n/knowledge-labels";
import {
  displayLocalizedName,
  displayLocalizedSummary,
} from "@/lib/i18n/localize-entity";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { toModernEnglish } from "@/lib/text/modern-english";
import { cn } from "@/lib/utils";

export function ConceptCard({
  concept,
  index = 0,
}: {
  concept: KnowledgeConcept;
  index?: number;
}) {
  const lang = useUiLanguage();
  const chrome = localizedKnowledgeChrome(lang);
  const body =
    lang === "en"
      ? (concept.concept?.definition ?? concept.summary)
      : displayLocalizedSummary(
          {
            id: concept.id,
            summary: concept.concept?.definition ?? concept.summary,
            name: concept.name,
            iastName: concept.iastName,
          },
          lang,
        );

  return (
    <Link
      href={conceptHref(concept)}
      style={{ ["--card-index" as string]: index }}
      className={cn(
        "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-xs",
        "hover:border-saffron/40 transition-divine hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 bg-[#4d6a86]"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#4d6a86]">
          {chrome.concept}
        </span>
      </div>
      <h3 className="text-foreground mt-2 font-serif text-lg leading-tight tracking-tight">
        {displayLocalizedName(concept, lang)}
      </h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
        {body}
      </p>
      <p className="text-muted-foreground mt-3 text-[11px]">
        {toModernEnglish(concept.primaryScripture)}
      </p>
    </Link>
  );
}
