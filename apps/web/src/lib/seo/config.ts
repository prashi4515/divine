/**
 * Single source of truth for site-wide SEO defaults.
 * Pages compose page-specific metadata via `buildPageMetadata`.
 */
import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

export const SITE_NAME = "Bhagavad Gita Online";
export const SITE_SHORT_NAME = "Divine";
export const SITE_TAGLINE = "The Song of God";

export const DEFAULT_TITLE =
  "Bhagavad Gita Online – Read All 18 Chapters with Meaning";

export const DEFAULT_DESCRIPTION =
  "Read the Bhagavad Gita online with Sanskrit shlokas, translations, word-by-word meaning, and commentary. Explore chapters, characters, Atlas, genealogy, and more.";

export const DEFAULT_KEYWORDS = [
  "Bhagavad Gita",
  "Bhagavad Gita online",
  "Gita chapters",
  "Sanskrit shloka",
  "Krishna",
  "Arjuna",
  "Mahabharata",
  "Hindu scripture",
  "Gita meaning",
  "Bhagavad Gita translation",
] as const;

/** Default OG/Twitter image path (dynamic OG can override per page). */
export const DEFAULT_OG_IMAGE_PATH = "/og?title=Bhagavad%20Gita%20Online";

export const SEO_VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined,
  yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION?.trim() || undefined,
} as const;

export function rootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s · ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: [...DEFAULT_KEYWORDS],
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [ogImage],
    },
    appleWebApp: {
      capable: true,
      title: SITE_SHORT_NAME,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    category: "religion",
    verification: {
      google: SEO_VERIFICATION.google,
      other: {
        ...(SEO_VERIFICATION.bing
          ? { "msvalidate.01": SEO_VERIFICATION.bing }
          : {}),
        ...(SEO_VERIFICATION.yandex
          ? { "yandex-verification": SEO_VERIFICATION.yandex }
          : {}),
      },
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

export function rootViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width" as const,
    initialScale: 1,
    viewportFit: "cover" as const,
  };
}
