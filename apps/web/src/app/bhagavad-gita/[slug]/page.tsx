import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapter } from "@/lib/api/chapters";
import { getPublishedVerses } from "@/lib/api/verses";
import { ChapterHero } from "@/features/reading/chapter-hero";
import { ChapterNavigation } from "@/features/reading/chapter-navigation";
import { ChapterReaderHeader } from "@/features/reading/chapter-reader-header";
import { chapterTitleDisplay } from "@/features/reading/chapter-reading";
import { ChapterStats } from "@/features/reading/chapter-stats";
import { VerseReader } from "@/features/reading/verse-reader";
import { ReadingError } from "@/features/reading/reading-error";
import { ReadingProgress } from "@/features/reading/reading-progress";
import { SiteFooter } from "@/features/reading/site-footer";

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

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

  try {
    const chapter = await getPublishedChapter(`bg.${n}`);
    const title = chapterTitleDisplay(chapter.number, chapter.title);
    return {
      title: `Chapter ${chapter.number} — ${title}`,
      description: `Read Chapter ${chapter.number} of the Bhagavad Gita — ${title}. A calm, typography-first reading experience.`,
      alternates: {
        canonical: `/bhagavad-gita/chapter-${chapter.number}`,
      },
    };
  } catch {
    return {
      title: `Chapter ${n}`,
      description: `Bhagavad Gita chapter ${n}.`,
    };
  }
}

const READER_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
] as const;

async function ChapterContent({ number }: { number: number }) {
  try {
    const chapter = await getPublishedChapter(`bg.${number}`);
    const { verses, languages } = await getPublishedVerses(chapter.publicId);

    const languageMap = new Map(languages.map((l) => [l.code, l]));
    const mergedLanguages = READER_LANGUAGES.map(
      (base) => languageMap.get(base.code) ?? base,
    );

    return (
      <>
        <ChapterHero
          number={chapter.number}
          title={chapter.title}
          verseCount={chapter.verseCount || verses.length}
          workTitle={chapter.work.title}
        />

        <div className="mx-auto mt-16 max-w-3xl space-y-12 md:mt-24 md:space-y-16">
          <ChapterStats verseCount={chapter.verseCount || verses.length} />
          <ReadingProgress percent={verses.length > 0 ? 1 : 0} />
          <VerseReader
            chapterNumber={chapter.number}
            verses={verses}
            languages={mergedLanguages}
            initialLanguage="en"
          />
          <ChapterNavigation
            currentNumber={chapter.number}
            totalChapters={18}
            listHref="/bhagavad-gita"
            chapterHref={(n) => `/bhagavad-gita/chapter-${n}`}
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

      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-24 pt-10 md:pt-16">
        <ChapterContent number={n} />
      </main>

      <SiteFooter />
    </div>
  );
}
