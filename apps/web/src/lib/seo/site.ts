export const CANONICAL_SITE_URL = "https://bagavadgitaonline.com";

/**
 * Absolute site URL — hardcoded canonical production domain.
 * Overridable ONLY via explicit NEXT_PUBLIC_SITE_URL (e.g. for local dev testing).
 * Never derives from VERCEL_URL or preview deployment host environment variables.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  return CANONICAL_SITE_URL;
}

export function stripTrailingSlash(url: string): string {
  if (url.length > 1 && url.endsWith("/")) return url.slice(0, -1);
  return url;
}

/** Normalize a path to leading slash, no trailing slash (except `/`). */
export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return stripTrailingSlash(withSlash.split("?")[0]!.split("#")[0]!);
}

/** Absolute URL for a path. Paths are normalized; never duplicate slashes. */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = normalizePath(path);
  if (normalized === "/") return base;
  return `${base}${normalized}`;
}
