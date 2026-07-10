# Deployment

> How the Divine platform is built, configured, and deployed.

## 1. Overview

| Component | Host | Notes |
| --------- | ---- | ----- |
| Web (`apps/web`) | Vercel | Next.js native hosting, ISR/edge |
| API (`apps/api`) | Railway or VPS | Long-running NestJS |
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

## 9. API Deployment (Railway / VPS)

- Build image, run migrations, deploy, health-check `/health`.
- _TODO — rollout/rollback procedure._

## 10. Rollback & Incident Response

- _TODO — rollback steps and incident runbook links._

## 11. Monitoring & Observability

- Health endpoint, structured logs (pino).
- _TODO — metrics, tracing, error reporting, uptime checks._

## References

- See [Architecture](./Architecture.md), [Database](./Database.md), [Roadmap](./Roadmap.md).
