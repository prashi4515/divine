# Atlas 2.0

Architecture-first map of Ancient Bhārata. Locations stay Knowledge Graph
entities (`entity.atlas`). Polygons, routes, layers, and icon tokens are
JSON packs. Renderers are pluggable — illustrated artwork can swap in later
without changing data or the scene engine.

## Pipeline

```
KG entities (lat/lng) ─┐
atlas/polygons.json    ├─► AtlasDataset ─► buildAtlasScene() ─► AtlasRenderer
atlas/routes.json      │                      ▲
atlas/layers.json      │                      │ camera + filters
atlas/icons.json       ┘
```

| Concern | Module |
| ------- | ------ |
| Contracts | `packages/types/src/knowledge/atlas-v2.ts` |
| Scene engine | `packages/types/src/knowledge/atlas-engine.ts` |
| Dataset load | `apps/web/src/lib/atlas/data/load-dataset.ts` |
| Renderer API | `apps/web/src/lib/atlas/render/types.ts` |
| Placeholder SVG | `apps/web/src/lib/atlas/render/placeholder-renderer.tsx` |
| Shell UI | `apps/web/src/features/atlas/atlas-explorer.tsx` |

## Capabilities (data-backed)

- **Kingdom polygons** — `polygons.json` rings linked to optional `entityId`
- **Routes / travel paths** — `placeIds` + optional `waypoints`
- **Layers** — base / kingdoms / routes / places / labels with z-index + semantic zoom range
- **Icons** — token ids only (`icon.city`, …); artwork belongs to the renderer
- **Semantic zoom** — levels 1–5 from camera scale
- **Marker clustering** — grid clusters below `cluster.maxClusterLevel`
- **Renderer swap** — set `dataset.baseMapProviderId` and register an `AtlasRenderer`

## Swapping the illustrated map

1. Implement `AtlasRenderer` (`id`, `label`, `render(props)`).
2. Register it in the explorer registry.
3. Set `baseMapProviderId` on the dataset (or override at load).
4. Do **not** change polygons/routes/layers/places JSON or `buildAtlasScene`.

The legacy parchment SVG (`atlas-base-map.tsx`, `geography.ts`) is leftover MVP art —
do not wire new features through it; migrate any remaining rings into `polygons.json`.

## Content layout

```
apps/web/content/knowledge/atlas/
  layers.json
  polygons.json
  routes.json
  icons.json
  README.md
```

Places continue to live on KG entities in `content/knowledge/entities/`.
