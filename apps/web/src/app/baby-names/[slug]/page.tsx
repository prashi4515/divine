import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { getAllBabyNames, getBabyNameBySlug } from "@/lib/baby-names/store";
import { getEntity } from "@/lib/knowledge/store";
import { babyNameSeo } from "@/lib/seo/titles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/knowledge/seo";
import { NAME_CLASSIFICATION_LABELS } from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const names = await getAllBabyNames();
  return names.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBabyNameBySlug(slug);
  if (!item) return { title: "Name Not Found" };

  return buildPageMetadata(
    babyNameSeo(
      item.nameEn,
      item.classification,
      item.meanings.primaryMeaning,
      item.primaryScripture
    )
  );
}

export default async function BabyNameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getBabyNameBySlug(slug);
  if (!item) notFound();

  // Resolve associated Entity if present
  const entity = item.associatedEntityId
    ? await getEntity(item.associatedEntityId).catch(() => null)
    : null;


  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Baby Names", href: "/baby-names" },
    { name: item.nameEn },
  ];

  // Schema.org DefinedTerm JSON-LD
  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: item.nameEn,
    termCode: item.slug,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Ancient Scripture & Sanskrit Baby Names",
      url: "https://bagavadgitaonline.com/baby-names",
    },
    description: item.meanings.primaryMeaning,
    url: `https://bagavadgitaonline.com/baby-names/${item.slug}`,
    sameAs: entity ? [`https://bagavadgitaonline.com/encyclopedia/person/${entity.slug}`] : undefined,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd(crumbs),
            definedTermJsonLd,
          ]),
        }}
      />

      <SiteHeader />


      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumbs */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/baby-names" className="hover:underline">Baby Names</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{item.nameEn}</span>
        </nav>

        {/* Header Section */}
        <header className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider capitalize">
              {item.genderUsage} Name
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {NAME_CLASSIFICATION_LABELS[item.classification]}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {item.primaryScripture}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            {item.nameEn}
          </h1>

          <div className="flex items-center gap-4 text-base font-serif text-muted-foreground">
            <span>Devanagari: <strong className="text-foreground font-bold">{item.nameSaDevanagari}</strong></span>
            <span>&bull;</span>
            <span>IAST: <strong className="text-foreground font-semibold">{item.nameIAST}</strong></span>
          </div>
        </header>

        {/* 1. Prominent Search-Intent Direct Answer Box */}
        <section aria-labelledby="meaning-answer-heading" className="mb-8 p-6 rounded-2xl bg-card border-2 border-primary/20 shadow-sm">
          <h2 id="meaning-answer-heading" className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
            What does {item.nameEn} mean?
          </h2>
          <p className="text-xl font-serif text-foreground leading-relaxed">
            {item.meanings.primaryMeaning}
          </p>

          <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium">Literal Sanskrit Root Meaning:</span>
              <span className="text-foreground font-medium">{item.meanings.literalSanskrit}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium">Traditional Interpretation:</span>
              <span className="text-foreground font-medium">{item.meanings.traditionalInterpretation}</span>
            </div>
          </div>
        </section>

        {/* 2. 4-Tier Semantic Meaning Breakdown */}
        <section className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-semibold text-foreground border-b border-border pb-3">
            {item.nameEn} – Meaning & Etymology Breakdown
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold text-foreground">1. Literal Sanskrit Meaning</h3>
              <p className="text-muted-foreground leading-relaxed">{item.meanings.literalSanskrit}</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">2. Traditional Interpretation</h3>
              <p className="text-muted-foreground leading-relaxed">{item.meanings.traditionalInterpretation}</p>
            </div>

            {item.meanings.characterContext && (
              <div>
                <h3 className="font-semibold text-foreground">3. Scriptural Character Context</h3>
                <p className="text-muted-foreground leading-relaxed">{item.meanings.characterContext}</p>
              </div>
            )}

            {item.meanings.modernUsageNote && (
              <div>
                <h3 className="font-semibold text-foreground">4. Modern Baby-Name Usage</h3>
                <p className="text-muted-foreground leading-relaxed">{item.meanings.modernUsageNote}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Etymology & Root Analysis */}
        <section className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm">
          <h2 className="text-xl font-serif font-semibold text-foreground border-b border-border pb-3 mb-4">
            Sanskrit Root & Grammatical Derivation
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {item.etymology.sanskritRoot && (
              <div>
                <dt className="text-xs text-muted-foreground font-medium">Sanskrit Root</dt>
                <dd className="text-foreground font-serif font-semibold text-base">{item.etymology.sanskritRoot}</dd>
              </div>
            )}
            {item.etymology.rootMeaning && (
              <div>
                <dt className="text-xs text-muted-foreground font-medium">Root Meaning</dt>
                <dd className="text-foreground font-medium">{item.etymology.rootMeaning}</dd>
              </div>
            )}
            {item.etymology.grammaticalNotes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground font-medium">Grammatical Notes</dt>
                <dd className="text-muted-foreground">{item.etymology.grammaticalNotes}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* 4. Scriptural Attestation & Citations */}
        {item.citations.length > 0 && (
          <section className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-semibold text-foreground border-b border-border pb-3">
              Scriptural Attestation & Primary Citations
            </h2>
            <div className="space-y-4">
              {item.citations.map((cite, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary mb-2">
                    <span>{cite.bookOrParva}</span>
                    <span>{cite.sectionOrVerse}</span>
                  </div>
                  {cite.sanskritSnippetSa && (
                    <blockquote className="font-serif text-base text-foreground mb-2 italic">
                      “{cite.sanskritSnippetSa}”
                    </blockquote>
                  )}
                  {cite.translationEn && (
                    <p className="text-sm text-foreground/90 mb-2">
                      {cite.translationEn}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <strong>Evidence Note:</strong> {cite.verifiableNote}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Internal Knowledge Graph Connections */}
        <section className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-semibold text-foreground border-b border-border pb-3">
            Knowledge Graph Connections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {entity && (
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium block mb-1">Authoritative Character Profile</span>
                <Link
                  href={`/encyclopedia/person/${entity.slug}`}
                  className="font-serif font-bold text-primary hover:underline text-base"
                >
                  {entity.name} in the Divine Encyclopedia &rarr;
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {entity.summary}
                </p>
              </div>
            )}

            {item.relatedGitaVerseIds && item.relatedGitaVerseIds.length > 0 && (
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium block mb-1">Related Bhagavad Gita Verses</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.relatedGitaVerseIds.map((vId) => {
                    const parts = vId.replace("bg.", "").split(".");
                    return (
                      <Link
                        key={vId}
                        href={`/verse/${parts[0]}/${parts[1]}`}
                        className="px-2.5 py-1 rounded bg-background border border-border text-xs font-medium text-foreground hover:border-primary"
                      >
                        BG {parts[0]}.{parts[1]} &rarr;
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Related & Alternate Names */}
        <section className="p-6 rounded-2xl border border-border bg-card shadow-sm">
          <h2 className="text-xl font-serif font-semibold text-foreground border-b border-border pb-3 mb-4">
            Related Names & Alternate Spellings
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {item.alternateSpellings.map((alt) => (
              <span key={alt} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                {alt}
              </span>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
