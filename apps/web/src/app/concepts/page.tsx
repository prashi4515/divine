import type { Metadata } from "next";
import Link from "next/link";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { ConceptCard } from "@/features/concepts/concept-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import { getConcepts } from "@/lib/concepts/store";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Concepts - Dharma, Karma, Yoga & more",
  description:
    "Philosophical concepts from the Knowledge Graph - definition, meaning, etymology, verses, chapters, characters, events, and related ideas.",
  alternates: { canonical: "/concepts" },
  openGraph: {
    title: "Concepts - Dharma, Karma, Yoga & more",
    description:
      "Explore Gita concepts as a dedicated module over the shared Knowledge Graph.",
    url: `${SITE_URL}/concepts`,
    type: "website",
  },
};

export default async function ConceptsIndexPage() {
  const concepts = await getConcepts();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="Signature experience"
          title="Concepts"
          description="Core ideas of the Bhagavad Gita from the shared Knowledge Graph - each page resolves definition, meaning, etymology, related verses and chapters, characters, events, examples, related concepts, and search aliases from existing JSON. Encyclopedia explains; Search finds aliases."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Concepts" },
          ]}
          actions={
            <>
              <Link
                href="/bhagavad-gita"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Bhagavad Gita
              </Link>
              <Link
                href="/search"
                className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
              >
                Search
              </Link>
              <Link
                href="/encyclopedia/concept"
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
              {concepts.length} concepts
            </p>
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
