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
pnpm --filter @divine/api commentary:import  # Sivananda EN + Ramsukhdas HI vyakhya
pnpm --filter @divine/api commentary:multilang  # Telugu commentary + kn/ta/ml/or script forms
```

Requires `DIVINE_DATABASE_URL` (loaded from `apps/api/.env` via the package script).

### Auth email (Resend)

Set `DIVINE_RESEND_API_KEY` and `DIVINE_EMAIL_FROM` in `apps/api/.env` for verification and password-reset emails. Without the API key, the API logs a skip message (and in development may log tokens) so local signup still works.

### Indic reader languages

| Code | Native meaning? | Source |
| ---- | --------------- | ------ |
| `en` | Yes | Sivananda (Unlicense / open corpus) |
| `hi` | Yes | Ramsukhdas meaning + vyakhya |
| `te` | Yes | Holy Bhagavad Gita Telugu (Unlicense HF) — translation, w2w, vyakhya |
| `or` | Yes (meaning) | Community Odia meaning corpus; vyakhya still interim |
| `sa` | Shloka | Sanskrit text on the verse |
| `kn` / `ta` / `ml` | **No** (script only) | Interim: Hindi Ramsukhdas re-lettered into kn/ta/ml script for on-screen presence — **not** literary Kannada/Tamil/Malayalam. **ISKCON/BBT (including Prabhupada Kannada PDFs) cannot be imported** without written BBT license. |

**ISKCON / BBT “Bhagavad Gita As It Is” cannot be imported** (copyrighted), including Kannada editions such as community-hosted Prabhupada PDFs. If you obtain a BBT license or another licensed open Kannada meaning corpus, add it via `indic:import` / CMS like Telugu.

### Commentaries

Open corpora only — **ISKCON / BBT “Bhagavad Gita As It Is” cannot be imported** (copyrighted). Use licensed content via CMS if you obtain BBT permission.

| Command | What it loads |
| ------- | ------------- |
| `commentary:import` | Sivananda EN word-meanings + commentary; Ramsukhdas Hindi vyakhya |
| `commentary:multilang` | Telugu detailed commentary + word meanings (Unlicense HF corpus); Ramsukhdas vyakhya in kn/ta/ml/or scripts |

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
