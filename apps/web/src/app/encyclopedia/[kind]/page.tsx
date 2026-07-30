import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { EntityCard } from "@/features/encyclopedia/entity-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getCollection,
  getEntitiesByKind,
  getEntitiesForCollection,
} from "@/lib/knowledge/store";
import {
  ENTITY_KINDS,
  ENTITY_KIND_LABELS,
  type EntityKind,
} from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;

type PageProps = { params: Promise<{ kind: string }> };

export async function generateStaticParams() {
  return ENTITY_KINDS.map((kind) => ({ kind }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kind } = await params;
  if (kind === "section") {
    return { title: "Encyclopedia sections" };
  }
  if (!(ENTITY_KINDS as readonly string[]).includes(kind)) {
    return { title: "Not found" };
  }
  const label = ENTITY_KIND_LABELS[kind as EntityKind];
  return {
    title: `${label} — Encyclopedia`,
    description: `Browse ${label} entities in the Divine knowledge graph.`,
    alternates: { canonical: `/encyclopedia/${kind}` },
  };
}

export default async function EncyclopediaKindPage({ params }: PageProps) {
  const { kind } = await params;

  // Redirect-style: /encyclopedia/section is not used; sections live at /encyclopedia/section/[slug]
  if (kind === "section") {
    notFound();
  }

  if (!(ENTITY_KINDS as readonly string[]).includes(kind)) {
    // Maybe it's an encyclopedia section slug mistakenly? Try collection
    const col = await getCollection(kind);
    if (col?.kind === "encyclopedia-section") {
      const entities = await getEntitiesForCollection(kind);
      return (
        <KindLayout
          title={col.title}
          description={col.description}
          crumbs={[
            { href: "/", label: "Home" },
            { href: "/encyclopedia", label: "Encyclopedia" },
            { label: col.title },
          ]}
          entities={entities}
        />
      );
    }
    notFound();
  }

  const entities = await getEntitiesByKind(kind);
  const label = ENTITY_KIND_LABELS[kind as EntityKind];

  return (
    <KindLayout
      title={label}
      description={`Published ${label.toLowerCase()} entities in the knowledge graph.`}
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/encyclopedia", label: "Encyclopedia" },
        { label },
      ]}
      entities={entities}
    />
  );
}

function KindLayout({
  title,
  description,
  crumbs,
  entities,
}: {
  title: string;
  description: string;
  crumbs: Array<{ href?: string; label: string }>;
  entities: Awaited<ReturnType<typeof getEntitiesByKind>>;
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Encyclopedia"
          title={title}
          description={description}
          breadcrumbs={crumbs}
          actions={
            <Link
              href="/encyclopedia"
              className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
            >
              All sections
            </Link>
          }
        />
        <section className="page-gutter py-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-muted-foreground mb-6 text-sm">
              {entities.length} entities
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((e, i) => (
                <li key={e.id} className="h-full">
                  <EntityCard entity={e} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
