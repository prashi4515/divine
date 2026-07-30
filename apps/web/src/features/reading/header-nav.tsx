"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/**
 * Localized primary nav — isolated so SiteHeader can stay a Server Component.
 */
export function HeaderNav() {
  const t = useMessages();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      <Link
        href="/bhagavad-gita"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-divine rounded-md px-3 py-1.5 text-sm"
      >
        {t.allChapters}
      </Link>
      <Link
        href="/genealogy"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-divine rounded-md px-3 py-1.5 text-sm"
      >
        Genealogy
      </Link>
    </nav>
  );
}
