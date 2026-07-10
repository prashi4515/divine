# SEO

> Search-engine optimization strategy for the Divine website. SEO is a
> first-class architectural concern, not an afterthought.

## 1. Goals

- Rank for verse, chapter, and theme queries across multiple Indian languages.
- Fast, crawlable, shareable pages for every verse.
- _TODO — target keywords and priority locales._

## 2. Rendering Strategy

- **SSG/ISR** for public content (verses, chapters) — fast TTFB, cacheable.
- **SSR** only where dynamic.
- **CSR** reserved for interactive, authenticated UI.
- _TODO — per-route rendering matrix._

## 3. URL Structure

- Locale-first: `/{locale}/chapter/{chapter}/verse/{verse}`.
- Stable verse identifiers independent of language.
- _TODO — finalize slug rules and trailing-slash policy._

## 4. Internationalization & hreflang

- `hreflang` tags for every locale variant of a page.
- Canonical URLs to avoid duplicate-content penalties.
- _TODO — locale list and default/fallback behavior._

## 5. Metadata

- Next.js Metadata API per page: title, description, canonical, Open Graph, Twitter cards.
- _TODO — metadata templates per page type._

## 6. Structured Data (Schema.org)

- _TODO — JSON-LD for articles/quotations/breadcrumbs._

## 7. Sitemaps & robots.txt

- Per-locale sitemaps, sitemap index.
- _TODO — generation approach and `robots.txt` rules._

## 8. Performance & Core Web Vitals

- Targets: LCP, CLS, INP within "good" thresholds.
- Font strategy: `next/font` with `display: swap` (already configured).
- _TODO — image optimization and budget definitions._

## 9. Social Sharing

- _TODO — OG image generation for verses._

## 10. Measurement

- _TODO — Search Console, analytics, indexing monitoring._

## References

- See [Architecture](./Architecture.md), [UI](./UI.md).
