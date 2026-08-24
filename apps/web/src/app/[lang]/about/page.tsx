import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutPage from "@/app/about/page";
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
    title: "About Bhagavad Gita Online",
    description:
      "Learn about Bhagavad Gita Online — an open, independent digital resource for exploring the Bhagavad Gita, Sanskrit shlokas, translations, Mahabharata events, Ancient Bharata Atlas, and genealogy.",
    path: `/${lang}/about`,
    canonicalUrl: "/about",
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedAboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <AboutPage />;
}
