import dynamic from "next/dynamic";
import Link from "next/link";
import { AccountLink } from "@/features/reading/account-link";
import { HeaderNav } from "@/features/reading/header-nav";
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
 * Public site chrome — brand left; nav + actions right; hairline rule below.
 * Server Component shell; interactive islands hydrate independently of auth.
 */
export function SiteHeader(_props: SiteHeaderProps) {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="page-gutter flex w-full items-center justify-between gap-2 py-2.5 sm:gap-3 lg:py-3">
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-2 rounded-md focus-visible:outline-none"
        >
          <span
            className="cta-saffron flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs transition-divine group-hover:shadow-sm"
            aria-hidden
          >
            <span className="font-serif text-base leading-none text-white">
              ॐ
            </span>
          </span>
          <span className="indic-display font-serif text-base sm:text-lg md:text-xl">
            <span className="sm:hidden">Gita</span>
            <span className="hidden sm:inline">Bhagavad Gita</span>
          </span>
        </Link>

        <div className="flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1.5">
          <HeaderNav />
          <HeaderSearch />
          <LanguageSwitcher />
          <ThemeToggle />
          <AccountLink />
        </div>
      </div>
    </header>
  );
}
