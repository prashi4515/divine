# Mahābhārata Atlas

Interactive atlas of Ancient Bhārata — **Google Maps–style** MapLibre canvas.
Place names are **JSON overlays only**. The old illustrated plate image is not used.

## Architecture

```
Clean basemap (Carto Positron, no labels)  ─┐
KG + atlas/*.json overlays                 ├─► MapLibre GL ─► UI
(traditional-labels, rivers, events, …)    ┘
```

| Concern | Module |
| ------- | ------ |
| Contracts | `packages/types` (`AtlasBaseMap.styleUrl`) |
| Dataset load | `apps/web/src/lib/atlas/data/load-dataset.ts` |
| Basemap style | `apps/web/src/lib/atlas/tiles/tile-style.ts` |
| Toponyms | `content/knowledge/atlas/overlays/traditional-labels.json` |
| Overlay layers | `apps/web/src/lib/atlas/renderer/overlay-layers.tsx` |
| Shell UI | `apps/web/src/features/atlas/atlas-map-app.tsx` |

## Rules

- **No educational plate image** as the default map.
- **No SVG atlas.** No procedural coastlines invented as “the map.”
- **Names come from JSON** (`traditional-labels.json` + KG places), not from basemap pixels.
- Basemap is a clean no-labels style so modern city names do not compete.
- Optional future illustrated plate can still use `baseMap.tiles` — never required for overlays.

## Swapping the basemap

Default is an **inline** clean light map (Carto `light_nolabels` raster tiles).
Ancient names come from overlay JSON only.

To use a custom remote style, set `styleUrl` in `base-map.json`.
To use a future illustrated plate, set `tiles` or `src` — overlays stay unchanged.

## Interaction

Pan, wheel/pinch/double-click zoom, `flyTo`, Fit India, fullscreen.
Search → fly + highlight + right drawer.
Labels follow the site language.
