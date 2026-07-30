"use client";

import Link from "next/link";
import { BookOpen, Languages, Search } from "lucide-react";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";

/**
 * Site-wide footer — brand, explore / reading / account columns, languages.
 */
export function SiteFooter() {
  const t = useMessages();
  const h = useHomeMessages();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/", label: t.home },
    { href: "/bhagavad-gita", label: t.allChapters },
    { href: "/genealogy", label: "Genealogy" },
    { href: "/search", label: h.searchVerses },
  ];

  const reading = [
    { href: "/bhagavad-gita/chapter-1", label: `${t.chapterFallback(1)}` },
    { href: "/bhagavad-gita/chapter-2", label: t.chapterTitle(2) },
    { href: "/bhagavad-gita/chapter-12", label: t.chapterTitle(12) },
    { href: "/search?q=dharma", label: "Dharma" },
    { href: "/search?q=karma", label: "Karma" },
  ];

  const account = [
    { href: "/login", label: "Sign in" },
    { href: "/signup", label: "Create account" },
    { href: "/account/history", label: "Reading history" },
  ];

  const languages = [
    "English",
    "हिन्दी",
    "తెలుగు",
    "ಕನ್ನಡ",
    "தமிழ்",
    "മലയാളം",
    "ଓଡ଼ିଆ",
    "संस्कृतम्",
  ];

  return (
    <footer className="border-border relative mt-auto overflow-hidden border-t">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 70% 80% at 10% 0%, hsl(var(--saffron) / 0.08), transparent 55%),
            radial-gradient(ellipse 50% 60% at 95% 100%, hsl(var(--gold) / 0.07), transparent 50%),
            hsl(var(--muted) / 0.35)
          `,
        }}
      />

      <div className="page-gutter w-full py-12 sm:py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] md:gap-8 lg:gap-12">
          <div className="max-w-sm space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none"
            >
              <span
                className="cta-saffron flex h-9 w-9 items-center justify-center rounded-lg shadow-xs"
                aria-hidden
              >
                <span className="font-serif text-base leading-none text-white">
                  ॐ
                </span>
              </span>
              <span className="font-serif text-xl tracking-tight">
                Bhagavad Gita
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.footer}
            </p>
            <p className="text-muted-foreground/90 text-xs leading-relaxed">
              Eighteen chapters · seven hundred verses · calm typography for
              unhurried reading.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/bhagavad-gita/chapter-1"
                className="cta-saffron inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-divine hover:shadow-md"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                {h.startReading}
              </Link>
              <Link
                href="/search"
                className="border-border bg-background/80 text-foreground hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                <Search className="h-3.5 w-3.5" aria-hidden />
                {h.searchVerses}
              </Link>
            </div>
          </div>

          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Reading" links={reading} />
          <FooterColumn title="Account" links={account} />
        </div>

        <div className="border-border/70 mx-auto mt-12 max-w-6xl border-t pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-2 sm:items-center">
              <Languages
                className="text-saffron mt-0.5 h-4 w-4 shrink-0 sm:mt-0"
                aria-hidden
              />
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Languages">
                {languages.map((lang) => (
                  <li
                    key={lang}
                    className="text-muted-foreground text-xs tracking-wide"
                  >
                    {lang}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-muted-foreground text-xs">
              © {year} Bhagavad Gita · Read with reverence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-divine text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
