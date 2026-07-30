# Knowledge Search index

Build-time static search documents for global Knowledge Search (`/search`).

```bash
pnpm --filter @divine/web generate:search-index
```

Writes `knowledge-index.json` from:

- `content/knowledge/entities.json`
- `content/gita/reader/bg.*.json`

No Neon. Regenerated on `prebuild`. Re-run after `generate:knowledge` or Gita static updates.
