import type { Metadata } from "next";
import { Mail, MessageSquare, Sparkles, LifeBuoy } from "lucide-react";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Bhagavad Gita Online. Contact us for questions, content corrections, broken links, or site feedback.",
  path: "/contact",
});

export default function ContactPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Contact" },
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
          <div className="page-gutter mx-auto max-w-5xl">
            <Breadcrumbs items={crumbs} className="mb-4" />
            <p className="text-saffron mb-2.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Reach Out to Us
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Contact & Feedback
            </h1>
            <p className="mt-4 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              We welcome your suggestions, content corrections, broken link reports, and general feedback as we continuously refine Bhagavad Gita Online.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="page-gutter mx-auto max-w-5xl py-12 md:py-16 space-y-12">
          {/* Contact Categories Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                <MessageSquare className="h-4 w-4" aria-hidden />
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                Content Corrections
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found a typo or error in Sanskrit shlokas, transliteration, or translations? Let us know so we can update it promptly.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                <LifeBuoy className="h-4 w-4" aria-hidden />
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                Technical Support
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Report broken links, map loading issues in the Atlas, display bugs, or accessibility concerns across mobile and desktop.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                <Mail className="h-4 w-4" aria-hidden />
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                Direct Email
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You can write to us directly at{" "}
                <a href={`mailto:${contactEmail}`} className="text-saffron font-medium hover:underline">
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Contact Form Section */}
          <ContactForm contactEmail={contactEmail} />
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={[breadcrumbJsonLd(crumbs)]} />
    </div>
  );
}
