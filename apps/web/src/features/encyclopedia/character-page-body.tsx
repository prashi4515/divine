"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  GitBranch,
  Library,
  MapPinned,
  ScrollText,
  Swords,
} from "lucide-react";
import type {
  CharacterLink,
  CharacterProfile,
  CharacterTimelineEntry,
  CharacterVerseLink,
} from "@/lib/encyclopedia/character-profile";
import { characterHasFamily } from "@/lib/encyclopedia/character-profile";
import {
  CONFIDENCE_LABELS,
  formatCitation,
  RELATION_TYPE_LABELS,
} from "@/lib/knowledge/types";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";
import { cn } from "@/lib/utils";

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

function LinkRow({ link }: { link: CharacterLink }) {
  return (
    <li>
      <div className="border-border/70 bg-card hover:border-saffron/40 group flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-divine">
        <div className="min-w-0 flex-1">
          <Link
            href={link.href}
            className="text-foreground text-sm font-medium group-hover:underline"
          >
            {link.entity.name}
          </Link>
          <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>{RELATION_TYPE_LABELS[link.relationType]}</span>
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
                link.confidence === "verified"
                  ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
                  : link.confidence === "traditional"
                    ? "border-amber-700/30 bg-amber-50 text-amber-950"
                    : "border-saffron/40 text-saffron",
              )}
            >
              {CONFIDENCE_LABELS[link.confidence]}
            </span>
          </p>
          {link.sources.length > 0 ? (
            <p className="text-muted-foreground/90 mt-1 flex flex-wrap gap-x-3 text-[10.5px]">
              {link.sources.map((s, i) => (
                <span key={i}>{formatCitation(s)}</span>
              ))}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Link href={link.href} aria-label={`Encyclopedia: ${link.entity.name}`}>
            <Library className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
          </Link>
          {link.surface ? (
            <Link
              href={link.surface.href}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[10px] underline-offset-2 hover:underline"
            >
              {link.surface.label}
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function LinkList({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: CharacterLink[];
}) {
  if (links.length === 0) return null;
  return (
    <Section id={id} title={title}>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <LinkRow
            key={`${link.entity.id}-${link.relationType}-${link.direction}`}
            link={link}
          />
        ))}
      </ul>
    </Section>
  );
}

function ChipList({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: CharacterLink[];
}) {
  if (links.length === 0) return null;
  return (
    <Section id={id} title={title}>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.entity.id} className="flex flex-wrap items-center gap-1.5">
            <Link
              href={link.href}
              className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
            >
              {link.entity.name}
            </Link>
            {link.surface ? (
              <Link
                href={link.surface.href}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
              >
                {link.surface.label}
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FamilyBlock({
  profile,
}: {
  profile: CharacterProfile;
}) {
  if (!characterHasFamily(profile)) return null;
  const { parents, children, spouses, siblings } = profile.family;
  return (
    <Section id="family" title="Family">
      <div className="space-y-6">
        {parents.length > 0 ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wider">
              Parents
            </h3>
            <ul className="space-y-1.5">
              {parents.map((l) => (
                <LinkRow key={l.entity.id} link={l} />
              ))}
            </ul>
          </div>
        ) : null}
        {spouses.length > 0 ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wider">
              Spouses
            </h3>
            <ul className="space-y-1.5">
              {spouses.map((l) => (
                <LinkRow key={l.entity.id} link={l} />
              ))}
            </ul>
          </div>
        ) : null}
        {siblings.length > 0 ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wider">
              Siblings
            </h3>
            <ul className="space-y-1.5">
              {siblings.map((l) => (
                <LinkRow key={l.entity.id} link={l} />
              ))}
            </ul>
          </div>
        ) : null}
        {children.length > 0 ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wider">
              Children
            </h3>
            <ul className="space-y-1.5">
              {children.map((l) => (
                <LinkRow key={l.entity.id} link={l} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

function TimelineBlock({ entries }: { entries: CharacterTimelineEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <Section id="timeline" title="Timeline">
      <ol className="border-border/60 relative space-y-0 border-l pl-4">
        {entries.map((entry, i) => (
          <li key={entry.entity.id} className="relative pb-5 last:pb-0">
            <span
              className="bg-foreground absolute -left-[1.15rem] top-1.5 size-2.5 rounded-full"
              aria-hidden
            />
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Order {entry.timelineOrder}
              {i === 0 ? " · earliest cited" : ""}
            </p>
            <Link
              href={entry.eventHref}
              className="text-foreground mt-0.5 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
            >
              {entry.entity.name}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
              {entry.entity.summary}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground mt-3 text-xs">
        <Link href="/timeline" className="underline-offset-2 hover:underline">
          Open full timeline
        </Link>
        {" · "}
        <Link href="/events" className="underline-offset-2 hover:underline">
          All events
        </Link>
      </p>
    </Section>
  );
}

function VersesBlock({ verses }: { verses: CharacterVerseLink[] }) {
  if (verses.length === 0) return null;
  return (
    <Section id="verses" title="Related verses">
      <ul className="space-y-1.5">
        {verses.map((v) => (
          <li key={v.entity.id}>
            <Link
              href={v.readerHref}
              className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                {v.verseLabel}
              </span>
              <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import { useUiLanguage } from "@/lib/i18n/use-messages";
import { getLocalizedEntityContent } from "@/lib/knowledge/localize-content";

/**
 * Complete character encyclopedia — every section from the shared graph.
 */
export function CharacterPageBody({ profile }: { profile: CharacterProfile }) {
  const { entity, biography } = profile;
  const lang = useUiLanguage();
  const localized = getLocalizedEntityContent(entity, lang);

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {biography.primaryScripture}
        </span>
        {biography.aliases.slice(0, 8).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {a}
          </span>
        ))}
      </div>

      {biography.epithet ? (
        <p className="text-muted-foreground text-sm italic">{biography.epithet}</p>
      ) : null}

      {/* Cross-surface CTAs — same graph, no duplicate content */}
      <div className="flex flex-wrap gap-2">
        {profile.genealogy.personHref ? (
          <Link
            href={profile.genealogy.personHref}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <GitBranch className="h-4 w-4" aria-hidden />
            Genealogy
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
        {profile.atlas.some((a) => a.surface?.label === "Atlas") ||
        profile.kingdom.some((k) => k.surface?.label === "Atlas") ? (
          <Link
            href="/atlas"
            className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Atlas
          </Link>
        ) : null}
        {profile.timeline.length > 0 ? (
          <Link
            href="/timeline"
            className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          >
            Timeline
          </Link>
        ) : null}
      </div>

      <Section id="biography" title="Biography">
        <p className="text-foreground/90 text-base leading-relaxed">
          {localized.description || biography.description}
        </p>
      </Section>

      {biography.sources.length > 0 ? (
        <Section id="sources" title="Primary sources">
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {biography.sources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {formatCitation(s)}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {biography.variantTraditions.length > 0 ? (
        <Section id="variants" title="Variant traditions">
          <ul className="space-y-3">
            {biography.variantTraditions.map((v) => (
              <li
                key={v.label}
                className="border-border/60 rounded-xl border px-4 py-3"
              >
                <p className="text-sm font-medium">{v.label}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {v.description}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {profile.graphNeighbors.length > 0 ? (
        <Section id="kg-graph" title="Knowledge graph">
          <LazyEntityGraph
            root={entity}
            neighbors={profile.graphNeighbors}
          />
        </Section>
      ) : null}

      <FamilyBlock profile={profile} />

      <ChipList id="kingdom" title="Kingdom" links={profile.kingdom} />
      <ChipList id="dynasty" title="Dynasty" links={profile.dynasty} />

      <TimelineBlock entries={profile.timeline} />
      <LinkList id="events" title="Events" links={profile.events} />

      <LinkList id="weapons" title="Weapons" links={profile.weapons} />
      <LinkList id="teachers" title="Teachers" links={profile.teachers} />
      <LinkList id="students" title="Students" links={profile.students} />
      <LinkList id="friends" title="Friends" links={profile.friends} />
      <LinkList id="enemies" title="Enemies" links={profile.enemies} />

      {(profile.genealogy.personHref ||
        profile.genealogy.modules.length > 0) && (
        <Section id="genealogy" title="Genealogy">
          <div className="flex flex-wrap gap-2">
            {profile.genealogy.personHref ? (
              <Link
                href={profile.genealogy.personHref}
                className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
              >
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                Open lineage
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            ) : null}
            {profile.genealogy.modules.map((c) => (
              <Link
                key={c.slug}
                href={`/genealogy/${c.slug}`}
                className="border-border/70 hover:border-saffron/40 inline-flex rounded-full border px-3 py-1.5 text-sm transition-divine"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <ChipList id="atlas" title="Atlas" links={profile.atlas} />
      <VersesBlock verses={profile.verses} />
      <ChipList id="concepts" title="Concepts" links={profile.concepts} />
      <LinkList
        id="related-characters"
        title="Related characters"
        links={profile.relatedCharacters}
      />
      <LinkList id="identity" title="Divine identity" links={profile.identity} />

      {profile.weapons.length === 0 &&
      profile.friends.length === 0 &&
      profile.enemies.length === 0 ? null : (
        <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <Swords className="h-3 w-3" aria-hidden />
          All links resolve to shared Knowledge Graph entities — no parallel
          character dataset.
        </p>
      )}
    </div>
  );
}
