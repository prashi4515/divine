import type { Metadata } from "next";
import { buildPageMetadata, hubIndexSeo } from "@/lib/seo";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { KingdomCard } from "@/features/kingdoms/kingdom-card";
import { HubCountLine } from "@/features/knowledge/hub-count-line";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getKingdoms } from "@/lib/kingdoms/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(hubIndexSeo("kingdoms"));

export default async function KingdomsIndexPage() {
  const kingdoms = await getKingdoms();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="kingdoms"
          actionLinks={[
            { href: "/atlas", labelKey: "navAtlas" },
            { href: "/encyclopedia", labelKey: "navEncyclopedia" },
          ]}
        />

        <section className="page-gutter pb-16 pt-4">
          <div className="mx-auto max-w-6xl">
            <HubCountLine count={kingdoms.length} kind="kingdoms" />
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
