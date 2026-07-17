import dynamic from "next/dynamic";
import Link from "next/link";
import { AccountLink } from "@/features/reading/account-link";
import { HeaderGitaLink } from "@/features/reading/header-gita-link";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

const HeaderSearch = dynamic(
  () =>
    import("@/features/search/header-search").then((m) => m.HeaderSearch),
  {
    loading: () => (
      <span
        className="inline-flex h-8 w-8 shrink-0"
        aria-hidden
      />
    ),
  },
);

type SiteHeaderProps = {
  workCode?: string;
  eyebrow?: string;
};

/**
 * Public site chrome — brand left; search icon + actions right; hairline rule below.
 * Server Component shell; interactive islands hydrate independently of auth.
 */
export function SiteHeader(_props: SiteHeaderProps) {
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
          <HeaderGitaLink />
          <HeaderSearch />
          <AccountLink />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
