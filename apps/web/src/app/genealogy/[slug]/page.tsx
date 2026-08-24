import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { GenealogyExplorer } from "@/features/genealogy/genealogy-explorer";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getGenealogyModule,
  getGenealogyModules,
  getPeopleForModule,
} from "@/lib/genealogy/store";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = false;


/** Old slugs from the pre-split corpus → current modules. */
const SLUG_REDIRECTS: Record<string, string> = {
  "major-asuras": "asuras",
  "major-devas": "devas",
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const modules = await getGenealogyModules();
  return [
    ...modules.map((m) => ({ slug: m.slug })),
    ...Object.keys(SLUG_REDIRECTS).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = SLUG_REDIRECTS[rawSlug] ?? rawSlug;
  const mod = await getGenealogyModule(slug);
  if (!mod) return { title: "Genealogy module not found" };
  const title = `${mod.title} — Hindu genealogy explorer`;
  const description = mod.description;
  return buildPageMetadata({
    title,
    description,
    path: `/genealogy/${mod.slug}`,
    lang: "en",
    type: "article",
    keywords: [
      mod.title,
      mod.sanskritTitle ?? "",
      "Hindu genealogy",
      "family tree",
      "dynasty",
      "Divine genealogy explorer",
    ].filter(Boolean),
  });
}

export default async function GenealogyModulePage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  if (SLUG_REDIRECTS[rawSlug]) {
    redirect(`/genealogy/${SLUG_REDIRECTS[rawSlug]}`);
  }
  const slug = rawSlug;
  const mod = await getGenealogyModule(slug);
  if (!mod) notFound();

  if (mod.status === "coming-soon") {
    return <ComingSoonPage slug={slug} />;
  }

  const people = await getPeopleForModule(slug);

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
      {
        "@type": "ListItem",
        position: 3,
        name: mod.title,
        item: `${getSiteUrl()}/genealogy/${mod.slug}`,
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: mod.title,
    description: mod.description,
    inLanguage: "en",
    mainEntityOfPage: `${getSiteUrl()}/genealogy/${mod.slug}`,
    author: { "@type": "Organization", name: "Divine" },
    publisher: { "@type": "Organization", name: "Divine" },
    about: people.map((p) => ({
      "@type": "Person",
      name: p.name,
      alternateName: p.sanskritName,
      url: `${getSiteUrl()}/genealogy/person/${p.id}`,
    })),
    citation: mod.scriptureSources.map((s) => ({
      "@type": "CreativeWork",
      name: [s.work, s.section, s.chapter, s.verse].filter(Boolean).join(" · "),
    })),
  };

  const faqLd =
    mod.faq && mod.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: mod.faq.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: { "@type": "Answer", text: q.answer },
          })),
        }
      : null;

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow={mod.eyebrow ?? "Module"}
          title={mod.title}
          description={mod.description}
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/genealogy", label: "Genealogy" },
            { label: mod.title },
          ]}
        />
        <GenealogyExplorer module={mod} people={people} />

        <section
          className="page-gutter w-full pb-14 md:pb-20"
          aria-labelledby="module-context"
        >
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            <div className="border-border/70 rounded-2xl border p-6 md:col-span-2">
              <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                Primary sources
              </p>
              <h2
                id="module-context"
                className="text-foreground mt-2 font-serif text-xl tracking-tight"
              >
                Where this module draws from
              </h2>
              <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                {mod.scriptureSources.map((s, i) => (
                  <li
                    key={`${s.work}-${i}`}
                    className="border-border/60 rounded-lg border-l-2 pl-3 py-0.5"
                  >
                    <span className="text-foreground font-medium">{s.work}</span>
                    {s.section && (
                      <span className="text-muted-foreground/90"> · {s.section}</span>
                    )}
                    {s.chapter && (
                      <span className="text-muted-foreground/90"> · {s.chapter}</span>
                    )}
                  </li>
                ))}
              </ul>
              {mod.relatedGitaChapters && mod.relatedGitaChapters.length > 0 && (
                <>
                  <p className="text-saffron mt-6 text-[11px] font-medium uppercase tracking-[0.18em]">
                    Related Bhagavad Gītā chapters
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {mod.relatedGitaChapters.map((n) => (
                      <li key={n}>
                        <Link
                          href={`/bhagavad-gita/chapter-${n}`}
                          className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-divine"
                        >
                          <BookOpen className="h-3.5 w-3.5" aria-hidden />
                          Chapter {n}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="border-border/70 rounded-2xl border p-6">
              <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                Explore next
              </p>
              <h3 className="text-foreground mt-2 font-serif text-lg">
                Related modules
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <RelatedModules currentSlug={mod.slug} />
              </ul>
            </div>
          </div>
        </section>

        {mod.faq && mod.faq.length > 0 && (
          <section
            className="page-gutter w-full pb-16 md:pb-20"
            aria-labelledby="module-faq"
          >
            <div className="mx-auto max-w-4xl">
              <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
                Questions
              </p>
              <h2
                id="module-faq"
                className="text-foreground mt-2 font-serif text-xl tracking-tight sm:text-2xl"
              >
                Frequently asked
              </h2>
              <div className="mt-6 space-y-3">
                {mod.faq.map((q) => (
                  <details
                    key={q.question}
                    className="border-border/70 group rounded-xl border p-5 open:shadow-sm"
                  >
                    <summary className="text-foreground cursor-pointer list-none text-sm font-medium marker:content-none">
                      <span className="flex items-start justify-between gap-3">
                        {q.question}
                        <span
                          aria-hidden
                          className="text-muted-foreground group-open:rotate-45 mt-0.5 shrink-0 transition-transform"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {q.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </div>
  );
}

async function RelatedModules({ currentSlug }: { currentSlug: string }) {
  const modules = await getGenealogyModules();
  const others = modules.filter(
    (m) => m.slug !== currentSlug && m.status === "available",
  );
  return (
    <>
      {others.slice(0, 6).map((m) => (
        <li key={m.slug}>
          <Link
            href={`/genealogy/${m.slug}`}
            className="text-foreground group inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
          >
            {m.title}
            <ArrowUpRight
              className="text-muted-foreground group-hover:text-foreground h-3.5 w-3.5"
              aria-hidden
            />
          </Link>
          <p className="text-muted-foreground text-xs">{m.summary}</p>
        </li>
      ))}
    </>
  );
}

function ComingSoonPage({ slug }: { slug: string }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GenealogyHeader
          eyebrow="In preparation"
          title="This module is being sourced"
          description="We only publish a module when every relationship in it can be tied to an accepted scripture. This one is on the editorial list and will appear here as soon as its citations are complete."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/genealogy", label: "Genealogy" },
            { label: slug },
          ]}
          actions={
            <Link
              href="/genealogy"
              className="border-border bg-background/80 text-foreground hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-divine"
            >
              Back to all modules
            </Link>
          }
        />
      </main>
      <SiteFooter />
    </div>
  );
}
