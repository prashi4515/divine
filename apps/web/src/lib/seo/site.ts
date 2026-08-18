/**
 * Absolute site URL — never hardcode a production domain.
 * Prefer NEXT_PUBLIC_SITE_URL; fall back to Vercel preview URL or localhost.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${stripTrailingSlash(host)}`;
  }

  return "https://bagavadgitaonline.com";
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
