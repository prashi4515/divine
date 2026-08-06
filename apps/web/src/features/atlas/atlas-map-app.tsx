"use client";

import * as React from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { Layers, X } from "lucide-react";
import type { GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AtlasDataset, AtlasEvent, AtlasRiver } from "@divine/types";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import {
  ATLAS_MAX_ZOOM,
  ATLAS_MIN_ZOOM,
  atlasDefaultView,
  atlasMaxBounds,
  buildCleanMapStyle,
  loadStoredViewport,
  saveStoredViewport,
} from "@/lib/atlas/tiles/tile-style";
import {
  OVERLAY_LAYER_IDS,
  OVERLAY_SOURCE_IDS,
  defaultOverlayVisibility,
  type OverlayToggleId,
} from "@/lib/atlas/overlays/layer-catalog";
import {
  eventsToGeoJson,
  kingdomsToGeoJson,
  placesToGeoJson,
  riversToGeoJson,
  routeStopsToGeoJson,
  routesToGeoJson,
  selectedKingdomToGeoJson,
  traditionalLabelsToGeoJson,
} from "@/lib/atlas/overlays/to-geojson";
import { syncAtlasOverlays } from "@/lib/atlas/renderer/sync-overlays";
import { AtlasOverlayLayers } from "@/lib/atlas/renderer/overlay-layers";
import type { AtlasSearchResult } from "@/lib/atlas/search/atlas-search-engine";
import { AtlasDomMarkers } from "@/features/atlas/atlas-dom-markers";
import { AtlasPlacePanel } from "@/features/atlas/atlas-place-panel";
import { AtlasSidebar } from "@/features/atlas/atlas-sidebar";
import { AtlasToolbar } from "@/features/atlas/atlas-toolbar";
import { useReadingStore } from "@/lib/stores/reading-store";
import { cn } from "@/lib/utils";
import "@/features/atlas/atlas.css";

type AtlasMapAppProps = {
  dataset: AtlasDataset;
  places: AtlasPlace[];
  traditionalLabels?: readonly TraditionalAtlasLabel[];
  initialSlug?: string;
  relatedByPlaceId?: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  >;
};

/**
 * Google Maps–style Ancient Bhārata Atlas.
 * Controls live outside the map; MapLibre owns pan/zoom/flyTo only.
 */
export function AtlasMapApp({
  dataset,
  places,
  traditionalLabels = [],
  initialSlug,
  relatedByPlaceId = {},
}: AtlasMapAppProps) {
  const lang = useReadingStore((s) => s.preferredLanguage);
  const mapRef = React.useRef<MapRef>(null);
  const projection = dataset.projection;
  const baseMap = dataset.baseMap;
  const maxBounds = React.useMemo(
    () => atlasMaxBounds(projection),
    [projection],
  );
  const defaultView = React.useMemo(
    () => atlasDefaultView(projection),
    [projection],
  );
  const [initialView] = React.useState(() => loadStoredViewport() ?? defaultView);

  const [visibility, setVisibility] = React.useState(() =>
    defaultOverlayVisibility(),
  );
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [hoveredRiverId, setHoveredRiverId] = React.useState<string | null>(
    null,
  );
  const [hoveredKingdomId, setHoveredKingdomId] = React.useState<string | null>(
    null,
  );

  const selected = places.find((p) => p.slug === selectedSlug) ?? null;
  const activeRoute =
    dataset.routes.find((r) => r.id === activeRouteId) ?? null;

  const relatedPeople = React.useMemo(() => {
    const out: Array<{
      id: string;
      name: string;
      placeSlug: string;
      longitude: number;
      latitude: number;
    }> = [];
    const seen = new Set<string>();
    for (const place of places) {
      const related = relatedByPlaceId[place.id] ?? [];
      for (const person of related) {
        if (!person.id.startsWith("person.") || seen.has(person.id)) continue;
        seen.add(person.id);
        out.push({
          id: person.id,
          name: person.name,
          placeSlug: place.slug,
          longitude: place.atlas.longitude,
          latitude: place.atlas.latitude,
        });
      }
    }
    return out;
  }, [places, relatedByPlaceId]);

  const placesFc = React.useMemo(
    () => placesToGeoJson(places, visibility, lang),
    [places, visibility, lang],
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
    () => kingdomsToGeoJson(dataset.polygons, visibility.kingdoms),
    [dataset.polygons, visibility.kingdoms],
  );
  const kingdomsSelectedFc = React.useMemo(
    () => selectedKingdomToGeoJson(dataset.polygons, selected),
    [dataset.polygons, selected],
  );
  const traditionalLabelsFc = React.useMemo(
    () => traditionalLabelsToGeoJson(traditionalLabels, lang, visibility),
    [traditionalLabels, lang, visibility],
  );

  // Basemap style is frozen for the map lifetime. Overlays are React
  // children (Source/Layer + DOM Markers) — never baked into mapStyle.
  const mapStyle = React.useMemo(
    () => buildCleanMapStyle(baseMap?.credit),
    [baseMap?.credit],
  );

  const emptyFc = React.useMemo(
    () => ({ type: "FeatureCollection" as const, features: [] }),
    [],
  );

  // Line overlays via imperative API (DOM Markers cover points/labels).
  const [mapReady, setMapReady] = React.useState(false);
  React.useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapReady) return;
    try {
      syncAtlasOverlays(
        map,
        {
          places: emptyFc,
          rivers: riversFc,
          routes: routesFc,
          routeStops: emptyFc,
          events: eventsFc,
          kingdoms: kingdomsFc,
          kingdomsSelected: kingdomsSelectedFc,
          traditionalLabels: emptyFc,
        },
        {
          showLabels: false,
          showRoutes: visibility.routes || Boolean(activeRouteId),
          activeRouteId,
          showEvents: visibility.events,
          showRivers: visibility.rivers,
          showKingdoms: visibility.kingdoms,
          selectedPlaceSlug: selectedSlug,
          selectedRiverId: selectedRiver?.id ?? null,
          hoveredRiverId,
          hoveredKingdomId,
        },
      );
    } catch (err) {
      console.error("[atlas] line overlay sync failed", err);
    }
  }, [
    mapReady,
    emptyFc,
    riversFc,
    routesFc,
    eventsFc,
    kingdomsFc,
    kingdomsSelectedFc,
    visibility.routes,
    visibility.events,
    visibility.rivers,
    visibility.kingdoms,
    selectedSlug,
    selectedRiver?.id,
    hoveredRiverId,
    hoveredKingdomId,
  ]);

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
      { padding: 72, duration: 900, maxZoom: 6.5 },
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
    setMobileSidebarOpen(false);
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

  function onMapMouseMove(e: MapLayerMouseEvent) {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const hoverLayers = [
      OVERLAY_LAYER_IDS.rivers,
      OVERLAY_LAYER_IDS.kingdomsFill,
      OVERLAY_LAYER_IDS.places,
      OVERLAY_LAYER_IDS.events,
    ].filter((id) => Boolean(map.getLayer(id)));
    if (hoverLayers.length === 0) return;
    const feats = map.queryRenderedFeatures(e.point, { layers: hoverLayers });
    const f = feats[0];
    if (!f) {
      setHoveredRiverId(null);
      setHoveredKingdomId(null);
      setCursor("grab");
      return;
    }
    setCursor("pointer");
    const props = f.properties as Record<string, string> | null;
    if (f.layer.id === OVERLAY_LAYER_IDS.rivers) {
      setHoveredRiverId(props?.id ?? null);
      setHoveredKingdomId(null);
      return;
    }
    if (f.layer.id === OVERLAY_LAYER_IDS.kingdomsFill) {
      setHoveredKingdomId(props?.id ?? null);
      setHoveredRiverId(null);
      return;
    }
    setHoveredRiverId(null);
    setHoveredKingdomId(null);
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

    if (f.layer.id === OVERLAY_LAYER_IDS.kingdomsFill) {
      const poly = dataset.polygons.find((p) => p.id === props.id);
      if (poly?.entityId) {
        const place = places.find((p) => p.id === poly.entityId);
        if (place) {
          focusPlace(place, Math.max(map.getZoom(), 6.5));
          return;
        }
      }
      if (poly?.slug) {
        const place = places.find(
          (p) => p.slug === poly.slug || p.id === `kingdom.${poly.slug}`,
        );
        if (place) focusPlace(place, Math.max(map.getZoom(), 6.5));
      }
      return;
    }

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

  function selectRoute(routeId: string | null) {
    setActiveRouteId(routeId);
    setRoutePlaying(false);
    setRouteStopIndex(routeId ? 0 : null);
    if (routeId) {
      setVisibility((v) => ({ ...v, routes: true }));
      const route = dataset.routes.find(
        (r) => r.id === routeId || r.slug === routeId,
      );
      if (route) {
        const routePlaces = route.placeIds
          .map((id) => places.find((p) => p.id === id))
          .filter((p): p is AtlasPlace => Boolean(p));

        const map = mapRef.current?.getMap();
        if (map && routePlaces.length > 0) {
          let minLng = Infinity;
          let minLat = Infinity;
          let maxLng = -Infinity;
          let maxLat = -Infinity;
          for (const p of routePlaces) {
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
            { padding: 80, duration: 900, maxZoom: 7.5 },
          );
        }
      }
    }
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

  const sidebar = (
    <AtlasSidebar
      places={places}
      dataset={dataset}
      traditionalLabels={traditionalLabels}
      relatedPeople={relatedPeople}
      visibility={visibility}
      onToggle={toggle}
      onSearchSelect={onSearchSelect}
      activeRouteId={activeRouteId}
      activeRoute={activeRoute}
      routeStopIndex={routeStopIndex}
      routePlaying={routePlaying}
      onSelectRoute={selectRoute}
      onStepRoute={stepRoute}
      onTogglePlay={() => {
        if (routePlaying) setRoutePlaying(false);
        else {
          setRouteStopIndex((i) => i ?? 0);
          setRoutePlaying(true);
        }
      }}
      onRestartRoute={() => {
        if (!activeRoute) return;
        setRouteStopIndex(0);
        setRoutePlaying(false);
        const first = places.find((p) => p.id === activeRoute.placeIds[0]);
        if (first) focusPlace(first, 6.5);
      }}
      selectedRiver={selectedRiver}
      selectedEvent={selectedEvent}
    />
  );

  return (
    <div
      className={cn(
        "atlas-shell bg-background flex h-full min-h-0 w-full overflow-hidden",
        fullscreen && "fixed inset-0 z-50 h-svh min-h-svh",
      )}
    >
      {/* Desktop sidebar */}
      <div className="hidden h-full md:flex">{sidebar}</div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close layers"
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[min(100%,320px)] flex-col shadow-2xl">
            <div className="bg-background flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search & Layers
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileSidebarOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
          </div>
        </div>
      ) : null}

      <div className="relative min-w-0 flex-1 h-full w-full overflow-hidden">
        {/* Floating top-right controls (Reset + Fullscreen) */}
        <div className="absolute top-3 right-3 z-30 pointer-events-none">
          <AtlasToolbar
            onResetView={resetCamera}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen((v) => !v)}
          />
        </div>

        {/* Floating mobile Search & Layers button */}
        <button
          type="button"
          className="absolute top-3 left-3 z-30 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border/80 bg-background/95 backdrop-blur-md px-3 text-xs font-medium text-foreground shadow-lg transition-all hover:bg-muted active:scale-95 md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Search & layers</span>
        </button>

        <Map
            ref={mapRef}
            mapLib={import("maplibre-gl")}
            initialViewState={initialView}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyle}
            maxBounds={maxBounds}
            minZoom={ATLAS_MIN_ZOOM}
            maxZoom={ATLAS_MAX_ZOOM}
            cursor={cursor}
            dragRotate={false}
            pitchWithRotate={false}
            attributionControl={{ compact: true }}
            onClick={onMapClick}
            onMouseMove={onMapMouseMove}
            onMouseLeave={() => {
              setCursor("grab");
              setHoveredRiverId(null);
              setHoveredKingdomId(null);
            }}
            onMoveEnd={(e) => {
              const { longitude, latitude, zoom } = e.viewState;
              saveStoredViewport({ longitude, latitude, zoom });
            }}
            onLoad={() => {
              mapRef.current?.getMap().resize();
              setMapReady(true);
            }}
            onError={(e) => {
              console.error("[atlas]", e.error);
            }}
            interactiveLayerIds={[
              OVERLAY_LAYER_IDS.events,
              OVERLAY_LAYER_IDS.rivers,
              OVERLAY_LAYER_IDS.kingdomsFill,
            ]}
          >
            <AtlasOverlayLayers
              places={placesFc}
              rivers={riversFc}
              routes={routesFc}
              routeStops={routeStopsFc}
              events={eventsFc}
              kingdoms={kingdomsFc}
              kingdomsSelected={kingdomsSelectedFc}
              traditionalLabels={traditionalLabelsFc}
              showLabels={visibility.labels}
              showRoutes={visibility.routes}
              activeRouteId={activeRouteId}
              showEvents={visibility.events}
              showRivers={visibility.rivers}
              showKingdoms={visibility.kingdoms}
              selectedPlaceSlug={selectedSlug}
              selectedRiverId={selectedRiver?.id ?? null}
              hoveredRiverId={hoveredRiverId}
              hoveredKingdomId={hoveredKingdomId}
            />
            <AtlasDomMarkers
              places={placesFc}
              labels={traditionalLabelsFc}
              routeStops={routeStopsFc}
              showLabels={visibility.labels}
              showRoutes={visibility.routes}
              activeRouteId={activeRouteId}
              selectedSlug={selectedSlug}
              onPlaceClick={(slug) => {
                const place = places.find((p) => p.slug === slug);
                if (place) {
                  focusPlace(
                    place,
                    Math.max(mapRef.current?.getZoom() ?? 6, 6.8),
                  );
                }
              }}
            />
            <NavigationControl position="bottom-right" showCompass={false} />
            <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
          </Map>
        </div>

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
