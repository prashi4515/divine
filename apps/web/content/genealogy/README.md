# Divine Genealogy — content store

Citation-first Hindu genealogy corpus. Accuracy ≫ quantity.

## Files

- `people.json` — canonical person records (`schemaVersion: 2`)
- `modules.json` — 24 independent modules (not one giant tree)

## Rebuild

Edit TypeScript drafts under `apps/web/scripts/genealogy/`, then:

```bash
pnpm --filter @divine/web generate:genealogy
pnpm --filter @divine/web validate:genealogy
```

## Rules

1. **Every relationship needs `confidence` + `sources[]`.** No exceptions.
2. Confidence levels: `verified` | `traditional` | `variant`.
3. When traditions differ, use `variantTraditions[]` and/or `confidence: "variant"`. Never silently merge conflicting lines.
4. **Canonical `name` / `iastName` use IAST** (Kṛṣṇa). Store `englishName` + `aliases[]` for search (Krishna, Krsna, Govinda…).
5. **IDs are permanent** (`/genealogy/person/<id>`). Never rename.
6. **Separate classes:** Daitya ≠ Dānava ≠ Rākṣasa ≠ Asura ≠ Nāga ≠ Deva. Do not merge trees.
7. **Do not invent.** If a link is not attested in a primary scripture, omit it.
8. Prefer a sparse verified spine over a dense unverified ladder (especially Solar/Lunar intermediate kings).

## Primary sources only

Mahābhārata, Harivaṃśa, Bhāgavata Purāṇa, Viṣṇu Purāṇa, Brahma / Brahmāṇḍa / Matsya / Padma / Agni / Mārkaṇḍeya / Liṅga / Kūrma / Vāyu / Skanda Purāṇas, Valmīki Rāmāyaṇa, Bhagavad Gītā (where applicable).

No blogs. No genealogy-image copies.
