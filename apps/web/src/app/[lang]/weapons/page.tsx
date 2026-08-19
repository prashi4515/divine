import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeaponsPage from "@/app/weapons/page";
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
    title: "Weapons & Divine Astras",
    description: "Astras, celestial bows, sacred maces, and armor from the Mahabharata tradition.",
    path: `/${lang}/weapons`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedWeaponsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <WeaponsPage />;
}
