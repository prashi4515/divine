import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConceptsPage from "@/app/concepts/page";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildPageMetadata({
    title: "Philosophical Concepts",
    description: "Key concepts in the Bhagavad Gita and Mahabharata — Dharma, Karma, Atman, Bhakti, Moksha, and Brahman.",
    path: `/${lang}/concepts`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedConceptsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <ConceptsPage />;
}
