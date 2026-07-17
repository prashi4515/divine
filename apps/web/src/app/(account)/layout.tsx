import type { Metadata } from "next";
import { AccountSidebar } from "@/features/account/account-sidebar";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 45% at 50% -8%, hsl(var(--muted) / 0.55), transparent 52%),
            hsl(var(--background))
          `,
        }}
      />
      <SiteHeader eyebrow="My Account" />
      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-24 pt-4 md:pt-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            My Account
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
            Manage your profile, saved verses, notes, and reading journey.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <AccountSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
