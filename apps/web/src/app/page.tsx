import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getPublishedWorks } from "@/lib/api/works";
import { WorksError, WorksList } from "@/features/works/works-list";

function WorksSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function WorksSection() {
  try {
    const works = await getPublishedWorks();
    return <WorksList works={works} />;
  } catch (error: unknown) {
    // Surface the real failure so misconfig (missing env, Zod, network) is visible.
    let message = "Something went wrong while loading the catalog.";
    if (error instanceof ApiError) {
      message =
        error.status === 0
          ? `Could not reach the API (${error.message}).`
          : `The API returned ${error.status}.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return <WorksError message={message} />;
  }
}

export default function Home() {
  return (
    <div className="relative min-h-svh">
      <header className="mx-auto flex w-full max-w-content items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="border-border flex h-8 w-8 items-center justify-center rounded-md border">
            <span className="font-serif text-sm">ॐ</span>
          </div>
          <span className="font-serif text-xl tracking-tight">Divine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-xs sm:inline">Catalog</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-content flex-col px-6 pb-24 pt-12 md:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="border-border bg-muted/40 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <span>Multilingual scripture, thoughtfully presented</span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            The Gita,
            <br />
            <span className="text-muted-foreground">for the modern seeker.</span>
          </h1>

          <p className="text-muted-foreground mt-6 text-balance text-base sm:text-lg">
            Read, reflect, and journey through timeless verses in your own language — calmly,
            clearly, and with reverence.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" disabled>
              Explore the Gita
            </Button>
            <Button size="lg" variant="ghost" disabled>
              Learn more
            </Button>
          </div>
        </div>

        <section className="mx-auto mt-24 w-full max-w-3xl" aria-labelledby="works-heading">
          <div className="mb-8 text-center">
            <span className="text-muted-foreground text-xs uppercase tracking-widest">
              Scripture
            </span>
            <h2 id="works-heading" className="mt-2 font-serif text-2xl sm:text-3xl">
              Works in the catalog
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Published corpora from the Divine API — live from your seeded database.
            </p>
          </div>

          <Suspense fallback={<WorksSectionSkeleton />}>
            <WorksSection />
          </Suspense>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-content flex-col items-center justify-between gap-2 px-6 py-8 text-xs sm:flex-row">
          <span>Built with reverence for seekers everywhere.</span>
          <span>© {new Date().getFullYear()} Divine</span>
        </div>
      </footer>
    </div>
  );
}
