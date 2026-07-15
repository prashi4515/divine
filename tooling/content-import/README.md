# Content Import Pipeline

Reusable, production-grade framework for loading scripture catalogs into Divine.

**This package does not ship Bhagavad Gita content.** It only provides the
pipeline. A tiny fictional fixture (`fixtures/example.v1.json`) exists for
dry-run demos.

## Architecture

```
JSON file
   │
   ▼
┌─────────┐   structural Zod + version gate
│ Parser  │
└────┬────┘
     ▼
┌───────────┐   duplicates, publicId format, FK resolution (file ∪ DB)
│ Validator │
└─────┬─────┘
      ▼
┌──────────┐   single Prisma $transaction, upserts on natural keys
│ Importer │   (skipped on --dry-run)
└────┬─────┘
     ▼
┌──────────┐   progress events + summary report
│ Reporter │
└──────────┘
```

### Why these boundaries?

| Decision | Rationale |
|---|---|
| **Separate Parser / Validator / Importer / Reporter** | SRP + testability. Parser never touches DB; Validator never writes; Importer never formats CLI output. |
| **Lives in `tooling/`, not `apps/api`** | Import is an ops CLI, not an HTTP concern. Keeps Nest modules free of bulk-load code. Still uses the same Prisma schema / Neon DB. |
| **Versioned JSON (`schemaVersion: "1.0.0"`)** | Historical dumps stay loadable; new fields land in `1.1.0` / `2.0.0` with an explicit gate in the parser. |
| **Natural keys only (no UUIDs in files)** | Files are portable across environments. UUIDs are DB-internal; public IDs (`ex.1.2`) are the contract. |
| **Zod at the parse boundary** | Matches platform rule: validate all external input. Detailed `Issue` paths map to JSON locations for operators. |
| **Referential integrity = file ∪ DB** | Catalog rows (languages, sources, topics, emotions) may be declared inline or already seeded — both resolve. |
| **Idempotent upserts** | Re-running the same file is safe. Unique constraints: `work.code`, `chapter.publicId`, `verse.publicId`, translation triple, junction pairs. |
| **Single interactive transaction** | All-or-nothing. Failure → full rollback. Progress still reports planned counts from validation. |
| **Dry-run short-circuits before Importer** | Same parse + validate path as production; zero writes. CI can gate merges on dry-run exit code. |
| **Schemas stay in tooling (not `@divine/types`)** | Import wire format is an ops contract, not a public API DTO. API types remain in `packages/types`. |
| **Nested verses under chapters** | Keeps chapter↔verse integrity local and matches how editors think about catalogs. |

## JSON shape (v1)

See `fixtures/example.v1.json` and `src/schema/v1.mts`.

Required:

- `schemaVersion`: `"1.0.0"`
- `meta.name`
- `work` (`code`, `slug`, `title`)
- `chapters[]` with nested `verses[]`

Optional catalogs: `languages`, `translationSources`, `topics`, `emotions`.

`publicId` rules (enforced by Validator):

- Chapter: `{workCode}.{chapterNumber}` → `ex.1`
- Verse: `{workCode}.{chapterNumber}.{verseNumber}` → `ex.1.2`

## Usage

```bash
# From repo root (loads apps/api/.env for DIVINE_DATABASE_URL)
pnpm --filter @divine/content-import load -- --file ./fixtures/example.v1.json --dry-run

# Commit writes (transactional)
pnpm --filter @divine/content-import load -- --file ./fixtures/example.v1.json
```

> Note: the package script is named `load`, not `import`, because `pnpm import` is a reserved pnpm command.
> Prerequisite: `pnpm --filter @divine/api exec prisma generate` (same client as the API).

Exit codes: `0` success, `1` parse / validation / import failure.

## Programmatic API

```ts
import { runImport } from "@divine/content-import";

const { summary, exitCode } = await runImport({
  filePath: "/path/to/catalog.v1.json",
  dryRun: true,
});
```

## Extending

1. Add `src/schema/v2.mts` with a new literal `schemaVersion`.
2. Teach `parseDocument` to dispatch on version.
3. Keep v1 loaders forever (or add an explicit migrate-file tool).
