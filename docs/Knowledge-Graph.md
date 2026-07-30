# Knowledge Graph

> Shared citation-first entity model for Divine. Encyclopedia, Genealogy, Gita
> cross-links, and Atlas / Timeline / Weapons all consume the same
> entities and edges — never parallel person/place datasets.

## North star

Divine is an interconnected **Knowledge Graph Platform**. Phase 1 ships:

- Zod contracts in `packages/types/src/knowledge/`
- Static JSON corpus in `apps/web/content/knowledge/` (DB-shaped for future Prisma)
- Encyclopedia UI (`/encyclopedia`)
- Genealogy as a **view** over the graph
- Gita chapter related-entities rail
- Unified entity + verse search suggestions
- Global Knowledge Search (`/search`) over a build-time static index
- **Related Content Engine** — weighted multi-hop graph recommendations on every entity page

## Related Content Engine

`buildRelatedContent` in `packages/types` walks the cited relation index (never invents edges), scores hops by relation type × confidence × depth decay × entity importance, and buckets neighbors into:

Characters · Events · Places · Kingdoms · Weapons · Concepts · Chapters · Verses · Atlas · Genealogy

Web surfaces call `getRelatedContent(entityId)` and render `RelatedContentSection`. Future entity kinds register via `ENTITY_KIND_BUCKETS` / `classifyRelatedBuckets` — no page hard-coding.

## IDs (stable forever)

Namespaced text IDs — never expose auto-increment PKs:

| Kind family | Example |
| ----------- | ------- |
| Person-like | `person.krishna` |
| Place | `city.hastinapura`, `pilgrimage.kurukshetra` |
| Concept | `concept.dharma` |
| Dynasty | `dynasty.yadu` |
| Scripture stub | `scripture.bg`, `chapter.bg.2`, `verse.bg.2.47` |

Genealogy URLs keep legacy ids (`/genealogy/person/krishna`) via
`externalRefs.genealogyId` + alias resolution.

## Content layout

```
apps/web/content/knowledge/
  entities/          # pack JSON by domain
  relations/         # kinship, places, scripture-links, …
  collections/       # encyclopedia-sections, genealogy-modules
  entities.json      # rebuilt merge
  relations.json
  collections.json
```

Scripts (do **not** import `@divine/types` from Node ESM scripts — use local helpers):

```bash
pnpm --filter @divine/web migrate:genealogy-to-knowledge
pnpm --filter @divine/web generate:knowledge
pnpm --filter @divine/web validate:knowledge
pnpm --filter @divine/web generate:search-index
```

## Citation rules

Every **relation** must have:

- `confidence`: `verified` | `traditional` | `variant`
- `sources[]` with at least one scripture reference

Do not invent edges to “fill” the graph. Accuracy ≫ quantity.

## Runtime (web)

| Module | Role |
| ------ | ---- |
| `lib/knowledge/store.ts` | Load/parse, relationship index, bundles, collections |
| `lib/knowledge/relationship-engine.ts` | Re-export of shared graph traversal (see packages/types) |
| `packages/types/.../relationship-engine.ts` | Relationship objects + ancestors/descendants/battles/ruled-by |
| `lib/knowledge/graph.ts` | Ego-network for React Flow (uses relationship engine) |
| `lib/knowledge/search.ts` | Alias + diacritic-fold entity search (in-page / atlas) |
| `lib/search/knowledge-search.ts` | Global Knowledge Search (fuzzy, Sanskrit, grouped) |
| `content/search/knowledge-index.json` | Build-time lightweight search index |
| `lib/knowledge/seo.ts` | Metadata + JSON-LD |
| `lib/knowledge/adapters/genealogy.ts` | Knowledge → Genealogy `Person` / modules |
| `lib/genealogy/store.ts` | Thin facade over the adapter |

## Relationship engine

Every relationship is a cited object — never a bare parent/child id array on the entity:

| Storage | Product view |
| ------- | ------------ |
| `fromId` | `source` |
| `toId` | `target` |
| `sources[]` | `citation` |
| `type` | `type` |
| `confidence` | `confidence` |

Helpers (all walk existing edges only — do not invent facts):

- `getParents` / `getChildren` — direction-aware, dedupe dual father/son edges
- `findAncestors` / `findDescendants` — multi-hop lineage
- `findBattlesInvolving(entityId)` — fought-in / participated-in / fought
- `findPlacesRuledBy(rulerIds)` — king-of / queen-of / ruled
- `traverseRelationships` — generic typed BFS

Rebuild + validate dedupe by `(source, type, target)` so relationships are not duplicated.

## Product surfaces

| Route | Consumer |
| ----- | -------- |
| `/encyclopedia` | Hub by section + featured |
| `/encyclopedia/[kind]/[slug]` | Canonical entity page; **characters** get a full profile (biography, family, kingdom, timeline, events, weapons, teachers/students, friends/enemies, genealogy, atlas, verses, concepts) derived from the shared graph |
| `/atlas` | Atlas 2.0 explorer (scene engine + pluggable renderer) |
| `/atlas/[slug]` | Place detail + map focus |
| `/kingdoms` | Kingdom hub (capitals, rulers, cities, battles — shared KG) |
| `/kingdoms/[slug]` | Kingdom detail page |
| `/genealogy/*` | Curated module explorer over the same entities |
| `/bhagavad-gita/chapter-N` | Related-entities rail |
| `/api/search/suggest` | Mixed knowledge chips from static index |
| `/api/search/knowledge` | Grouped Knowledge Search (no Neon) |
| `/search` | Global Knowledge Search UI |

**Atlas vs Encyclopedia:** Atlas explores geography (polygons, routes, layers)
over shared place entities. Encyclopedia explains entities in prose. See
[Atlas.md](./Atlas.md). Place encyclopedia pages link **Open in Atlas**.

Travel routes live in `content/knowledge/atlas/routes.json` and reference place
entity ids (no duplicated geography).

## Future Prisma migration

Sketch (no Phase 1 tables):

- `KnowledgeEntity` — columns ≈ entity JSON; `id` text PK; GIN on aliases
- `KnowledgeRelation` — `fromId`, `toId`, `type`, `confidence`, `sources` JSONB
- `KnowledgeCollection` + membership

Path: `validate:knowledge` → ETL JSON → `createMany` → point `store.ts` at
API/ISR while keeping Zod parse at the boundary. **No schema rewrite** if Phase 1
JSON already matches columns.

API remains the only DB client; web never imports Prisma.

## Out of scope (Phase 1)

Full Atlas maps, Timeline UI, Weapons catalog (`/weapons`), Concepts (`/concepts`), Learning Center, NestJS knowledge
module, locale-first `/[locale]` routing.

## References

- [Architecture](./Architecture.md)
- [Roadmap](./Roadmap.md)
