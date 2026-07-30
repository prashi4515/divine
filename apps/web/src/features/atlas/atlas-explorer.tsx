"use client";

import * as React from "react";
import { Search, Route as RouteIcon, Layers } from "lucide-react";
import type { AtlasDataset, AtlasRoute } from "@divine/types";
import {
  ATLAS_FILTERS,
  ATLAS_FILTER_LABELS,
  atlasHref,
  markerKindFor,
  type AtlasFilter,
  type AtlasPlace,
} from "@/lib/atlas/geo";
import {
  buildAtlasScene,
  projectLatLng,
  type AtlasPlaceInput,
} from "@/lib/atlas/engine/build-scene";
import {
  createRendererRegistry,
  resolveRenderer,
} from "@/lib/atlas/render/types";
import { placeholderAtlasRenderer } from "@/lib/atlas/render/placeholder-renderer";
import { searchEntities } from "@/lib/knowledge/search";
import { ENTITY_KIND_LABELS } from "@/lib/knowledge/types";
import { AtlasControls } from "@/features/atlas/atlas-controls";
import { AtlasPlacePanel } from "@/features/atlas/atlas-place-panel";
import { useAtlasCamera } from "@/features/atlas/use-atlas-camera";
import { cn } from "@/lib/utils";
import "@/features/atlas/atlas.css";

const RENDERERS = createRendererRegistry([placeholderAtlasRenderer]);

type AtlasExplorerProps = {
  dataset: AtlasDataset;
  places: AtlasPlace[];
  /** @deprecated Prefer dataset.routes — kept for place pages. */
  routes?: AtlasRoute[];
  initialSlug?: string;
  relatedByPlaceId?: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  >;
};

function toPlaceInputs(places: readonly AtlasPlace[]): AtlasPlaceInput[] {
  return places.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    englishName: p.englishName,
    importance: p.importance,
    category: markerKindFor(p),
    latitude: p.atlas.latitude,
    longitude: p.atlas.longitude,
    href: atlasHref(p),
    entityId: p.id,
  }));
}

/**
 * Atlas 2.0 explorer — data → scene engine → pluggable renderer.
 * Artwork is not required; swap renderers via dataset.baseMapProviderId.
 */
export function AtlasExplorer({
  dataset,
  places,
  initialSlug,
  relatedByPlaceId = {},
}: AtlasExplorerProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const cameraApi = useAtlasCamera(wrapRef);

  const [filters, setFilters] = React.useState<Set<AtlasFilter>>(
    () => new Set(ATLAS_FILTERS),
  );
  const [layerVisibility, setLayerVisibility] = React.useState<
    Map<string, boolean>
  >(() => new Map());
  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(
    initialSlug ?? null,
  );
  const [query, setQuery] = React.useState("");
  const [fullscreen, setFullscreen] = React.useState(false);

  const selected = places.find((p) => p.slug === selectedSlug) ?? null;
  const routes = dataset.routes;
  const activeRoute = routes.find((r) => r.id === activeRouteId) ?? null;

  const placeInputs = React.useMemo(() => toPlaceInputs(places), [places]);

  const scene = React.useMemo(
    () =>
      buildAtlasScene({
        dataset,
        places: placeInputs,
        camera: cameraApi.camera,
        filters: {
          categories: filters as ReadonlySet<AtlasFilter>,
          layerVisibility,
          activeRouteId,
          selectedSlug,
        },
      }),
    [
      dataset,
      placeInputs,
      cameraApi.camera,
      filters,
      layerVisibility,
      activeRouteId,
      selectedSlug,
    ],
  );

  const renderer = resolveRenderer(RENDERERS, dataset.baseMapProviderId);

  const hits = React.useMemo(() => {
    const q = query.trim();
    if (!q) return [] as Array<{ place: AtlasPlace; label: string; badge: string }>;
    const fromPlaces = searchEntities(places, q, 8).flatMap((h) => {
      const place = places.find((p) => p.id === h.id);
      if (!place) return [];
      return [
        {
          place,
          label: h.name,
          badge: ENTITY_KIND_LABELS[h.kind],
        },
      ];
    });
    return fromPlaces.slice(0, 8);
  }, [query, places]);

  function focusPlace(place: AtlasPlace, zoom = 2.6) {
    const pt = projectLatLng(
      dataset.projection,
      place.atlas.latitude,
      place.atlas.longitude,
    );
    cameraApi.animateTo(pt, zoom);
    setSelectedSlug(place.slug);
  }

  React.useEffect(() => {
    if (!initialSlug) return;
    const p = places.find((x) => x.slug === initialSlug);
    if (p) {
      const t = window.setTimeout(() => focusPlace(p, 2.8), 120);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  function toggleFilter(f: AtlasFilter) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function toggleLayer(layerId: string) {
    setLayerVisibility((prev) => {
      const next = new Map(prev);
      const layer = dataset.layers.find((l) => l.id === layerId);
      const current = next.has(layerId)
        ? next.get(layerId)!
        : (layer?.defaultVisible ?? true);
      next.set(layerId, !current);
      return next;
    });
  }

  return (
    <div
      ref={wrapRef}
      className={cn(
        "border-border bg-background relative flex min-h-[min(78vh,820px)] flex-col overflow-hidden rounded-3xl border shadow-sm",
        fullscreen && "fixed inset-0 z-50 min-h-svh rounded-none border-0",
      )}
    >
      <div
        data-atlas-ui
        className="from-background/95 absolute inset-x-0 top-0 z-30 flex flex-wrap items-center gap-2 bg-gradient-to-b to-transparent px-3 pb-8 pt-3"
      >
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places…"
            className="border-border bg-background/90 h-11 w-full rounded-xl border py-2 pl-10 pr-4 text-sm shadow-sm outline-none"
            aria-label="Search Atlas"
          />
          {hits.length > 0 && (
            <ul className="border-border bg-background absolute inset-x-0 top-[calc(100%+0.4rem)] z-40 max-h-72 overflow-auto rounded-xl border shadow-md">
              {hits.map((h) => (
                <li key={`${h.place.id}-${h.label}`}>
                  <button
                    type="button"
                    className="hover:bg-muted flex h-11 w-full items-center justify-between gap-2 px-4 text-left text-sm"
                    onClick={() => {
                      setQuery("");
                      focusPlace(h.place, 2.8);
                    }}
                  >
                    <span>{h.label}</span>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      {h.badge}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden flex-wrap gap-1.5 md:flex">
          {ATLAS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFilter(f)}
              className={cn(
                "h-9 rounded-md border px-2.5 text-[11px] tracking-wide transition-divine",
                filters.has(f)
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {ATLAS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="text-muted-foreground ml-auto hidden items-center gap-2 text-[11px] sm:flex">
          <span>Zoom L{scene.semanticLevel}</span>
          <span>·</span>
          <span>{renderer.label}</span>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 cursor-grab active:cursor-grabbing"
        onPointerDown={cameraApi.onPointerDown}
        onPointerMove={cameraApi.onPointerMove}
        onPointerUp={cameraApi.onPointerUp}
        onDoubleClick={cameraApi.onDoubleClick}
      >
        {renderer.render({
          scene,
          viewport: {
            width: dataset.projection.viewBoxWidth,
            height: dataset.projection.viewBoxHeight,
            camera: cameraApi.camera,
          },
          className: "absolute inset-0 h-full w-full",
          handlers: {
            onSelectPlace: (slug) => {
              setSelectedSlug(slug);
              const place = places.find((p) => p.slug === slug);
              if (place) {
                // Single click selects; double-click navigates via panel link
              }
            },
            onSelectCluster: (_id, placeIds) => {
              const first = places.find((p) => placeIds.includes(p.id));
              if (first) focusPlace(first, Math.min(cameraApi.camera.k * 1.4, 4));
            },
            onHoverPlace: () => undefined,
          },
        })}

        <AtlasControls
          fullscreen={fullscreen}
          onFullscreen={() => setFullscreen((v) => !v)}
          onZoomIn={() => cameraApi.zoomBy(1.25)}
          onZoomOut={() => cameraApi.zoomBy(0.8)}
          onReset={() => cameraApi.fitIndia()}
          onFitIndia={() => cameraApi.fitIndia()}
          onLocate={() => {
            if (selected) focusPlace(selected, 3);
          }}
          locateDisabled={!selected}
          panelOpen={Boolean(selected)}
        />

        <div
          data-atlas-ui
          className="border-border bg-background/92 absolute bottom-4 left-3 z-30 hidden w-52 rounded-xl border p-3 shadow-sm backdrop-blur-md sm:block"
        >
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            Layers
          </p>
          <ul className="mb-3 space-y-1">
            {dataset.layers
              .filter((l) => l.kind !== "base")
              .map((l) => {
                const visible =
                  scene.layers.find((s) => s.id === l.id)?.visible ??
                  l.defaultVisible;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => toggleLayer(l.id)}
                      className={cn(
                        "flex h-9 w-full items-center rounded-md px-2 text-left text-xs",
                        visible
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {l.title}
                    </button>
                  </li>
                );
              })}
          </ul>
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <RouteIcon className="h-3.5 w-3.5" aria-hidden />
            Travel paths
          </p>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setActiveRouteId(null)}
                className={cn(
                  "flex h-9 w-full items-center rounded-md px-2 text-left text-xs",
                  !activeRouteId
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                None
              </button>
            </li>
            {routes.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveRouteId((id) => (id === r.id ? null : r.id))
                  }
                  className={cn(
                    "flex h-9 w-full items-center rounded-md px-2 text-left text-xs",
                    activeRouteId === r.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
          {activeRoute ? (
            <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
              {activeRoute.summary}
            </p>
          ) : null}
        </div>

        {selected ? (
          <AtlasPlacePanel
            place={selected}
            related={relatedByPlaceId[selected.id] ?? []}
            onClose={() => setSelectedSlug(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
