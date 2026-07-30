# Translation corrections (native-speaker QA)

Imported Telugu / Odia / Hindi text comes from open corpora and scrapes. Those
sources sometimes have OCR typos, missing matras, or awkward phrasing.

## How to fix a mistake

1. Note the verse id (`bg.2.1`), language, and which field (meaning / w2w / commentary).
2. Add or edit an entry in `overrides.json` (see schema below).
3. Regenerate static snapshots so the public site picks it up:

```bash
pnpm --filter @divine/web generate:gita-static
```

For DB-backed pages, also patch the row in Admin / Prisma (overrides apply to
static reader files when generation merges this folder — see
`apply-content-corrections.ts`).

## `overrides.json` schema

```json
{
  "bg.2.1": {
    "holy-bg-telugu": "corrected translation…",
    "holy-bg-telugu-vyakhya": "corrected commentary…",
    "holy-bg-telugu-w2w": "corrected word meanings…"
  }
}
```

Keys are `publicId` → `sourceKey` → full replacement text.

## Languages you cannot proofread

- Prefer publisher-canonical sources (Sivananda EN, Ramsukhdas HI) over scrapes.
- For kn/ta/ml script-proxy rows (Hindi rescripted), fix the Hindi source first.
- Recruit a native reviewer per language before calling a locale “production”.
