import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { ConceptPageBody } from "@/features/concepts/concept-page-body";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getConceptBySlug,
  getConcepts,
  resolveConceptLinks,
} from "@/lib/concepts/store";
import { conceptHref } from "@/lib/concepts/helpers";
import {
  breadcrumbJsonLd,
  entityJsonLd,
  entityMetadata,
} from "@/lib/knowledge/seo";

export const dynamic = "force-static";
export const revalidate = false;


type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const concepts = await getConcepts().catch(() => []);
  return concepts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) return { title: "Concept not found" };
  const base = entityMetadata(concept);
  return {
    ...base,
    title: concept.seo?.title ?? `${concept.name} — Concepts | Divine`,
    alternates: { canonical: conceptHref(concept) },
    openGraph: {
      ...base.openGraph,
      url: `${getSiteUrl()}${conceptHref(concept)}`,
    },
  };
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) notFound();

  const links = await resolveConceptLinks(concept);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Concepts", href: "/concepts" },
    { name: concept.name },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Concept"
          title={concept.name}
          description={concept.summary}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/concepts", label: "Concepts" },
            { label: concept.name },
          ]}
          actions={
            <>
              <Link
                href="/concepts"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                All concepts
              </Link>
              <Link
                href={`/encyclopedia/concept/${concept.slug}`}
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Encyclopedia
              </Link>
            </>
          }
        />
        <ConceptPageBody concept={concept} links={links} />
        <RelatedContentSection entityId={concept.id} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd(concept)),
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
