import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventsPage from "@/app/events/page";
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
    title: "Mahabharata Events & Timeline",
    description: "Chronological exploration of key Mahabharata events, linking people, places, kingdoms, weapons, and verses.",
    path: `/${lang}/events`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEventsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EventsPage />;
}
