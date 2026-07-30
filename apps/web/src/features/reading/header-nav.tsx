"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/**
 * Localized primary nav — isolated so SiteHeader can stay a Server Component.
 */
export function HeaderNav() {
  const t = useMessages();

  const items = [
    { href: "/bhagavad-gita", label: t.allChapters },
    { href: "/atlas", label: t.navAtlas },
    { href: "/events", label: t.navEvents },
    { href: "/kingdoms", label: t.navKingdoms },
    { href: "/weapons", label: t.navWeapons },
    { href: "/concepts", label: t.navConcepts },
    { href: "/timeline", label: t.navTimeline },
    { href: "/encyclopedia", label: t.navEncyclopedia },
    { href: "/genealogy", label: t.navGenealogy },
  ] as const;

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-divine rounded-md px-3 py-1.5 text-sm"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
