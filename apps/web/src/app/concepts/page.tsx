import type { Metadata } from "next";
import { buildPageMetadata, hubIndexSeo } from "@/lib/seo";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { ConceptCard } from "@/features/concepts/concept-card";
import { HubCountLine } from "@/features/knowledge/hub-count-line";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getConcepts } from "@/lib/concepts/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(hubIndexSeo("concepts"));

export default async function ConceptsIndexPage() {
  const concepts = await getConcepts();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="concepts"
          actionLinks={[
            { href: "/bhagavad-gita", labelKey: "allChapters" },
            { href: "/encyclopedia", labelKey: "navEncyclopedia" },
          ]}
        />

        <section className="page-gutter pb-16 pt-4">
          <div className="mx-auto max-w-6xl">
            <HubCountLine count={concepts.length} kind="concepts" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {concepts.map((concept, i) => (
                <li key={concept.id}>
                  <ConceptCard concept={concept} index={i} />
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
