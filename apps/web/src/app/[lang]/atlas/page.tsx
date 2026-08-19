import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AtlasPage from "@/app/atlas/page";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { atlasIndexSeo, buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildPageMetadata({
    ...atlasIndexSeo(),
    path: `/${lang}/atlas`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedAtlasPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <AtlasPage />;
}
