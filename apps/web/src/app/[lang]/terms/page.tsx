import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermsPage from "@/app/terms/page";
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
    title: "Terms of Use",
    description:
      "Terms of Use for Bhagavad Gita Online. Guidelines for accessing and using our educational scripture platform, atlas, and reference tools.",
    path: `/${lang}/terms`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedTermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <TermsPage />;
}
