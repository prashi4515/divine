import type { Metadata } from "next";
import { ChapterGrid } from "@/features/reading/chapter-grid";
import { GitaIndexHeader } from "@/features/reading/gita-index-header";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getStaticGitaChaptersIndex } from "@/lib/reading/gita-static";
import {
  bookSeriesJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  gitaIndexSeo,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(gitaIndexSeo());

/** Static index — no API round-trip. */
export const dynamic = "force-static";
export const revalidate = false;

export default async function BhagavadGitaPage() {
  let chapters;
  try {
    chapters = await getStaticGitaChaptersIndex();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Static chapter index missing.";
    return (
      <div className="relative flex min-h-svh flex-col">
        <SiteHeader workCode="bg" eyebrow="Bhagavad Gita" />
        <main id="main-content" className="page-gutter w-full flex-1 py-10">
          <ReadingError title="Unable to load chapters" message={message} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Bhagavad Gita" },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 45% at 50% -5%, hsl(var(--saffron) / 0.12), transparent 55%),
            radial-gradient(ellipse 60% 35% at 85% 8%, hsl(var(--gold) / 0.08), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />

      <SiteHeader workCode="bg" eyebrow="Bhagavad Gita" />

      <main
        id="main-content"
        className="page-gutter w-full flex-1 pb-14 pt-2 sm:pb-16 md:pb-20 md:pt-3"
      >
        <Breadcrumbs items={crumbs} className="mb-4" />
        <GitaIndexHeader />

        <section className="mt-8 md:mt-10" aria-label="Chapters">
          <ChapterGrid chapters={chapters} basePath="/bhagavad-gita" />
        </section>
      </main>

      <SiteFooter />
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          bookSeriesJsonLd(),
          collectionPageJsonLd({
            name: "Bhagavad Gita — All 18 Chapters",
            description: gitaIndexSeo().description,
            path: "/bhagavad-gita",
            items: chapters.map((ch) => ({
              name: `Chapter ${ch.number}`,
              path: `/bhagavad-gita/chapter-${ch.number}`,
            })),
          }),
        ]}
      />
    </div>
  );
}
