# Admin CMS

> Internal content management UI for Divine. **Not** the public website.
> Current milestone: **design / layout only** — no API, database, or CRUD.

## Access

- Base path: `/admin`
- `robots: noindex` on the admin layout
- Footer note in sidebar: “Design preview · no API”

## Information architecture

| Route | Purpose |
| ----- | ------- |
| `/admin` | Dashboard — stats, activity, quick links |
| `/admin/works` | Scripture corpora |
| `/admin/chapters` | Chapter structure |
| `/admin/verses` | Verse catalog |
| `/admin/translations` | Language × source meanings |
| `/admin/languages` | BCP-47 catalog |
| `/admin/topics` | Thematic taxonomy |
| `/admin/emotions` | Emotion tags |
| `/admin/settings` | CMS preferences (placeholders) |

## UX decisions

Documented in the implementation PR / agent response; summary:

- Separated from marketing site via `/admin` route group layout (sidebar shell).
- Neutral SaaS chrome (Vercel/Linear/Notion): hairline borders, muted surfaces, no decorative gradients.
- Persistent sidebar on `md+`; sheet-style drawer on mobile.
- Breadcrumbs in sticky header for orientation.
- Disabled primary actions until APIs exist — honest empty product state.
- Tables show column contracts early so editors learn the data model.
- Loading skeletons demonstrated on Dashboard + Verses as static design samples.

## Out of scope (this phase)

- Auth / RBAC
- Prisma or Nest calls
- Mutations, forms that persist
- Public reader UI
