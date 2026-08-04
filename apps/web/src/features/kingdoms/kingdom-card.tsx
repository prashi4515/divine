"use client";

import Link from "next/link";
import { kingdomHref, type KnowledgeKingdom } from "@/lib/kingdoms/helpers";
import { localizedKnowledgeChrome } from "@/lib/i18n/knowledge-labels";
import {
  displayLocalizedName,
  displayLocalizedSummary,
} from "@/lib/i18n/localize-entity";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

export function KingdomCard({
  kingdom,
  index = 0,
}: {
  kingdom: KnowledgeKingdom;
  index?: number;
}) {
  const lang = useUiLanguage();
  const chrome = localizedKnowledgeChrome(lang);

  return (
    <Link
      href={kingdomHref(kingdom)}
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
          {chrome.kingdom}
        </span>
        {kingdom.atlas?.kingdom ? (
          <span className="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">
            · {kingdom.atlas.kingdom}
          </span>
        ) : null}
      </div>
      <h3 className="text-foreground mt-2 font-serif text-lg leading-tight tracking-tight">
        {displayLocalizedName(kingdom, lang)}
      </h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
        {displayLocalizedSummary(kingdom, lang)}
      </p>
      {kingdom.atlas?.modernLocation ? (
        <p className="text-muted-foreground mt-3 text-[11px]">
          {kingdom.atlas.modernLocation}
        </p>
      ) : null}
    </Link>
  );
}
