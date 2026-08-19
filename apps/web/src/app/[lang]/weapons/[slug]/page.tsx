import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeaponDetailPage from "@/app/weapons/[slug]/page";
import { getWeapons } from "@/lib/weapons/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const weapons = await getWeapons().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const w of weapons) {
      params.push({ lang, slug: w.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const weapon = (await getWeapons()).find((w) => w.slug === slug);
  if (!weapon) return { title: "Weapon not found" };
  return buildPageMetadata({
    title: `${weapon.name} — Divine Astra & Weapon | Divine`,
    description: weapon.summary,
    path: `/${lang}/weapons/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedWeaponDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <WeaponDetailPage params={Promise.resolve({ slug })} />;
}
