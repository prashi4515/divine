import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, ShieldCheck, MapPin, GitBranch, Sparkles, ScrollText, Users } from "lucide-react";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Bhagavad Gita Online",
  description:
    "Learn about Bhagavad Gita Online — an open, independent digital resource for exploring the Bhagavad Gita, Sanskrit shlokas, translations, Mahabharata events, Ancient Bharata Atlas, and genealogy.",
  path: "/about",
});

export default function AboutPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About" },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/60 bg-muted/20 py-10 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
            style={{
              background: `
                radial-gradient(ellipse 60% 80% at 20% 0%, hsl(var(--saffron) / 0.12), transparent 60%),
                radial-gradient(ellipse 50% 60% at 85% 100%, hsl(var(--gold) / 0.08), transparent 50%)
              `,
            }}
          />
          <div className="page-gutter mx-auto max-w-5xl">
            <Breadcrumbs items={crumbs} className="mb-4" />
            <p className="text-saffron mb-2.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              About Our Platform
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Bhagavad Gita Online
            </h1>
            <p className="mt-4 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              An independent, accessible digital platform dedicated to bringing the timeless wisdom of the Bhagavad Gita, the history of the Mahabharata, and the geography of Ancient Bhārata to readers worldwide.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="page-gutter mx-auto max-w-5xl py-12 md:py-16 space-y-12">
          {/* Mission Section */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              The Bhagavad Gita is one of humanity’s most profound philosophical and spiritual treasures. Spoken on the battlefield of Kurukshetra between Lord Sri Krishna and Prince Arjuna, its 700 verses offer timeless guidance on duty (Dharma), selflessness (Karma Yoga), devotion (Bhakti), self-realization (Jnana), and the nature of existence.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              <strong>Bhagavad Gita Online</strong> was built to provide an unhurried, beautifully formatted digital reading experience that makes these sacred shlokas accessible to everyone—whether you are a lifelong practitioner, a student of philosophy, a historical researcher, or a first-time reader.
            </p>
          </section>

          {/* Core Features Grid */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              What You Will Find Here
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Gita Reader & Commentary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete 18 chapters with Sanskrit shlokas, English and Indic transliterations, word-by-word meanings, and classical commentary.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Ancient Bharata Atlas
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interactive geospatial mapping of Mahabharata kingdoms, sacred rivers, historical tirthas, and battlefields with traditional certainty levels.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <GitBranch className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Genealogy & Lineages
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive lineage maps tracing cosmic creation, Solar (Surya) and Lunar (Chandra) dynasties, Pandavas, Kauravas, and rishis.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <ScrollText className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Mahabharata Events & Timeline
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chronological exploration of key epic milestones, from the birth of the Kuru elders to the Kurukshetra war and post-war era.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Weapons & Divine Astras
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detailed catalog of divine weapons, celestial bows, sacred chariots, and heroic armor featured in the Mahabharata.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <Compass className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Knowledge Encyclopedia
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Referenced encyclopedia explaining key philosophical concepts like Atman, Karma, Dharma, Bhakti, and Brahman.
                </p>
              </div>
            </div>
          </section>

          {/* Independence & Transparency Disclaimer */}
          <section className="rounded-2xl border border-border/80 bg-muted/30 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-saffron">
              <Users className="h-5 w-5" aria-hidden />
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Editorial Independence & Transparency
              </h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <strong>Bhagavad Gita Online</strong> is an independent educational and cultural reference site created for readers and students worldwide.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
              Notice of Non-Affiliation: This platform is independently published. It is not affiliated with, endorsed by, or connected to ISKCON, Gita Press, any specific temple, university, government entity, or religious organization. Our goal is to present classical texts, translations, and historical context clearly, respectfully, and neutrally.
            </p>
          </section>

          {/* Action Links */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/bhagavad-gita"
              className="cta-saffron inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-divine hover:shadow-md"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Start Reading Chapter 1
            </Link>
            <Link
              href="/contact"
              className="border-border bg-background hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-foreground transition-divine"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={[breadcrumbJsonLd(crumbs)]} />
    </div>
  );
}
