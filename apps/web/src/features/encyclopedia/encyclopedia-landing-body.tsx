"use client";

import Link from "next/link";
import { EntityCard } from "@/features/encyclopedia/entity-card";
import { localizeEncyclopediaSection } from "@/lib/i18n/encyclopedia-section-messages";
import { localizedEntityKindLabel } from "@/lib/i18n/knowledge-labels";
import { useHubUiMessages, useUiLanguage } from "@/lib/i18n/use-messages";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import type {
  EntityKind,
  KnowledgeCollection,
  KnowledgeEntity,
} from "@/lib/knowledge/types";

type Props = {
  sections: KnowledgeCollection[];
  kinds: EntityKind[];
  featured: KnowledgeEntity[];
  initialLanguage?: ReadingLanguageCode;
};

export function EncyclopediaLandingBody({
  sections,
  kinds,
  featured,
  initialLanguage,
}: Props) {
  const t = useHubUiMessages(initialLanguage);
  const lang = useUiLanguage(initialLanguage);

  return (
    <section className="page-gutter py-10" aria-labelledby="sections">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <h2
            id="sections"
            className="text-foreground font-serif text-xl tracking-tight sm:text-2xl"
          >
            {t.browseBySection}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => {
              const copy = localizeEncyclopediaSection(s, lang);
              return (
                <li key={s.slug}>
                  <Link
                    href={`/encyclopedia/section/${s.slug}`}
                    className="border-border/70 bg-card hover:border-saffron/40 block rounded-2xl border p-5 transition-divine"
                  >
                    <p className="text-saffron text-[10px] font-medium uppercase tracking-[0.16em]">
                      {copy.eyebrow || t.sectionFallback}
                    </p>
                    <h3 className="text-foreground mt-2 font-serif text-lg">
                      {copy.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {copy.summary}
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs">
                      {t.entitiesCount(s.entityIds.length)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-foreground font-serif text-xl tracking-tight">
            {t.byKind}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {kinds.map((k) => (
              <li key={k}>
                <Link
                  href={`/encyclopedia/${k}`}
                  className="border-border/70 hover:border-saffron/40 inline-flex rounded-full border px-3 py-1 text-xs transition-divine"
                >
                  {localizedEntityKindLabel(k, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-foreground font-serif text-xl tracking-tight">
            {t.featured}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e, i) => (
              <li key={e.id} className="h-full">
                <EntityCard entity={e} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
