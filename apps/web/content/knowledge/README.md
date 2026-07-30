# Divine Knowledge Graph — content store

Citation-first interconnected entities for Encyclopedia, Genealogy, and future Atlas / Timeline.

## Files

- `entities.json` / `relations.json` / `collections.json` — merged build artifacts (schemaVersion 1)
- `entities/*.json`, `relations/*.json`, `collections/*.json` — source packs

## Commands

```bash
pnpm --filter @divine/web migrate:genealogy-to-knowledge
pnpm --filter @divine/web generate:knowledge
pnpm --filter @divine/web validate:knowledge
```

## Rules

1. Every relation needs `confidence` + `sources[]` (min 1).
2. IDs are permanent (`person.krishna`, `city.hastinapura`, `verse.bg.2.47`).
3. Canonical names use IAST; store `englishName` + `aliases` for search.
4. Do not invent relationships — omit if uncited.
5. Shape matches future Prisma `KnowledgeEntity` / `KnowledgeRelation` columns.
