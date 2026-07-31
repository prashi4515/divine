# Mahābhārata Atlas

Interactive atlas of Ancient Bhārata. One **illustrated plate** is the permanent
visual foundation. Application logic never invents coastlines or kingdom
boundaries from code — overlays are data-driven JSON above the artwork.

Interaction uses **MapLibre GL** (smooth pan/zoom/gestures/`flyTo`) with the
plate as a georeferenced image source — not OpenStreetMap tiles.

## Pipeline

```
Illustrated plate (baseMap.src)  ─┐
KG entities (lat/lng)            ├─► GeoJSON overlays ─► MapLibre GL ─► UI
atlas/rivers.json                │
atlas/events.json                │
atlas/routes.json                │
atlas/overlays/kingdoms.json     ┘   (selected highlight only)
```

| Concern | Module |
| ------- | ------ |
| Contracts | `packages/types/src/knowledge/atlas-v2.ts` |
| Dataset load | `apps/web/src/lib/atlas/data/load-dataset.ts` |
| Illustrated style | `apps/web/src/lib/atlas/tiles/tile-style.ts` |
| Overlay catalog | `apps/web/src/lib/atlas/overlays/layer-catalog.ts` |
| GeoJSON adapters | `apps/web/src/lib/atlas/overlays/to-geojson.ts` |
| MapLibre layers | `apps/web/src/lib/atlas/renderer/overlay-layers.tsx` |
| Search | `apps/web/src/lib/atlas/search/atlas-search-engine.ts` |
| Shell UI | `apps/web/src/features/atlas/atlas-map-app.tsx` |
| Artwork | `apps/web/public/images/atlas/ancient-bharata-map.jpg` |

## Swapping the illustrated map

1. Replace the image under `public/images/atlas/` (or add a new file).
2. Update `content/knowledge/atlas/base-map.json` (`src`, credit, intrinsic size).
3. Adjust `projection` only if georeference bounds change.
4. Do **not** change overlay JSON or rendering code for artwork alone.

The renderer must not care what the plate depicts — only that it has a URL and
a lat/lng frame.

## Rules

- The base artwork is **not** data and is **not** clickable.
- Do not procedurally draw India, coastlines, or permanent kingdom borders.
- Kingdom extents (when curated) appear only on selection / layer intent.
- Labels are dynamic overlays — never burned into the image as the source of truth.

## Certainty

- **verified** — strong traditional + geographic consensus
- **traditional** — named in the epic; location follows tradition
- **approximate** — epic does not fix a modern site precisely

Never present approximate or traditional pins as surveyed historical fact.

## Capabilities

- Illustrated plate basemap (never re-mounted for overlay updates)
- Smooth pan / wheel zoom / pinch / double-click / flyTo / fit / reset
- Viewport memory (`localStorage`)
- River vectors, event markers, travel routes (play / pause / step / restart)
- Marker clustering + collision-aware labels
- Search (English, IAST, aliases) with keyboard navigation
