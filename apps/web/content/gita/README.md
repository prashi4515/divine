# Static Gita snapshots

Pre-generated JSON so `/bhagavad-gita` pages never wait on Neon/API.

| Path | Purpose |
| ---- | ------- |
| `reader/bg.N.json` | Slim chapter (shloka + translations) — page HTML |
| `commentary/bg.N.json` | Commentaries only — `/api/gita/commentary/bg.N.M` |
| `chapters.json` | Chapter index cards |

## Regenerate

With the API running:

```bash
pnpm --filter @divine/web generate:gita-static
```

Commit both `reader/` and `commentary/` when scripture text changes.
