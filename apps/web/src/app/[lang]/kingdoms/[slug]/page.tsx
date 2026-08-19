import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KingdomDetailPage from "@/app/kingdoms/[slug]/page";
import { getKingdoms } from "@/lib/kingdoms/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const kingdoms = await getKingdoms().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const k of kingdoms) {
      params.push({ lang, slug: k.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const kingdom = (await getKingdoms()).find((k) => k.slug === slug);
  if (!kingdom) return { title: "Kingdom not found" };
  return buildPageMetadata({
    title: `${kingdom.name} Kingdom — Ancient Bharata | Divine`,
    description: kingdom.summary,
    path: `/${lang}/kingdoms/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedKingdomDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <KingdomDetailPage params={Promise.resolve({ slug })} />;
}
