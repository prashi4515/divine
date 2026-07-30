import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Library,
  ScrollText,
} from "lucide-react";
import type {
  ConceptResolvedLinks,
  KnowledgeConcept,
} from "@/lib/concepts/store";
import { conceptHref } from "@/lib/concepts/helpers";
import { entityHref } from "@/lib/knowledge/search";
import { eventHref, eventTypeLabel, genealogyPersonHref } from "@/lib/events/helpers";
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
  hrefFor,
  extraHref,
}: {
  title: string;
  id: string;
  entities: KnowledgeEntity[];
  hrefFor?: (e: KnowledgeEntity) => string;
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
                href={hrefFor?.(e) ?? entityHref(e)}
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
 * Concept detail — every section from resolveConceptLinks (shared KG JSON).
 */
export function ConceptPageBody({
  concept,
  links,
}: {
  concept: KnowledgeConcept;
  links: ConceptResolvedLinks;
}) {
  const graphNeighbors = links.relatedEdges.slice(0, 24).map((r) => ({
    entity: r.other,
    relation: r.relation,
  }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          Concept
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {links.overview.primaryScripture}
        </span>
        {concept.sanskritName ? (
          <span className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]">
            {concept.sanskritName}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={entityHref(concept)}
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
        >
          Encyclopedia
        </Link>
        <Link
          href="/bhagavad-gita"
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
        >
          Bhagavad Gītā
        </Link>
        <Link
          href={`/search?q=${encodeURIComponent(concept.englishName)}`}
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
        >
          Search
        </Link>
      </div>

      <Section id="definition" title="Definition">
        <p className="text-foreground/90 text-base leading-relaxed">
          {links.definition}
        </p>
      </Section>

      <Section id="meaning" title="Meaning">
        <p className="text-foreground/90 text-base leading-relaxed">
          {links.meaning}
        </p>
      </Section>

      {links.etymology ? (
        <Section id="etymology" title="Etymology">
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            {links.etymology}
          </p>
        </Section>
      ) : null}

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

      {links.verses.length > 0 ? (
        <Section id="related-verses" title="Related verses">
          <ul className="space-y-1.5">
            {links.verses.map((v) => (
              <li key={v.id}>
                <Link
                  href={v.href ?? entityHref(v.entity ?? concept)}
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

      {links.chapters.length > 0 ? (
        <Section id="related-chapters" title="Related chapters">
          <ul className="flex flex-wrap gap-2">
            {links.chapters.map((ch) => (
              <li key={ch.number}>
                <Link
                  href={ch.href}
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                >
                  {ch.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
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
        <Section id="related-events" title="Related events">
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

      {links.examples.length > 0 ? (
        <Section id="examples" title="Examples">
          <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {links.examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <EntityChips
        id="related-concepts"
        title="Related concepts"
        entities={links.relatedConcepts}
        hrefFor={conceptHref}
        extraHref={(e) => ({ href: entityHref(e), label: "Encyclopedia" })}
      />

      {links.aliases.length > 0 ? (
        <Section id="search-aliases" title="Search aliases">
          <ul className="flex flex-wrap gap-2">
            {links.aliases.map((a) => (
              <li key={a}>
                <Link
                  href={`/search?q=${encodeURIComponent(a)}`}
                  className="border-border/50 text-muted-foreground hover:border-saffron/40 hover:text-foreground inline-flex rounded-full border px-3 py-1.5 text-xs transition-divine"
                >
                  {a}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-2 text-[11px]">
            Aliases are indexed in Knowledge Search and link here from the
            shared graph entity.
          </p>
        </Section>
      ) : null}

      {graphNeighbors.length > 0 ? (
        <Section id="kg-graph" title="Knowledge graph">
          <LazyEntityGraph root={concept} neighbors={graphNeighbors} />
        </Section>
      ) : null}

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Concept pages resolve definition, meaning, etymology, verses, chapters,
        characters, events, and related ideas from the shared Knowledge Graph —
        no parallel concepts dataset and no Neon storage.
      </p>
    </div>
  );
}
