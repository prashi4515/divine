import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { getPublishedWorks } from "@/lib/api/works";
import { FeaturedScripture, FeaturedScriptureEmpty } from "@/features/reading/featured-scripture";
import { HomeHero } from "@/features/reading/home-hero";
import { PublishedScriptures } from "@/features/reading/published-scriptures";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { publicWorkPath } from "@/lib/reading/work-paths";

export const metadata: Metadata = {
  title: "Divine — Sacred texts for the modern seeker",
  description:
    "A calm, multilingual home for reading scripture — thoughtfully presented for the modern seeker.",
};

function FeaturedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-28 pt-8" aria-hidden>
      <div className="border-border rounded-xl border p-8 md:p-12">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-6 h-12 w-2/3" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-md" />
        <Skeleton className="mt-8 h-11 w-40" />
      </div>
    </div>
  );
}

async function CatalogSection() {
  try {
    const works = await getPublishedWorks();
    const featured = works.find((work) => work.code === "bg") ?? works[0];
    if (!featured) return <FeaturedScriptureEmpty />;
    return (
      <>
        <FeaturedScripture work={featured} />
        <PublishedScriptures works={works} />
      </>
    );
  } catch (error: unknown) {
    let message = "Something went wrong while loading the scripture catalog.";
    if (error instanceof ApiError) {
      message =
        error.status === 0
          ? `Could not reach the API (${error.message}).`
          : `The API returned ${error.status}.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return (
      <div className="mx-auto w-full max-w-3xl px-6 pb-28 pt-8">
        <ReadingError title="Unable to load scripture" message={message} />
      </div>
    );
  }
}

async function resolveCtaHref(): Promise<string> {
  try {
    const works = await getPublishedWorks();
    const featured = works.find((work) => work.code === "bg") ?? works[0];
    if (featured) return publicWorkPath(featured);
  } catch {
    // fall through
  }
  return "/bhagavad-gita";
}

export default async function HomePage() {
  const ctaHref = await resolveCtaHref();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% -10%, hsl(var(--muted) / 0.85), transparent 55%),
            radial-gradient(ellipse 60% 40% at 90% 20%, hsl(var(--foreground) / 0.03), transparent 50%),
            hsl(var(--background))
          `,
        }}
      />

      <SiteHeader />

      <main className="flex-1">
        <HomeHero ctaHref={ctaHref} />

        <Suspense fallback={<FeaturedSkeleton />}>
          <CatalogSection />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
