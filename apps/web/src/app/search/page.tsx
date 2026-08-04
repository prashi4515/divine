import { Suspense } from "react";
import type { Metadata } from "next";
import {
  KNOWLEDGE_SEARCH_GROUPS,
  type KnowledgeSearchGroup,
} from "@divine/types";
import { SearchPageClient } from "@/features/search";
import { SearchSkeleton } from "@/features/search/search-skeleton";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { warmKnowledgeSearchIndex } from "@/lib/search/knowledge-search";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  searchSeo,
  websiteJsonLd,
} from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return buildPageMetadata(searchSeo(sp.q));
}

void warmKnowledgeSearchIndex().catch(() => undefined);

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    group?: string;
  }>;
};

function parseGroup(raw: string | undefined): KnowledgeSearchGroup | undefined {
  if (!raw) return undefined;
  return (KNOWLEDGE_SEARCH_GROUPS as readonly string[]).includes(raw)
    ? (raw as KnowledgeSearchGroup)
    : undefined;
}

async function SearchBody({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const group = parseGroup(sp.group?.trim());

  return <SearchPageClient initialQuery={q} initialGroup={group} />;
}

export default function SearchPage(props: SearchPageProps) {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Search" },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 45% at 50% -8%, hsl(var(--muted) / 0.65), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />
      <SiteHeader />
      <main
        id="main-content"
        className="page-gutter w-full flex-1 pb-14 pt-4 sm:pb-16 md:pb-20 md:pt-6"
      >
        <Breadcrumbs items={crumbs} className="mb-4" />
        <Suspense fallback={<SearchSkeleton />}>
          <SearchBody searchParams={props.searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
      <JsonLd data={[breadcrumbJsonLd(crumbs), websiteJsonLd()]} />
    </div>
  );
}
