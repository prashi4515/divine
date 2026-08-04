import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
} from "@/lib/seo/config";
import { absoluteUrl, normalizePath } from "@/lib/seo/site";

export type PageMetadataInput = {
  /** Unique page title (without site template suffix when absoluteTitle). */
  title: string;
  description: string;
  /** Path only, e.g. `/atlas` — never a full domain. */
  path: string;
  /** Override Open Graph type. */
  type?: "website" | "article" | "profile" | "book";
  /** Absolute or site-relative image URL/path. */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  keywords?: string[];
  /** If true, do not apply root title template (use title as-is). */
  absoluteTitle?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

function resolveImage(image?: string): string {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

/** Clamp titles near ~60 chars when practical without cutting mid-word harshly. */
export function clampTitle(title: string, max = 60): string {
  const t = title.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.6) return `${cut.slice(0, lastSpace)}…`;
  return `${cut}…`;
}

export function clampDescription(description: string, max = 160): string {
  const d = description.trim().replace(/\s+/g, " ");
  if (d.length <= max) return d;
  const cut = d.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.7) return `${cut.slice(0, lastSpace)}…`;
  return `${cut}…`;
}

/**
 * Shared Metadata builder — every public page should use this.
 * Canonical + OpenGraph URL always derive from NEXT_PUBLIC_SITE_URL via absoluteUrl.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const path = normalizePath(input.path);
  const url = absoluteUrl(path);
  const title = clampTitle(input.title);
  const description = clampDescription(input.description);
  const image = resolveImage(input.image);
  const imageAlt = input.imageAlt ?? title;

  const ogType =
    input.type === "article" || input.type === "profile" || input.type === "book"
      ? "article"
      : "website";

  return {
    title: input.absoluteTitle
      ? { absolute: title }
      : title,
    description,
    keywords: input.keywords,
    alternates: { canonical: path },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(input.authors?.length ? { authors: input.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Dynamic OG image URL for a titled card. */
export function ogImageFor(opts: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}): string {
  const params = new URLSearchParams();
  params.set("title", opts.title);
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  if (opts.eyebrow) params.set("eyebrow", opts.eyebrow);
  return `/og?${params.toString()}`;
}
