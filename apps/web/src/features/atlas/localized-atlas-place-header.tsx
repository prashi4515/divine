"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { atlasFilterLabel } from "@/lib/atlas/i18n-labels";
import type { AtlasFilter } from "@/lib/atlas/geo";
import { useMessages } from "@/lib/i18n/use-messages";

/**
 * Atlas place hero — chrome labels update live with the language switcher.
 * Place name/summary stay from the Knowledge Graph (English content).
 */
export function LocalizedAtlasPlaceHeader({
  category,
  title,
  description,
  encyclopediaHref,
}: {
  category: AtlasFilter;
  title: string;
  description: string;
  encyclopediaHref: string;
}) {
  const t = useMessages();

  return (
    <GenealogyHeader
      eyebrow={atlasFilterLabel(t, category)}
      title={title}
      description={description}
      breadcrumbs={[
        { href: "/", label: t.home },
        { href: "/atlas", label: t.navAtlas },
        { label: title },
      ]}
      actions={
        <>
          <Link
            href={encyclopediaHref}
            className="cta-saffron inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-white"
          >
            {t.navEncyclopedia}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/atlas"
            className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
          >
            {t.navAtlas}
          </Link>
        </>
      }
    />
  );
}
