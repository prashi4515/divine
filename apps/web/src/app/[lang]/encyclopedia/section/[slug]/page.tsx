import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EncyclopediaSectionPage from "@/app/encyclopedia/section/[slug]/page";
import { getCollections } from "@/lib/knowledge/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const collections = await getCollections().catch(() => []);
  const sections = collections.filter((c) => c.kind === "encyclopedia-section");
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const s of sections) {
      params.push({ lang, slug: s.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const collections = await getCollections();
  const section = collections.find((c) => c.kind === "encyclopedia-section" && c.slug === slug);
  if (!section) return { title: "Section not found" };
  return buildPageMetadata({
    title: `${section.title} — Encyclopedia Section | Divine`,
    description: section.description,
    path: `/${lang}/encyclopedia/section/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEncyclopediaSectionPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EncyclopediaSectionPage params={Promise.resolve({ slug })} />;
}
