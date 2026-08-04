"use client";

import Link from "next/link";
import { EntityCard } from "@/features/encyclopedia/entity-card";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { localizeEncyclopediaSection } from "@/lib/i18n/encyclopedia-section-messages";
import {
  localizedEntityKindLabel,
  localizedKnowledgeChrome,
} from "@/lib/i18n/knowledge-labels";
import { useHubUiMessages, useMessages, useUiLanguage } from "@/lib/i18n/use-messages";
import type { EntityKind, KnowledgeEntity } from "@/lib/knowledge/types";

type Props = {
  kind?: EntityKind;
  sectionSlug?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  entities: KnowledgeEntity[];
};

/**
 * Encyclopedia kind / section listing — chrome follows the UI language.
 */
export function EncyclopediaKindBody({
  kind,
  sectionSlug,
  sectionTitle,
  sectionDescription,
  entities,
}: Props) {
  const lang = useUiLanguage();
  const t = useHubUiMessages();
  const nav = useMessages();
  const chrome = localizedKnowledgeChrome(lang);

  const sectionCopy =
    sectionSlug && sectionTitle
      ? localizeEncyclopediaSection(
          {
            slug: sectionSlug,
            title: sectionTitle,
            summary: sectionDescription ?? "",
            eyebrow: chrome.encyclopedia,
          },
          lang,
        )
      : null;

  const title = kind
    ? localizedEntityKindLabel(kind, lang)
    : (sectionCopy?.title ?? sectionTitle ?? chrome.encyclopedia);

  const description = kind
    ? `${title} — ${chrome.encyclopedia}`
    : (sectionCopy?.summary ?? sectionDescription ?? "");

  return (
    <>
      <GenealogyHeader
        eyebrow={chrome.encyclopedia}
        title={title}
        description={description}
        breadcrumbs={[
          { href: "/", label: nav.home },
          { href: "/encyclopedia", label: chrome.encyclopedia },
          { label: title },
        ]}
        actions={
          <Link
            href="/encyclopedia"
            className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
          >
            {t.browseBySection}
          </Link>
        }
      />
      <section className="page-gutter py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-muted-foreground mb-6 text-sm">
            {t.entitiesCount(entities.length)}
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
    </>
  );
}
