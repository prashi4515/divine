# Client bundle & public auth bootstrap

Audit of the public Bhagavad Gita surface (`/`, `/bhagavad-gita/*`, `/search`, `/scriptures/*`) after non-blocking auth work (2026-07-17).

## Auth bootstrap (non-blocking)

| Condition | Behavior |
|-----------|----------|
| No `divine_admin_session` cookie (and no client token storage) | Skip `/v1/auth/me` and `/v1/auth/refresh`. Status stays `unauthenticated`. |
| Session cookie present | First paint is immediate. Background: `/me`, then refresh on failure. `AccountLink` swaps Sign in → My Account when hydrated. |
| Public RSC | Never awaits auth. Root layout only reads the presence cookie to seed the client hint. |

`useSearchParams` was removed from `AuthProvider` (it forced a root Suspense boundary). Redirect `?next=` is handled only on the login page.

Barrel imports of `@/lib/api/services` were replaced with `@/lib/api/services/auth` so public auth UI does not pull admin `libraryService` / `usersService`.

## Admin isolation

Admin chrome (`AdminSidebar`, `AdminHeader`, `AdminCommandPalette`) lives only under `app/admin/layout.tsx`. Public layouts do not import `@/features/admin/*`.

## `"use client"` audit — public chrome

Imported into pages that use `SiteHeader` / reading shell:

| Component | Client? | Why |
|-----------|---------|-----|
| `Providers` / `AuthProvider` / `ThemeProvider` | Yes | Theme + auth context |
| `SiteHeader` | **No** (RSC shell) | Brand markup is server; islands hydrate separately |
| `HeaderGitaLink` | Yes | `useMessages` |
| `HeaderSearch` | Yes (lazy via `next/dynamic`) | Expand/suggest interactivity |
| `AccountLink` | Yes | `useOptionalAuth` — async navbar hydrate |
| `LanguageSwitcher` | Yes | Zustand + menu |
| `ThemeToggle` | Yes | `next-themes` |
| `SiteFooter` / `HomeHero` / chapter cards / verse reader | Yes | Mostly `useMessages` / reader state |
| `SectionHeading` | **No** | Presentational only |

## Bundle report (production `next build`, 2026-07-17)

Regenerate:

```bash
pnpm --filter @divine/web build
node apps/web/scripts/report-client-bundle.mjs
```

### Next.js First Load JS (route table)

| Route | First Load JS |
|-------|----------------|
| Shared by all | **102 kB** |
| `/`, `/bhagavad-gita` | **152 kB** |
| `/bhagavad-gita/chapter-*` | **189 kB** (verse reader) |
| `/search` | **156 kB** |
| `/login` | **148 kB** |
| `/admin` layout chrome | separate `app/admin/layout-*.js` (~26 kB) + shared |

### Largest client chunks (`.next/static/chunks`)

| File (hash varies) | Size | Role |
|--------------------|------|------|
| `framework-*.js` | ~185 KB | Next/React framework |
| `3177-*.js` / `567e3fde-*.js` | ~169 KB each | Shared app runtime |
| `main-*.js` | ~126 KB | App bootstrap |
| `polyfills-*.js` | ~110 KB | Browser polyfills |
| `8504-*.js` / `8575-*.js` / `1106-*.js` | ~50–55 KB | Shared feature modules (auth/theme/i18n/search helpers) |
| `app/admin/layout-*.js` | ~26 KB | **Admin-only** (not on public Gita first paint) |
| `app/search/page-*.js` | ~18 KB | Search page client |

Total static chunk files measured by the report script: **~1.43 MB** on disk (uncompressed; gzipped transfer is much smaller).

### Largest dependencies (client graph)

1. `next` / `react` / `react-dom` (framework + shared)
2. `zod` (auth + search client parse)
3. `next-themes`
4. `@radix-ui/react-*` (menus / dialogs where used)
5. `lucide-react` (tree-shaken icons)
6. `zustand` (reading language)
7. `@divine/types` (Zod schemas pulled by client services)

### What causes hydration on public pages

1. Root `Providers` (`ThemeProvider` + `AuthProvider`) — does **not** block RSC HTML
2. Header islands: `HeaderSearch` (dynamic), `AccountLink`, `LanguageSwitcher`, `ThemeToggle`, `HeaderGitaLink`
3. Page clients: `HomeHero`, chapter cards, `VerseReader`, search page client

### Lazy-load opportunities (follow-up; functionality unchanged in this pass)

1. Load autocomplete + `verseSearchService.suggest` only after the search icon expands
2. Per-locale dynamic import for `messages` tables
3. Split verse-reader extras (related reading) behind viewport / interaction
4. Keep admin library clients out of any public barrel (already isolated by route)

## Verification checklist

- [ ] Anonymous visit to `/bhagavad-gita/chapter-2`: Network tab shows **no** `/v1/auth/me` or `/v1/auth/refresh`
- [ ] Signed-in visit: page HTML paints; then `/me` (and refresh only if needed); navbar updates without blocking content
- [ ] Login with `?next=/account` still redirects correctly
- [ ] `/admin` still loads command palette + sidebar only under admin layout
