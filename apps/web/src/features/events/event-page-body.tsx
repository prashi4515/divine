import Link from "next/link";
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
  KnowledgeEvent,
  ResolvedEventLinks,
} from "@/lib/events/store";
import {
  eventHref,
  eventTypeLabel,
  genealogyPersonHref,
  gitaChapterHref,
} from "@/lib/events/store";
import { entityHref } from "@/lib/knowledge/search";
import { weaponHref } from "@/lib/weapons/helpers";
import { atlasHref, isAtlasPlace } from "@/lib/atlas/geo";
import { formatCitation } from "@/lib/knowledge/types";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";
import type { EntityBundle } from "@/lib/knowledge/store";

function EntityLinkList({
  title,
  entities,
  empty,
  extraHref,
  entityLinkHref,
}: {
  title: string;
  entities: KnowledgeEntity[];
  empty?: string;
  extraHref?: (e: KnowledgeEntity) => { href: string; label: string } | null;
  entityLinkHref?: (e: KnowledgeEntity) => string;
}) {
  if (entities.length === 0) {
    return empty ? (
      <section>
        <h2 className="text-saffron mb-2 text-[10px] font-medium uppercase tracking-[0.18em]">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">{empty}</p>
      </section>
    ) : null;
  }

  return (
    <section>
      <h2 className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {entities.map((e) => {
          const extra = extraHref?.(e);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-1.5">
              <Link
                href={entityLinkHref?.(e) ?? entityHref(e)}
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
    </section>
  );
}

/**
 * Event detail body — every section is driven by resolved Knowledge Graph JSON.
 */
export function EventPageBody({
  event,
  links,
  bundle,
}: {
  event: KnowledgeEvent;
  links: ResolvedEventLinks;
  bundle: EntityBundle;
}) {
  const graphNeighbors = bundle.related
    .slice(0, 24)
    .map((r) => ({ entity: r.other, relation: r.relation }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {eventTypeLabel(event.event.eventType)}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          Timeline · {event.event.timelineOrder}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {event.primaryScripture}
        </span>
        {event.aliases?.slice(0, 4).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {a}
          </span>
        ))}
      </div>

      <section aria-labelledby="overview">
        <h2
          id="overview"
          className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
        >
          Overview
        </h2>
        <p className="text-foreground/90 text-base leading-relaxed">
          {event.description}
        </p>
      </section>

      <section aria-labelledby="timeline-position">
        <h2
          id="timeline-position"
          className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
        >
          Timeline position
        </h2>
        <div className="border-border/70 bg-card flex flex-wrap items-center gap-3 rounded-2xl border p-4 text-sm">
          {links.prev ? (
            <Link
              href={eventHref(links.prev)}
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              ← {links.prev.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">Start of hub timeline</span>
          )}
          <span className="text-foreground font-medium">{event.name}</span>
          {links.next ? (
            <Link
              href={eventHref(links.next)}
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              {links.next.name} →
            </Link>
          ) : (
            <span className="text-muted-foreground">End of hub timeline</span>
          )}
        </div>
      </section>

      <EntityLinkList
        title="People involved"
        entities={links.participants}
        extraHref={(e) => {
          const href = genealogyPersonHref(e);
          return href ? { href, label: "Genealogy" } : null;
        }}
      />

      <EntityLinkList
        title="Places involved"
        entities={links.places}
        extraHref={(e) =>
          isAtlasPlace(e)
            ? { href: atlasHref(e), label: "Atlas" }
            : null
        }
      />

      <EntityLinkList title="Kingdoms" entities={links.kingdoms} />

      {links.chapters.length > 0 ? (
        <section aria-labelledby="gita-chapters">
          <h2
            id="gita-chapters"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Related Gītā chapters
          </h2>
          <ul className="flex flex-wrap gap-2">
            {links.chapters.map((n) => (
              <li key={n}>
                <Link
                  href={gitaChapterHref(n)}
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                >
                  <BookOpen className="h-3.5 w-3.5" aria-hidden />
                  Chapter {n}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {links.verses.some((v) => v.href || v.entity) ? (
        <section aria-labelledby="related-verses">
          <h2
            id="related-verses"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Related verses
          </h2>
          <ul className="space-y-2">
            {links.verses.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-2 text-sm">
                {v.href ? (
                  <Link
                    href={v.href}
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    {v.entity?.name ?? v.id.replace(/^verse\./, "")}
                  </Link>
                ) : (
                  <span>{v.entity?.name ?? v.id}</span>
                )}
                {v.entity ? (
                  <Link
                    href={entityHref(v.entity)}
                    className="text-muted-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
                  >
                    Encyclopedia
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <EntityLinkList
        title="Weapons used"
        entities={links.weapons}
        empty={undefined}
        entityLinkHref={weaponHref}
        extraHref={(e) => ({ href: entityHref(e), label: "Encyclopedia" })}
      />

      {links.weapons.length > 0 ? (
        <p className="text-muted-foreground -mt-6 text-xs">
          <Swords className="mr-1 inline h-3 w-3" aria-hidden />
          Weapon entries are Knowledge Graph entities linked from this event’s
          JSON.
        </p>
      ) : null}

      <section aria-labelledby="genealogy-links">
        <h2
          id="genealogy-links"
          className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
        >
          Genealogy links
        </h2>
        <ul className="flex flex-wrap gap-2">
          {links.participants
            .map((p) => ({ p, href: genealogyPersonHref(p) }))
            .filter((x): x is { p: KnowledgeEntity; href: string } =>
              Boolean(x.href),
            )
            .slice(0, 16)
            .map(({ p, href }) => (
              <li key={p.id}>
                <Link
                  href={href}
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                >
                  <GitBranch className="h-3.5 w-3.5" aria-hidden />
                  {p.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="atlas-links">
        <h2
          id="atlas-links"
          className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
        >
          Atlas links
        </h2>
        <ul className="flex flex-wrap gap-2">
          {links.places.filter(isAtlasPlace).map((p) => (
            <li key={p.id}>
              <Link
                href={atlasHref(p)}
                className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
              >
                <MapPinned className="h-3.5 w-3.5" aria-hidden />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        {links.places.filter(isAtlasPlace).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No Atlas-mapped places on this event yet.
          </p>
        ) : null}
      </section>

      <EntityLinkList
        title="Related encyclopedia pages"
        entities={[
          ...links.scriptures,
          ...links.relatedEvents,
          ...links.kingdoms.slice(0, 4),
        ]}
      />

      {links.relatedEvents.length > 0 ? (
        <section aria-labelledby="related-events">
          <h2
            id="related-events"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Related events
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {links.relatedEvents.map((e) => (
              <li key={e.id}>
                <Link
                  href={eventHref(e)}
                  className="border-border/70 bg-card hover:border-saffron/40 block rounded-2xl border p-4 transition-divine"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#6a4530]">
                    {eventTypeLabel(e.event.eventType)}
                  </p>
                  <p className="mt-1 font-serif text-lg">{e.name}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{e.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {event.scriptureSources.length > 0 ? (
        <section aria-labelledby="sources">
          <h2
            id="sources"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Sources
          </h2>
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {event.scriptureSources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {formatCitation(s)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {graphNeighbors.length > 0 ? (
        <section aria-labelledby="kg-graph">
          <h2
            id="kg-graph"
            className="text-saffron mb-3 text-[10px] font-medium uppercase tracking-[0.18em]"
          >
            Knowledge graph
          </h2>
          <LazyEntityGraph root={event} neighbors={graphNeighbors} />
        </section>
      ) : null}

      <section className="border-border/60 flex flex-wrap gap-2 border-t pt-6">
        <Link
          href={entityHref(event)}
          className="border-border bg-background/80 hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-divine"
        >
          <Library className="h-3.5 w-3.5" aria-hidden />
          Encyclopedia entry
        </Link>
        <Link
          href="/events"
          className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
        >
          All events
        </Link>
      </section>
    </div>
  );
}
