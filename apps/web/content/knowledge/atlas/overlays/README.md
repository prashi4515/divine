# Atlas overlays

Interactive data lives here (or in sibling atlas JSON files). The illustrated
base plate under `/public/images/atlas/` is **not** data — the renderer never
reads geography from pixels.

| File | Role |
| ---- | ---- |
| `kingdoms.json` | Kingdom extents — drawn only when selected (currently empty until curated) |
| `../rivers.json` | River vector paths |
| `../events.json` | Event markers |
| `../routes.json` | Travel routes |
| Places / cities | Knowledge Graph entities (`content/knowledge/entities/`) |

Do not invent coastlines or permanent painted borders in code.
