import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapters } from "@/lib/api/chapters";
import { getPublishedWorkBySlug } from "@/lib/api/works";
import { ChapterGrid } from "@/features/reading/chapter-grid";
import { ChapterGridSkeleton } from "@/features/reading/chapter-grid-skeleton";
import { ReadingError } from "@/features/reading/reading-error";
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

      <SiteHeader eyebrow={work.title} />

      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-24 pt-4 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="hover:text-foreground transition-divine">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{work.title}</li>
          </ol>
        </nav>

        <header className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
            Scripture
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl">
            {work.title}
          </h1>
          {work.description ? (
            <p className="text-muted-foreground mt-5 text-pretty text-base leading-relaxed sm:text-lg">
              {work.description}
            </p>
          ) : (
            <p className="text-muted-foreground mt-5 text-pretty text-base leading-relaxed sm:text-lg">
              Choose a chapter and begin — quietly, at your own pace.
            </p>
          )}
        </header>

        <section className="mt-14 md:mt-20" aria-label="Chapters">
          <Suspense fallback={<ChapterGridSkeleton />}>
            <ChaptersSection workCode={work.code} basePath={basePath} />
          </Suspense>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
