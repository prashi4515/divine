import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapter, getPublishedChapters } from "@/lib/api/chapters";
import { getPublishedVerses } from "@/lib/api/verses";
import { getPublishedWorkBySlug } from "@/lib/api/works";
import { ChapterHero } from "@/features/reading/chapter-hero";
import { ChapterNavigation } from "@/features/reading/chapter-navigation";
import { ChapterReaderHeader } from "@/features/reading/chapter-reader-header";
import { chapterTitleDisplay } from "@/features/reading/chapter-reading";
import { VerseReader } from "@/features/reading/verse-reader";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { publicChapterPath, publicWorkPath } from "@/lib/reading/work-paths";

type ChapterPageProps = {
  params: Promise<{ workSlug: string; slug: string }>;
};

const CHAPTER_SLUG = /^chapter-(\d+)$/;

function parseChapterNumber(slug: string): number | null {
  const match = CHAPTER_SLUG.exec(slug);
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { workSlug, slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) return { title: "Chapter" };

  try {
    const work = await getPublishedWorkBySlug(workSlug);
    if (!work || work.code === "bg") return { title: "Chapter" };
    const chapter = await getPublishedChapter(`${work.code}.${n}`);
    const title = chapterTitleDisplay(chapter.number, chapter.title);
    return {
      title: `Chapter ${chapter.number} — ${title}`,
      description: `Read Chapter ${chapter.number} of ${work.title}.`,
      alternates: {
        canonical: publicChapterPath(work, chapter.number),
      },
    };
  } catch {
    return { title: `Chapter ${n}` };
  }
}

async function ChapterContent({
  workSlug,
  number,
}: {
  workSlug: string;
  number: number;
}) {
  try {
    const work = await getPublishedWorkBySlug(workSlug);
    if (!work || work.code === "bg") notFound();

    const chapterPublicId = `${work.code}.${number}`;
    const [chapter, allChapters, { verses, languages }] = await Promise.all([
      getPublishedChapter(chapterPublicId),
      getPublishedChapters(),
      getPublishedVerses(chapterPublicId, "reader"),
    ]);
    const workChapters = allChapters.filter((c) => c.work.code === work.code);
    const totalChapters = workChapters.length;
    const listHref = publicWorkPath(work);

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
            verses={verses}
            languages={languages.length > 0 ? languages : [
              { code: "en", name: "English", nativeName: "English" },
            ]}
            initialLanguage="en"
          />
          <ChapterNavigation
            currentNumber={chapter.number}
            totalChapters={totalChapters}
            listHref={listHref}
            prevHref={
              chapter.number > 1
                ? publicChapterPath(work, chapter.number - 1)
                : null
            }
            nextHref={
              chapter.number < totalChapters
                ? publicChapterPath(work, chapter.number + 1)
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
 * Public chapter reading page — `/scriptures/{workSlug}/chapter-{n}`.
 */
export default async function ScriptureChapterPage({ params }: ChapterPageProps) {
  const { workSlug, slug } = await params;
  const n = parseChapterNumber(slug);
  if (n === null) notFound();

  const work = await getPublishedWorkBySlug(workSlug);
  if (!work || work.code === "bg") notFound();

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

      <ChapterReaderHeader backHref={publicWorkPath(work)} />

      <main className="page-gutter w-full max-w-none flex-1 pb-14 pt-6 sm:pb-16 md:pb-20 md:pt-8">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-8 pt-4">
              <div className="mx-auto h-8 w-48 rounded-md bg-muted" />
              <div className="border-border bg-card rounded-xl border p-8">
                <div className="mx-auto h-4 w-20 rounded bg-muted" />
                <div className="mt-8 space-y-3">
                  <div className="h-6 rounded bg-muted" />
                  <div className="h-6 w-5/6 rounded bg-muted" />
                </div>
              </div>
            </div>
          }
        >
          <ChapterContent workSlug={workSlug} number={n} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
