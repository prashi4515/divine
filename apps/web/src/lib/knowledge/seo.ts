import type { Metadata } from "next";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { ENTITY_KIND_LABELS } from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";
import {
  absoluteUrl,
  articleJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  clampDescription,
  clampTitle,
  ogImageFor,
  personJsonLd,
  placeJsonLd,
} from "@/lib/seo";

export { breadcrumbJsonLd };

export function entityMetadata(entity: KnowledgeEntity): Metadata {
  const kindLabel = ENTITY_KIND_LABELS[entity.kind] ?? entity.kind;
  const title =
    entity.seo?.title ??
    clampTitle(`${entity.name} – ${kindLabel}`);
  const description = clampDescription(
    entity.seo?.description ?? entity.summary,
  );
  const path = entityHref(entity);
  const isPerson = [
    "person",
    "king",
    "queen",
    "sage",
    "warrior",
    "avatar",
    "deity",
    "deva",
    "devi",
  ].includes(entity.kind);

  return buildPageMetadata({
    title,
    description,
    path,
    type: isPerson ? "profile" : "article",
    image:
      entity.seo?.ogImage ??
      ogImageFor({
        title: entity.name,
        subtitle: kindLabel,
        eyebrow: "Encyclopedia",
      }),
    imageAlt: entity.name,
  });
}

export function entityJsonLd(entity: KnowledgeEntity, overridePath?: string) {
  const path = overridePath ?? entityHref(entity);
  const kind = entity.kind;
  const alternateName = [entity.englishName, ...(entity.aliases ?? [])].filter(
    Boolean,
  );

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
    return personJsonLd({
      name: entity.name,
      description: entity.description,
      path,
      alternateName,
    });
  }

  if (
    kind === "city" ||
    kind === "kingdom" ||
    kind === "river" ||
    kind === "mountain" ||
    kind === "forest" ||
    kind === "temple" ||
    kind === "pilgrimage" ||
    kind === "battlefield" ||
    kind === "ashrama"
  ) {
    return placeJsonLd({
      name: entity.name,
      description: entity.description,
      path,
      latitude: entity.atlas?.latitude,
      longitude: entity.atlas?.longitude,
    });
  }

  return articleJsonLd({
    headline: entity.name,
    description: entity.description,
    path,
    image: entity.seo?.ogImage,
  });
}

/** @deprecated Prefer absoluteUrl from @/lib/seo — kept for call sites during migration. */
export function siteAbsoluteUrl(path: string): string {
  return absoluteUrl(path);
}
