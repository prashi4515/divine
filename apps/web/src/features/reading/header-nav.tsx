"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/**
 * Localized primary nav — desktop row; mobile uses MobileNav.
 */
export function HeaderNav() {
  const t = useMessages();

  const items = [
    { href: "/bhagavad-gita", label: t.allChapters },
    { href: "/atlas", label: t.navAtlas },
    { href: "/events", label: t.navEvents },
    { href: "/kingdoms", label: t.navKingdoms },
    { href: "/weapons", label: t.navWeapons },
    { href: "/encyclopedia", label: t.navEncyclopedia },
    { href: "/genealogy", label: t.navGenealogy },
  ] as const;

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
