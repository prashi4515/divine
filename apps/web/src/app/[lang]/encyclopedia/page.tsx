import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EncyclopediaPage from "@/app/encyclopedia/page";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildPageMetadata({
    title: "Mahabharata Encyclopedia",
    description: "Referenced knowledge encyclopedia — people, deities, avatars, rishis, places, and sacred concepts.",
    path: `/${lang}/encyclopedia`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEncyclopediaPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EncyclopediaPage />;
}
