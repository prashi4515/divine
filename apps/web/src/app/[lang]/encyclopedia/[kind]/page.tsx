import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EncyclopediaKindPage from "@/app/encyclopedia/[kind]/page";
import { getAllEntities } from "@/lib/knowledge/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; kind: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const entities = await getAllEntities().catch(() => []);
  const kinds = new Set(entities.map((e) => e.kind));
  const params: Array<{ lang: string; kind: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const kind of kinds) {
      params.push({ lang, kind });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, kind } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildPageMetadata({
    title: `${kind.charAt(0).toUpperCase() + kind.slice(1)} — Encyclopedia | Divine`,
    description: `Browse all ${kind} entries in the Mahabharata encyclopedia.`,
    path: `/${lang}/encyclopedia/${kind}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEncyclopediaKindPage({ params }: PageProps) {
  const { lang, kind } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EncyclopediaKindPage params={Promise.resolve({ kind })} />;
}
