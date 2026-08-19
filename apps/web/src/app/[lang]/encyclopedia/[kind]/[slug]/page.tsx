import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EncyclopediaEntityPage from "@/app/encyclopedia/[kind]/[slug]/page";
import { getAllEntities } from "@/lib/knowledge/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; kind: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const entities = await getAllEntities().catch(() => []);
  const params: Array<{ lang: string; kind: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const e of entities) {
      if (e.status === "published") {
        params.push({ lang, kind: e.kind, slug: e.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, kind, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const entity = (await getAllEntities()).find((e) => e.kind === kind && e.slug === slug);
  if (!entity) return { title: "Entry not found" };
  return buildPageMetadata({
    title: `${entity.name} — Encyclopedia | Divine`,
    description: entity.summary,
    path: `/${lang}/encyclopedia/${kind}/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedEncyclopediaEntityPage({ params }: PageProps) {
  const { lang, kind, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <EncyclopediaEntityPage params={Promise.resolve({ kind, slug })} />;
}
