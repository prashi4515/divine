import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { getAllBabyNames } from "@/lib/baby-names/store";
import { babyNameIndexSeo } from "@/lib/seo/titles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/knowledge/seo";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(babyNameIndexSeo());
}

export default async function BabyNamesIndexPage() {
  const names = await getAllBabyNames();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Baby Names" },
  ];

  const categories = [
    { slug: "boy", title: "Boy Names", desc: "Scriptural and Sanskrit names for boys" },
    { slug: "girl", title: "Girl Names", desc: "Scriptural and Sanskrit names for girls" },
    { slug: "unisex", title: "Unisex Names", desc: "Names suitable for both boys and girls" },
    { slug: "mahabharata", title: "Mahabharata Names", desc: "Names attested in the epic Mahabharata" },
    { slug: "bhagavad-gita", title: "Bhagavad Gita Names", desc: "Names and epithets from the Gita" },
    { slug: "sanskrit", title: "Sanskrit Etymological", desc: "Names with verified classical Sanskrit roots" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />

      <SiteHeader />


      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumb nav */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Baby Names</span>
        </nav>

        {/* Hero Header */}
        <header className="mb-10 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            Scholarly & Scripturally Verified
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground mb-3">
            Ancient Scripture & Sanskrit Baby Names
          </h1>
          <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
            Explore our peerless, scripturally verified directory of Indian and Sanskrit baby names. Every name features Devanagari Sanskrit, IAST transliteration, a 4-tier semantic meaning breakdown, verified roots, and direct citations from the Bhagavad Gita, Mahabharata, and ancient texts.
          </p>
        </header>

        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
            Browse by Category & Scripture
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/baby-names/${cat.slug}`}
                className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all shadow-sm"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {cat.title} &rarr;
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* All Verified Names Directory */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              All Verified Names ({names.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              100% Etymologically Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {names.map((item) => (
              <Link
                key={item.id}
                href={`/baby-names/${item.slug}`}
                className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-lg font-serif font-bold text-foreground">
                      {item.nameEn}
                    </span>
                    <span className="text-xs font-serif text-muted-foreground">
                      {item.nameSaDevanagari} ({item.nameIAST})
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2 mb-3">
                    {item.meanings.primaryMeaning}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="capitalize px-2 py-0.5 rounded bg-muted font-medium">
                    {item.genderUsage}
                  </span>
                  <span>&bull;</span>
                  <span>{item.primaryScripture}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
