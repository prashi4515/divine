# apps/api

**NestJS backend foundation** for Divine. This is the API skeleton only —
no authentication and no business/domain modules yet.

## Stack

- **NestJS 11** — modular Node framework
- **Prisma 6** + **PostgreSQL** — data access (no models yet)
- **@nestjs/config** + **Zod** — validated environment configuration
- **@nestjs/swagger** — OpenAPI docs at `/docs`
- **@nestjs/terminus** — health check with a Prisma DB ping
- **nestjs-pino** — structured JSON logging (pretty in dev)
- Global **ValidationPipe** and **AllExceptionsFilter**
- **Docker** multi-stage image + `docker-compose` (Postgres + API)

## What exists

```
apps/api/
├── src/
│   ├── main.ts                 # bootstrap: pipe, filter, swagger, cors, versioning
│   ├── app.module.ts           # wires config, logger, prisma, health, filter
│   ├── config/env.ts           # Zod-validated env schema
│   ├── common/filters/
│   │   └── all-exceptions.filter.ts   # consistent error envelope + logging
│   ├── prisma/
│   │   ├── prisma.module.ts    # global
│   │   └── prisma.service.ts   # lifecycle-managed PrismaClient
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts       # GET /health
├── prisma/schema.prisma        # datasource + generator only (no models)
├── Dockerfile                  # build from REPO ROOT context
├── docker-compose.yml          # postgres + api
├── .env.example
└── ...tsconfig / nest-cli / eslint
```

## Endpoints

| Method | Path        | Purpose                         |
| ------ | ----------- | ------------------------------- |
| GET    | `/health`   | Liveness + DB ping (Terminus)   |
| —      | `/docs`     | Swagger UI                      |
| —      | `/v1/*`     | Versioned API (empty for now)   |

## Database (Neon PostgreSQL)

Prisma is configured for Neon's dual-endpoint model:

- `DIVINE_DATABASE_URL` → **pooled** endpoint (host contains `-pooler`). Used at
  runtime (`datasource.url`) so the serverless app can open many short
  connections through Neon's PgBouncer.
- `DIVINE_DIRECT_URL` → **direct** endpoint (no `-pooler`). Used by Prisma
  Migrate (`datasource.directUrl`) because migrations need a real, non-pooled
  session to create the shadow DB and run DDL.

Both come from the Neon dashboard → Connection Details. They are read from
`apps/api/.env` (gitignored). **No secret is ever committed** — only
`.env.example` (placeholder shapes) is tracked.

### Verify the connection

```bash
cp apps/api/.env.example apps/api/.env      # paste your real Neon strings
pnpm --filter @divine/api verify:db         # opens a real connection, runs SELECT version()
```

The verifier masks the password in its output.

### Migrations (no models yet)

```bash
pnpm --filter @divine/api prisma:status     # show migration state
pnpm --filter @divine/api prisma:migrate    # create/apply a dev migration (once models exist)
pnpm --filter @divine/api prisma:deploy     # apply committed migrations in CI/prod
```

There are no models yet, so there is nothing to migrate. The configuration is
in place for when the first model lands.

## Local development

```bash
cp apps/api/.env.example apps/api/.env      # then edit the DIVINE_ vars

# Option A — full stack in Docker (Postgres + API)
cd apps/api && docker compose up --build

# Option B — Postgres in Docker, API on host
cd apps/api && docker compose up -d postgres
pnpm --filter @divine/api prisma:generate
pnpm --filter @divine/api start:dev
```

## Scripts

```bash
pnpm --filter @divine/api start:dev        # watch mode
pnpm --filter @divine/api build            # prisma generate + nest build
pnpm --filter @divine/api typecheck        # prisma generate + tsc --noEmit
pnpm --filter @divine/api lint             # eslint
```

## Notes

- The database has **no tables yet** — `/health` verifies connectivity with a
  `SELECT 1`, which works against an empty database.
- Auth, domain modules, and migrations are intentionally out of scope here.
