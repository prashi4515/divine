import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { getPublishedWorks } from "@/lib/api/works";
import { FeaturedScripture, FeaturedScriptureEmpty } from "@/features/reading/featured-scripture";
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

async function HeroCta() {
  try {
    const works = await getPublishedWorks();
    const featured = works.find((work) => work.code === "bg") ?? works[0];
    if (!featured) return null;
    return (
      <Button asChild size="lg">
        <Link href={publicWorkPath(featured)}>
          Begin Reading
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    );
  } catch {
    return (
      <Button asChild size="lg">
        <Link href="/bhagavad-gita">
          Begin Reading
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    );
  }
}

export default function HomePage() {
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
        <section className="mx-auto flex w-full max-w-content flex-col items-center px-6 pb-6 pt-10 text-center md:pt-16">
          <p className="font-serif text-6xl tracking-tight sm:text-7xl md:text-8xl">Divine</p>
          <h1 className="text-muted-foreground mt-6 max-w-xl text-balance text-lg leading-relaxed sm:text-xl">
            Read sacred texts with clarity, calm, and reverence.
          </h1>
          <div className="mt-10">
            <Suspense
              fallback={
                <Button asChild size="lg">
                  <Link href="/bhagavad-gita">
                    Begin Reading
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              }
            >
              <HeroCta />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={<FeaturedSkeleton />}>
          <CatalogSection />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
