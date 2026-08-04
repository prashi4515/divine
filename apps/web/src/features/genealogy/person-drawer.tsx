"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ScrollText,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type {
  Person,
  Relationship,
  ScriptureReference,
} from "@/lib/genealogy/types";
import { CATEGORY_TOKENS,
  CONFIDENCE_LABELS,
  RELATIONSHIP_LABELS,
  formatCitation,
  type ConfidenceLevel } from "@/lib/genealogy/types";
import { localizedPersonCategoryLabel } from "@/lib/i18n/knowledge-labels";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

/**
 * Right-side sheet built on Radix Dialog primitives.
 * Shown when a person node is opened in the explorer.
 */
export function PersonDrawer({
  person,
  open,
  onOpenChange,
  onNavigateToPerson,
  peopleById,
}: {
  person: Person | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPerson?: (id: string) => void;
  /** Optional map so related names resolve to proper titles, not raw IDs. */
  peopleById?: ReadonlyMap<string, Person>;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "bg-background border-border fixed right-0 top-0 z-50 flex h-svh w-full max-w-md flex-col overflow-hidden border-l shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200",
          )}
        >
          {person ? (
            <PersonDrawerBody
              person={person}
              onNavigateToPerson={onNavigateToPerson}
              peopleById={peopleById}
            />
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              Select a person to open their details.
            </div>
          )}

          <DialogPrimitive.Close
            aria-label="Close details"
            className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute right-3 top-3 rounded-md p-1.5 transition-divine focus-visible:outline-none focus-visible:ring-2"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function PersonDrawerBody({
  person,
  onNavigateToPerson,
  peopleById,
}: {
  person: Person;
  onNavigateToPerson?: (id: string) => void;
  peopleById?: ReadonlyMap<string, Person>;
}) {
  const lang = useUiLanguage();
  const tokens = CATEGORY_TOKENS[person.category];

  const grouped = React.useMemo(() => groupRelationships(person.relationships), [
    person.relationships,
  ]);

  return (
    <>
      <div
        className="relative shrink-0 border-b px-6 py-6"
        style={{ borderColor: `${tokens.ring}33`, background: `${tokens.tint}44` }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl leading-none"
            style={{ background: tokens.tint, color: tokens.accent }}
            aria-hidden
          >
            {person.imagePlaceholder ?? "◈"}
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <p
              className="text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{ color: tokens.accent }}
            >
              {localizedPersonCategoryLabel(person.category, lang)}
            </p>
            <DialogPrimitive.Title asChild>
              <h2 className="text-foreground mt-1 font-serif text-2xl leading-tight tracking-tight">
                {person.name}
              </h2>
            </DialogPrimitive.Title>
            {person.englishName !== person.name && (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {person.englishName}
              </p>
            )}
            {person.sanskritName && (
              <p
                className="indic-display text-muted-foreground mt-0.5 font-serif text-base"
                lang="sa"
              >
                {person.sanskritName}
              </p>
            )}
            {person.epithet && (
              <p className="text-muted-foreground/90 mt-2 text-xs italic">
                {person.epithet}
              </p>
            )}
            <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="border-border/70 rounded-full border px-2 py-0.5">
                {person.primaryScripture}
              </span>
            </p>
          </div>
        </div>
        {person.aliases && person.aliases.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {person.aliases.map((alias) => (
              <li
                key={alias}
                className="border-border/60 text-muted-foreground rounded-full border bg-white/40 px-2 py-0.5 text-[10px] tracking-wide dark:bg-white/5"
              >
                {alias}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <section aria-labelledby="drawer-description">
          <h3 id="drawer-description" className="sr-only">
            Description
          </h3>
          <p className="text-foreground/90 text-sm leading-relaxed">
            {person.description}
          </p>
        </section>

        {grouped.map((group) => (
          <RelationSection
            key={group.title}
            title={group.title}
            relationships={group.items}
            onNavigateToPerson={onNavigateToPerson}
            peopleById={peopleById}
          />
        ))}

        {person.variantTraditions && person.variantTraditions.length > 0 && (
          <section aria-labelledby="variant-traditions" className="space-y-3">
            <h3
              id="variant-traditions"
              className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
            >
              Variant traditions
            </h3>
            {person.variantTraditions.map((v) => (
              <div
                key={v.label}
                className="border-border/70 bg-muted/40 rounded-xl border p-4"
              >
                <p className="text-foreground text-sm font-medium">{v.label}</p>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  {v.description}
                </p>
                <SourceList sources={v.sources} />
              </div>
            ))}
          </section>
        )}

        {person.relatedStories && person.relatedStories.length > 0 && (
          <section aria-labelledby="related-stories" className="space-y-2">
            <h3
              id="related-stories"
              className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
            >
              Stories
            </h3>
            {person.relatedStories.map((s) => (
              <div key={s.title} className="border-border/70 rounded-xl border p-4">
                <p className="text-foreground text-sm font-medium">{s.title}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {s.summary}
                </p>
                {s.sources && <SourceList sources={s.sources} />}
              </div>
            ))}
          </section>
        )}

        {person.relatedVerses && person.relatedVerses.length > 0 && (
          <section aria-labelledby="related-verses" className="space-y-2">
            <h3
              id="related-verses"
              className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
            >
              In the Bhagavad Gītā
            </h3>
            <ul className="space-y-1.5">
              {person.relatedVerses.map((v) => (
                <li key={v.publicId}>
                  <Link
                    href={verseHref(v.workCode, v.publicId)}
                    className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-divine"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                      <span className="text-foreground font-medium">
                        {formatGitaLabel(v.publicId)}
                      </span>
                    </span>
                    {v.label && (
                      <span className="text-muted-foreground max-w-[50%] truncate text-right">
                        {v.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {person.scriptureSources.length > 0 && (
          <section aria-labelledby="scripture-sources" className="space-y-2">
            <h3
              id="scripture-sources"
              className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
            >
              Primary sources
            </h3>
            <SourceList sources={person.scriptureSources} />
          </section>
        )}

        <div className="border-border/70 border-t pt-5 space-y-2">
          {person.encyclopediaHref && (
            <Link
              href={person.encyclopediaHref}
              className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Open in Encyclopedia
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
          <Link
            href={`/genealogy/person/${person.id}`}
            className="text-muted-foreground inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
          >
            Open dedicated genealogy page
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}

const REL_GROUP_ORDER: Array<{
  title: string;
  match: (t: string) => boolean;
}> = [
  { title: "Parents", match: (t) => t === "parent" || t === "father" || t === "mother" || t === "adoptive-father" || t === "adoptive-mother" },
  { title: "Spouses", match: (t) => t === "spouse" || t === "consort" },
  { title: "Siblings", match: (t) => t === "sibling" || t === "brother" || t === "sister" },
  { title: "Children", match: (t) => t === "child" || t === "son" || t === "daughter" || t === "adoptive-son" || t === "adoptive-daughter" },
  { title: "Descendants", match: (t) => t === "descendant" },
  { title: "Ancestors", match: (t) => t === "ancestor" },
  { title: "Teachers & Disciples", match: (t) => t === "guru" || t === "disciple" },
  { title: "Friends & foes", match: (t) => t === "friend" || t === "enemy" },
  { title: "Divine identity", match: (t) => t === "incarnation-of" || t === "manifestation-of" },
];

function groupRelationships(
  relationships: readonly Relationship[],
): Array<{ title: string; items: Relationship[] }> {
  const groups: Array<{ title: string; items: Relationship[] }> = [];
  const consumed = new Set<Relationship>();
  for (const { title, match } of REL_GROUP_ORDER) {
    const items = relationships.filter((r) => match(r.type));
    if (items.length > 0) {
      groups.push({ title, items });
      items.forEach((i) => consumed.add(i));
    }
  }
  const rest = relationships.filter((r) => !consumed.has(r));
  if (rest.length > 0) groups.push({ title: "Related", items: rest });
  return groups;
}

function RelationSection({
  title,
  relationships,
  onNavigateToPerson,
  peopleById,
}: {
  title: string;
  relationships: Relationship[];
  onNavigateToPerson?: (id: string) => void;
  peopleById?: ReadonlyMap<string, Person>;
}) {
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {relationships.map((rel) => (
          <li key={`${rel.type}-${rel.personId}`}>
            <button
              type="button"
              onClick={() => onNavigateToPerson?.(rel.personId)}
              className={cn(
                "border-border/70 bg-card hover:border-saffron/40 group flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left transition-divine",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="text-foreground text-sm font-medium group-hover:underline">
                  {peopleById?.get(rel.personId)?.name ??
                    formatPersonIdLabel(rel.personId)}
                </span>
                <span className="text-muted-foreground/90 mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {RELATIONSHIP_LABELS[rel.type]}
                  <ConfidenceBadge confidence={rel.confidence} />
                </span>
                {rel.note && (
                  <span className="text-muted-foreground mt-1 block text-[11px] italic">
                    {rel.note}
                  </span>
                )}
                <SourceList sources={rel.sources} inline />
              </span>
              <ArrowUpRight
                className="text-muted-foreground/70 group-hover:text-foreground mt-1 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const styles: Record<ConfidenceLevel, string> = {
    verified:
      "border-emerald-700/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    traditional:
      "border-amber-700/30 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
    variant:
      "border-saffron/40 text-saffron bg-saffron/5",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
        styles[confidence],
      )}
    >
      {CONFIDENCE_LABELS[confidence]}
    </span>
  );
}

function SourceList({
  sources,
  inline = false,
}: {
  sources: readonly ScriptureReference[];
  inline?: boolean;
}) {
  if (sources.length === 0) return null;
  return (
    <ul
      className={cn(
        "text-muted-foreground/90 flex flex-wrap gap-x-3 gap-y-1",
        inline ? "mt-1.5 text-[10.5px]" : "mt-2 text-[11px]",
      )}
    >
      {sources.map((s, i) => (
        <li
          key={`${s.work}-${i}`}
          className="inline-flex items-center gap-1 tracking-wide"
          title={formatCitation(s)}
        >
          <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
          <span>{formatCitation(s)}</span>
        </li>
      ))}
    </ul>
  );
}

function formatPersonIdLabel(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function verseHref(workCode: string, publicId: string): string {
  if (workCode === "bg") {
    const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
    if (m) return `/bhagavad-gita/chapter-${m[1]}#verse-${m[2]}`;
    return `/bhagavad-gita`;
  }
  return `/scriptures/${workCode}/${publicId}`;
}

function formatGitaLabel(publicId: string): string {
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (m) return `Chapter ${m[1]}, Verse ${m[2]}`;
  return publicId;
}
