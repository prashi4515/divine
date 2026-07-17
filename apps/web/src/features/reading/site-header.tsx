"use client";

import { useMessages } from "@/lib/i18n/use-messages";
import { AccountLink } from "@/features/reading/account-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { HeaderSearch } from "@/features/search/header-search";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

type SiteHeaderProps = {
  /** Optional work code for localized eyebrow (e.g. "bg"). */
  workCode?: string;
  /** Fallback eyebrow when workCode is absent. */
  eyebrow?: string;
};

/**
 * Public site chrome — brand, global search, account, language, theme.
 */
export function SiteHeader({ workCode, eyebrow }: SiteHeaderProps) {
  const t = useMessages();
  const label = workCode
    ? eyebrow ?? workCode
    : eyebrow;

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-content flex-wrap items-center gap-3 px-6 py-3 md:flex-nowrap md:gap-4 md:py-3.5">
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none"
      >
        <span
          className="border-border bg-background/80 flex h-7 w-7 items-center justify-center rounded-md border shadow-xs transition-divine group-hover:shadow-sm"
          aria-hidden
        >
          <span className="font-serif text-sm leading-none">ॐ</span>
        </span>
        <span className="font-serif text-lg tracking-tight md:text-xl">Divine</span>
      </Link>

      <div className="order-3 w-full md:order-none md:mx-2 md:w-auto md:min-w-0 md:flex-1">
        <HeaderSearch />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
        {label ? (
          <Link
            href="/bhagavad-gita"
            className="text-muted-foreground hover:text-foreground hidden text-xs tracking-wide transition-divine lg:inline"
          >
            {t.gitaTitle}
          </Link>
        ) : (
          <Link
            href="/bhagavad-gita"
            className="text-muted-foreground hover:text-foreground hidden text-xs tracking-wide transition-divine sm:inline"
          >
            {t.gitaTitle}
          </Link>
        )}
        <AccountLink />
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
