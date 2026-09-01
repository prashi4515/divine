import { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { getAllBabyNames } from "@/lib/baby-names/store";
import { babyNameIndexSeo } from "@/lib/seo/titles";
import { breadcrumbJsonLd } from "@/lib/knowledge/seo";
import { BabyNameDirectoryClient } from "./directory-client";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata(babyNameIndexSeo());

export default async function BabyNamesIndexPage() {
  const allNames = await getAllBabyNames();

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Baby Names", href: "/baby-names" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <SiteHeader eyebrow="Scriptural Directory" workCode="BABY_NAMES" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Hero Framing & Crawlable Introduction */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200 dark:border-amber-800/50">
            Responsibly Verified Scripture &amp; Sanskrit Repository
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
            Sanskrit &amp; Hindu Baby Names
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed mb-6 max-w-3xl mx-auto">
            Explore Sanskrit and Hindu baby names for boys, girls, and unisex use. Learn the Sanskrit spelling, pronunciation, meaning, traditional origin, and, where applicable, connections to Vedic literature, the Bhagavad Gita, Mahabharata, Ramayana, Upanishads, and Puranic traditions.
          </p>

          {/* Crawlable Category Discovery Links */}
          <nav aria-label="Baby Name Categories" className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2 pb-4">
            <Link
              href="/baby-names/boy"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Sanskrit Baby Boy Names
            </Link>
            <Link
              href="/baby-names/girl"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Sanskrit Baby Girl Names
            </Link>
            <Link
              href="/baby-names/unisex"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Sanskrit Unisex Names
            </Link>
            <Link
              href="/baby-names/mahabharata"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Mahabharata Names
            </Link>
            <Link
              href="/baby-names/bhagavad-gita"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Bhagavad Gita Names
            </Link>
            <Link
              href="/baby-names/ramayana"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Ramayana Names
            </Link>
            <Link
              href="/baby-names/sanskrit"
              className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              Sanskrit Names
            </Link>
          </nav>
        </div>

        {/* Client-Side Dense Interactive Directory Component */}
        <BabyNameDirectoryClient initialNames={allNames} />
      </main>

      <SiteFooter />
    </div>
  );
}
