# SEO

Production SEO for the Divine Bhagavad Gita platform (Next.js App Router).

## Principles

- Never hardcode a production domain. Use `NEXT_PUBLIC_SITE_URL` via `getSiteUrl()` / `absoluteUrl()`.
- One shared SEO module: `apps/web/src/lib/seo/`.
- Server Components + Metadata API only — no client-rendered meta tags.
- Preserve existing routes; clean aliases redirect to canonicals.

## Central module

| File | Role |
| ---- | ---- |
| `lib/seo/site.ts` | Site URL helpers |
| `lib/seo/config.ts` | Global defaults (`rootMetadata`) |
| `lib/seo/metadata.ts` | `buildPageMetadata` |
| `lib/seo/titles.ts` | Page-type titles/descriptions |
| `lib/seo/json-ld.ts` | Schema.org builders |
| `components/json-ld.tsx` | JSON-LD script |
| `components/breadcrumbs.tsx` | Visible breadcrumbs |

## Canonical routes (do not break)

| Surface | URL |
| ------- | --- |
| Home | `/` |
| Gita | `/bhagavad-gita` |
| Chapter | `/bhagavad-gita/chapter-{n}` |
| Verse (indexable) | `/verse/{chapter}/{verse}` |
| Search | `/search` (query does not create new canonicals) |
| Encyclopedia | `/encyclopedia/{kind}/{slug}` |
| Atlas / Events / … | `/{hub}`, `/{hub}/{slug}` |

### Aliases (308/301 → canonical)

- `/chapter/2` → `/bhagavad-gita/chapter-2`
- `/characters/krishna` → `/encyclopedia/person/krishna`

## Sitemaps & robots

- Split sitemaps via `generateSitemaps()` in `app/sitemap.ts`
- `app/robots.ts` references `absoluteUrl('/sitemap.xml')`

## Dynamic OG images

`/og?title=&subtitle=&eyebrow=` — referenced from metadata helpers.

## Verification

Set optional env vars:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
- `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`

## Trailing slash

`trailingSlash: false` in `next.config.ts`. Middleware lowercases paths and collapses `//`.
