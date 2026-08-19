import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterGrid } from "@/features/reading/chapter-grid";
import { GitaIndexHeader } from "@/features/reading/gita-index-header";
import { ReadingError } from "@/features/reading/reading-error";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { JsonLd } from "@/components/json-ld";
import { getStaticGitaChaptersIndex } from "@/lib/reading/gita-static";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  gitaIndexSeo,
} from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildPageMetadata({
    ...gitaIndexSeo(),
    path: `/${lang}/bhagavad-gita`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedBhagavadGitaPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }

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
    { name: "Home", href: `/${lang}` },
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
        <GitaIndexHeader />

        <section className="mt-8 md:mt-10" aria-label="Chapters">
          <ChapterGrid chapters={chapters} basePath={`/${lang}/bhagavad-gita`} />
        </section>
      </main>

      <SiteFooter />
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          collectionPageJsonLd({
            name: "Bhagavad Gita — All 18 Chapters",
            description: gitaIndexSeo().description,
            path: `/${lang}/bhagavad-gita`,
            items: chapters.map((ch) => ({
              name: `Chapter ${ch.number}`,
              path: `/${lang}/bhagavad-gita/chapter-${ch.number}`,
            })),
          }),
        ]}
      />
    </div>
  );
}
