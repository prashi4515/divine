"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Library,
  ScrollText,
  Swords,
} from "lucide-react";
import { useMessages, useUiLanguage } from "@/lib/i18n/use-messages";
import { localizeEntityTitle } from "@/lib/reading/shloka-script";
import type {
  WeaponResolvedLinks,
  KnowledgeWeapon,
} from "@/lib/weapons/store";
import {
  weaponCategoryLabel,
  weaponFocusLabel,
  weaponHref,
} from "@/lib/weapons/store";
import { entityHref } from "@/lib/knowledge/search";
import { eventHref, eventTypeLabel, genealogyPersonHref } from "@/lib/events/helpers";
import { formatCitation } from "@/lib/knowledge/types";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import { isKnowledgeWeapon } from "@/lib/weapons/helpers";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";
import {
  displayEnglishName,
  toModernEnglish,
} from "@/lib/text/modern-english";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2
        id={id}
        className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function EntityChips({
  title,
  id,
  entities,
  extraHref,
  hrefFor,
}: {
  title: string;
  id: string;
  entities: KnowledgeEntity[];
  hrefFor?: (e: KnowledgeEntity) => string;
  extraHref?: (e: KnowledgeEntity) => { href: string; label: string } | null;
}) {
  const lang = useUiLanguage();
  if (entities.length === 0) return null;
  return (
    <Section id={id} title={title}>
      <ul className="flex flex-wrap gap-2">
        {entities.map((e) => {
          const extra = extraHref?.(e);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-1.5">
              <Link
                href={hrefFor?.(e) ?? entityHref(e)}
                className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                prefetch
              >
                {localizeEntityTitle(displayEnglishName(e), lang)}
                <Library className="text-muted-foreground h-3 w-3" aria-hidden />
              </Link>
              {extra ? (
                <Link
                  href={extra.href}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
                  prefetch
                >
                  {extra.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function PhraseList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>{toModernEnglish(item)}</li>
      ))}
    </ul>
  );
}

export function WeaponPageBody({
  weapon,
  links,
}: {
  weapon: KnowledgeWeapon;
  links: WeaponResolvedLinks;
}) {
  const graphNeighbors = links.relatedEdges.slice(0, 24).map((r) => ({
    entity: r.other,
    relation: r.relation,
  }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {weaponCategoryLabel(links.category)}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {toModernEnglish(weaponFocusLabel(links.focus))}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {toModernEnglish(links.overview.primaryScripture)}
        </span>
        {weapon.aliases?.slice(0, 4).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {toModernEnglish(a)}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={entityHref(weapon)}
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Encyclopedia
        </Link>
        <Link
          href="/timeline"
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Timeline
        </Link>
        <Link
          href="/events"
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Events
        </Link>
      </div>

      <Section id="description" title="Description">
        <p className="text-foreground/90 text-base leading-relaxed">
          {toModernEnglish(links.overview.description)}
        </p>
      </Section>

      <EntityChips
        id="owners"
        title="Owners"
        entities={links.owners}
        extraHref={(e) => {
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      {links.origin.length > 0 ? (
        <Section id="origin" title="Origin">
          <ul className="space-y-2">
            {links.origin.map(({ entity, note }) => (
              <li key={entity.id}>
                <Link
                  href={entityHref(entity)}
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                  prefetch
                >
                  {displayEnglishName(entity)}
                  <Library className="text-muted-foreground h-3 w-3" aria-hidden />
                </Link>
                {note ? (
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    {toModernEnglish(note.replace(/^origin\s*[—–-]\s*/i, ""))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {links.powers.length > 0 ? (
        <Section id="powers" title="Powers">
          <PhraseList items={links.powers} />
        </Section>
      ) : null}

      {links.overview.sources.length > 0 ? (
        <Section id="scriptural-references" title="Scriptural references">
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {links.overview.sources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {toModernEnglish(formatCitation(s))}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {links.notableUses.length > 0 ? (
        <Section id="notable-uses" title="Notable uses">
          <PhraseList items={links.notableUses} />
        </Section>
      ) : null}

      {(links.counters.length > 0 || links.counterWeapons.length > 0) ? (
        <Section id="counters" title="Counters">
          <PhraseList items={links.counters} />
          {links.counterWeapons.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {links.counterWeapons.map((w) => (
                <li key={w.id}>
                  <Link
                    href={isKnowledgeWeapon(w) ? weaponHref(w) : entityHref(w)}
                    className="border-border/70 bg-card hover:border-saffron/40 inline-flex rounded-full border px-3 py-1.5 text-sm transition-divine"
                    prefetch
                  >
                    {displayEnglishName(w)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      {links.battles.length > 0 ? (
        <Section id="battles" title="Related battles">
          <ul className="space-y-2">
            {links.battles.map((b) => (
              <li key={b.id}>
                <Link
                  href={eventHref(b)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                  prefetch
                >
                  <span className="flex items-center gap-2">
                    <Swords className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {displayEnglishName(b)}
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      {eventTypeLabel(b.event.eventType)}
                    </span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <EntityChips
        id="related-characters"
        title="Related characters"
        entities={links.characters}
        extraHref={(e) => {
          if (!isCharacterEntity(e)) return null;
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      {links.events.length > 0 ? (
        <Section id="events" title="Related events">
          <ul className="space-y-1.5">
            {links.events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={eventHref(ev)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex w-full items-start justify-between rounded-lg border px-3 py-2.5 transition-divine"
                  prefetch
                >
                  <span>
                    <span className="text-sm font-medium">
                      {displayEnglishName(ev)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-[11px]">
                      {eventTypeLabel(ev.event.eventType)}
                    </span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <EntityChips id="scriptures" title="Scriptures" entities={links.scriptures} />

      {links.verses.length > 0 ? (
        <Section id="verses" title="Related verses">
          <ul className="space-y-1.5">
            {links.verses.map((v) => (
              <li key={v.id}>
                <Link
                  href={v.href ?? entityHref(v.entity ?? weapon)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                  prefetch
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {toModernEnglish(v.label)}
                  </span>
                  <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {graphNeighbors.length > 0 ? (
        <Section id="kg-graph" title="Knowledge graph">
          <LazyEntityGraph root={weapon} neighbors={graphNeighbors} />
        </Section>
      ) : null}
    </div>
  );
}
