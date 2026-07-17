"use client";

import { localizeWorkTitle, useMessages } from "@/lib/i18n/use-messages";
import { AccountLink } from "@/features/reading/account-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

type SiteHeaderProps = {
  /** Optional work code for localized eyebrow (e.g. "bg"). */
  workCode?: string;
  /** Fallback eyebrow when workCode is absent. */
  eyebrow?: string;
};

/**
 * Public site chrome — brand, translation language, theme toggle.
 */
export function SiteHeader({ workCode, eyebrow }: SiteHeaderProps) {
  const t = useMessages();
  const label = workCode
    ? localizeWorkTitle(t, { code: workCode, title: eyebrow ?? workCode })
    : eyebrow;

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-content items-center justify-between px-6 py-3 md:py-3.5">
      <Link
        href="/"
        className="group flex items-center gap-2 rounded-md focus-visible:outline-none"
      >
        <span
          className="border-border bg-background/80 flex h-7 w-7 items-center justify-center rounded-md border shadow-xs transition-divine group-hover:shadow-sm"
          aria-hidden
        >
          <span className="font-serif text-sm leading-none">ॐ</span>
        </span>
        <span className="font-serif text-lg tracking-tight md:text-xl">Divine</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-2.5">
        {label ? (
          <span className="text-muted-foreground hidden text-xs tracking-wide md:inline">
            {label}
          </span>
        ) : null}
        <Link
          href="/search"
          className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-divine"
        >
          Search
        </Link>
        <AccountLink />
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
