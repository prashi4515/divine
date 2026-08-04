import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EncyclopediaKindBody } from "@/features/encyclopedia/encyclopedia-kind-body";
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

export const dynamic = "force-dynamic";

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

  if (kind === "section") {
    notFound();
  }

  if (!(ENTITY_KINDS as readonly string[]).includes(kind)) {
    const col = await getCollection(kind);
    if (col?.kind === "encyclopedia-section") {
      const entities = await getEntitiesForCollection(kind);
      return (
        <div className="relative flex min-h-svh flex-col">
          <SiteHeader />
          <main className="flex-1">
            <EncyclopediaKindBody
              sectionSlug={col.slug}
              sectionTitle={col.title}
              sectionDescription={col.description ?? col.summary}
              entities={[...entities]}
            />
          </main>
          <SiteFooter />
        </div>
      );
    }
    notFound();
  }

  const entities = await getEntitiesByKind(kind);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <EncyclopediaKindBody
          kind={kind as EntityKind}
          entities={[...entities]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
