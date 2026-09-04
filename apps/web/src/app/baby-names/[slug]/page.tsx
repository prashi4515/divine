import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { getAllBabyNames, getBabyNameBySlug, getBabyNameById } from "@/lib/baby-names/store";
import { getEntity } from "@/lib/knowledge/store";
import { babyNameSeo } from "@/lib/seo/titles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/knowledge/seo";
import { NAME_CLASSIFICATION_LABELS, type BabyNameRecord } from "@/lib/knowledge/types";

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
      item.primaryScripture,
      item.nameSaDevanagari,
      item.nameIAST,
      item.genderUsage
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

  // Resolve related names
  const relatedNamesRaw = await Promise.all(
    (item.relatedNameIds || []).map((id) => getBabyNameById(id).catch(() => null))
  );
  const relatedNames = relatedNamesRaw.filter((r): r is BabyNameRecord => r !== null);

  const canonicalUrl = `https://bagavadgitaonline.com/baby-names/${item.slug}`;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Baby Names", href: "/baby-names" },
    { name: item.nameEn },
  ];

  // Schema.org DefinedTerm & ItemPage JSON-LD
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
    url: canonicalUrl,
    ...(entity ? { sameAs: [`https://bagavadgitaonline.com/encyclopedia/person/${entity.slug}`] } : {}),
  };

  const itemPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: `${item.nameEn} Name Meaning, Sanskrit Spelling & Origin`,
    description: item.meanings.primaryMeaning,
    url: canonicalUrl,
    mainEntity: {
      "@type": "DefinedTerm",
      name: item.nameEn,
      description: item.meanings.primaryMeaning,
      inDefinedTermSet: "https://bagavadgitaonline.com/baby-names"
    }
  };

  const isDictionarySource = (src?: string) =>
    !src || /cologne|monier|lexicon|dictionary/i.test(src);

  const isDict = isDictionarySource(item.primaryScripture);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd(crumbs),
            definedTermJsonLd,
            itemPageJsonLd,
          ]),
        }}
      />

      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Crawlable Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/baby-names" className="hover:underline">Baby Names</Link>
          <span>/</span>
          <Link href={`/baby-names/${item.genderUsage}`} className="hover:underline capitalize">{item.genderUsage} Names</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{item.nameEn}</span>
        </nav>

        {/* Primary Page Header & H1 */}
        <header className="mb-8 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Link
              href={`/baby-names/${item.genderUsage}`}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider capitalize hover:bg-primary/20 transition-colors"
            >
              {item.genderUsage} Baby Name
            </Link>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {NAME_CLASSIFICATION_LABELS[item.classification]}
            </span>
            {item.primaryScripture && !isDict && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                {item.primaryScripture}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 tracking-tight">
            {item.nameEn} Name Meaning
          </h1>

          {/* Prominent Search-Intent Direct Answer Box */}
          <div className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-foreground text-base sm:text-lg leading-relaxed font-sans mb-6">
            <p className="font-medium">
              <strong className="font-semibold text-primary">{item.nameEn}</strong> is a verified{" "}
              <span className="capitalize">{item.genderUsage}</span> name of Sanskrit origin meaning{" "}
              <span className="font-semibold text-foreground">“{item.meanings.primaryMeaning}”</span>. In Sanskrit Devanagari script it is written as{" "}
              <strong className="font-serif text-amber-900 dark:text-amber-200">{item.nameSaDevanagari}</strong> and transliterated as{" "}
              <strong className="font-serif text-amber-900 dark:text-amber-200">{item.nameIAST}</strong>.
            </p>
          </div>

          {/* Key Name Details Overview Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-border/80">
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Name</span>
              <span className="text-foreground font-semibold text-sm">{item.nameEn}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Sanskrit</span>
              <span className="text-foreground font-serif font-bold text-base">{item.nameSaDevanagari}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium uppercase tracking-wider text-[10px]">IAST Transliteration</span>
              <span className="text-foreground font-serif font-semibold text-sm">{item.nameIAST}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5 font-medium uppercase tracking-wider text-[10px]">Gender</span>
              <span className="text-foreground font-semibold text-sm capitalize">{item.genderUsage}</span>
            </div>
          </div>
        </header>

        {/* Section: Spelling & Transliteration */}
        <section aria-labelledby="spelling-heading" className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 id="spelling-heading" className="text-xl font-serif font-bold text-foreground border-b border-border pb-3">
            {item.nameEn} – Sanskrit Spelling &amp; Transliteration
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The name <strong>{item.nameEn}</strong> originates from Sanskrit. Below are the verified Devanagari script, IAST transliteration, and alternate spellings:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">English Spelling</span>
                <span className="text-lg font-bold text-foreground">{item.nameEn}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Sanskrit / Devanagari</span>
                <span className="text-xl font-bold font-serif text-foreground">{item.nameSaDevanagari}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">IAST Transliteration</span>
                <span className="text-base font-semibold font-serif text-foreground">{item.nameIAST}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Pronunciation Guide</span>
                <span className="text-sm font-medium text-foreground">{item.nameIAST} (Sanskrit: {item.nameSaDevanagari})</span>
              </div>
            </div>
          </div>

          {item.alternateSpellings && item.alternateSpellings.length > 0 && (
            <div className="pt-3 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Verified Alternative English Spellings
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {item.alternateSpellings.map((alt) => (
                  <span key={alt} className="px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section: Meaning & Etymology */}
        <section aria-labelledby="meaning-heading" className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 id="meaning-heading" className="text-xl font-serif font-bold text-foreground border-b border-border pb-3">
            What Does {item.nameEn} Mean?
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground text-base mb-1">Primary Lexical Meaning</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {item.meanings.primaryMeaning}
              </p>
            </div>

            {item.meanings.literalSanskrit && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Literal Sanskrit Meaning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.meanings.literalSanskrit}
                </p>
              </div>
            )}

            {item.meanings.traditionalInterpretation && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Traditional Interpretation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.meanings.traditionalInterpretation}
                </p>
              </div>
            )}

            {(item.etymology.sanskritRoot || item.etymology.rootMeaning || item.etymology.grammaticalNotes) && (
              <div className="pt-3 border-t border-border/60">
                <h3 className="font-semibold text-foreground mb-2">Etymology &amp; Sanskrit Root Analysis</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-4 rounded-xl border border-border/60">
                  {item.etymology.sanskritRoot && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Sanskrit Root / Term</dt>
                      <dd className="text-foreground font-serif font-bold text-sm">{item.etymology.sanskritRoot}</dd>
                    </div>
                  )}
                  {item.etymology.rootMeaning && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Root Meaning</dt>
                      <dd className="text-foreground font-medium">{item.etymology.rootMeaning}</dd>
                    </div>
                  )}
                  {item.etymology.grammaticalNotes && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground font-medium">Grammatical Notes</dt>
                      <dd className="text-muted-foreground leading-relaxed">{item.etymology.grammaticalNotes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {item.meanings.modernUsageNote && (
              <div className="pt-3 border-t border-border/60">
                <h3 className="font-semibold text-foreground mb-1">Modern Usage &amp; Cultural Context</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.meanings.modernUsageNote}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section: Scriptural & Historical Context */}
        <section aria-labelledby="scripture-heading" className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 id="scripture-heading" className="text-xl font-serif font-bold text-foreground border-b border-border pb-3">
            Scriptural &amp; Historical Context
          </h2>

          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              The name <strong>{item.nameEn}</strong> is classified as{" "}
              <strong className="text-foreground">{NAME_CLASSIFICATION_LABELS[item.classification]}</strong>
              {item.primaryScripture && !isDict ? (
                <> with primary attestation in the <strong className="text-foreground">{item.primaryScripture}</strong>.</>
              ) : (
                <> within traditional Sanskrit literature.</>
              )}
            </p>

            {item.meanings.characterContext && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
                <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1 text-primary">
                  Character &amp; Scriptural Usage Note
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.meanings.characterContext}
                </p>
              </div>
            )}

            {/* Knowledge Graph Connections */}
            {(entity || (item.relatedGitaVerseIds && item.relatedGitaVerseIds.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {entity && (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Authoritative Character Profile</span>
                    <Link
                      href={`/encyclopedia/person/${entity.slug}`}
                      className="font-serif font-bold text-primary hover:underline text-base"
                    >
                      {entity.name} in Divine Encyclopedia &rarr;
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entity.summary}
                    </p>
                  </div>
                )}

                {item.relatedGitaVerseIds && item.relatedGitaVerseIds.length > 0 && (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Related Bhagavad Gita Verses</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.relatedGitaVerseIds.map((vId) => {
                        const parts = vId.replace("bg.", "").split(".");
                        return (
                          <Link
                            key={vId}
                            href={`/verse/${parts[0]}/${parts[1]}`}
                            className="px-2.5 py-1 rounded bg-muted border border-border text-xs font-medium text-foreground hover:border-primary transition-colors"
                          >
                            BG {parts[0]}.{parts[1]} &rarr;
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section: Sources & Textual Evidence */}
        {item.citations && item.citations.length > 0 && (
          <section aria-labelledby="sources-heading" className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h2 id="sources-heading" className="text-xl font-serif font-bold text-foreground border-b border-border pb-3">
              Sources &amp; Textual Evidence
            </h2>
            <p className="text-xs text-muted-foreground">
              Verified citations and textual references for <strong>{item.nameEn}</strong>:
            </p>
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
                    <strong>Verifiable Evidence Note:</strong> {cite.verifiableNote}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Related Baby Names & Directory Internal Links */}
        <section aria-labelledby="related-names-heading" className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 id="related-names-heading" className="text-xl font-serif font-bold text-foreground border-b border-border pb-3">
            Related Sanskrit Baby Names
          </h2>

          {relatedNames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {relatedNames.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/baby-names/${rel.slug}`}
                  className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/60 hover:border-primary/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-foreground group-hover:text-primary transition-colors text-base">
                        {rel.nameEn}
                      </span>
                      <span className="text-xs font-serif text-muted-foreground">
                        {rel.nameSaDevanagari}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {rel.meanings.primaryMeaning}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between">
                    <span className="capitalize">{rel.genderUsage}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">Meaning &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Explore more verified Sanskrit and scripture baby names in our directory.
            </p>
          )}

          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <Link
              href="/baby-names"
              className="font-semibold text-primary hover:underline flex items-center gap-1"
            >
              &larr; Back to Baby Names Directory
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/baby-names/${item.genderUsage}`}
                className="px-3 py-1 rounded-full bg-muted border border-border text-foreground hover:border-primary transition-colors capitalize"
              >
                More {item.genderUsage} Names
              </Link>
              <Link
                href="/baby-names/sanskrit"
                className="px-3 py-1 rounded-full bg-muted border border-border text-foreground hover:border-primary transition-colors"
              >
                All Sanskrit Names
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
