"use client";

import Link from "next/link";
import Image from "next/image";
import { useUiLanguage, useMessages } from "@/lib/i18n/use-messages";
import { localizePath } from "@/lib/i18n/locales";

/** Live-translated brand mark for the site header. */
export function SiteBrand() {
  const lang = useUiLanguage();
  const t = useMessages(lang);
  const homeHref = localizePath("/", lang);

  return (
    <Link
      href={homeHref}
      className="group flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5 rounded-md focus-visible:outline-none"
    >
      <Image
        src="/brand/logo.webp"
        alt="Bhagavad Gita Online Logo"
        width={36}
        height={36}
        className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
        priority
      />
      <span className="indic-display truncate font-serif text-base sm:text-lg md:text-xl">
        <span className="sm:hidden">Gita</span>
        <span className="hidden sm:inline">{t.gitaTitle}</span>
      </span>
    </Link>
  );
}
