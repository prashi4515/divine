import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { CharacterPageBody } from "@/features/encyclopedia/character-page-body";
import { EntityPageBody } from "@/features/encyclopedia/entity-page-body";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getAllEntities,
  getEntityBundle,
  getEntityByKindSlug,
} from "@/lib/knowledge/store";
import { buildCharacterProfile } from "@/lib/encyclopedia/character-profile";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import {
  entityMetadata,
  entityJsonLd,
  breadcrumbJsonLd,
} from "@/lib/knowledge/seo";
import { ENTITY_KIND_LABELS, type EntityKind } from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;

type PageProps = { params: Promise<{ kind: string; slug: string }> };

export async function generateStaticParams() {
  const entities = await getAllEntities();
  return entities
    .filter((e) => e.status === "published")
    .map((e) => ({ kind: e.kind, slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kind, slug } = await params;
  const entity = await getEntityByKindSlug(kind, slug);
  if (!entity) return { title: "Entity not found" };
  return entityMetadata(entity);
}

export default async function EncyclopediaEntityPage({ params }: PageProps) {
  const { kind, slug } = await params;
  const entity = await getEntityByKindSlug(kind, slug);
  if (!entity || entity.status !== "published") notFound();

  const bundle = await getEntityBundle(entity.id);
  if (!bundle) notFound();

  const isCharacter = isCharacterEntity(entity);
  const characterProfile = isCharacter
    ? buildCharacterProfile(bundle)
    : null;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Encyclopedia", href: "/encyclopedia" },
    {
      name: ENTITY_KIND_LABELS[entity.kind as EntityKind],
      href: `/encyclopedia/${entity.kind}`,
    },
    { name: entity.name },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow={
            isCharacter
              ? `Character · ${ENTITY_KIND_LABELS[entity.kind as EntityKind]}`
              : ENTITY_KIND_LABELS[entity.kind as EntityKind]
          }
          title={entity.name}
          description={entity.summary}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/encyclopedia", label: "Encyclopedia" },
            {
              href: `/encyclopedia/${entity.kind}`,
              label: ENTITY_KIND_LABELS[entity.kind as EntityKind],
            },
            { label: entity.name },
          ]}
          actions={
            <Link
              href="/encyclopedia"
              className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
            >
              Encyclopedia home
            </Link>
          }
        />
        {characterProfile ? (
          <CharacterPageBody profile={characterProfile} />
        ) : (
          <EntityPageBody bundle={bundle} />
        )}
        <RelatedContentSection entityId={entity.id} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd(entity)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
    </div>
  );
}
