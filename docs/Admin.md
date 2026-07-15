# Admin CMS

> Internal content management UI for Divine. **Not** the public website.
> Most routes are still design placeholders. **Chapters** is read-only and
> backed by the live API (`GET /v1/chapters`).

## Access

- Base path: `/admin`
- `robots: noindex` on the admin layout
- Sidebar footer notes live Chapters wiring

## Information architecture

| Route | Purpose | Status |
| ----- | ------- | ------ |
| `/admin` | Dashboard — stats, activity, quick links | Design |
| `/admin/works` | Scripture corpora | Design |
| `/admin/chapters` | Chapter structure | **Live read-only** |
| `/admin/verses` | Verse catalog | Design |
| `/admin/translations` | Language × source meanings | Design |
| `/admin/languages` | BCP-47 catalog | Design |
| `/admin/topics` | Thematic taxonomy | Design |
| `/admin/emotions` | Emotion tags | Design |
| `/admin/settings` | CMS preferences (placeholders) | Design |

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
