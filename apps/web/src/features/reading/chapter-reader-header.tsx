"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountLink } from "@/features/reading/account-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { HeaderSearch } from "@/features/search/header-search";
import { localizeWorkTitle, useMessages } from "@/lib/i18n/use-messages";
import { readerFontClass } from "@/lib/reading/reader-fonts";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";

type ChapterReaderHeaderProps = {
  backHref?: string;
  backLabel?: string;
  workCode?: string;
};

export function ChapterReaderHeader({
  backHref = "/bhagavad-gita",
  backLabel = "Bhagavad Gita",
  workCode = "bg",
}: ChapterReaderHeaderProps) {
  const t = useMessages();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const label = localizeWorkTitle(t, { code: workCode, title: backLabel });
  const labelFont = readerFontClass(preferredLanguage);

  return (
    <header className="border-border/60 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="page-gutter flex w-full items-center justify-between gap-3 py-2.5">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md text-sm transition-divine focus-visible:outline-none"
        >
          <ArrowLeft
            className="h-4 w-4 shrink-0 transition-divine group-hover:-translate-x-0.5"
            aria-hidden
          />
          <span className={cn("hidden indic-display sm:inline", labelFont)}>
            {label}
          </span>
        </Link>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
          <HeaderSearch />
          <AccountLink />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
