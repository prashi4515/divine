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
        {/* Top Hero Framing */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200 dark:border-amber-800/50">
            Responsibly Verified Scripture &amp; Sanskrit Repository
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
            Ancient Scripture &amp; Sanskrit Baby Names
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
            Search our comprehensive, etymologically verified directory of Indian and Sanskrit personal names derived from the Bhagavad Gita, Mahabharata, Ramayana, Vedas, Upanishads, and classical Sanskrit literature.
          </p>
        </div>

        {/* Client-Side Dense Interactive Directory Component */}
        <BabyNameDirectoryClient initialNames={allNames} />
      </main>

      <SiteFooter />
    </div>
  );
}
