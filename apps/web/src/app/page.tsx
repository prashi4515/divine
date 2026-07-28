import type { Metadata } from "next";
import { FeaturedVerse } from "@/features/reading/featured-verse";
import { HomeBrowseCta } from "@/features/reading/home-browse-cta";
import { HomeHero } from "@/features/reading/home-hero";
import { HomeValues } from "@/features/reading/home-values";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { readerFontVariableClass } from "@/lib/reading/reader-font-vars";
import { getVerseOfTheDay } from "@/lib/reading/verse-of-the-day";

export const metadata: Metadata = {
  title: "Bhagavad Gita — The Song of God",
  description:
    "A calm, multilingual home for reading scripture — thoughtfully presented for the modern seeker.",
  alternates: { canonical: "/" },
};

/** Refresh periodically so “verse of the day” advances with the IST calendar. */
export const revalidate = 3_600;

export default function HomePage() {
  const verseOfTheDay = getVerseOfTheDay();

  return (
    <div
      className={`relative flex min-h-svh flex-col ${readerFontVariableClass}`}
    >
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

      <main className="flex-1">
        <HomeHero />
        <FeaturedVerse verse={verseOfTheDay} />
        <HomeValues />
        <HomeBrowseCta />
      </main>

      <SiteFooter />
    </div>
  );
}
