import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactPage from "@/app/contact/page";
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
    title: "Contact Us",
    description:
      "Get in touch with Bhagavad Gita Online. Contact us for questions, content corrections, broken links, or site feedback.",
    path: `/${lang}/contact`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <ContactPage />;
}
