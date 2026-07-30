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
  KingdomResolvedLinks,
  KnowledgeKingdom,
} from "@/lib/kingdoms/store";
import { entityHref } from "@/lib/knowledge/search";
import { atlasHref } from "@/lib/atlas/geo";
import { eventHref, eventTypeLabel } from "@/lib/events/helpers";
import { genealogyPersonHref } from "@/lib/events/helpers";
import { formatCitation } from "@/lib/knowledge/types";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";

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
}: {
  title: string;
  id: string;
  entities: KnowledgeEntity[];
  extraHref?: (e: KnowledgeEntity) => { href: string; label: string } | null;
}) {
  if (entities.length === 0) return null;
  return (
    <Section id={id} title={title}>
      <ul className="flex flex-wrap gap-2">
        {entities.map((e) => {
          const extra = extraHref?.(e);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-1.5">
              <Link
                href={entityHref(e)}
                className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
              >
                {e.name}
                <Library className="text-muted-foreground h-3 w-3" aria-hidden />
              </Link>
              {extra ? (
                <Link
                  href={extra.href}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
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

/**
 * Kingdom detail — every section from resolveKingdomLinks (shared KG JSON).
 */
export function KingdomPageBody({
  kingdom,
  links,
}: {
  kingdom: KnowledgeKingdom;
  links: KingdomResolvedLinks;
}) {
  const graphNeighbors = links.relatedEdges.slice(0, 24).map((r) => ({
    entity: r.other,
    relation: r.relation,
  }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          Kingdom
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {links.overview.primaryScripture}
        </span>
        {links.overview.era ? (
          <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
            {links.overview.era}
          </span>
        ) : null}
        {kingdom.aliases?.slice(0, 4).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {a}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {links.atlasPlace ? (
          <Link
            href={atlasHref(links.atlasPlace)}
            className="cta-saffron inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-sm"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Atlas
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
        <Link
          href={entityHref(kingdom)}
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
        >
          Encyclopedia
        </Link>
        {links.timeline.length > 0 ? (
          <Link
            href="/timeline"
            className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          >
            Timeline
          </Link>
        ) : null}
      </div>

      <Section id="overview" title="Overview">
        <p className="text-foreground/90 text-base leading-relaxed">
          {links.overview.description}
        </p>
        {links.overview.modernLocation ? (
          <p className="text-muted-foreground mt-3 text-sm">
            Modern context: {links.overview.modernLocation}
          </p>
        ) : null}
      </Section>

      {links.overview.sources.length > 0 ? (
        <Section id="sources" title="Primary sources">
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {links.overview.sources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {formatCitation(s)}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {links.capital ? (
        <Section id="capital" title="Capital">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={entityHref(links.capital)}
              className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-divine"
            >
              {links.capital.name}
              <Library className="text-muted-foreground h-3 w-3" aria-hidden />
            </Link>
            {links.capital.atlas ? (
              <Link
                href={atlasHref(links.capital)}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
              >
                Atlas
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            ) : null}
          </div>
        </Section>
      ) : null}

      <EntityChips
        id="rulers"
        title="Rulers"
        entities={links.rulers}
        extraHref={(e) => {
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      <EntityChips id="dynasty" title="Dynasty" entities={links.dynasty} />

      <EntityChips
        id="major-cities"
        title="Major cities"
        entities={links.majorCities}
        extraHref={(e) =>
          e.atlas ? { href: atlasHref(e), label: "Atlas" } : null
        }
      />

      {links.battles.length > 0 ? (
        <Section id="battles" title="Battles">
          <ul className="space-y-2">
            {links.battles.map((b) => (
              <li key={b.id}>
                <Link
                  href={eventHref(b)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                >
                  <span className="flex items-center gap-2">
                    <Swords className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {b.name}
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

      {links.timeline.length > 0 ? (
        <Section id="timeline" title="Timeline">
          <ol className="border-border/60 relative space-y-0 border-l pl-4">
            {links.timeline.map((ev) => (
              <li key={ev.id} className="relative pb-5 last:pb-0">
                <span
                  className="bg-foreground absolute -left-[1.15rem] top-1.5 size-2.5 rounded-full"
                  aria-hidden
                />
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  Order {ev.event.timelineOrder} · {eventTypeLabel(ev.event.eventType)}
                </p>
                <Link
                  href={eventHref(ev)}
                  className="text-foreground mt-0.5 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
                >
                  {ev.name}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                  {ev.summary}
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
      ) : null}

      {links.atlasPlace ? (
        <Section id="atlas" title="Atlas">
          <Link
            href={atlasHref(links.atlasPlace)}
            className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-divine"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Open {kingdom.name} on the Atlas
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {links.atlasPlace.atlas?.scripturalSignificance ? (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {links.atlasPlace.atlas.scripturalSignificance}
            </p>
          ) : null}
        </Section>
      ) : null}

      {(links.genealogyModules.length > 0 ||
        links.characters.some((c) => genealogyPersonHref(c))) && (
        <Section id="genealogy" title="Genealogy">
          <ul className="flex flex-wrap gap-2">
            {links.genealogyModules.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/genealogy/${m.slug}`}
                  className="border-border/70 hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                >
                  <GitBranch className="h-3.5 w-3.5" aria-hidden />
                  {m.title}
                </Link>
              </li>
            ))}
            {links.characters.slice(0, 8).map((c) => {
              const href = genealogyPersonHref(c);
              if (!href) return null;
              return (
                <li key={`g-${c.id}`}>
                  <Link
                    href={href}
                    className="border-border/50 text-muted-foreground hover:border-saffron/40 hover:text-foreground inline-flex rounded-full border px-3 py-1.5 text-xs transition-divine"
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <EntityChips
        id="characters"
        title="Characters"
        entities={links.characters}
        extraHref={(e) => {
          if (!isCharacterEntity(e)) return null;
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      {links.events.length > 0 ? (
        <Section id="events" title="Events">
          <ul className="space-y-1.5">
            {links.events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={eventHref(ev)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex w-full items-start justify-between rounded-lg border px-3 py-2.5 transition-divine"
                >
                  <span>
                    <span className="text-sm font-medium">{ev.name}</span>
                    <span className="text-muted-foreground mt-0.5 block text-[11px]">
                      {eventTypeLabel(ev.event.eventType)} · timeline{" "}
                      {ev.event.timelineOrder}
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
                  href={v.href ?? entityHref(v.entity ?? kingdom)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {v.label}
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
          <LazyEntityGraph root={kingdom} neighbors={graphNeighbors} />
        </Section>
      ) : null}

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Kingdom pages resolve capitals, cities, rulers, events, and verses from
        the shared Knowledge Graph — no parallel kingdom dataset.
      </p>
    </div>
  );
}
