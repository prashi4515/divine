import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Eye, Cookie, FileText, Lock } from "lucide-react";
import { SiteHeader } from "@/features/reading/site-header";
import { SiteFooter } from "@/features/reading/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for Bhagavad Gita Online. Learn how visitor information, cookies, analytics, and advertising preferences are handled.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Privacy Policy" },
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
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Legal & Transparency
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Last updated: August 19, 2026
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="page-gutter mx-auto max-w-4xl py-12 md:py-16 space-y-10 text-foreground">
          <section className="space-y-4">
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              At <strong>Bhagavad Gita Online</strong> (accessible from{" "}
              <a href="https://www.bagavadgitaonline.com" className="text-saffron font-medium hover:underline">
                https://www.bagavadgitaonline.com
              </a>
              ), we prioritize the privacy and trust of our visitors. This Privacy Policy document outlines the types of information collected and recorded by Bhagavad Gita Online and how we use it.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-saffron" aria-hidden />
              1. Information We Collect
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Voluntary Information:</strong> When you voluntarily contact us via email or our feedback forms, we receive the information you choose to provide, such as your name, email address, message category, and message text.
              </p>
              <p>
                <strong>Automatically Collected Log Data:</strong> Like most standard websites, our web servers automatically collect standard technical log information when you navigate the site. This includes your Internet Protocol (IP) address, browser type, operating system, referring pages, date/time stamps, and page request counts. This data is non-personally identifiable and is used solely for server security diagnostics, traffic analysis, and system maintenance.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <Cookie className="h-5 w-5 text-saffron" aria-hidden />
              2. Cookies & Local Storage
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Bhagavad Gita Online uses cookies and browser local storage to enhance your reading experience.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Preferences & Reader Settings:</strong> Storing your preferred reading language (e.g. Sanskrit, English, Hindi, Telugu, Tamil, Kannada, Malayalam, Odia) and font display options so you do not have to reselect them on every page visit.
                </li>
                <li>
                  <strong>Session State:</strong> Remembering session preferences if you create an account or save reading history.
                </li>
              </ul>
              <p>
                You can choose to disable or clear cookies through your individual browser options. Refer to your browser&apos;s help documentation to manage cookie settings.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-saffron" aria-hidden />
              3. Analytics & Advertising Services (Google AdSense)
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Analytics:</strong> We may utilize privacy-friendly analytics services (such as Google Analytics) to monitor aggregate traffic patterns, popular chapter destinations, and search queries to improve overall site usability and content quality.
              </p>
              <p>
                <strong>Google AdSense & Advertising Policy:</strong> Bhagavad Gita Online may use third-party advertising services such as Google AdSense. If advertising is enabled, these services may use cookies, web beacons, or similar technologies to serve, measure, and personalize advertising as permitted by applicable policies and user choices.
              </p>
              <p>
                Third-party ad vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites on the internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site or other sites on the Internet.
              </p>
              <p>
                Users may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-saffron font-medium hover:underline"
                >
                  Google Ads Settings
                </a>{" "}
                or by visiting{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-saffron font-medium hover:underline"
                >
                  www.aboutads.info
                </a>.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-saffron" aria-hidden />
              4. Data Security & Retention
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We employ industry-standard security protocols, including HTTPS encryption for all browser traffic, to protect your browsing sessions. We do not sell, trade, or rent personal identification information to third parties.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              5. Children&apos;s Privacy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bhagavad Gita Online does not knowingly collect personal identifiable information from children under the age of 13. Our website is an educational text reference suitable for general audiences. If you believe your child has provided personal information on our website, please contact us immediately so we can remove such data.
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              6. Changes to This Privacy Policy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to update this Privacy Policy periodically. Any modifications will be posted directly on this page with an updated revision date.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-border/70 bg-muted/40 p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              7. Contact Us
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions or feedback regarding this Privacy Policy, please contact us by email at{" "}
              <a href={`mailto:${contactEmail}`} className="text-saffron font-medium hover:underline">
                {contactEmail}
              </a>{" "}
              or through our{" "}
              <Link href="/contact" className="text-saffron font-medium hover:underline">
                Contact Page
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
