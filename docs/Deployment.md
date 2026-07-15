# Deployment

> How the Divine platform is built, configured, and deployed.

## 1. Overview

| Component | Host | Notes |
| --------- | ---- | ----- |
| Web (`apps/web`) | Vercel | Next.js native hosting, ISR/edge |
| API (`apps/api`) | Render | NestJS Web Service (Docker) |
| Database | Neon | Managed PostgreSQL |

- _TODO — confirm final hosting choices and regions._

## 2. Environments

- `development`, `staging`, `production`.
- Each environment has isolated secrets and databases.
- _TODO — environment matrix and promotion flow._

## 3. Environment Variables

- All first-party vars prefixed `DIVINE_`.
- Validated at boot via Zod (`apps/api/src/config/env.ts`).
- Documented in `apps/api/.env.example`. Never commit real `.env`.

| Variable | Scope | Secret |
| -------- | ----- | ------ |
| `DIVINE_DATABASE_URL` | api | yes |
| `DIVINE_DIRECT_URL` | api (migrations) | yes |
| `DIVINE_API_PORT` | api | no |
| `DIVINE_WEB_ORIGIN` | api | no |
| `DIVINE_LOG_LEVEL` | api | no |

- _TODO — add web env vars and future secrets (Redis, Meili, OAuth, AI)._

## 4. Local Development

```bash
pnpm install
pnpm --filter @divine/web dev        # web on :3000
pnpm --filter @divine/api start:dev  # api on :8080
```

- Optional local Postgres via `apps/api/docker-compose.yml`.

## 5. Docker

- Multi-stage `apps/api/Dockerfile` (build from repo root context).
- `docker-compose.yml` runs Postgres + API for local parity.
- _TODO — image registry and tagging strategy._

## 6. Database Migrations in Deploy

- `pnpm --filter @divine/api prisma:deploy` before switching traffic.
- Expand/contract migrations; never ship breaking schema before old code is gone.
- _TODO — migration job wiring in CI/CD._

## 7. CI/CD

- Minimum gates: lint, typecheck, test, build, migration drift check.
- _TODO — pipeline definition (GitHub Actions)._

## 8. Web Deployment (Vercel)

- Merge to `main` → production; PRs → preview deployments.
- _TODO — preview DB strategy (Neon branching)._

## 9. API Deployment (Render)

Preferred host for NestJS API: [Render](https://render.com) Web Service.

### Docker (recommended)

1. New **Web Service** → connect GitHub repo `divine`.
2. **Runtime:** Docker.
3. **Dockerfile path:** `apps/api/Dockerfile`
4. **Docker context:** repo root (`.`)
5. **Health check path:** `/health`
6. Set env vars from `apps/api/.env.example` (see table below).
7. After first deploy, run migrations once (Render Shell or local against prod DB):

```bash
pnpm --filter @divine/api prisma:deploy
pnpm --filter @divine/api prisma:seed   # optional
```

### Env vars (API on Render)

| Variable | Notes |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `DIVINE_DATABASE_URL` | Neon pooled URL |
| `DIVINE_DIRECT_URL` | Neon direct URL (migrations) |
| `DIVINE_WEB_ORIGIN` | Vercel URL, e.g. `https://your-app.vercel.app` |
| `DIVINE_JWT_ACCESS_SECRET` | `openssl rand -base64 48` |
| `DIVINE_JWT_REFRESH_SECRET` | separate secret, same length |
| `DIVINE_COOKIE_SECURE` | `true` |
| `DIVINE_LOG_LEVEL` | `info` |

Render injects `PORT`; the API listens on `process.env.PORT` when set. Do not hardcode `DIVINE_API_PORT` unless needed.

Point Vercel web env `DIVINE_API_URL` / `NEXT_PUBLIC_DIVINE_API_URL` at the Render URL (e.g. `https://divine-api.onrender.com`).

- _TODO — rollout/rollback procedure._

## 10. Rollback & Incident Response

- _TODO — rollback steps and incident runbook links._

## 11. Monitoring & Observability

- Health endpoint, structured logs (pino).
- _TODO — metrics, tracing, error reporting, uptime checks._

## References

- See [Architecture](./Architecture.md), [Database](./Database.md), [Roadmap](./Roadmap.md).
