"use client";

import Link from "next/link";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";

export function SiteFooter() {
  const t = useMessages();
  const h = useHomeMessages();

  const links = [
    { href: "/", label: t.home },
    { href: "/bhagavad-gita", label: t.gitaTitle },
    { href: "/search", label: h.searchVerses },
  ];

  return (
    <footer className="border-border mt-auto border-t">
      <div className="page-gutter w-full py-8 sm:py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md focus-visible:outline-none"
            >
              <span
                className="cta-saffron flex h-7 w-7 items-center justify-center rounded-md shadow-xs"
                aria-hidden
              >
                <span className="font-serif text-sm leading-none text-white">
                  ॐ
                </span>
              </span>
              <span className="font-serif text-lg tracking-tight">
                Bhagavad Gita
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
              {t.footer}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-divine text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-border/60 text-muted-foreground mt-8 border-t pt-6 text-xs">
          © {new Date().getFullYear()} Bhagavad Gita
        </div>
      </div>
    </footer>
  );
}
