import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, ScrollText } from "lucide-react";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import {
  getGenealogyPeopleByIds,
  getGenealogyPerson,
  getModulesForPerson,
  listAllGenealogyPersonIds,
} from "@/lib/genealogy/store";
import { resolveEntityId } from "@/lib/knowledge/store";
import {
  CATEGORY_LABELS,
  CATEGORY_TOKENS,
  CONFIDENCE_LABELS,
  RELATIONSHIP_LABELS,
  type Relationship,
} from "@/lib/genealogy/types";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = false;


type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const ids = await listAllGenealogyPersonIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await getGenealogyPerson(id);
  if (!person) return { title: "Person not found" };
  const title = `${person.name} (${CATEGORY_LABELS[person.category]}) — Hindu genealogy`;
  const description = person.description.slice(0, 220);
  return {
    title,
    description,
    alternates: { canonical: `/genealogy/person/${person.id}` },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}/genealogy/person/${person.id}`,
      type: "profile",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getGenealogyPerson(id);
  if (!person) notFound();

  const neighborIds = person.relationships.map((r) => r.personId);
  const [modules, neighbors, entityId] = await Promise.all([
    getModulesForPerson(id),
    getGenealogyPeopleByIds(neighborIds),
    resolveEntityId(id),
  ]);
  const byId = new Map(neighbors.map((p) => [p.id, p]));

  const tokens = CATEGORY_TOKENS[person.category];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${getSiteUrl()}/genealogy/person/${person.id}`,
    name: person.name,
    alternateName: [person.sanskritName, ...(person.aliases ?? [])].filter(
      Boolean,
    ),
    description: person.description,
    url: `${getSiteUrl()}/genealogy/person/${person.id}`,
    gender: person.gender === "male" || person.gender === "female"
      ? person.gender
      : undefined,
    parent: person.relationships
      .filter(
        (r) =>
          r.type === "parent" ||
          r.type === "father" ||
          r.type === "mother",
      )
      .map((r) => ({
        "@type": "Person",
        name: byId.get(r.personId)?.name ?? r.personId,
        url: `${getSiteUrl()}/genealogy/person/${r.personId}`,
      })),
    spouse: person.relationships
      .filter((r) => r.type === "spouse" || r.type === "consort")
      .map((r) => ({
        "@type": "Person",
        name: byId.get(r.personId)?.name ?? r.personId,
        url: `${getSiteUrl()}/genealogy/person/${r.personId}`,
      })),
    children: person.relationships
      .filter(
        (r) =>
          r.type === "child" ||
          r.type === "son" ||
          r.type === "daughter",
      )
      .map((r) => ({
        "@type": "Person",
        name: byId.get(r.personId)?.name ?? r.personId,
        url: `${getSiteUrl()}/genealogy/person/${r.personId}`,
      })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
      {
        "@type": "ListItem",
        position: 2,
        name: "Genealogy",
        item: `${getSiteUrl()}/genealogy`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: person.name,
        item: `${getSiteUrl()}/genealogy/person/${person.id}`,
      },
    ],
  };

  const grouped = groupRelationships(person.relationships);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow={CATEGORY_LABELS[person.category]}
          title={person.name}
          description={person.description}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/genealogy", label: "Genealogy" },
            { label: person.name },
          ]}
          actions={
            <>
              {person.encyclopediaHref && (
                <Link
                  href={person.encyclopediaHref}
                  className="cta-saffron inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-white"
                >
                  Encyclopedia
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
              {modules[0] && (
                <Link
                  href={`/genealogy/${modules[0].slug}`}
                  className="border-border bg-background/80 text-foreground hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                >
                  Open in {modules[0].title}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </>
          }
        />

        <section
          className="page-gutter w-full pb-12 md:pb-16"
          aria-labelledby="person-details"
        >
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            <article className="border-border/70 rounded-2xl border p-6 md:col-span-2">
              <h2 id="person-details" className="sr-only">
                Details
              </h2>

              {person.aliases && person.aliases.length > 0 && (
                <div className="mb-5">
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{ color: tokens.accent }}
                  >
                    Also known as
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {person.aliases.map((a) => (
                      <li
                        key={a}
                        className="border-border/60 text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {grouped.map((g) => (
                <section key={g.title} className="mb-6 last:mb-0">
                  <h3 className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                    {g.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((rel) => {
                      const other = byId.get(rel.personId);
                      return (
                        <li key={`${rel.type}-${rel.personId}`}>
                          <Link
                            href={`/genealogy/person/${rel.personId}`}
                            className="border-border/70 bg-card hover:border-saffron/40 flex items-start justify-between gap-3 rounded-lg border p-3 transition-divine"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="text-foreground text-sm font-medium">
                                {other?.name ?? rel.personId}
                              </span>
                              <span className="text-muted-foreground/90 mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                                {RELATIONSHIP_LABELS[rel.type]}
                                <span
                                  className={
                                    rel.confidence === "verified"
                                      ? "rounded-full border border-emerald-700/30 bg-emerald-50 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-900"
                                      : rel.confidence === "traditional"
                                        ? "rounded-full border border-amber-700/30 bg-amber-50 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-950"
                                        : "text-saffron rounded-full border border-current/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
                                  }
                                >
                                  {CONFIDENCE_LABELS[rel.confidence]}
                                </span>
                              </span>
                              {rel.note && (
                                <span className="text-muted-foreground mt-1 block text-[11px] italic">
                                  {rel.note}
                                </span>
                              )}
                              <span className="text-muted-foreground/90 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px]">
                                {rel.sources.map((s, i) => (
                                  <span
                                    key={`${s.work}-${i}`}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                                    {[s.work, s.section, s.chapter, s.verse]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </span>
                                ))}
                              </span>
                            </span>
                            <ArrowUpRight
                              className="text-muted-foreground/70 h-3.5 w-3.5 shrink-0"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

              {person.variantTraditions && person.variantTraditions.length > 0 && (
                <section className="border-border/70 bg-muted/40 mt-6 rounded-xl border p-5">
                  <h3 className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                    Variant traditions
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {person.variantTraditions.map((v) => (
                      <li key={v.label}>
                        <p className="text-foreground text-sm font-medium">
                          {v.label}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                          {v.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>

            <aside className="space-y-6">
              {person.relatedVerses && person.relatedVerses.length > 0 && (
                <div className="border-border/70 rounded-2xl border p-6">
                  <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                    In the Bhagavad Gītā
                  </p>
                  <ul className="mt-3 space-y-2">
                    {person.relatedVerses.map((v) => (
                      <li key={v.publicId}>
                        <Link
                          href={verseHref(v.workCode, v.publicId)}
                          className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-divine"
                        >
                          <span className="inline-flex items-center gap-2">
                            <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                            <span className="text-foreground font-medium">
                              {formatGitaLabel(v.publicId)}
                            </span>
                          </span>
                          {v.label && (
                            <span className="text-muted-foreground max-w-[55%] truncate text-right">
                              {v.label}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {modules.length > 0 && (
                <div className="border-border/70 rounded-2xl border p-6">
                  <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                    Appears in
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {modules.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/genealogy/${m.slug}`}
                          className="text-foreground inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                        >
                          {m.title}
                          <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {person.scriptureSources.length > 0 && (
                <div className="border-border/70 rounded-2xl border p-6">
                  <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                    Primary sources
                  </p>
                  <ul className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                    {person.scriptureSources.map((s, i) => (
                      <li key={`${s.work}-${i}`} className="inline-flex items-start gap-1.5">
                        <ScrollText className="mt-0.5 h-3 w-3 opacity-70" aria-hidden />
                        <span>
                          {[s.work, s.section, s.chapter, s.verse]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>
        {entityId ? <RelatedContentSection entityId={entityId} /> : null}
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
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

function verseHref(workCode: string, publicId: string): string {
  if (workCode === "bg") {
    const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
    if (m) return `/verse/${m[1]}/${m[2]}`;
  }
  return `/bhagavad-gita`;
}

function formatGitaLabel(publicId: string): string {
  const m = /^(?:bg\.)?(\d{1,2})\.(\d{1,3})$/i.exec(publicId);
  if (m) return `Chapter ${m[1]}, Verse ${m[2]}`;
  return publicId;
}
