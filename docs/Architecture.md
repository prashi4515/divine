# Architecture

> System architecture for the Divine platform — a production-grade,
> multilingual Bhagavad Gita platform designed to scale to millions of users.

## 1. Overview

- **Vision:** content-first, API-first, SEO-first platform for the Bhagavad Gita.
- **Primary surface:** the website (SEO + discovery). Mobile apps and AI Guru are clients of the same API.
- **Guiding principle:** _TODO — one-paragraph north star statement._

## 2. Architectural Principles

- Shared domain contracts live in `packages/*` — never duplicated across apps.
- Locale is a first-class dimension on every public content route.
- Read path is optimized for anonymous traffic; write path is isolated behind auth.
- Modular monolith until traffic or team size forces a split.
- _TODO — add any additional principles._

## 3. System Topology

- **Clients:** Next.js web, future Android/iOS, future AI Guru UI.
- **Edge / CDN:** Vercel edge for HTML/ISR, CDN for audio/static.
- **Application:** NestJS modular monolith API.
- **Data plane:** Neon PostgreSQL (source of truth), Redis (later), Meilisearch (later), object storage/CDN for audio.

_TODO — insert topology diagram._

## 4. Monorepo Structure

```
divine/
├── apps/
│   ├── web/     # Next.js 15
│   └── api/     # NestJS
├── packages/
│   ├── ui/      # shared React components
│   ├── config/  # shared config presets
│   └── types/   # shared TS types / DTOs
└── docs/
```

- **Tooling:** pnpm workspaces (Turborepo planned).
- _TODO — document dependency rules and boundaries._

## 5. Backend Architecture (NestJS)

- Module-per-domain organization.
- Cross-cutting concerns: global `ValidationPipe`, global `AllExceptionsFilter`, pino logging.
- Data access isolated in `PrismaModule` / `PrismaService`.
- _TODO — list domain modules as they are added._

## 6. Frontend Architecture (Next.js)

- App Router, Server Components by default.
- Locale-first routing (`/[locale]/...`) — _planned_.
- Data fetched from the API over HTTP; no direct DB access.
- Public pages never block on auth: no `/me` or refresh without a session cookie; navbar hydrates asynchronously. See [Client-Bundle-Auth](./Client-Bundle-Auth.md).
- Admin chrome is scoped to `app/admin/layout.tsx` only.
- _TODO — document feature-folder conventions._

## 7. Data Flow

- Public content reads: SSG/ISR → optional API hydrate.
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

- See [Roadmap](./Roadmap.md), [API](./API.md), [Database](./Database.md), [Client-Bundle-Auth](./Client-Bundle-Auth.md).
