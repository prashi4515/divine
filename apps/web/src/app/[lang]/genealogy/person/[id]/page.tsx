import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PersonDetailPage from "@/app/genealogy/person/[id]/page";
import { getAllGenealogyPeople } from "@/lib/genealogy/store";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ lang: string; id: string }> };

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const people = await getAllGenealogyPeople().catch(() => []);
  const params: Array<{ lang: string; id: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const p of people) {
      params.push({ lang, id: p.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isSupportedLocale(lang)) return {};
  const people = await getAllGenealogyPeople();
  const person = people.find((p) => p.id === id);
  if (!person) return { title: "Person not found" };
  return buildPageMetadata({
    title: `${person.name} — Genealogy & Lineage | Divine`,
    description: person.description || `${person.name} lineage entry in the Mahabharata genealogy.`,
    path: `/${lang}/genealogy/person/${id}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedPersonDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <PersonDetailPage params={Promise.resolve({ id })} />;
}
