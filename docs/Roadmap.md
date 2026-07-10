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
- ✅ Frontend initialized (Next.js 15, Tailwind, shadcn/ui, dark mode, landing placeholder).
- ✅ Backend foundation (NestJS, Prisma, Swagger, health, logging, Docker).
- ✅ Neon PostgreSQL connection verified.
- _TODO — update as milestones complete._

## Phase P0 — Foundation

- ✅ Monorepo, web shell, API foundation, DB connection.
- ⏳ Shared `packages/types` wired into web + api.
- ⏳ First domain schema + migration.
- ⏳ Locale-first routing scaffolding.

## Phase P1 — Accounts & Personalization

- ⏳ JWT authentication.
- ⏳ Bookmarks.
- ⏳ Notes.
- ⏳ Reading plans.
- _TODO — acceptance criteria per feature._

## Phase P2 — Enrichment

- ⏳ Audio playback + CDN.
- ⏳ Google OAuth.
- ⏳ Redis caching.
- ⏳ Meilisearch + emotion-based search.

## Phase P3 — Intelligence & Mobile

- ⏳ AI Guru (RAG over content).
- ⏳ React Native / Expo apps consuming the same API.
- ❔ Service extraction (only if metrics demand).

## Milestones & Timeline

| Milestone | Target | Status |
| --------- | ------ | ------ |
| P0 complete | _TODO_ | 🚧 |
| P1 complete | _TODO_ | ⏳ |
| P2 complete | _TODO_ | ⏳ |
| P3 complete | _TODO_ | ⏳ |

## Non-Goals (for now)

- Microservices, GraphQL, event bus, micro-frontends.
- _TODO — confirm and expand._

## References

- See [Architecture](./Architecture.md).
