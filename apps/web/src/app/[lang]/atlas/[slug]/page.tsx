import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AtlasPlacePage from "@/app/atlas/[slug]/page";
import { getAtlasPlaces } from "@/lib/atlas/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const places = await getAtlasPlaces().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const p of places) {
      params.push({ lang, slug: p.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const place = (await getAtlasPlaces()).find((p) => p.slug === slug);
  if (!place) return { title: "Place not found" };
  const title = place.seo?.title ?? `${place.name} — Atlas | Divine`;
  const description =
    place.seo?.description ??
    `${place.summary} Approximate modern location: ${place.atlas.modernLocation}.`;
  return buildPageMetadata({
    title,
    description,
    path: `/${lang}/atlas/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedAtlasPlacePage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <AtlasPlacePage params={Promise.resolve({ slug })} />;
}
