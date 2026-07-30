# Roadmap

> Delivery phases for the Divine platform. Architecture is built once;
> product capability is layered on top.

## Status Legend

- ✅ Done
- 🚧 In progress
- ⏳ Planned
- ❔ Under consideration

## Current State

- ✅ Monorepo skeleton (pnpm workspaces).
- ✅ Frontend initialized (Next.js 15, Tailwind, shadcn/ui, dark mode).
- ✅ Backend foundation (NestJS, Prisma, Swagger, health, logging, Docker).
- ✅ Neon PostgreSQL connection verified.
- ✅ P0 content catalog schema + seed (languages, work `bg`, sources, topics, emotions).
- ✅ Works API + homepage fetch.
- ✅ Content import framework (`tooling/content-import`).
- ✅ Chapters API + admin read-only list.
- ✅ Public Gita reading shell + static chapter reader.
- ✅ Genealogy explorer (citation-first corpus).
- ✅ **Knowledge Graph Phase 1** — shared Zod entities/relations, Encyclopedia UI, Genealogy adapter, Gita related-entities rail. See [Knowledge-Graph](./Knowledge-Graph.md).
- ⏳ Locale-first routing scaffolding.

## Phase P0 — Foundation

- ✅ Monorepo, web shell, API foundation, DB connection.
- ✅ Shared `packages/types` wired into web + api (works + chapters).
- ✅ First domain schema + migration.
- ✅ Content import pipeline (reusable; Gita load deferred).
- ✅ Chapters read API + admin list.
- ⏳ Locale-first routing scaffolding.

## Phase KG1 — Knowledge Graph + Encyclopedia (now)

- ✅ `@divine/types` knowledge schemas (entity, relation, collection, citation) + fixture tests.
- ✅ Static corpus under `content/knowledge/` + migrate/rebuild/validate scripts.
- ✅ Genealogy migrated onto shared entities/relations (adapter keeps `/genealogy/*`).
- ✅ Encyclopedia routes + entity pages + React Flow ego graph + SEO/JSON-LD/sitemap.
- ✅ Gita chapter related-entities rail + mixed entity/verse search suggest.
- ⏳ Prisma `KnowledgeEntity` / `KnowledgeRelation` tables (document only in Phase 1).

## Phase KG2 — Atlas / Timeline

- ✅ Atlas Phase 1 — SVG Mahābhārata map (`/atlas`), shared place entities, travel routes, SEO place pages.
- ✅ Atlas 2.0 architecture — data/renderer split, kingdom polygons JSON, layers, icon tokens, clustering, semantic zoom, swappable placeholder renderer (`docs/Atlas.md`).
- ✅ Kingdoms module (`/kingdoms`) — capitals, rulers, cities, battles, timeline from shared KG JSON.
- ✅ Weapons module (`/weapons`) — categorized Mahābhārata arsenal (astras, bows, maces, …) with broader-Hindu arms clearly marked; `entity.weapon` meta.
- ✅ Concepts module (`/concepts`) — definition, meaning, etymology, verses, chapters, characters, events, examples, related concepts from shared KG JSON.
- ✅ Related Content Engine — weighted graph traversal recommendations on every entity surface.
- ✅ Interactive Timeline — era columns, filters, zoom, event cards, deep links (not a static strip).
- ⏳ Learning Center as additional consumer of the shared model.
- ⏳ Illustrated Atlas plate (renderer pack) + Rāmāyaṇa / other-era atlas layers.

## Phase P1 / 1.5 — Accounts & session foundation

- ✅ JWT access + refresh tokens, HttpOnly cookies, remember-me.
- ✅ Email signup, login, logout, forgot/reset password.
- ✅ Email verification via Resend (`DIVINE_RESEND_API_KEY`).
- ✅ Device sessions list + revoke + logout-all.
- ✅ User profile + reading preferences (persisted, restored after login).
- ✅ Shared auth contracts in `packages/types`.
- ✅ Rate limiting (Throttler) + audit logs for auth events.
- ⏳ Bookmarks / notes / highlights (Phase 2 engagement).
- ⏳ Reading plans, Verse of the Day, push notifications.

**Next after search:** engagement (bookmarks/notes) + Meilisearch when scale needs it. Public Knowledge Search uses a build-time static JSON index (no Neon); Neon remains for user-specific history only.

## Phase P2 — Enrichment

- ⏳ Audio playback + CDN.
- ⏳ Google OAuth.
- ⏳ Redis caching.
- ✅ Intelligent multilingual Gita search (Postgres `SearchEngine`, synonyms/fuzzy/topics/UI at `/search`).
- ✅ Global Knowledge Search — static index (`generate:search-index`), grouped results, aliases/Sanskrit/fuzzy; Neon only for user search history.
- ⏳ Optional Meilisearch/Typesense adapter behind the same `SearchEngine` contract.

## Phase P3 — Intelligence & Mobile

- ⏳ AI Guru (RAG over content + knowledge graph).
- ⏳ React Native / Expo apps consuming the same API.
- ❔ Service extraction (only if metrics demand).

## Milestones & Timeline

| Milestone | Target | Status |
| --------- | ------ | ------ |
| P0 complete | _TODO_ | 🚧 |
| KG1 Encyclopedia | Phase 1 | ✅ |
| Atlas Phase 1 (Mahābhārata) | Phase 1 | ✅ |
| KG2 Timeline / more eras | Phase 2 | ⏳ |
| P1 complete | _TODO_ | ⏳ |
| P2 complete | _TODO_ | ⏳ |
| P3 complete | _TODO_ | ⏳ |

## Non-Goals (for now)

- Microservices, GraphQL, event bus, micro-frontends.
- Inventing unverified knowledge-graph edges to fill density.

## References

- See [Architecture](./Architecture.md).
- See [Knowledge-Graph](./Knowledge-Graph.md).
