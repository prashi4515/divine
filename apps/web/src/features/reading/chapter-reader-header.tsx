"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountLink } from "@/features/reading/account-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { localizeWorkTitle, useMessages } from "@/lib/i18n/use-messages";

type ChapterReaderHeaderProps = {
  /** Back destination — typically the scripture chapter list. */
  backHref?: string;
  backLabel?: string;
  workCode?: string;
};

/**
 * Quiet reader chrome: back to scripture, language, theme toggle.
 */
export function ChapterReaderHeader({
  backHref = "/bhagavad-gita",
  backLabel = "Bhagavad Gita",
  workCode = "bg",
}: ChapterReaderHeaderProps) {
  const t = useMessages();
  const label = localizeWorkTitle(t, { code: workCode, title: backLabel });

  return (
    <header className="border-border/60 relative z-10 border-b">
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-4 px-6 py-2.5 sm:px-8 md:py-3 lg:px-[1in]">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground group inline-flex min-h-9 items-center gap-2 rounded-md text-sm transition-divine focus-visible:outline-none"
        >
          <ArrowLeft
            className="h-4 w-4 transition-divine group-hover:-translate-x-0.5"
            aria-hidden
          />
          <span>{label}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="text-muted-foreground hidden text-xs tracking-wide sm:inline">
            {t.reader}
          </span>
          <AccountLink />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
