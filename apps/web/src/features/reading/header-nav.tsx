"use client";

import Link from "next/link";
import { useUiLanguage, useMessages } from "@/lib/i18n/use-messages";
import { localizePath } from "@/lib/i18n/locales";

/**
 * Localized primary nav — desktop row; mobile uses MobileNav.
 */
export function HeaderNav() {
  const lang = useUiLanguage();
  const t = useMessages(lang);

  const items = [
    { href: localizePath("/bhagavad-gita", lang), label: t.allChapters },
    { href: localizePath("/atlas", lang), label: t.navAtlas },
    { href: localizePath("/events", lang), label: t.navEvents },
    { href: localizePath("/kingdoms", lang), label: t.navKingdoms },
    { href: localizePath("/weapons", lang), label: t.navWeapons },
    { href: localizePath("/encyclopedia", lang), label: t.navEncyclopedia },
    { href: localizePath("/genealogy", lang), label: t.navGenealogy },
  ];

  return (
    <nav
      className="hidden max-w-[min(65vw,42rem)] items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden"
      aria-label="Primary"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-divine shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs xl:px-2.5 xl:text-sm"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
