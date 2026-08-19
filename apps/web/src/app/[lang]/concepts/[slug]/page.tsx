import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConceptDetailPage from "@/app/concepts/[slug]/page";
import { getConcepts } from "@/lib/concepts/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const concepts = await getConcepts().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const c of concepts) {
      params.push({ lang, slug: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const concepts = await getConcepts().catch(() => []);
  const concept = concepts.find((c) => c.slug === slug);
  if (!concept) return { title: "Concept not found" };
  return buildPageMetadata({
    title: `${concept.name} — Philosophical Concept | Divine`,
    description: concept.summary,
    path: `/${lang}/concepts/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedConceptDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <ConceptDetailPage params={Promise.resolve({ slug })} />;
}
