import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedVerse } from "@/features/reading/featured-verse";
import { HomeBabyNamesSection } from "@/features/reading/home-baby-names";
import { HomeBrowseCta } from "@/features/reading/home-browse-cta";
import { HomeChaptersPreview } from "@/features/reading/home-chapters-preview";
import { HomeHero } from "@/features/reading/home-hero";
import { HomeJourney } from "@/features/reading/home-journey";
import { HomeLanguages } from "@/features/reading/home-languages";
import { HomeValues } from "@/features/reading/home-values";
import { HomeWisdom } from "@/features/reading/home-wisdom";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { JsonLd } from "@/components/json-ld";
import { getVerseOfTheDay } from "@/lib/reading/verse-of-the-day";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import {
  bookSeriesJsonLd,
  buildPageMetadata,
  homeSeo,
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
    ...homeSeo(),
    path: `/${lang}`,
    lang: lang as ReadingLanguageCode,
  });
}

export default async function LocalizedHomePage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }

  const verseOfTheDay = getVerseOfTheDay();

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 50% -8%, hsl(var(--saffron) / 0.14), transparent 60%),
            radial-gradient(ellipse 70% 45% at 85% 12%, hsl(var(--gold) / 0.10), transparent 55%),
            radial-gradient(ellipse 60% 40% at 15% 8%, hsl(var(--maroon) / 0.06), transparent 55%),
            hsl(var(--background))
          `,
        }}
      />

      <SiteHeader />

      <main id="main-content" className="flex-1">
        <HomeHero />
        <FeaturedVerse verse={verseOfTheDay} />
        <HomeChaptersPreview />
        <HomeBabyNamesSection />
        <HomeLanguages />
        <HomeWisdom />
        <HomeValues />
        <HomeJourney />
        <HomeBrowseCta />
      </main>

      <SiteFooter />
      <JsonLd data={bookSeriesJsonLd()} />
    </div>
  );
}
