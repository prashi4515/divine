import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GenealogyModulePage from "@/app/genealogy/[slug]/page";
import { getGenealogyModules } from "@/lib/genealogy/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const modules = await getGenealogyModules().catch(() => []);
  const params: Array<{ lang: string; slug: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const m of modules) {
      if (m.status === "available") {
        params.push({ lang, slug: m.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const modules = await getGenealogyModules();
  const mod = modules.find((m) => m.slug === slug);
  if (!mod) return { title: "Genealogy module not found" };
  return buildPageMetadata({
    title: `${mod.title} — Genealogy | Divine`,
    description: mod.description || mod.summary,
    path: `/${lang}/genealogy/${slug}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedGenealogyModulePage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <GenealogyModulePage params={Promise.resolve({ slug })} />;
}
