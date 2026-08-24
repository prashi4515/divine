import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { KingdomPageBody } from "@/features/kingdoms/kingdom-page-body";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getKingdomBySlug,
  getKingdoms,
  resolveKingdomLinks,
} from "@/lib/kingdoms/store";
import { kingdomHref } from "@/lib/kingdoms/helpers";
import {
  breadcrumbJsonLd,
  entityJsonLd,
} from "@/lib/knowledge/seo";


type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const kingdoms = await getKingdoms();
  return kingdoms.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kingdom = await getKingdomBySlug(slug);
  if (!kingdom) return { title: "Kingdom not found" };
  const title = kingdom.seo?.title ?? `${kingdom.name} — Kingdoms | Divine`;
  const description = kingdom.seo?.description ?? kingdom.summary;
  return buildPageMetadata({
    title,
    description,
    path: kingdomHref(kingdom),
    lang: "en",
    type: "article",
  });
}

export default async function KingdomDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const kingdom = await getKingdomBySlug(slug);
  if (!kingdom) notFound();

  const links = await resolveKingdomLinks(kingdom);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Kingdoms", href: "/kingdoms" },
    { name: kingdom.name },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Kingdom"
          title={kingdom.name}
          description={kingdom.summary}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/kingdoms", label: "Kingdoms" },
            { label: kingdom.name },
          ]}
          actions={
            <>
              <Link
                href="/kingdoms"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                All kingdoms
              </Link>
              <Link
                href={`/encyclopedia/kingdom/${kingdom.slug}`}
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Encyclopedia
              </Link>
            </>
          }
        />
        <KingdomPageBody kingdom={kingdom} links={links} />
        <RelatedContentSection entityId={kingdom.id} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd(kingdom)),
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
