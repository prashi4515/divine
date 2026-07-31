"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/use-messages";

/** Live-translated brand mark for the site header. */
export function SiteBrand() {
  const t = useMessages();
  return (
    <Link
      href="/"
      className="group flex min-w-0 max-w-full items-center gap-2 rounded-md focus-visible:outline-none"
    >
      <span
        className="cta-saffron flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs transition-divine group-hover:shadow-sm"
        aria-hidden
      >
        <span className="font-serif text-base leading-none text-white">ॐ</span>
      </span>
      <span className="indic-display truncate font-serif text-base sm:text-lg md:text-xl">
        <span className="sm:hidden">Gita</span>
        <span className="hidden sm:inline">{t.gitaTitle}</span>
      </span>
    </Link>
  );
}
