import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailPage from "@/app/events/[slug]/page";
import { getEvents } from "@/lib/events/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const events = await getEvents().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const e of events) {
      params.push({ lang, slug: e.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const event = (await getEvents()).find((e) => e.slug === slug);
  if (!event) return { title: "Event not found" };
  return buildPageMetadata({
    title: `${event.name} — Event | Divine`,
    description: event.summary,
    path: `/${lang}/events/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEventDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EventDetailPage params={Promise.resolve({ slug })} lang={lang} />;
}
