import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GenealogyPage from "@/app/genealogy/page";
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
    title: "Genealogy & Cosmic Dynasties",
    description: "Lineage maps tracing creation, Solar and Lunar dynasties, Pandavas, Kauravas, and rishis.",
    path: `/${lang}/genealogy`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedGenealogyPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <GenealogyPage />;
}
