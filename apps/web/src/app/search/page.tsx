import { Suspense } from "react";
import type { Metadata } from "next";
import { ApiError } from "@/lib/api/client";
import { searchVerses } from "@/lib/api/search";
import { SearchPageClient } from "@/features/search";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";

export const metadata: Metadata = {
  title: "Search — Bhagavad Gita",
  description:
    "Intelligent search across Sanskrit, English, Telugu, Hindi, transliteration, commentary, and topics.",
  alternates: { canonical: "/search" },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    lang?: string;
    page?: string;
  }>;
};

async function SearchBody({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const topic = sp.topic?.trim() || undefined;
  const lang = sp.lang?.trim() || "en";
  const page = Number(sp.page) || 1;

  let results = {
    data: [] as Awaited<ReturnType<typeof searchVerses>>["data"],
    meta: {
      query: q,
      expandedTerms: [] as string[],
      page,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  };

  try {
    if (q || topic) {
      results = await searchVerses({ q, topic, lang, page, pageSize: 20 });
    }
  } catch (error: unknown) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <SearchPageClient
      initialQuery={q}
      initialTopic={topic}
      initialLang={lang}
      initialResults={results.data}
      initialTotal={results.meta.total}
      initialExpanded={results.meta.expandedTerms}
      initialPage={results.meta.page}
      initialTotalPages={results.meta.totalPages}
    />
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 45% at 50% -8%, hsl(var(--muted) / 0.65), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />
      <SiteHeader />
      <main className="mx-auto w-full flex-1 px-6 pb-16 pt-4 md:pb-20 md:pt-6 lg:px-[1in]">
        <Suspense
          fallback={
            <p className="text-muted-foreground py-12 text-center text-sm">
              Loading…
            </p>
          }
        >
          <SearchBody searchParams={props.searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
