import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedEntitiesRail } from "@/features/encyclopedia/related-entities-rail";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { gitaChapterTitle } from "@/lib/i18n/gita-chapters";
import { getEntitiesForGitaChapter } from "@/lib/knowledge/store";
import {
  getStaticGitaChapter,
  getStaticGitaChaptersIndex,
} from "@/lib/reading/gita-static";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  verseCreativeWorkJsonLd,
  verseSeo,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ chapter: string; verse: string }>;
};

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const chapters = await getStaticGitaChaptersIndex().catch(() => []);
  const params: Array<{ chapter: string; verse: string }> = [];
  for (const ch of chapters) {
    const snap = await getStaticGitaChapter(ch.number).catch(() => null);
    if (!snap) continue;
    for (const v of snap.verses) {
      params.push({
        chapter: String(ch.number),
        verse: String(v.number),
      });
    }
  }
  return params;
}

function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { chapter, verse } = await params;
  const c = parsePositiveInt(chapter);
  const v = parsePositiveInt(verse);
  if (c == null || v == null) return { title: "Verse" };

  const snap = await getStaticGitaChapter(c).catch(() => null);
  const verseRow = snap?.verses.find((x) => x.number === v);
  const en =
    verseRow?.translations.find((t) => t.languageCode === "en")?.text ??
    verseRow?.meaning ??
    undefined;
  return buildPageMetadata(verseSeo(c, v, en));
}

export default async function VersePage({ params }: PageProps) {
  const { chapter, verse } = await params;
  const c = parsePositiveInt(chapter);
  const v = parsePositiveInt(verse);
  if (c == null || v == null || c > 18) notFound();

  const snap = await getStaticGitaChapter(c).catch(() => null);
  if (!snap) notFound();
  const verseRow = snap.verses.find((x) => x.number === v);
  if (!verseRow) notFound();

  const chapterTitle = gitaChapterTitle("en", c);
  const en =
    verseRow.translations.find((t) => t.languageCode === "en")?.text ??
    verseRow.meaning ??
    "";
  const sa = verseRow.sanskritText || verseRow.transliteration || "";
  const readerHref = `/bhagavad-gita/chapter-${c}#verse-${v}`;
  const prev = v > 1 ? `/verse/${c}/${v - 1}` : null;
  const nextVerse = snap.verses.find((x) => x.number === v + 1);
  const next = nextVerse
    ? `/verse/${c}/${v + 1}`
    : c < 18
      ? `/verse/${c + 1}/1`
      : null;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Bhagavad Gita", href: "/bhagavad-gita" },
    { name: `Chapter ${c}`, href: `/bhagavad-gita/chapter-${c}` },
    { name: `${c}.${v}` },
  ];

  const related = await getEntitiesForGitaChapter(c).catch(() => []);
  const path = `/verse/${c}/${v}`;
  const seo = verseSeo(c, v, en);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader workCode="bg" eyebrow="Bhagavad Gita" />
      <main id="main-content" className="page-gutter mx-auto w-full max-w-3xl flex-1 pb-16 pt-6">
        <Breadcrumbs items={crumbs} className="mb-6" />
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.16em]">
          Bhagavad Gita {c}.{v}
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          Chapter {c}, Verse {v}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {chapterTitle}
        </p>

        {sa ? (
          <p
            lang="sa"
            className="mt-8 text-center font-serif text-xl leading-relaxed sm:text-2xl"
          >
            {sa}
          </p>
        ) : null}
        {en ? (
          <p className="text-foreground/90 mt-6 text-base leading-relaxed">
            {en}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={readerHref}
            className="bg-foreground text-background inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open in chapter reader
          </Link>
        </div>

        <nav
          aria-label="Verse navigation"
          className="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6"
        >
          {prev ? (
            <Link
              href={prev}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {related.length > 0 ? (
          <div className="mt-12">
            <RelatedEntitiesRail entities={related} chapterNumber={c} />
          </div>
        ) : null}
      </main>
      <SiteFooter />
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          verseCreativeWorkJsonLd({
            chapterNumber: c,
            verseNumber: v,
            name: `Bhagavad Gita ${c}.${v}`,
            description: seo.description,
            path,
            text: en || sa,
          }),
        ]}
      />
    </div>
  );
}
