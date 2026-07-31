"use client";

import * as React from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";
import type { GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Route as RouteIcon,
} from "lucide-react";
import type { AtlasDataset, AtlasEvent, AtlasRiver } from "@divine/types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import {
  ACTIVE_TILE_PROVIDER,
  ATLAS_MAX_ZOOM,
  ATLAS_MIN_ZOOM,
  atlasDefaultView,
  atlasMaxBounds,
  buildIllustratedStyle,
  loadStoredViewport,
  saveStoredViewport,
} from "@/lib/atlas/tiles/tile-style";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
  OVERLAY_TOGGLES,
  defaultOverlayVisibility,
  type OverlayToggleId,
} from "@/lib/atlas/overlays/layer-catalog";
import {
  eventsToGeoJson,
  placesToGeoJson,
  riversToGeoJson,
  routeStopsToGeoJson,
  routesToGeoJson,
  selectedKingdomToGeoJson,
} from "@/lib/atlas/overlays/to-geojson";
import { AtlasOverlayLayers } from "@/lib/atlas/renderer/overlay-layers";
import type { AtlasSearchResult } from "@/lib/atlas/search/atlas-search-engine";
import { AtlasMapSearch } from "@/features/atlas/atlas-map-search";
import { AtlasPlacePanel } from "@/features/atlas/atlas-place-panel";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";
import "@/features/atlas/atlas.css";

type AtlasMapAppProps = {
  dataset: AtlasDataset;
  places: AtlasPlace[];
  initialSlug?: string;
  relatedByPlaceId?: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  >;
};

/**
 * Illustrated Ancient Bhārata Atlas — MapLibre interaction over one plate.
 * Artwork is never treated as data. Overlays come from JSON / KG only.
 */
export function AtlasMapApp({
  dataset,
  places,
  initialSlug,
  relatedByPlaceId = {},
}: AtlasMapAppProps) {
  const t = useMessages();
  const mapRef = React.useRef<MapRef>(null);
  const projection = dataset.projection;
  const baseMap = dataset.baseMap;
  const mapStyle = React.useMemo(
    () => buildIllustratedStyle(baseMap, projection),
    [baseMap, projection],
  );
  const maxBounds = React.useMemo(
    () => atlasMaxBounds(projection),
    [projection],
  );
  const defaultView = React.useMemo(
    () => atlasDefaultView(projection),
    [projection],
  );
  const [initialView] = React.useState(() => loadStoredViewport() ?? defaultView);

  const [visibility, setVisibility] = React.useState(defaultOverlayVisibility);
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(
    initialSlug ?? null,
  );
  const [selectedEvent, setSelectedEvent] = React.useState<AtlasEvent | null>(
    null,
  );
  const [selectedRiver, setSelectedRiver] = React.useState<AtlasRiver | null>(
    null,
  );
  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);
  const [routeStopIndex, setRouteStopIndex] = React.useState<number | null>(
    null,
  );
  const [routePlaying, setRoutePlaying] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [cursor, setCursor] = React.useState<string>("grab");

  const selected = places.find((p) => p.slug === selectedSlug) ?? null;
  const activeRoute =
    dataset.routes.find((r) => r.id === activeRouteId) ?? null;

  const placesFc = React.useMemo(
    () => placesToGeoJson(places, visibility),
    [places, visibility],
  );
  const riversFc = React.useMemo(
    () => riversToGeoJson(dataset.rivers, visibility.rivers),
    [dataset.rivers, visibility.rivers],
  );
  const routesFc = React.useMemo(
    () => routesToGeoJson(dataset, places, activeRouteId, visibility.routes),
    [dataset, places, activeRouteId, visibility.routes],
  );
  const routeStopsFc = React.useMemo(
    () => routeStopsToGeoJson(activeRoute, places, routeStopIndex),
    [activeRoute, places, routeStopIndex],
  );
  const eventsFc = React.useMemo(
    () => eventsToGeoJson(dataset.events, visibility.events),
    [dataset.events, visibility.events],
  );
  const kingdomsFc = React.useMemo(
    () =>
      visibility.kingdoms
        ? selectedKingdomToGeoJson(dataset.polygons, selected)
        : { type: "FeatureCollection" as const, features: [] },
    [dataset.polygons, selected, visibility.kingdoms],
  );

  const flyTo = React.useCallback(
    (lng: number, lat: number, zoom = 7.5) => {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: Math.min(Math.max(zoom, ATLAS_MIN_ZOOM), ATLAS_MAX_ZOOM),
        duration: 1100,
        essential: true,
      });
    },
    [],
  );

  const focusPlace = React.useCallback(
    (place: AtlasPlace, zoom = 7.8) => {
      setSelectedSlug(place.slug);
      setSelectedEvent(null);
      setSelectedRiver(null);
      flyTo(place.atlas.longitude, place.atlas.latitude, zoom);
    },
    [flyTo],
  );

  const resetCamera = React.useCallback(() => {
    mapRef.current?.flyTo({
      center: [defaultView.longitude, defaultView.latitude],
      zoom: defaultView.zoom,
      bearing: 0,
      pitch: 0,
      duration: 900,
      essential: true,
    });
  }, [defaultView]);

  const fitAllPlaces = React.useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || places.length === 0) return;
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    for (const p of places) {
      minLng = Math.min(minLng, p.atlas.longitude);
      maxLng = Math.max(maxLng, p.atlas.longitude);
      minLat = Math.min(minLat, p.atlas.latitude);
      maxLat = Math.max(maxLat, p.atlas.latitude);
    }
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 64, duration: 900, maxZoom: 6.5 },
    );
  }, [places]);

  React.useEffect(() => {
    if (!initialSlug) return;
    const p = places.find((x) => x.slug === initialSlug);
    if (p) {
      const timer = window.setTimeout(() => focusPlace(p, 7.8), 450);
      return () => window.clearTimeout(timer);
    }
  }, [initialSlug, places, focusPlace]);

  // Route play — stop-by-stop
  React.useEffect(() => {
    if (!routePlaying || !activeRoute) return;
    const stops = activeRoute.placeIds;
    const idx = routeStopIndex ?? 0;
    const place = places.find((p) => p.id === stops[idx]);
    if (place) focusPlace(place, 7.5);
    if (idx >= stops.length - 1) {
      setRoutePlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setRouteStopIndex(idx + 1), 2200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePlaying, routeStopIndex, activeRouteId]);

  function onSearchSelect(hit: AtlasSearchResult) {
    if (hit.routeId) {
      setActiveRouteId(hit.routeId);
      setRouteStopIndex(0);
      setRoutePlaying(false);
      setVisibility((v) => ({ ...v, routes: true }));
    }
    if (hit.eventId) {
      const ev = dataset.events.find((e) => e.id === hit.eventId) ?? null;
      setSelectedEvent(ev);
      setVisibility((v) => ({ ...v, events: true }));
    }
    if (hit.riverId) {
      const river = dataset.rivers.find((r) => r.id === hit.riverId) ?? null;
      setSelectedRiver(river);
      setVisibility((v) => ({ ...v, rivers: true }));
    }
    if (hit.placeSlug) {
      const place = places.find((p) => p.slug === hit.placeSlug);
      if (place) {
        focusPlace(place, hit.zoom);
        return;
      }
    }
    flyTo(hit.longitude, hit.latitude, hit.zoom);
  }

  function onMapClick(e: MapLayerMouseEvent) {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const layers = [
      OVERLAY_LAYER_IDS.places,
      OVERLAY_LAYER_IDS.placesClusters,
      OVERLAY_LAYER_IDS.events,
      OVERLAY_LAYER_IDS.rivers,
      OVERLAY_LAYER_IDS.routesActive,
      OVERLAY_LAYER_IDS.routes,
      OVERLAY_LAYER_IDS.routeStops,
    ].filter((id) => Boolean(map.getLayer(id)));

    const feats = map.queryRenderedFeatures(e.point, { layers });
    const f = feats[0];
    if (!f) {
      setSelectedSlug(null);
      setSelectedEvent(null);
      setSelectedRiver(null);
      return;
    }

    if (f.layer.id === OVERLAY_LAYER_IDS.placesClusters) {
      const clusterId = f.properties?.cluster_id as number | undefined;
      const source = map.getSource(OVERLAY_SOURCE_IDS.places) as
        | GeoJSONSource
        | undefined;
      if (clusterId != null && source) {
        void source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geom = f.geometry;
          if (geom.type !== "Point") return;
          map.easeTo({
            center: geom.coordinates as [number, number],
            zoom,
            duration: 500,
          });
        });
      }
      return;
    }

    const props = f.properties as Record<string, string> | null;
    if (!props) return;

    if (f.layer.id === OVERLAY_LAYER_IDS.rivers) {
      const river = dataset.rivers.find((r) => r.id === props.id) ?? null;
      setSelectedRiver(river);
      setSelectedEvent(null);
      if (river?.entityId) {
        const place = places.find((p) => p.id === river.entityId);
        if (place) {
          setSelectedSlug(place.slug);
          return;
        }
      }
      flyTo(e.lngLat.lng, e.lngLat.lat, Math.max(map.getZoom(), 6.5));
      return;
    }

    if (f.layer.id === OVERLAY_LAYER_IDS.events) {
      const ev = dataset.events.find((e) => e.id === props.id) ?? null;
      setSelectedEvent(ev);
      setSelectedRiver(null);
      if (ev?.placeId) {
        const place = places.find((p) => p.id === ev.placeId);
        if (place) focusPlace(place, 7.5);
        else flyTo(ev.longitude, ev.latitude, 7.5);
      } else if (ev) {
        flyTo(ev.longitude, ev.latitude, 7.5);
      }
      return;
    }

    if (props.slug) {
      const place = places.find((p) => p.slug === props.slug);
      if (place) focusPlace(place, Math.max(map.getZoom(), 6.8));
    }
  }

  function toggle(id: OverlayToggleId) {
    setVisibility((v) => ({ ...v, [id]: !v[id] }));
  }

  function stepRoute(delta: number) {
    if (!activeRoute) return;
    setRoutePlaying(false);
    setRouteStopIndex((i) => {
      const cur = i ?? 0;
      const next = Math.min(
        Math.max(cur + delta, 0),
        activeRoute.placeIds.length - 1,
      );
      const place = places.find((p) => p.id === activeRoute.placeIds[next]);
      if (place) focusPlace(place, 7.5);
      return next;
    });
  }

  return (
    <div
      className={cn(
        "atlas-shell border-border relative flex h-[min(78vh,820px)] min-h-[480px] flex-col overflow-hidden rounded-3xl border shadow-sm",
        fullscreen && "fixed inset-0 z-50 h-svh min-h-svh rounded-none border-0",
      )}
    >
      <div
        data-atlas-ui
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start gap-2 p-3"
      >
        <div className="pointer-events-auto max-w-full">
          <AtlasMapSearch
            places={places}
            dataset={dataset}
            placeholder={t.searchPlaces}
            onSelect={onSearchSelect}
          />
        </div>
        <div className="pointer-events-none ml-auto hidden rounded-md bg-background/85 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur sm:block">
          {ACTIVE_TILE_PROVIDER.label}
        </div>
      </div>

      <Map
        ref={mapRef}
        mapLib={import("maplibre-gl")}
        initialViewState={initialView}
        style={{ width: "100%", height: "100%", flex: 1 }}
        mapStyle={mapStyle}
        maxBounds={maxBounds}
        minZoom={ATLAS_MIN_ZOOM}
        maxZoom={ATLAS_MAX_ZOOM}
        cursor={cursor}
        dragRotate={false}
        pitchWithRotate={false}
        attributionControl={{ compact: true }}
        onClick={onMapClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("grab")}
        onMoveEnd={(e) => {
          const { longitude, latitude, zoom } = e.viewState;
          saveStoredViewport({ longitude, latitude, zoom });
        }}
        interactiveLayerIds={[
          OVERLAY_LAYER_IDS.places,
          OVERLAY_LAYER_IDS.placesClusters,
          OVERLAY_LAYER_IDS.events,
          OVERLAY_LAYER_IDS.rivers,
          OVERLAY_LAYER_IDS.routeStops,
        ]}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />

        <AtlasOverlayLayers
          places={placesFc}
          rivers={riversFc}
          routes={routesFc}
          routeStops={routeStopsFc}
          events={eventsFc}
          kingdoms={kingdomsFc}
          showLabels={visibility.labels}
          showRoutes={visibility.routes}
          showEvents={visibility.events}
          showRivers={visibility.rivers}
          selectedPlaceSlug={selectedSlug}
          selectedRiverId={selectedRiver?.id ?? null}
        />
      </Map>

      <div
        data-atlas-ui
        className="absolute bottom-28 right-3 z-30 flex flex-col gap-2"
      >
        <button
          type="button"
          aria-label="Reset view"
          className="border-border bg-background inline-flex h-10 w-10 items-center justify-center rounded-md border shadow-sm"
          onClick={resetCamera}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="border-border bg-background inline-flex h-10 w-10 items-center justify-center rounded-md border shadow-sm"
          onClick={() => setFullscreen((v) => !v)}
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <aside
        data-atlas-ui
        className="atlas-sidebar border-border bg-background/94 absolute bottom-4 left-3 top-20 z-30 hidden w-56 flex-col overflow-hidden rounded-xl border shadow-sm backdrop-blur-md sm:flex"
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            {t.layers}
          </p>
          <ul className="mb-4 space-y-1">
            {OVERLAY_TOGGLES.map((layer) => (
              <li key={layer.id}>
                <button
                  type="button"
                  onClick={() => toggle(layer.id)}
                  className={cn(
                    "flex h-9 w-full items-center rounded-md px-2 text-left text-xs",
                    visibility[layer.id]
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {layer.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <RouteIcon className="h-3.5 w-3.5" aria-hidden />
            {t.travelPaths}
          </p>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveRouteId(null);
                  setRoutePlaying(false);
                  setRouteStopIndex(null);
                }}
                className={cn(
                  "flex h-9 w-full items-center rounded-md px-2 text-left text-xs",
                  !activeRouteId
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {t.layerNone}
              </button>
            </li>
            {dataset.routes.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    const next = activeRouteId === r.id ? null : r.id;
                    setActiveRouteId(next);
                    setRoutePlaying(false);
                    setRouteStopIndex(next ? 0 : null);
                    if (next) {
                      setVisibility((v) => ({ ...v, routes: true }));
                      const first = places.find((p) => p.id === r.placeIds[0]);
                      if (first) focusPlace(first, 6.5);
                    }
                  }}
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
            <div className="border-border mt-3 space-y-2 border-t pt-3">
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {activeRoute.summary}
              </p>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  aria-label="Previous stop"
                  className="border-border inline-flex h-9 items-center justify-center rounded-md border"
                  onClick={() => stepRoute(-1)}
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="bg-foreground text-background col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md text-xs"
                  onClick={() => {
                    if (routePlaying) setRoutePlaying(false);
                    else {
                      setRouteStopIndex((i) => i ?? 0);
                      setRoutePlaying(true);
                    }
                  }}
                >
                  {routePlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Play
                    </>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Next stop"
                  className="border-border inline-flex h-9 items-center justify-center rounded-md border"
                  onClick={() => stepRoute(1)}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground w-full text-center text-[11px] underline-offset-2 hover:underline"
                onClick={() => {
                  setRouteStopIndex(0);
                  setRoutePlaying(false);
                  const first = places.find(
                    (p) => p.id === activeRoute.placeIds[0],
                  );
                  if (first) focusPlace(first, 6.5);
                }}
              >
                Restart
              </button>
              {routeStopIndex != null ? (
                <p className="text-muted-foreground text-[11px]">
                  Stop {routeStopIndex + 1} / {activeRoute.placeIds.length}
                </p>
              ) : null}
            </div>
          ) : null}

          {selectedRiver ? (
            <div className="border-border mt-3 space-y-1 border-t pt-3">
              <p className="font-serif text-sm">{selectedRiver.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-sky-900/70">
                {selectedRiver.certainty}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {selectedRiver.summary}
              </p>
            </div>
          ) : null}

          {selectedEvent ? (
            <div className="border-border mt-3 space-y-1 border-t pt-3">
              <p className="font-serif text-sm">{selectedEvent.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-800/80">
                {selectedEvent.certainty}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {selectedEvent.summary}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-4 w-full text-left text-[11px] underline-offset-2 hover:underline"
            onClick={fitAllPlaces}
          >
            Fit all places
          </button>
        </div>
      </aside>

      {selected ? (
        <AtlasPlacePanel
          place={selected}
          related={relatedByPlaceId[selected.id] ?? []}
          onClose={() => setSelectedSlug(null)}
        />
      ) : null}
    </div>
  );
}
