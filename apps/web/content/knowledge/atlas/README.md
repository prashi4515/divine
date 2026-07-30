# Atlas content packs (Atlas 2.0)

Locations remain Knowledge Graph entities (`entity.atlas`).

| File | Role |
|------|------|
| `layers.json` | Layer stack (base, kingdoms, routes, places, labels) |
| `polygons.json` | Kingdom polygon rings (data, not artwork) |
| `routes.json` | Travel / campaign paths (`placeIds` + optional waypoints) |
| `icons.json` | Icon **tokens** only — artwork lives in the renderer |

The active renderer is chosen by `dataset.baseMapProviderId` (`placeholder` today).
An illustrated plate can register a new renderer without changing these packs.
