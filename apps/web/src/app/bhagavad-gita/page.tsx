import { Suspense } from "react";
import type { Metadata } from "next";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapters } from "@/lib/api/chapters";
import { ChapterGrid } from "@/features/reading/chapter-grid";
import { ChapterGridSkeleton } from "@/features/reading/chapter-grid-skeleton";
import { GitaIndexHeader } from "@/features/reading/gita-index-header";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";

export const metadata: Metadata = {
  title: "Bhagavad Gita",
  description:
    "Explore all 18 chapters of the Bhagavad Gita — a calm, chapter-by-chapter reading path.",
  alternates: {
    canonical: "/bhagavad-gita",
  },
};

async function ChaptersSection() {
  try {
    const chapters = await getPublishedChapters();
    const gitaChapters = chapters
      .filter((chapter) => chapter.work.code === "bg")
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return <ChapterGrid chapters={gitaChapters} basePath="/bhagavad-gita" />;
  } catch (error: unknown) {
    let message = "Something went wrong while loading chapters.";
    if (error instanceof ApiError) {
      message =
        error.status === 0
          ? `Could not reach the API (${error.message}).`
          : `The API returned ${error.status}.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return <ReadingError title="Unable to load chapters" message={message} />;
  }
}

export default function BhagavadGitaPage() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 50% -5%, hsl(var(--muted) / 0.7), transparent 50%),
            hsl(var(--background))
          `,
        }}
      />

      <SiteHeader workCode="bg" eyebrow="Bhagavad Gita" />

      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-16 pt-2 md:pb-20 md:pt-3">
        <GitaIndexHeader />

        <section className="mt-8 md:mt-10" aria-label="Chapters">
          <Suspense fallback={<ChapterGridSkeleton />}>
            <ChaptersSection />
          </Suspense>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
