import type { Metadata } from "next";
import Link from "next/link";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { KingdomCard } from "@/features/kingdoms/kingdom-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getKingdoms } from "@/lib/kingdoms/store";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Kingdoms - Ancient Bharata",
  description:
    "Mahabharata-era kingdoms from the Knowledge Graph - capitals, rulers, cities, battles, timeline, atlas, and scripture links.",
  alternates: { canonical: "/kingdoms" },
  openGraph: {
    title: "Kingdoms - Ancient Bharata",
    description:
      "Explore kingdoms as a dedicated module over the shared Knowledge Graph.",
    url: `${SITE_URL}/kingdoms`,
    type: "website",
  },
};

export default async function KingdomsIndexPage() {
  const kingdoms = await getKingdoms();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Signature experience"
          title="Kingdoms"
          description="Mahabharata-era kingdoms from the shared Knowledge Graph - each page resolves capital, rulers, dynasty, cities, battles, timeline, atlas, genealogy, characters, events, and verses from existing JSON. Encyclopedia explains; Atlas maps."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Kingdoms" },
          ]}
          actions={
            <>
              <Link
                href="/atlas"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Atlas
              </Link>
              <Link
                href="/events"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Events
              </Link>
              <Link
                href="/encyclopedia/kingdom"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Encyclopedia
              </Link>
            </>
          }
        />

        <section className="page-gutter pb-16 pt-4">
          <div className="mx-auto max-w-6xl">
            <p className="text-muted-foreground mb-6 text-sm">
              {kingdoms.length} kingdoms
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kingdoms.map((kingdom, i) => (
                <li key={kingdom.id}>
                  <KingdomCard kingdom={kingdom} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
