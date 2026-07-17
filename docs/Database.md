# Database

> Data layer documentation — PostgreSQL (Neon) accessed via Prisma.

## 1. Overview

- **Engine:** PostgreSQL (hosted on Neon).
- **ORM:** Prisma.
- **Schema location:** `apps/api/prisma/schema.prisma`.
- **Status:** P0 migration `20260710065200_p0_content_catalog` applied to Neon. Content catalog tables exist (empty — no seed). Prisma Client generated.

## 2. Connection Strategy (Neon)

Neon exposes two endpoints for the same database:

| Env var | Endpoint | Used for |
| ------- | -------- | -------- |
| `DIVINE_DATABASE_URL` | Pooled (`-pooler`) | Runtime queries (`datasource.url`) |
| `DIVINE_DIRECT_URL` | Direct (no `-pooler`) | Migrations (`datasource.directUrl`) |

- Pooled endpoint routes through PgBouncer for many short-lived serverless connections.
- Direct endpoint is required by Prisma Migrate for shadow DB + DDL.
- Secrets live only in `apps/api/.env` (gitignored). See `.env.example`.

## 3. Verifying the Connection

```bash
pnpm --filter @divine/api verify:db
```

- Runs `SELECT version()` and masks the password in output.

## 4. Schema Conventions

- **Internal PK:** UUID.
- **Public key:** natural, stable (e.g. `bg.2.47`).
- **Tables:** snake_case plural. **Columns:** snake_case. **Models:** PascalCase singular.
- _TODO — finalize conventions doc._

## 5. Domain Model

**Full entity design, relationships, normalization, indexes, and scale plan:**
see **[Database-Design.md](./Database-Design.md)**.

Summary of contexts: content catalog → taxonomy (topics/emotions) → media →
identity → engagement → intelligence (AI/search history). No Prisma models
until that design is approved for implementation.

## 6. Migrations

```bash
pnpm --filter @divine/api prisma:status    # inspect state
pnpm --filter @divine/api prisma:migrate   # create/apply dev migration
pnpm --filter @divine/api prisma:deploy    # apply committed migrations (CI/prod)
```

- Migrations are committed under `apps/api/prisma/migrations/` (none yet).
- Never edit an already-applied migration.
- _TODO — expand/contract migration policy._

## 7. Seeding

```bash
pnpm --filter @divine/api prisma:seed
pnpm --filter @divine/api search:seed   # topics, synonyms, verse↔topic, keywords
```

- Script: `apps/api/scripts/seed.mts` (Prisma Client upserts — no raw SQL).
- Search index: `apps/api/scripts/seed-search.mts` — synonyms/spellings, topic tags from real verse text, denormalized keywords.
- P0 seeds: languages (en/hi/te), work `bg`, translation sources, topics, emotions.
- Idempotent on natural keys (`code`, `slug`, `key`).

## 8. Indexing & Performance

- _TODO — plan unique index on `(verse_id, locale, translation_key)`._
- _TODO — read replica strategy at scale._

## 9. Backups & Recovery

- _TODO — Neon backup/branching and restore runbook._

## References

- See [Architecture](./Architecture.md), [API](./API.md), [Deployment](./Deployment.md).
