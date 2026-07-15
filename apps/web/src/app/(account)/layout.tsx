import type { Metadata } from "next";
import { AccountNav } from "@/features/account";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader eyebrow="Account" />
      <main className="mx-auto w-full max-w-content flex-1 px-6 pb-24 pt-4 md:pt-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Your account</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your profile, saved verses, and reading journey.
          </p>
        </header>
        <AccountNav />
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
