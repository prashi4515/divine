import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeBabyNamesSection() {
  const categoryLinks = [
    { href: "/baby-names/boy", label: "Sanskrit Baby Boy Names" },
    { href: "/baby-names/girl", label: "Sanskrit Baby Girl Names" },
    { href: "/baby-names/unisex", label: "Sanskrit Unisex Names" },
    { href: "/baby-names/mahabharata", label: "Mahabharata Names" },
    { href: "/baby-names/bhagavad-gita", label: "Bhagavad Gita Names" },
    { href: "/baby-names/ramayana", label: "Ramayana Names" },
    { href: "/baby-names/sanskrit", label: "Sanskrit Names" },
  ];

  return (
    <section className="page-gutter w-full py-12 sm:py-16">
      <div className="border-border/70 relative w-full overflow-hidden rounded-3xl border bg-card p-6 sm:p-10 md:p-12 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/10 text-saffron text-xs font-semibold uppercase tracking-wider mb-4 border border-saffron/20">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            <span>Sanskrit Etymology &amp; Personal Names</span>
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">
            Sanskrit &amp; Hindu Baby Names
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
            Explore Sanskrit and Hindu baby names with meanings, Devanagari spellings, pronunciation, traditional origins, and scriptural connections where applicable.
          </p>

          <div className="flex flex-wrap gap-2 mb-8" aria-label="Baby Name Categories">
            {categoryLinks.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:border-saffron hover:text-saffron transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <div>
            <Button
              asChild
              size="lg"
              className="cta-saffron h-12 border-0 px-7 text-base shadow-md hover:shadow-lg"
            >
              <Link href="/baby-names">
                <span>Explore Baby Names</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
