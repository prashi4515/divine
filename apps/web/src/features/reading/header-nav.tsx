"use client";

import Link from "next/link";
import { useHomeMessages, useMessages } from "@/lib/i18n/use-messages";

/** Localized primary nav — isolated so SiteHeader can stay a Server Component. */
export function HeaderNav() {
  const t = useMessages();
  const h = useHomeMessages();

  const links = [
    { href: "/bhagavad-gita", label: t.allChapters },
    { href: "/#verse-of-the-day", label: h.todaysVerse },
    { href: "/search", label: h.searchVerses },
  ];

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-divine rounded-md px-3 py-1.5 text-sm"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
