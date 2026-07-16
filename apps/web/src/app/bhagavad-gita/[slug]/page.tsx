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

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

/** Pre-render all 18 Gita chapters at build time (ISR refreshes daily). */
export const revalidate = 86_400;

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

const LANGUAGE_ORDER = ["en", "sa", "hi", "te", "kn", "ta", "ml", "or"] as const;

function orderLanguages(
  languages: Array<{ code: string; name: string; nativeName: string | null }>,
) {
  const byCode = new Map(languages.map((l) => [l.code, l]));
  const ordered = LANGUAGE_ORDER.map((code) => byCode.get(code)).filter(
    (l): l is { code: string; name: string; nativeName: string | null } => Boolean(l),
  );
  for (const lang of languages) {
    if (!LANGUAGE_ORDER.includes(lang.code as (typeof LANGUAGE_ORDER)[number])) {
      ordered.push(lang);
    }
  }
  return ordered;
}

async function ChapterContent({ number }: { number: number }) {
  try {
    const chapterPublicId = `bg.${number}`;
    const [chapter, { verses, languages }] = await Promise.all([
      getPublishedChapterCached(chapterPublicId),
      getPublishedVersesCached(chapterPublicId, "reader"),
    ]);
    const readerLanguages = orderLanguages(languages);

    return (
      <>
        <ChapterHero
          number={chapter.number}
          title={chapter.title}
          verseCount={chapter.verseCount || verses.length}
          workTitle={chapter.work.title}
          workCode={chapter.work.code}
        />

        <div className="mt-10 w-full space-y-10 md:mt-12 md:space-y-12">
          <VerseReader
            chapterNumber={chapter.number}
            chapterPublicId={chapter.publicId}
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
      </>
    );
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    let message = "Something went wrong while loading this chapter.";
    if (error instanceof ApiError) {
      message =
        error.status === 0
          ? `Could not reach the API (${error.message}).`
          : `The API returned ${error.status}.`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return (
      <div className="mx-auto max-w-lg pt-10">
        <ReadingError title="Unable to load chapter" message={message} />
      </div>
    );
  }
}

/**
 * Public chapter reading page — `/bhagavad-gita/chapter-{n}`.
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
            radial-gradient(ellipse 90% 45% at 50% -8%, hsl(var(--muted) / 0.65), transparent 52%),
            hsl(var(--background))
          `,
        }}
      />

      <ChapterReaderHeader />

      <main className="mx-auto w-full max-w-none flex-1 px-6 pb-16 pt-6 sm:px-8 md:pb-20 md:pt-8 lg:px-[1in]">
        <ChapterContent number={n} />
      </main>

      <SiteFooter />
    </div>
  );
}
