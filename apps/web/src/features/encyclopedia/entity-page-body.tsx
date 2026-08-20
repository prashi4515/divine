"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, MapPinned, ScrollText } from "lucide-react";
import type { EntityBundle } from "@/lib/knowledge/store";
import {
  CONFIDENCE_LABELS,
  formatCitation,
  RELATION_TYPE_LABELS,
} from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";
import { atlasHref, isAtlasPlace } from "@/lib/atlas/geo";
import { eventHref, isKnowledgeEvent } from "@/lib/events/helpers";
import { kingdomHref, isKnowledgeKingdom } from "@/lib/kingdoms/helpers";
import { weaponHref, isKnowledgeWeapon } from "@/lib/weapons/helpers";
import { conceptHref, isKnowledgeConcept } from "@/lib/concepts/helpers";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";
import { cn } from "@/lib/utils";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { getLocalizedEntityContent } from "@/lib/knowledge/localize-content";

function verseHref(publicId: string): string {
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (m) return `/bhagavad-gita/chapter-${m[1]}#verse-${m[2]}`;
  return "/bhagavad-gita";
}

export function EntityPageBody({ bundle }: { bundle: EntityBundle }) {
  const { entity, grouped, collections, related } = bundle;
  const lang = useUiLanguage();
  const localized = getLocalizedEntityContent(entity, lang);

  const graphNeighbors = related
    .filter((r) => r.direction === "out" || r.direction === "in")
    .slice(0, 24)
    .map((r) => ({ entity: r.other, relation: r.relation }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {entity.primaryScripture}
        </span>
        {entity.aliases?.slice(0, 6).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {a}
          </span>
        ))}
      </div>

      {entity.epithet && (
        <p className="text-muted-foreground text-sm italic">{entity.epithet}</p>
      )}

      {isAtlasPlace(entity) && (
        <section>
          <Link
            href={atlasHref(entity)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Open in Atlas
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Atlas visualizes this place on the Mahābhārata map. Encyclopedia
            explains.
          </p>
        </section>
      )}

      {isKnowledgeKingdom(entity) && (
        <section>
          <Link
            href={kingdomHref(entity)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Open in Kingdoms
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Kingdoms is the dedicated hub for capitals, rulers, cities, battles,
            and timeline — Encyclopedia explains.
          </p>
        </section>
      )}

      {isKnowledgeEvent(entity) && (
        <section>
          <Link
            href={eventHref(entity)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open in Events
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Events is the dedicated hub for participants, locations, chapters,
            and timeline — Encyclopedia explains.
          </p>
        </section>
      )}

      {isKnowledgeWeapon(entity) && (
        <section>
          <Link
            href={weaponHref(entity)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open in Weapons
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Weapons is the dedicated hub for owners, origin, uses, battles, and
            timeline — Encyclopedia explains.
          </p>
        </section>
      )}

      {isKnowledgeConcept(entity) && (
        <section>
          <Link
            href={conceptHref(entity)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open in Concepts
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Concepts is the dedicated hub for definition, meaning, etymology,
            verses, and related ideas — Encyclopedia explains.
          </p>
        </section>
      )}

      <section>
        <p className="text-foreground/90 text-base leading-relaxed">
          {localized.description || entity.description}
        </p>
      </section>

      {entity.scriptureSources.length > 0 && (
        <section aria-labelledby="sources">
          <h2
            id="sources"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Primary sources
          </h2>
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {entity.scriptureSources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {formatCitation(s)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {graphNeighbors.length > 0 && (
        <section aria-labelledby="kg-graph">
          <h2
            id="kg-graph"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Knowledge graph
          </h2>
          <LazyEntityGraph root={entity} neighbors={graphNeighbors} />
        </section>
      )}

      {grouped.map((group) => (
        <section key={group.title} aria-label={group.title} className="space-y-2">
          <h2 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
            {group.title}
          </h2>
          <ul className="space-y-1.5">
            {group.items.map((item) => (
              <li key={`${item.relation.id}-${item.direction}`}>
                <Link
                  href={entityHref(item.other)}
                  className={cn(
                    "border-border/70 bg-card hover:border-saffron/40 group flex w-full items-start justify-between rounded-lg border px-3 py-2.5 transition-divine",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground text-sm font-medium group-hover:underline">
                      {item.other.name}
                    </span>
                    <span className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {RELATION_TYPE_LABELS[item.relation.type]}
                      <span
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
                          item.relation.confidence === "verified"
                            ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
                            : item.relation.confidence === "traditional"
                              ? "border-amber-700/30 bg-amber-50 text-amber-950"
                              : "border-saffron/40 text-saffron",
                        )}
                      >
                        {CONFIDENCE_LABELS[item.relation.confidence]}
                      </span>
                    </span>
                    <span className="text-muted-foreground/90 mt-1 flex flex-wrap gap-x-3 text-[10.5px]">
                      {item.relation.sources.map((s, i) => (
                        <span key={i}>{formatCitation(s)}</span>
                      ))}
                    </span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {collections.filter((c) => c.kind === "genealogy-module").length > 0 && (
        <section aria-labelledby="genealogy-mods">
          <h2
            id="genealogy-mods"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Genealogy modules
          </h2>
          <ul className="flex flex-wrap gap-2">
            {collections
              .filter((c) => c.kind === "genealogy-module")
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/genealogy/${c.slug}`}
                    className="border-border/70 hover:border-saffron/40 inline-flex rounded-full border px-3 py-1 text-xs transition-divine"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      {entity.externalRefs?.publicId?.startsWith("bg.") && (
        <section>
          <Link
            href={verseHref(entity.externalRefs.publicId)}
            className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-divine"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open in Bhagavad Gītā reader
          </Link>
        </section>
      )}

      {entity.kind === "scripture" && entity.externalRefs?.workCode === "bg" && (
        <section>
          <Link
            href="/bhagavad-gita"
            className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-divine"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Browse Bhagavad Gītā chapters
          </Link>
        </section>
      )}
    </div>
  );
}
