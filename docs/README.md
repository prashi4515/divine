# docs/

Living documentation for the Divine platform. This folder is the
long-term memory of the system — architecture decisions, runbooks, and
domain knowledge live here so the repo stays the source of truth for
years.

## Index

| Document | Purpose |
| -------- | ------- |
| [Architecture](./Architecture.md) | System architecture, topology, principles |
| [Roadmap](./Roadmap.md) | Delivery phases and milestones |
| [API](./API.md) | REST conventions and endpoint reference |
| [Database](./Database.md) | Prisma + Neon connection, migrations ops |
| [Database Design](./Database-Design.md) | Full entity model, relationships, indexes, scale |
| [SEO](./SEO.md) | Rendering, URLs, i18n, metadata, sitemaps |
| [UI](./UI.md) | Component inventory |
| [Design System](./Design-System.md) | Public tokens, type, motion, a11y, SEO layout |
| [AI](./AI.md) | AI Guru and emotion-based search design |
| [Deployment](./Deployment.md) | Environments, env vars, Docker, CI/CD |
| [Admin](./Admin.md) | Internal CMS UI (design-only milestone) |

## Planned additions

```
docs/
├── adrs/        # Architecture Decision Records (immutable, numbered)
├── runbooks/    # Operational procedures: deploy, rollback, incidents
└── product/     # Detailed product specs
```

## Rules

- **ADRs are immutable.** To reverse a decision, add a new ADR that
  supersedes the old one — never edit history.
- Documentation lives next to the code it describes. If a doc is
  app-specific, keep it inside that app's folder; only cross-cutting docs
  belong here.
- Every user-visible or operational change should update the relevant
  document in the same pull request.
- `docs/` is **not** a pnpm workspace and must never contain a
  `package.json`.
