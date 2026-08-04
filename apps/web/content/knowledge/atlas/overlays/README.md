# Atlas overlays

Interactive data lives in JSON. The illustrated plate is served as XYZ tiles
under `/public/tiles/ancient-bharata/` — **not** data. The renderer never reads
geography from pixels.

| File | Role |
| ---- | ---- |
| `kingdoms.json` | Kingdom extents (hover / selection) |
| `traditional-labels.json` | Multilingual plate toponyms |
| `../rivers.json` | River vectors |
| `../events.json` | Event markers |
| `../routes.json` | Travel routes |
| Places / cities | Knowledge Graph entities |

Do not invent coastlines or permanent painted borders in code.
