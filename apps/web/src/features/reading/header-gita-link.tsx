"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/** Localized Gita nav link — isolated so SiteHeader can stay a Server Component. */
export function HeaderGitaLink() {
  const t = useMessages();
  return (
    <Link
      href="/bhagavad-gita"
      className="text-muted-foreground hover:text-foreground hidden px-2 text-xs tracking-wide transition-divine md:inline"
    >
      {t.gitaTitle}
    </Link>
  );
}
