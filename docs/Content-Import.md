# Content Import Pipeline

> Ops CLI for loading versioned JSON scripture catalogs into Postgres.
> Package: `tooling/content-import` (`@divine/content-import`).
> Writes the shared public catalog: **Work → Chapter → Verse → Translation**.
> After import, link CMS Library rows with `pnpm --filter @divine/api cms:sync`.

## Pipeline stages

1. **Parser** — read file, JSON.parse, version gate, Zod structural parse.
2. **Validator** — in-file duplicates, `publicId` format, referential integrity against file ∪ DB.
3. **Importer** — catalog upsert, then **one transaction per chapter** (Neon-safe for large corpora); natural-key upserts.
4. **Reporter** — stderr progress + stdout summary (planned vs written, issues by severity).

## Commands

```bash
pnpm --filter @divine/content-import load -- --file ./fixtures/example.v1.json --dry-run
pnpm --filter @divine/content-import load -- --file ./fixtures/bg-complete.v1.json
pnpm --filter @divine/content-import load -- --file ./fixtures/quran-fatiha.v1.json
pnpm --filter @divine/content-import load -- --file ./fixtures/bible-genesis-1.v1.json
pnpm --filter @divine/api cms:sync
pnpm --filter @divine/api indic:import   # Telugu/Odia meanings + kn/ta/ml script forms
```

Requires `DIVINE_DATABASE_URL` (loaded from `apps/api/.env` via the package script).

### Indic reader languages

`indic:import` fills public reader languages beyond English/Hindi:

| Code | Source |
| ---- | ------ |
| `te` | Holy Bhagavad Gita Telugu meaning (Unlicense corpus) — 701 verses |
| `or` | Community Odia meaning corpus — 591 verses (source numbering gaps) |
| `kn` / `ta` / `ml` | Hindi Ramsukhdas meaning rendered in Kannada/Tamil/Malayalam script via Sanscript (interim until dedicated meaning texts are licensed) |

The Gita reader only lists languages that actually have translations for the chapter (no empty Telugu stubs).

## Schema

- Current: `schemaVersion: "1.0.0"` — see `tooling/content-import/src/schema/v1.mts`.
- Fixtures:
  - `fixtures/example.v1.json` — tiny dry-run sample
  - `fixtures/bg-chapters.v1.json` — Bhagavad Gita chapters only
  - `fixtures/bg-complete.v1.json` — full Gita (18 chapters, ~701 verses, en/hi translations)
  - `fixtures/quran-fatiha.v1.json` — Surah Al-Fatiha sample
  - `fixtures/bible-genesis-1.v1.json` — Genesis 1 verses 1–20 (KJV)

Hierarchy is always Work → Chapter → Verse. Tradition-specific labels (Surah, Kanda, Book) live on CMS `Scripture.structureLevels` only.

Full design rationale: `tooling/content-import/README.md`.
