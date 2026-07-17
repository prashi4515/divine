import type { Metadata } from "next";
import { HomeHero } from "@/features/reading/home-hero";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";

export const metadata: Metadata = {
  title: "Divine — Sacred texts for the modern seeker",
  description:
    "A calm, multilingual home for reading scripture — thoughtfully presented for the modern seeker.",
};

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
        <HomeHero />
      </main>

      <SiteFooter />
    </div>
  );
}
