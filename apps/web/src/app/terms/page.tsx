import type { Metadata } from "next";
import Link from "next/link";
import { Scale, BookOpen, AlertTriangle, FileCheck, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description:
    "Terms of Use for Bhagavad Gita Online. Guidelines for accessing and using our educational scripture platform, atlas, and reference tools.",
  path: "/terms",
});

export default function TermsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Terms of Use" },
  ];

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "contact@bagavadgitaonline.com";

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/60 bg-muted/20 py-10 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
            style={{
              background: `
                radial-gradient(ellipse 60% 80% at 20% 0%, hsl(var(--saffron) / 0.12), transparent 60%),
                radial-gradient(ellipse 50% 60% at 85% 100%, hsl(var(--gold) / 0.08), transparent 50%)
              `,
            }}
          />
          <div className="page-gutter mx-auto max-w-4xl">
            <Breadcrumbs items={crumbs} className="mb-4" />
            <p className="text-saffron mb-2.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Legal & Governance
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Terms of Use
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Last updated: August 19, 2026
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="page-gutter mx-auto max-w-4xl py-12 md:py-16 space-y-10 text-foreground">
          <section className="space-y-4">
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Welcome to <strong>Bhagavad Gita Online</strong> (accessible at{" "}
              <a href="https://www.bagavadgitaonline.com" className="text-saffron font-medium hover:underline">
                https://www.bagavadgitaonline.com
              </a>
              ). By accessing or using this website, you agree to comply with and be bound by the following Terms of Use. Please review them carefully before using our services.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-saffron" aria-hidden />
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing, browsing, or reading content on Bhagavad Gita Online, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, you should discontinue use of the site.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-saffron" aria-hidden />
              2. Educational & Informational Purpose
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The content provided on Bhagavad Gita Online—including Sanskrit shlokas, English and Indic translations, word-by-word meanings, historical commentaries, maps, event timelines, and genealogy trees—is presented strictly for educational, cultural, research, and non-commercial personal study.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              3. Intellectual Property & Rights
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Public Domain Textual Sources:</strong> Classical Sanskrit shlokas from the Bhagavad Gita and ancient scriptural verses belong to public cultural heritage.
              </p>
              <p>
                <strong>Site Original Content:</strong> Custom website code, database compilations, UI designs, vector maps, original commentary arrangements, and interactive visual modules created by Bhagavad Gita Online are protected by applicable intellectual property and copyright laws.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-saffron" aria-hidden />
              4. Permitted Use & Prohibited Activities
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Permitted Use:</strong> You are granted a limited, revocable, non-exclusive right to access, read, link to, bookmark, and quote short excerpts of content for personal, scholarly, non-commercial, or educational purposes.
              </p>
              <p>
                <strong>Prohibited Activities:</strong> You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Engage in automated scraping or data harvesting that overloads or disrupts server performance.</li>
                <li>Attempt to bypass security controls, reverse-engineer site software, or gain unauthorized access to server infrastructure.</li>
                <li>Distribute malicious code, viruses, or harmful scripts through the website.</li>
                <li>Misrepresent site content or claim false affiliation with Bhagavad Gita Online.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-saffron" aria-hidden />
              5. Disclaimer of Warranties & Availability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website and all content are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied. While we strive for historical, textual, and geographic accuracy, Bhagavad Gita Online does not guarantee that the site will be error-free, uninterrupted, or completely free of technical bugs.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              6. Limitation of Liability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, Bhagavad Gita Online and its operators shall not be liable for any direct, indirect, incidental, consequential, or special damages resulting from your use of, or inability to use, this website or its contents.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              7. External Links
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our pages may contain links to third-party websites or scholarly resources. These links are provided solely for convenience. We do not control or endorse external sites and are not responsible for their content or privacy practices.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              8. Modifications to Terms
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to revise or update these Terms of Use at any time. Modified terms take effect immediately upon being published on this page. Your continued use of the website following any changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-border/70 bg-muted/40 p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              9. Contact Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions regarding these Terms of Use, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-saffron font-medium hover:underline">
                {contactEmail}
              </a>{" "}
              or via our{" "}
              <Link href="/contact" className="text-saffron font-medium hover:underline">
                Contact Form
              </Link>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={[breadcrumbJsonLd(crumbs)]} />
    </div>
  );
}
