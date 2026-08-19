"use client";

import Link from "next/link";
import { BookOpen, Languages, Search } from "lucide-react";
import { PUBLIC_AUTH_UI_ENABLED } from "@/lib/auth/config";
import { READING_LANGUAGES } from "@/lib/reading/languages";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

/**
 * Site-wide footer — brand artwork backdrop, explore links, live languages.
 */
export function SiteFooter() {
  const t = useMessages();
  const h = useHomeMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);
  const year = new Date().getFullYear();

  const explore = [
    { href: "/", label: t.home },
    { href: "/bhagavad-gita", label: t.allChapters },
    { href: "/atlas", label: t.navAtlas },
    { href: "/events", label: t.navEvents },
    { href: "/kingdoms", label: t.navKingdoms },
    { href: "/weapons", label: t.navWeapons },
    { href: "/encyclopedia", label: t.navEncyclopedia },
    { href: "/genealogy", label: t.navGenealogy },
    { href: "/search", label: h.searchVerses },
  ];

  const legal = [
    { href: "/about", label: t.about ?? "About Us" },
    { href: "/contact", label: t.contact ?? "Contact Us" },
    { href: "/privacy", label: t.privacy ?? "Privacy Policy" },
    { href: "/terms", label: t.terms ?? "Terms of Use" },
  ];

  const account = [
    { href: "/login", label: t.signIn },
    { href: "/signup", label: t.createAccount },
    { href: "/account/history", label: t.readingHistory },
  ];

  return (
    <footer className="border-border relative mt-auto overflow-hidden border-t">
      {/* Dedicated Sunset & Sacred Banyan Footer Artwork */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/images/footer-backdrop.svg"
          alt="Sacred sunset and banyan tree divine artwork"
          className="h-full w-full object-cover opacity-100 contrast-105 saturate-115"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--background) / 0.65) 0%, hsl(var(--background) / 0.35) 30%, transparent 65%)",
          }}
        />
      </div>

      <div className="page-gutter w-full py-12 sm:py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(0,1.8fr)_repeat(3,minmax(0,1fr))] md:gap-10 lg:gap-12">
          <div className="max-w-md space-y-4 sm:col-span-2 md:col-span-1">
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
                {t.gitaTitle}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.footer}
            </p>
            <p className="text-muted-foreground/90 text-xs leading-relaxed">
              {t.footerBlurb}
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

          <FooterColumn title={t.footerExplore} links={explore} />
          <FooterColumn title={t.footerLegal ?? "Information & Legal"} links={legal} />
          {PUBLIC_AUTH_UI_ENABLED ? (
            <FooterColumn title={t.footerAccount} links={account} />
          ) : null}
        </div>

        <div className="border-border/70 mx-auto mt-12 max-w-6xl border-t pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-2 sm:items-center">
              <Languages
                className="text-saffron mt-0.5 h-4 w-4 shrink-0 sm:mt-0"
                aria-hidden
              />
              <ul
                className="flex flex-wrap gap-x-1 gap-y-1.5"
                aria-label={t.language}
              >
                {READING_LANGUAGES.map((lang) => {
                  const active = preferredLanguage === lang.code;
                  return (
                    <li key={lang.code}>
                      <button
                        type="button"
                        onClick={() => setPreferredLanguage(lang.code)}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs tracking-wide transition-divine",
                          active
                            ? "bg-saffron/15 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                        )}
                        aria-pressed={active}
                        lang={lang.code === "sa" ? "sa" : lang.code}
                      >
                        {lang.nativeName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="text-muted-foreground text-xs">
              © {year} {t.gitaTitle} · {t.footerCopyright}
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
