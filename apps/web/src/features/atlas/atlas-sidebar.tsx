/**
 * Left Atlas sidebar — search, layers, routes, legend. Never overlays the map.
 */
"use client";

import {
  Layers,
  Pause,
  Play,
  Route as RouteIcon,
  SkipBack,
  SkipForward,
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
  routeStopIndex: number | null;
  routePlaying: boolean;
  onSelectRoute: (routeId: string | null) => void;
  onStepRoute: (delta: number) => void;
  onTogglePlay: () => void;
  onRestartRoute: () => void;
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
            {t.travelPaths}
          </p>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => onSelectRoute(null)}
                className={cn(
                  "flex h-9 w-full items-center rounded-md px-2 text-left text-sm",
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
                  onClick={() =>
                    onSelectRoute(activeRouteId === r.id ? null : r.id)
                  }
                  className={cn(
                    "flex h-9 w-full items-center rounded-md px-2 text-left text-sm",
                    activeRouteId === r.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {atlasRouteLabel(t, r)}
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
                  onClick={() => onStepRoute(-1)}
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="bg-foreground text-background col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md text-xs"
                  onClick={onTogglePlay}
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
                  onClick={() => onStepRoute(1)}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground w-full text-center text-[11px] underline-offset-2 hover:underline"
                onClick={onRestartRoute}
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
