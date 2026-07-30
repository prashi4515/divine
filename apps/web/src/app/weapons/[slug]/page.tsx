import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { WeaponPageBody } from "@/features/weapons/weapon-page-body";
import { Suspense } from "react";
import { RelatedContentSection } from "@/features/knowledge/related-content-section";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getWeaponBySlug,
  getWeapons,
  resolveWeaponLinks,
} from "@/lib/weapons/store";
import { weaponHref } from "@/lib/weapons/helpers";
import { displayEnglishName, toModernEnglish } from "@/lib/text/modern-english";
import {
  breadcrumbJsonLd,
  entityJsonLd,
  entityMetadata,
} from "@/lib/knowledge/seo";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const weapons = await getWeapons();
  return weapons.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weapon = await getWeaponBySlug(slug);
  if (!weapon) return { title: "Weapon not found" };
  const title = displayEnglishName(weapon);
  const base = entityMetadata(weapon);
  return {
    ...base,
    title: `${title} - Weapons | Divine`,
    description: toModernEnglish(
      weapon.seo?.description ?? weapon.summary,
    ),
    alternates: { canonical: weaponHref(weapon) },
    openGraph: {
      ...base.openGraph,
      title: `${title} - Weapons | Divine`,
      url: `${SITE_URL}${weaponHref(weapon)}`,
    },
  };
}

export default async function WeaponDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const weapon = await getWeaponBySlug(slug);
  if (!weapon) notFound();

  const links = await resolveWeaponLinks(weapon);
  const title = displayEnglishName(weapon);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Weapons", href: "/weapons" },
    { name: title },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Weapon"
          title={title}
          description={toModernEnglish(weapon.summary)}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/weapons", label: "Weapons" },
            { label: title },
          ]}
          actions={
            <>
              <Link
                href="/weapons"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                All weapons
              </Link>
              <Link
                href={`/encyclopedia/weapon/${weapon.slug}`}
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
                prefetch
              >
                Encyclopedia
              </Link>
            </>
          }
        />
        <WeaponPageBody weapon={weapon} links={links} />
        <Suspense fallback={null}>
          <RelatedContentSection entityId={weapon.id} />
        </Suspense>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd(weapon)),
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
