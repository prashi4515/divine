# Divine

Production-grade multilingual Bhagavad Gita platform.

This repository is the **monorepo skeleton**. It contains folder structure and
tooling configuration only — no business logic, no authentication, no database
models yet. Application code will be added phase by phase after the
architecture blueprint is approved.

---

## Repository layout

```
divine/
├── apps/               # Deployable applications
│   ├── web/            # Next.js 15 website (SEO-first, multilingual)
│   └── api/            # NestJS backend API (single source of truth)
│
├── packages/           # Shared, reusable libraries (workspace-internal)
│   ├── ui/             # Shared React UI components (shadcn-based)
│   ├── config/         # Shared configs: eslint, tsconfig, tailwind presets
│   └── types/          # Shared TypeScript types / DTOs / Zod schemas
│
├── docs/               # Architecture, ADRs, runbooks, product docs
│
├── package.json          # Root workspace manifest
├── pnpm-workspace.yaml   # Declares apps/* and packages/* as workspaces
├── .editorconfig         # Uniform whitespace across editors
├── .prettierrc           # Code formatting rules
├── .eslintrc.json        # Linting rules (root)
├── .gitignore
└── README.md             # This file
```

## Rules

- `apps/*` may depend on `packages/*`. Never the reverse.
- `apps/web` and `apps/api` must **not** import each other directly. They
  communicate over HTTP.
- Every workspace has its own `package.json` and `README.md`.
- No secrets are ever committed. Only `.env.example` files may be tracked.

## Prerequisites

- Node.js `>= 20`
- pnpm `>= 9`

## Getting started

```bash
pnpm install
```

That is all this skeleton supports. Application code and scripts will be
added in later phases.

## Documentation

See [`docs/`](./docs/README.md) for architecture, decision records, and
runbooks.
