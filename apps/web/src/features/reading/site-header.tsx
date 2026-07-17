"use client";

import { useMessages } from "@/lib/i18n/use-messages";
import { AccountLink } from "@/features/reading/account-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { HeaderSearch } from "@/features/search/header-search";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

type SiteHeaderProps = {
  workCode?: string;
  eyebrow?: string;
};

/**
 * Public site chrome — brand left; search icon + actions right; hairline rule below.
 */
export function SiteHeader(_props: SiteHeaderProps) {
  const t = useMessages();

  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-6 py-2.5 lg:px-[1in] lg:py-3">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none"
        >
          <span
            className="border-border bg-background flex h-7 w-7 items-center justify-center rounded-md border shadow-xs transition-divine group-hover:shadow-sm"
            aria-hidden
          >
            <span className="font-serif text-sm leading-none">ॐ</span>
          </span>
          <span className="font-serif text-lg tracking-tight md:text-xl">
            Divine
          </span>
        </Link>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
          <Link
            href="/bhagavad-gita"
            className="text-muted-foreground hover:text-foreground hidden px-2 text-xs tracking-wide transition-divine md:inline"
          >
            {t.gitaTitle}
          </Link>
          <HeaderSearch />
          <AccountLink />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
