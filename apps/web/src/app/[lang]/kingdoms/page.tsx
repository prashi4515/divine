import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KingdomsPage from "@/app/kingdoms/page";
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
    title: "Kingdoms of Ancient Bharata",
    description: "Explore Mahabharata-era kingdoms, capitals, rulers, battles, and atlas links.",
    path: `/${lang}/kingdoms`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedKingdomsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <KingdomsPage />;
}
