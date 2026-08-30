import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
} from "@/lib/seo/config";
import { absoluteUrl } from "@/lib/seo/site";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { localizePath, normalizeCleanPath } from "@/lib/i18n/locales";

export type PageMetadataInput = {
  /** Unique page title. */
  title: string;
  description: string;
  /** Path only, e.g. `/atlas` or `/hi/atlas`. */
  path: string;
  /** Optional canonical path/URL override (e.g. `/privacy` for duplicate legal pages). */
  canonicalUrl?: string;
  /** Language for canonical, locale, and hreflang tagging. Defaults to 'en'. */
  lang?: ReadingLanguageCode;
  /** Override Open Graph type. */
  type?: "website" | "article" | "profile" | "book";
  /** Absolute or site-relative image URL/path. */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  noindex?: boolean;
  keywords?: string[];
  /** If true, do not apply root title template (use title as-is). */
  absoluteTitle?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

const OG_LOCALES: Record<ReadingLanguageCode, string> = {
  en: "en_US",
  sa: "sa_IN",
  hi: "hi_IN",
  te: "te_IN",
  kn: "kn_IN",
  ta: "ta_IN",
  ml: "ml_IN",
  or: "or_IN",
};

function resolveImage(image?: string): string {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

function clampWithoutEllipsis(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.5) {
    return cut.slice(0, lastSpace).trim();
  }
  return cut.trim();
}

/**
 * Format and pre-evaluate title tag as a complete string including site brand suffix.
 * Prevents ellipses (…), double-clamping, and duplicated site names in HTML output.
 */
export function formatCleanTitle(
  pageTitle: string,
  opts: { absoluteTitle?: boolean; siteName?: string; maxTotalLength?: number } = {},
): { title: { absolute: string }; fullTitleString: string } {
  const siteName = opts.siteName ?? SITE_NAME;
  const brandSuffix = ` · ${siteName}`;
  const maxTotal = opts.maxTotalLength ?? 65;

  let raw = pageTitle.trim();
  if (raw.endsWith(brandSuffix)) {
    raw = raw.slice(0, -brandSuffix.length).trim();
  } else if (raw.endsWith(` - ${siteName}`)) {
    raw = raw.slice(0, -(` - ${siteName}`.length)).trim();
  }

  if (opts.absoluteTitle) {
    const finalTitle = clampWithoutEllipsis(raw, maxTotal);
    return { title: { absolute: finalTitle }, fullTitleString: finalTitle };
  }

  const full = `${raw}${brandSuffix}`;
  if (full.length <= maxTotal) {
    return { title: { absolute: full }, fullTitleString: full };
  }

  const availableForPage = Math.max(15, maxTotal - brandSuffix.length);
  const clampedPage = clampWithoutEllipsis(raw, availableForPage);
  const finalFull = `${clampedPage}${brandSuffix}`;
  return { title: { absolute: finalFull }, fullTitleString: finalFull };
}

export function clampTitle(title: string, max = 70): string {
  return clampWithoutEllipsis(title, max);
}

export function clampDescription(description: string, max = 170): string {
  const d = description.trim().replace(/\s+/g, " ");
  return clampWithoutEllipsis(d, max);
}

/**
 * Shared Metadata builder — supports self-referencing canonicals and reciprocal hreflang clusters across all 8 languages.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const lang = input.lang ?? "en";
  const cleanPath = normalizeCleanPath(input.path);
  const canonicalPath = input.canonicalUrl
    ? normalizeCleanPath(input.canonicalUrl)
    : localizePath(cleanPath, lang);
  const canonicalUrl = absoluteUrl(canonicalPath);

  const titleObj = formatCleanTitle(input.title, {
    absoluteTitle: input.absoluteTitle,
  });

  const description = clampDescription(input.description);
  const image = resolveImage(input.image);
  const imageAlt = input.imageAlt ?? titleObj.fullTitleString;

  const ogType =
    input.type === "article" || input.type === "profile" || input.type === "book"
      ? "article"
      : "website";

  const isNoIndex = Boolean(input.noIndex || input.noindex);

  const isScriptureRoute = cleanPath.startsWith("/scriptures");

  const languages = isScriptureRoute
    ? {
        en: absoluteUrl(cleanPath),
        "x-default": absoluteUrl(cleanPath),
      }
    : {
        en: absoluteUrl(cleanPath),
        sa: absoluteUrl(localizePath(cleanPath, "sa")),
        hi: absoluteUrl(localizePath(cleanPath, "hi")),
        te: absoluteUrl(localizePath(cleanPath, "te")),
        kn: absoluteUrl(localizePath(cleanPath, "kn")),
        ta: absoluteUrl(localizePath(cleanPath, "ta")),
        ml: absoluteUrl(localizePath(cleanPath, "ml")),
        or: absoluteUrl(localizePath(cleanPath, "or")),
        "x-default": absoluteUrl(cleanPath),
      };

  return {
    title: titleObj.title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    robots: isNoIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: titleObj.fullTitleString,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[lang] ?? "en_US",
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(input.authors?.length ? { authors: input.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titleObj.fullTitleString,
      description,
      images: [image],
    },
  };
}

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
