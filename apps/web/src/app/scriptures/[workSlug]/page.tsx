import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapters } from "@/lib/api/chapters";
import { getPublishedWorkBySlug } from "@/lib/api/works";
import { ChapterGrid } from "@/features/reading/chapter-grid";
import { ChapterGridSkeleton } from "@/features/reading/chapter-grid-skeleton";
import { ReadingError } from "@/features/reading/reading-error";
import { ScriptureIndexHeader } from "@/features/reading/scripture-index-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { publicWorkPath } from "@/lib/reading/work-paths";

type PageProps = {
  params: Promise<{ workSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { workSlug } = await params;
  const work = await getPublishedWorkBySlug(workSlug);
  if (!work) return { title: "Scripture" };
  return {
    title: work.title,
    description: work.description ?? `Read ${work.title} on Divine.`,
    alternates: { canonical: publicWorkPath(work) },
  };
}

async function ChaptersSection({
  workCode,
  basePath,
}: {
  workCode: string;
  basePath: string;
}) {
  try {
    const chapters = await getPublishedChapters();
    const filtered = chapters
      .filter((chapter) => chapter.work.code === workCode)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return <ChapterGrid chapters={filtered} basePath={basePath} />;
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

export default async function ScriptureWorkPage({ params }: PageProps) {
  const { workSlug } = await params;
  const work = await getPublishedWorkBySlug(workSlug);
  if (!work) notFound();

  // Keep the canonical Gita URL
  if (work.code === "bg") {
    notFound();
  }

  const basePath = publicWorkPath(work);

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

      <SiteHeader workCode={work.code} eyebrow={work.title} />

      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-16 pt-2 md:pb-20 md:pt-3">
        <ScriptureIndexHeader work={work} />

        <section className="mt-8 md:mt-10" aria-label="Chapters">
          <Suspense fallback={<ChapterGridSkeleton />}>
            <ChaptersSection workCode={work.code} basePath={basePath} />
          </Suspense>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
