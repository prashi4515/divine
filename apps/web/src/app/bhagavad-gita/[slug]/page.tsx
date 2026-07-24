import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import {
  getPublishedChapterCached,
  getPublishedVersesCached,
} from "@/lib/api/cached-content";
import { ChapterHero } from "@/features/reading/chapter-hero";
import { ChapterNavigation } from "@/features/reading/chapter-navigation";
import { ChapterReaderHeader } from "@/features/reading/chapter-reader-header";
import { VerseReader } from "@/features/reading/verse-reader";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { gitaChapterTitle } from "@/lib/i18n/gita-chapters";
import ChapterLoading from "./loading";

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

/** Pre-render all 18 Gita chapters at build time (ISR refreshes hourly). */
export const revalidate = 3_600;

export function generateStaticParams() {
  return Array.from({ length: 18 }, (_, index) => ({
    slug: `chapter-${index + 1}`,
  }));
}

const CHAPTER_SLUG = /^chapter-(\d+)$/;

function parseChapterNumber(slug: string): number | null {
  const match = CHAPTER_SLUG.exec(slug);
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 10);
  if (!Number.isFinite(n) || n < 1 || n > 18) return null;
  return n;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) return { title: "Chapter" };

  const title = gitaChapterTitle("en", n);
  return {
    title: `Chapter ${n} — ${title}`,
    description: `Read Chapter ${n} of the Bhagavad Gita — ${title}. A calm, typography-first reading experience.`,
    alternates: {
      canonical: `/bhagavad-gita/chapter-${n}`,
    },
  };
}

const LANGUAGE_ORDER = [
  "en",
  "sa",
  "hi",
  "te",
  "kn",
  "ta",
  "ml",
  "or",
] as const;

function orderLanguages(
  languages: Array<{ code: string; name: string; nativeName: string | null }>,
) {
  const byCode = new Map(languages.map((l) => [l.code, l]));
  const ordered = LANGUAGE_ORDER.map((code) => byCode.get(code)).filter(
    (l): l is { code: string; name: string; nativeName: string | null } =>
      Boolean(l),
  );
  for (const lang of languages) {
    if (!LANGUAGE_ORDER.includes(lang.code as (typeof LANGUAGE_ORDER)[number])) {
      ordered.push(lang);
    }
  }
  return ordered;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 0
      ? `Could not reach the API (${error.message}).`
      : `The API returned ${error.status}.`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong while loading this chapter.";
}

/** Lightweight — chapter row only, paints before the verse payload. */
async function ChapterHeroSection({ number }: { number: number }) {
  try {
    const chapter = await getPublishedChapterCached(`bg.${number}`);
    return (
      <ChapterHero
        number={chapter.number}
        title={chapter.title}
        verseCount={chapter.verseCount}
        workTitle={chapter.work.title}
        workCode={chapter.work.code}
      />
    );
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="mx-auto max-w-lg pt-6">
        <ReadingError title="Unable to load chapter" message={toErrorMessage(error)} />
      </div>
    );
  }
}

function HeroSkeleton() {
  return (
    <div className="animate-pulse mx-auto flex max-w-2xl flex-col items-center gap-3 pt-2" aria-hidden>
      <div className="bg-muted h-3 w-24 rounded-full" />
      <div className="bg-muted h-8 w-40 rounded-md" />
      <div className="bg-muted h-10 w-72 max-w-full rounded-md" />
      <div className="bg-muted mt-2 h-4 w-full max-w-xl rounded" />
    </div>
  );
}

/** Heavy — verse list without commentaries (commentaries hydrate client-side). */
async function ChapterVersesSection({ number }: { number: number }) {
  try {
    const chapterPublicId = `bg.${number}`;
    const [{ verses, languages }, chapter] = await Promise.all([
      getPublishedVersesCached(chapterPublicId, "reader"),
      getPublishedChapterCached(chapterPublicId),
    ]);
    const readerLanguages = orderLanguages(languages);

    return (
      <div className="mt-10 w-full space-y-10 md:mt-12 md:space-y-12">
        <VerseReader
          chapterNumber={chapter.number}
          verses={verses}
          languages={readerLanguages}
          initialLanguage="en"
        />
        <ChapterNavigation
          currentNumber={chapter.number}
          totalChapters={18}
          listHref="/bhagavad-gita"
          prevHref={
            chapter.number > 1
              ? `/bhagavad-gita/chapter-${chapter.number - 1}`
              : null
          }
          nextHref={
            chapter.number < 18
              ? `/bhagavad-gita/chapter-${chapter.number + 1}`
              : null
          }
        />
      </div>
    );
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="mx-auto mt-10 max-w-lg">
        <ReadingError title="Unable to load verses" message={toErrorMessage(error)} />
      </div>
    );
  }
}

/**
 * Public chapter reading page — `/bhagavad-gita/chapter-{n}`.
 * Hero streams first; verse payload (slim, no commentary) follows in Suspense.
 */
export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) notFound();

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 45% at 50% -8%, hsl(var(--saffron) / 0.12), transparent 55%),
            radial-gradient(ellipse 55% 35% at 90% 10%, hsl(var(--gold) / 0.08), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />

      <ChapterReaderHeader />

      <main className="page-gutter w-full max-w-none flex-1 pb-14 pt-6 sm:pb-16 md:pb-20 md:pt-8">
        <Suspense fallback={<HeroSkeleton />}>
          <ChapterHeroSection number={n} />
        </Suspense>

        <Suspense fallback={<ChapterLoading />}>
          <ChapterVersesSection number={n} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
