/**
 * Left Atlas sidebar — search, layers, routes, legend. Never overlays the map.
 */
"use client";

import {
  Layers,
  Route as RouteIcon,
} from "lucide-react";
import type { AtlasDataset, AtlasEvent, AtlasRiver, AtlasRoute } from "@divine/types";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import type { OverlayToggleId } from "@/lib/atlas/overlays/layer-catalog";
import { OVERLAY_TOGGLES } from "@/lib/atlas/overlays/layer-catalog";
import type {
  AtlasSearchPerson,
  AtlasSearchResult,
} from "@/lib/atlas/search/atlas-search-engine";
import { AtlasMapSearch } from "@/features/atlas/atlas-map-search";
import { atlasRouteLabel } from "@/lib/atlas/i18n-labels";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

type AtlasSidebarProps = {
  places: readonly AtlasPlace[];
  dataset: AtlasDataset;
  traditionalLabels?: readonly TraditionalAtlasLabel[];
  relatedPeople?: readonly AtlasSearchPerson[];
  visibility: Record<OverlayToggleId, boolean>;
  onToggle: (id: OverlayToggleId) => void;
  onSearchSelect: (hit: AtlasSearchResult) => void;
  activeRouteId: string | null;
  activeRoute: AtlasRoute | null;
  routeStopIndex?: number | null;
  routePlaying?: boolean;
  onSelectRoute: (routeId: string | null) => void;
  onStepRoute?: (delta: number) => void;
  onTogglePlay?: () => void;
  onRestartRoute?: () => void;
  selectedRiver: AtlasRiver | null;
  selectedEvent: AtlasEvent | null;
};

function layerLabel(
  id: OverlayToggleId,
  t: ReturnType<typeof useMessages>,
): string {
  switch (id) {
    case "kingdoms":
      return t.filterKingdoms;
    case "cities":
      return t.filterCities;
    case "rivers":
      return t.filterRivers;
    case "forests":
      return t.filterForests;
    case "mountains":
      return t.filterMountains;
    case "ashramas":
      return t.filterAshramas;
    case "battlefields":
      return t.filterBattlefields;
    case "events":
      return t.navEvents;
    case "routes":
      return t.travelPaths;
    case "pilgrimage":
      return t.filterPilgrimage;
    case "labels":
      return t.layerLabels;
    default:
      return id;
  }
}

const LEGEND = [
  { color: "#c47848", labelKey: "filterKingdoms" as const },
  { color: "#3d6a8a", labelKey: "filterCities" as const },
  { color: "#1a6a9a", labelKey: "filterRivers" as const },
  { color: "#3d6a40", labelKey: "filterForests" as const },
  { color: "#5a4030", labelKey: "filterMountains" as const },
  { color: "#8a3030", labelKey: "filterBattlefields" as const },
];

export function AtlasSidebar({
  places,
  dataset,
  traditionalLabels = [],
  relatedPeople = [],
  visibility,
  onToggle,
  onSearchSelect,
  activeRouteId,
  activeRoute,
  routeStopIndex,
  routePlaying,
  onSelectRoute,
  onStepRoute,
  onTogglePlay,
  onRestartRoute,
  selectedRiver,
  selectedEvent,
}: AtlasSidebarProps) {
  const t = useMessages();

  return (
    <aside className="atlas-sidebar border-border bg-background flex h-full w-full max-w-none shrink-0 flex-col overflow-hidden border-r md:w-[340px]">
      <div className="border-border relative z-20 shrink-0 space-y-3 overflow-visible border-b p-3">
        <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
          Atlas
        </p>
        <AtlasMapSearch
          places={places}
          dataset={dataset}
          traditionalLabels={traditionalLabels}
          relatedPeople={relatedPeople}
          placeholder={t.searchPlaces}
          onSelect={onSearchSelect}
          layout="sidebar"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-3">
        <section>
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            {t.layers}
          </p>
          <ul className="space-y-1">
            {OVERLAY_TOGGLES.map((layer) => (
              <li key={layer.id}>
                <label className="hover:bg-muted/60 flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm">
                  <input
                    type="checkbox"
                    checked={visibility[layer.id]}
                    onChange={() => onToggle(layer.id)}
                    className="accent-foreground h-3.5 w-3.5"
                  />
                  <span>{layerLabel(layer.id, t)}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <RouteIcon className="h-3.5 w-3.5" aria-hidden />
            Journeys & Pilgrimages
          </p>

          <div className="space-y-3">
            {/* Exile Journeys Group */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-1">
              <p className="text-[11px] font-semibold text-foreground px-1.5 py-1 uppercase tracking-wider">
                Pandavas — Exile Journeys
              </p>
              {dataset.routes
                .filter((r) => r.parentCategory === "pandava-exile" || r.category === "initial-exile" || r.category === "forest-residences" || r.category === "tirtha-yatra" || r.category === "individual-journeys" || r.category === "virata-year")
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRoute(activeRouteId === r.id || activeRouteId === r.slug ? null : r.id)}
                    className={cn(
                      "flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-xs transition-divine",
                      activeRouteId === r.id || activeRouteId === r.slug
                        ? "bg-foreground text-background font-medium shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="truncate">{r.title}</span>
                    <span className="text-[10px] opacity-70 shrink-0 ml-1">
                      {r.stops?.length ?? r.placeIds.length} stops
                    </span>
                  </button>
                ))}
            </div>

            {/* Epic Campaigns Group */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-1">
              <p className="text-[11px] font-semibold text-foreground px-1.5 py-1 uppercase tracking-wider">
                Epic Campaigns & Pilgrimages
              </p>
              {dataset.routes
                .filter((r) => r.parentCategory !== "pandava-exile" && r.category !== "initial-exile" && r.category !== "forest-residences" && r.category !== "tirtha-yatra" && r.category !== "individual-journeys" && r.category !== "virata-year")
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRoute(activeRouteId === r.id || activeRouteId === r.slug ? null : r.id)}
                    className={cn(
                      "flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-xs transition-divine",
                      activeRouteId === r.id || activeRouteId === r.slug
                        ? "bg-foreground text-background font-medium shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="truncate">{r.title}</span>
                    <span className="text-[10px] opacity-70 shrink-0 ml-1">
                      {r.stops?.length ?? r.placeIds.length} stops
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Active Route Detail Card */}
          {activeRoute ? (
            <div className="border-border mt-4 space-y-3 border-t pt-3">
              <div>
                <p className="font-serif text-sm font-medium">{activeRoute.title}</p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {activeRoute.summary}
                </p>
              </div>

              {/* Journey Stops Overview */}
              {activeRoute.stops && activeRoute.stops.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span>Journey Sequence</span>
                    <span>{activeRoute.stops.length} Stops</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {activeRoute.stops.map((stop, idx) => (
                      <div
                        key={stop.id || idx}
                        className="rounded-md border border-border/80 bg-muted/20 p-2 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-foreground truncate">
                            {idx + 1}. {stop.ancientName}
                          </span>
                          <span className="cta-saffron shrink-0 rounded px-1.5 py-0.2 text-[8px] font-semibold text-white uppercase">
                            {stop.locationType ?? "stop"}
                          </span>
                        </div>
                        {stop.modernName ? (
                          <p className="text-[10px] text-muted-foreground">{stop.modernName}</p>
                        ) : null}
                        {stop.narrative ? (
                          <p className="text-[10px] text-muted-foreground italic leading-tight">
                            "{stop.narrative}"
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {(selectedRiver || selectedEvent) && (
          <section className="border-border space-y-2 border-t pt-3">
            {selectedRiver ? (
              <div>
                <p className="font-serif text-sm">{selectedRiver.name}</p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {selectedRiver.summary}
                </p>
              </div>
            ) : null}
            {selectedEvent ? (
              <div>
                <p className="font-serif text-sm">{selectedEvent.name}</p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {selectedEvent.summary}
                </p>
              </div>
            ) : null}
          </section>
        )}

        <section>
          <p className="text-muted-foreground mb-2 text-[10px] font-medium uppercase tracking-[0.16em]">
            Legend
          </p>
          <ul className="space-y-1.5">
            {LEGEND.map((item) => (
              <li
                key={item.labelKey}
                className="text-muted-foreground flex items-center gap-2 text-xs"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden
                />
                {t[item.labelKey]}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
