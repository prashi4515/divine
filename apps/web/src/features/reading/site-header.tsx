import dynamic from "next/dynamic";
import { AccountLink } from "@/features/reading/account-link";
import { HeaderNav } from "@/features/reading/header-nav";
import { LanguageSwitcher } from "@/features/reading/language-switcher";
import { MobileNav } from "@/features/reading/mobile-nav";
import { SiteBrand } from "@/features/reading/site-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { PUBLIC_AUTH_UI_ENABLED } from "@/lib/auth/config";

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



/**
 * Public site chrome — brand left; nav + actions right.
 * Hamburger only below `lg`; desktop keeps the inline link row.
 */
export function SiteHeader() {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="page-gutter flex w-full items-center gap-2 py-2.5 sm:gap-3 lg:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <MobileNav />
          <SiteBrand />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <HeaderNav />
          <HeaderSearch />
          <LanguageSwitcher />
          <ThemeToggle />
          {PUBLIC_AUTH_UI_ENABLED ? <AccountLink /> : null}
        </div>
      </div>
    </header>
  );
}
