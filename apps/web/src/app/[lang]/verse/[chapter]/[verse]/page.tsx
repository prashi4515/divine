import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Layers, List } from "lucide-react";
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
  getStaticGitaVerseCommentary,
} from "@/lib/reading/gita-static";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  verseCreativeWorkJsonLd,
  verseFaqJsonLd,
  verseSeo,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string; chapter: string; verse: string }>;
};

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const chapters = await getStaticGitaChaptersIndex().catch(() => []);
  const params: Array<{ lang: string; chapter: string; verse: string }> = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const ch of chapters) {
      const snap = await getStaticGitaChapter(ch.number).catch(() => null);
      if (!snap) continue;
      for (const v of snap.verses) {
        params.push({
          lang,
          chapter: String(ch.number),
          verse: String(v.number),
        });
      }
    }
  }
  return params;
}

function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

function parseWordMeanings(raw?: string | null): Array<{ word: string; meaning: string }> {
  if (!raw) return [];
  const parts = raw.split(";").map((p) => p.trim()).filter(Boolean);
  const result: Array<{ word: string; meaning: string }> = [];
  for (const part of parts) {
    const match = part.match(/^(\S+)\s+(.+)$/);
    if (match) {
      result.push({ word: match[1], meaning: match[2] });
    } else {
      result.push({ word: part, meaning: "" });
    }
  }
  return result;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, chapter, verse } = await params;
  if (!isSupportedLocale(lang)) return {};
  const c = parsePositiveInt(chapter);
  const v = parsePositiveInt(verse);
  if (c == null || v == null) return { title: "Verse" };

  const snap = await getStaticGitaChapter(c).catch(() => null);
  const verseRow = snap?.verses.find((x) => x.number === v);
  const chapterTitle = gitaChapterTitle(lang as ReadingLanguageCode, c);
  const snippet =
    verseRow?.translations.find((t) => t.languageCode === lang)?.text ??
    verseRow?.translations.find((t) => t.languageCode === "en")?.text ??
    verseRow?.meaning ??
    undefined;

  return buildPageMetadata({
    ...verseSeo(c, v, snippet, chapterTitle),
    path: `/${lang}/verse/${c}/${v}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedVersePage({ params }: PageProps) {
  const { lang, chapter, verse } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const c = parsePositiveInt(chapter);
  const v = parsePositiveInt(verse);
  if (c == null || v == null || c > 18) notFound();

  const snap = await getStaticGitaChapter(c).catch(() => null);
  if (!snap) notFound();
  const verseRow = snap.verses.find((x) => x.number === v);
  if (!verseRow) notFound();

  const chapterTitle = gitaChapterTitle(lang as ReadingLanguageCode, c);
  const localizedText =
    verseRow.translations.find((t) => t.languageCode === lang)?.text ??
    verseRow.translations.find((t) => t.languageCode === "en")?.text ??
    "";
  const sanskritText = verseRow.sanskritText || "";
  const transliteration = verseRow.transliteration || "";
  const wordMeanings = parseWordMeanings(verseRow.meaning);

  const commentaryFile = await getStaticGitaVerseCommentary(c, v).catch(() => null);
  const localizedCommentary =
    commentaryFile?.translations.find((t) => t.languageCode === lang)?.text ??
    commentaryFile?.commentary ??
    verseRow.commentary ??
    "";

  const readerHref = `/${lang}/bhagavad-gita/chapter-${c}#verse-${v}`;
  
  // Previous & Next navigation logic
  let prevHref: string | null = null;
  let prevLabel: string | null = null;
  if (v > 1) {
    prevHref = `/${lang}/verse/${c}/${v - 1}`;
    prevLabel = `Bhagavad Gita ${c}.${v - 1}`;
  } else if (c > 1) {
    const prevSnap = await getStaticGitaChapter(c - 1).catch(() => null);
    if (prevSnap && prevSnap.verses.length > 0) {
      const lastV = prevSnap.verses[prevSnap.verses.length - 1].number;
      prevHref = `/${lang}/verse/${c - 1}/${lastV}`;
      prevLabel = `Bhagavad Gita ${c - 1}.${lastV}`;
    }
  }

  let nextHref: string | null = null;
  let nextLabel: string | null = null;
  const nextVerse = snap.verses.find((x) => x.number === v + 1);
  if (nextVerse) {
    nextHref = `/${lang}/verse/${c}/${v + 1}`;
    nextLabel = `Bhagavad Gita ${c}.${v + 1}`;
  } else if (c < 18) {
    nextHref = `/${lang}/verse/${c + 1}/1`;
    nextLabel = `Bhagavad Gita ${c + 1}.1`;
  }

  const crumbs = [
    { name: "Home", href: `/${lang}` },
    { name: "Bhagavad Gita", href: `/${lang}/bhagavad-gita` },
    { name: `Chapter ${c}: ${chapterTitle}`, href: `/${lang}/bhagavad-gita/chapter-${c}` },
    { name: `Verse ${c}.${v}` },
  ];

  const related = await getEntitiesForGitaChapter(c).catch(() => []);
  const path = `/${lang}/verse/${c}/${v}`;
  const seo = verseSeo(c, v, localizedText || verseRow.meaning || "", chapterTitle);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader workCode="bg" eyebrow="Bhagavad Gita" />
      <main id="main-content" className="page-gutter mx-auto w-full max-w-3xl flex-1 pb-16 pt-6">
        <Breadcrumbs items={crumbs} className="mb-6" />

        {/* Verse Identification Header */}
        <section aria-labelledby="verse-heading" className="space-y-3 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-secondary-foreground">
              Bhagavad Gita {c}.{v}
            </span>
            <span className="rounded-md bg-secondary/80 px-2.5 py-1 font-mono text-secondary-foreground">
              BG {c}.{v}
            </span>
            <span className="rounded-md bg-secondary/80 px-2.5 py-1 font-mono text-secondary-foreground">
              Gita {c}.{v}
            </span>
          </div>

          <h1 id="verse-heading" className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Bhagavad Gita Chapter {c}, Verse {v}
          </h1>

          <p className="text-base text-muted-foreground">
            Chapter {c} · <Link href={`/${lang}/bhagavad-gita/chapter-${c}`} className="font-medium hover:underline text-foreground">{chapterTitle}</Link>
          </p>

          <p className="text-sm leading-relaxed text-muted-foreground/90 pt-1">
            <strong>Bhagavad Gita {c}.{v}</strong> (also cited as <em>BG {c}.{v}</em> or <em>Bhagavad Gita Chapter {c} Verse {v}</em>) is a sacred verse from Chapter {c} ({chapterTitle}). Explore the original Sanskrit shloka, Romanized transliteration, translation, word-by-word meaning, and commentary below.
          </p>
        </section>

        {/* Sanskrit & Transliteration */}
        {sanskritText ? (
          <section className="mt-8 rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Sanskrit Shloka
            </h2>
            <p
              lang="sa"
              className="text-center font-serif text-xl leading-relaxed sm:text-2xl text-foreground"
            >
              {sanskritText}
            </p>
            {transliteration ? (
              <div className="mt-6 border-t border-border/40 pt-4 text-center">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Transliteration (IAST)
                </h3>
                <p className="font-sans italic text-base leading-relaxed text-muted-foreground">
                  {transliteration}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Translation */}
        {localizedText ? (
          <section className="mt-8 rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Translation
            </h2>
            <blockquote className="text-foreground/95 text-base leading-relaxed font-serif sm:text-lg italic border-l-2 border-primary/60 pl-4 py-1" lang={lang}>
              “{localizedText}”
            </blockquote>
          </section>
        ) : null}

        {/* Word-by-Word Meaning */}
        {wordMeanings.length > 0 ? (
          <section className="mt-8 rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Word-by-Word Meaning
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {wordMeanings.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <span className="font-serif font-semibold text-foreground">{item.word}</span>
                  {item.meaning ? (
                    <span className="text-muted-foreground">— {item.meaning}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : verseRow.meaning ? (
          <section className="mt-8 rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Word-by-Word Meaning
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {verseRow.meaning}
            </p>
          </section>
        ) : null}

        {/* Commentary & Explanation */}
        {localizedCommentary ? (
          <section className="mt-8 rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Explanation & Commentary
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed space-y-4" lang={lang}>
              {localizedCommentary.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </section>
        ) : null}

        {/* Chapter Context & Links */}
        <section className="mt-8 rounded-2xl bg-muted/30 p-6 border border-border/60">
          <h2 className="text-base font-semibold tracking-tight text-foreground mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" aria-hidden />
            Chapter {c} Context & Navigation
          </h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            This verse is part of <strong>Chapter {c} ({chapterTitle})</strong> of the Bhagavad Gita. Continue studying the remaining verses of this chapter or open the full interactive chapter reader.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={readerHref}
              className="bg-foreground text-background inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Open in Chapter Reader
            </Link>
            <Link
              href={`/${lang}/bhagavad-gita/chapter-${c}`}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium transition-colors"
            >
              <List className="h-3.5 w-3.5" aria-hidden />
              View All Verses in Chapter {c}
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-serif font-semibold tracking-tight text-foreground mb-4">
            Frequently Asked Questions on Bhagavad Gita {c}.{v}
          </h2>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-card p-4 border border-border/50">
              <h3 className="font-medium text-foreground mb-1">
                What is Bhagavad Gita Chapter {c}, Verse {v}?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Bhagavad Gita {c}.{v} (also written as BG {c}.{v} or Gita {c}.{v}) is a verse from Chapter {c} ({chapterTitle}).
              </p>
            </div>
            {localizedText ? (
              <div className="rounded-lg bg-card p-4 border border-border/50">
                <h3 className="font-medium text-foreground mb-1">
                  What is the translation of Bhagavad Gita {c}.{v}?
                </h3>
                <p className="text-muted-foreground leading-relaxed" lang={lang}>
                  “{localizedText}”
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* Verse Navigation */}
        <nav
          aria-label="Verse navigation"
          className="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6"
        >
          {prevHref && prevLabel ? (
            <Link
              href={prevHref}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>{prevLabel}</span>
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/${lang}/bhagavad-gita/chapter-${c}`}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Chapter {c}
          </Link>

          {nextHref && nextLabel ? (
            <Link
              href={nextHref}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <span>{nextLabel}</span>
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
            chapterTitle,
            name: `Bhagavad Gita ${c}.${v}`,
            description: seo.description,
            path,
            text: localizedText || verseRow.meaning || undefined,
            sanskritText,
            transliteration,
          }),
          verseFaqJsonLd({
            chapterNumber: c,
            verseNumber: v,
            chapterTitle,
            englishTranslation: localizedText,
            meaningSummary: localizedCommentary || localizedText,
          }),
        ]}
      />
    </div>
  );
}
