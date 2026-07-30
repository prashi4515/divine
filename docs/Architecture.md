# Architecture

> System architecture for the Divine platform — a production-grade,
> multilingual Hindu Knowledge Graph Platform (Bhagavad Gita reading +
> Encyclopedia + Genealogy, designed to scale to Atlas, Timeline, and more).

## 1. Overview

- **Vision:** content-first, API-first, SEO-first **Knowledge Graph Platform** —
  interconnected persons, places, concepts and scriptures with citation-backed
  edges. The Bhagavad Gita reader is the first deep content surface; Encyclopedia
  is the canonical entity surface; Genealogy is a curated graph view.
- **Primary surface:** the website (SEO + discovery). Mobile apps and AI Guru are clients of the same API.
- **Guiding principle:** one shared entity/relation model — product features never fork parallel person/place datasets. See [Knowledge-Graph](./Knowledge-Graph.md).

## 2. Architectural Principles

- Shared domain contracts live in `packages/*` — never duplicated across apps.
- Knowledge entities use stable namespaced text IDs (`person.krishna`, `verse.bg.2.47`).
- Locale is a first-class dimension on every public content route.
- Read path is optimized for anonymous traffic; write path is isolated behind auth.
- Modular monolith until traffic or team size forces a split.
- Phase 1 knowledge corpus is static JSON shaped like future Prisma columns (hybrid storage).

## 3. System Topology

- **Clients:** Next.js web, future Android/iOS, future AI Guru UI.
- **Edge / CDN:** Vercel edge for HTML/ISR, CDN for audio/static.
- **Application:** NestJS modular monolith API.
- **Data plane:** Neon PostgreSQL (source of truth for accounts + future KG), Redis (later), Meilisearch (later), object storage/CDN for audio. Phase 1 KG reads from `apps/web/content/knowledge/`.

_TODO — insert topology diagram._

## 4. Monorepo Structure

```
divine/
├── apps/
│   ├── web/     # Next.js 15 (Gita, Encyclopedia, Genealogy)
│   └── api/     # NestJS
├── packages/
│   ├── ui/      # shared React components
│   ├── config/  # shared config presets
│   └── types/   # shared TS types / DTOs (incl. knowledge Zod)
└── docs/
```

- **Tooling:** pnpm workspaces (Turborepo planned).
- Dependency flow: `apps/* → packages/*` only. Web and API never import each other.

## 5. Backend Architecture (NestJS)

- Module-per-domain organization.
- Cross-cutting concerns: global `ValidationPipe`, global `AllExceptionsFilter`, pino logging.
- Data access isolated in `PrismaModule` / `PrismaService`.
- Future: Knowledge module for Prisma-backed entities (Phase 1 is web-static only).

## 6. Frontend Architecture (Next.js)

- App Router, Server Components by default.
- Locale-first routing (`/[locale]/...`) — _planned_.
- Public knowledge reads: SSG from static JSON via `lib/knowledge/store.ts`.
- Authenticated user data: client → API → Postgres.
- Public pages never block on auth: no `/me` or refresh without a session cookie; navbar hydrates asynchronously. See [Client-Bundle-Auth](./Client-Bundle-Auth.md).
- Admin chrome is scoped to `app/admin/layout.tsx` only.
- Feature folders: `features/reading`, `features/encyclopedia`, `features/genealogy`, `features/search`.

## 7. Data Flow

- Public content reads: SSG/ISR → optional API hydrate.
- Knowledge graph: content packs → `generate:knowledge` → validated JSON → store → Encyclopedia / Genealogy / Gita rails.
- Authenticated user data: client → API → Postgres.
- _TODO — add sequence diagrams per flow._

## 8. Cross-Cutting Concerns

- **Configuration:** Zod-validated env at boot.
- **Logging:** structured JSON (pino).
- **Error handling:** consistent error envelope.
- **Observability:** _TODO — metrics, tracing, error reporting plan._

## 9. Security Considerations

- Secrets never committed; `.env` gitignored.
- CORS limited to known web origin.
- _TODO — authz model, rate limiting, input hardening._

## 10. Architecture Decision Records (ADRs)

- ADRs live in `docs/adrs/` (to be created).
- _TODO — list initial ADRs (public IDs, monorepo tooling, modular monolith, locale-first URLs)._

## 11. Open Questions

- _TODO — capture unresolved architectural questions._

## References

- See [Roadmap](./Roadmap.md), [Knowledge-Graph](./Knowledge-Graph.md), [API](./API.md), [Database](./Database.md), [Client-Bundle-Auth](./Client-Bundle-Auth.md).
