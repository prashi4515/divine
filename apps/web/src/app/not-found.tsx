import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { buildPageMetadata, ogImageFor } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Page not found",
  description:
    "This page could not be found. Search the Bhagavad Gita, browse popular chapters, or explore the Atlas.",
  path: "/404",
  noIndex: true,
  image: ogImageFor({ title: "Page not found", eyebrow: "Divine" }),
});

const SUGGESTIONS = [
  { href: "/search", label: "Search" },
  { href: "/bhagavad-gita/chapter-2", label: "Chapter 2 — Sāṅkhya Yoga" },
  { href: "/bhagavad-gita/chapter-1", label: "Chapter 1" },
  { href: "/encyclopedia/person/krishna", label: "Krishna" },
  { href: "/encyclopedia/person/arjuna", label: "Arjuna" },
  { href: "/atlas", label: "Ancient Bharata Atlas" },
  { href: "/genealogy", label: "Genealogy" },
  { href: "/bhagavad-gita", label: "All 18 chapters" },
] as const;

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main
        id="main-content"
        className="page-gutter mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-16"
      >
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
          404
        </p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          The page you requested does not exist or may have moved. Try search,
          or continue with a popular destination below.
        </p>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="border-border hover:border-foreground/30 block rounded-xl border px-4 py-3 text-sm transition-colors"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
