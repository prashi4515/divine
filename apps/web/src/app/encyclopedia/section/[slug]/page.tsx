import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { EntityCard } from "@/features/encyclopedia/entity-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getCollection,
  getCollections,
  getEntitiesForCollection,
} from "@/lib/knowledge/store";

export const dynamic = "force-static";
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cols = await getCollections();
  return cols
    .filter((c) => c.kind === "encyclopedia-section")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollection(slug);
  if (!col) return { title: "Section not found" };
  return {
    title: `${col.title} — Encyclopedia`,
    description: col.summary,
    alternates: { canonical: `/encyclopedia/section/${slug}` },
  };
}

export default async function EncyclopediaSectionPage({ params }: PageProps) {
  const { slug } = await params;
  const col = await getCollection(slug);
  if (!col || col.kind !== "encyclopedia-section") notFound();
  const entities = await getEntitiesForCollection(slug);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Encyclopedia"
          title={col.title}
          description={col.description}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/encyclopedia", label: "Encyclopedia" },
            { label: col.title },
          ]}
          actions={
            <Link
              href="/encyclopedia"
              className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
            >
              All sections
            </Link>
          }
        />
        <section className="page-gutter py-10">
          <div className="mx-auto max-w-6xl">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((e, i) => (
                <li key={e.id} className="h-full">
                  <EntityCard entity={e} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
