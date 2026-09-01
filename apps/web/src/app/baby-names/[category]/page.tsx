import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { getBabyNamesByCategory } from "@/lib/baby-names/store";
import { babyNameCategorySeo } from "@/lib/seo/titles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/knowledge/seo";

export const dynamic = "force-static";
export const revalidate = false;

const VALID_CATEGORIES = [
  "boy",
  "girl",
  "unisex",
  "mahabharata",
  "bhagavad-gita",
  "ramayana",
  "sanskrit",
] as const;

type PageProps = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}

type CategoryType = (typeof VALID_CATEGORIES)[number];

function isValidCategory(cat: string): cat is CategoryType {
  return (VALID_CATEGORIES as readonly string[]).includes(cat);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategory(category)) {
    return { title: "Category Not Found" };
  }

  return buildPageMetadata(babyNameCategorySeo(category));
}

export default async function BabyNameCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const names = await getBabyNamesByCategory(category);
  const catCap = category.charAt(0).toUpperCase() + category.slice(1);


  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Baby Names", href: "/baby-names" },
    { name: `${catCap} Names` },
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
        {/* Breadcrumbs */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/baby-names" className="hover:underline">Baby Names</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{catCap} Names</span>
        </nav>

        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            {catCap} Ancient Scripture &amp; Sanskrit Baby Names
          </h1>
          <p className="text-muted-foreground text-base max-w-3xl leading-relaxed mb-4">
            Explore verified {category} baby names with Sanskrit etymology, literal root meanings, and direct scriptural citations.
          </p>

          <nav aria-label="Other Baby Name Categories" className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/baby-names/boy"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "boy" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Sanskrit Baby Boy Names
            </Link>
            <Link
              href="/baby-names/girl"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "girl" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Sanskrit Baby Girl Names
            </Link>
            <Link
              href="/baby-names/unisex"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "unisex" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Sanskrit Unisex Names
            </Link>
            <Link
              href="/baby-names/mahabharata"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "mahabharata" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Mahabharata Names
            </Link>
            <Link
              href="/baby-names/bhagavad-gita"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "bhagavad-gita" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Bhagavad Gita Names
            </Link>
            <Link
              href="/baby-names/ramayana"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "ramayana" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Ramayana Names
            </Link>
            <Link
              href="/baby-names/sanskrit"
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${category === "sanskrit" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"}`}
            >
              Sanskrit Names
            </Link>
          </nav>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
