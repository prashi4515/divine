import type { Metadata } from "next";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { GenealogyLandingBody } from "@/features/genealogy/genealogy-landing-body";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getGenealogyModules } from "@/lib/genealogy/store";
import { buildPageMetadata, genealogyIndexSeo, getSiteUrl } from "@/lib/seo";

/** Dynamic so the reading-language cookie can SSR the correct UI (no English flash). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(genealogyIndexSeo());

export default async function GenealogyLandingPage() {
  const modules = await getGenealogyModules();
  const available = modules.filter((m) => m.status === "available");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Divine Genealogy",
    description:
      "An interactive, cited encyclopaedia of Hindu genealogy: Asuras, dynasties, deities, sages and their relationships.",
    url: `${getSiteUrl()}/genealogy`,
    hasPart: available.map((m) => ({
      "@type": "CreativeWork",
      name: m.title,
      description: m.summary,
      url: `${getSiteUrl()}/genealogy/${m.slug}`,
    })),
    isPartOf: {
      "@type": "WebSite",
      name: "Divine",
      url: getSiteUrl(),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
      {
        "@type": "ListItem",
        position: 2,
        name: "Genealogy",
        item: `${getSiteUrl()}/genealogy`,
      },
    ],
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <LocalizedModuleHeader
          module="genealogy"
          actionLinks={[
            { href: "/encyclopedia", labelKey: "navEncyclopedia" },
            { href: "/bhagavad-gita", labelKey: "allChapters" },
          ]}
        />
        <GenealogyLandingBody modules={[...modules]} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}
