import type { Metadata } from "next";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { ENTITY_KIND_LABELS } from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export function entityMetadata(entity: KnowledgeEntity): Metadata {
  const title =
    entity.seo?.title ??
    `${entity.name} — ${ENTITY_KIND_LABELS[entity.kind]} | Divine Encyclopedia`;
  const description =
    entity.seo?.description ?? entity.summary.slice(0, 160);
  const url = `${SITE_URL}${entityHref(entity)}`;
  return {
    title,
    description,
    alternates: { canonical: entityHref(entity) },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: entity.seo?.ogImage ? [{ url: entity.seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function entityJsonLd(entity: KnowledgeEntity) {
  const url = `${SITE_URL}${entityHref(entity)}`;
  const kind = entity.kind;
  let type = "Thing";
  if (
    kind === "person" ||
    kind === "king" ||
    kind === "queen" ||
    kind === "sage" ||
    kind === "warrior" ||
    kind === "avatar" ||
    kind === "deity" ||
    kind === "deva" ||
    kind === "devi"
  ) {
    type = "Person";
  } else if (
    kind === "city" ||
    kind === "kingdom" ||
    kind === "river" ||
    kind === "mountain" ||
    kind === "forest" ||
    kind === "temple" ||
    kind === "pilgrimage"
  ) {
    type = "Place";
  } else if (kind === "concept") {
    type = "DefinedTerm";
  } else if (kind === "event" || kind === "battle") {
    type = "Event";
  }

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: entity.name,
    alternateName: [entity.englishName, ...(entity.aliases ?? [])],
    description: entity.description,
    url,
  };
}

export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; href?: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };
}
