# API

> REST API conventions and reference for the Divine backend (NestJS).

## 1. Overview

- **Base URL (local):** `http://localhost:8080`
- **Versioned prefix:** `/v1`
- **Interactive docs (Swagger):** `/docs`
- **Health check:** `/health` (outside the version prefix, for infrastructure).

## 2. Conventions

- **Style:** REST, JSON request/response.
- **Versioning:** URI prefix (`/v1/...`). Health is intentionally unversioned.
- **Naming:** kebab-case paths, plural resources (e.g. `/v1/verses`).
- _TODO — pagination, filtering, sorting conventions._

## 3. Authentication

- _Not implemented yet._
- Planned: JWT access + refresh tokens; Google OAuth later.
- _TODO — auth header format, token lifetimes, refresh flow._

## 4. Standard Response Shapes

- **Success (lists):** `{ "data": [ ... ] }`
- **Success (detail):** `{ "data": { ... } }`
- **Error envelope (current):**

```json
{
  "statusCode": 400,
  "timestamp": "ISO-8601",
  "path": "/v1/...",
  "method": "GET",
  "message": "…",
  "error": "…"
}
```

## 5. Validation

- Global `ValidationPipe`: unknown properties stripped, extras rejected, payloads transformed to DTO types.
- _TODO — link DTOs to `packages/types` schemas._

## 6. Endpoints

### Health

- `GET /health` — liveness + database ping.

### Content

- `GET /v1/works` — list published works (ordered by `sortOrder`). Public, no auth.
- `GET /v1/chapters` — list published chapters (ordered by `sortOrder`), each with nested `work` summary (`code`, `slug`, `title`). Public, no auth.
- `GET /v1/chapters/:publicId` — one published chapter by public ID (e.g. `bg.1`). 404 if missing or unpublished.

### User _(planned)_

- `GET/POST/DELETE /v1/me/bookmarks` — _TODO._
- `CRUD /v1/me/notes` — _TODO._
- `CRUD /v1/me/plans` — _TODO._

### Search _(planned)_

- `GET /v1/search` — _TODO._

## 7. Errors & Status Codes

- _TODO — table of error codes and meanings._

## 8. Rate Limiting

- _Not implemented._ _TODO — strategy and limits._

## 9. Versioning & Deprecation Policy

- _TODO — how new versions are introduced and old ones retired._

## References

- See [Architecture](./Architecture.md), [Database](./Database.md).
