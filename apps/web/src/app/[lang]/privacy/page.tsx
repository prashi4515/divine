import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrivacyPolicyPage from "@/app/privacy/page";
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
    title: "Privacy Policy",
    description:
      "Privacy Policy for Bhagavad Gita Online. Learn how visitor information, cookies, analytics, and advertising preferences are handled.",
    path: `/${lang}/privacy`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedPrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <PrivacyPolicyPage />;
}
