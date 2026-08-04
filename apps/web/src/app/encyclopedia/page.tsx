import type { Metadata } from "next";
import { buildPageMetadata, hubIndexSeo } from "@/lib/seo";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { EncyclopediaLandingBody } from "@/features/encyclopedia/encyclopedia-landing-body";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getCollections, getAllEntities } from "@/lib/knowledge/store";
import type { EntityKind } from "@/lib/knowledge/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(hubIndexSeo("encyclopedia"));

export default async function EncyclopediaLandingPage() {
  const [collections, entities] = await Promise.all([
    getCollections(),
    getAllEntities(),
  ]);
  const sections = collections.filter((c) => c.kind === "encyclopedia-section");
  const featured = [...entities]
    .filter((e) => e.status === "published")
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 9);

  const kinds = [...new Set(entities.map((e) => e.kind))].sort() as EntityKind[];

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="encyclopedia"
          actionLinks={[
            { href: "/genealogy", labelKey: "navGenealogy" },
            { href: "/atlas", labelKey: "navAtlas" },
          ]}
        />
        <EncyclopediaLandingBody
          sections={[...sections]}
          kinds={kinds}
          featured={featured}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
