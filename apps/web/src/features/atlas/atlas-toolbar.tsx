/**
 * Atlas top toolbar — layer toggles outside the map (Google Maps style).
 */
"use client";

import {
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import {
  OVERLAY_TOGGLES,
  type OverlayToggleId,
} from "@/lib/atlas/overlays/layer-catalog";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

const TOOLBAR_ORDER: OverlayToggleId[] = [
  "kingdoms",
  "cities",
  "rivers",
  "forests",
  "mountains",
  "ashramas",
  "battlefields",
  "events",
  "routes",
  "pilgrimage",
  "labels",
];

function toggleLabel(
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

type AtlasToolbarProps = {
  visibility: Record<OverlayToggleId, boolean>;
  onToggle: (id: OverlayToggleId) => void;
  onResetView: () => void;
  onFitIndia: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function AtlasToolbar({
  visibility,
  onToggle,
  onResetView,
  onFitIndia,
  fullscreen,
  onToggleFullscreen,
}: AtlasToolbarProps) {
  const t = useMessages();
  const toggles = TOOLBAR_ORDER.map(
    (id) => OVERLAY_TOGGLES.find((x) => x.id === id)!,
  ).filter(Boolean);

  return (
    <div className="border-border bg-background flex shrink-0 items-center gap-2 border-b px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {toggles.map((layer) => {
          const on = visibility[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
              aria-pressed={on}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                on
                  ? "bg-foreground text-background"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {toggleLabel(layer.id, t)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onToggle("labels")}
          aria-pressed={visibility.labels}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            visibility.labels
              ? "bg-foreground text-background"
              : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {t.layerLabels}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onFitIndia}
          className="text-muted-foreground hover:text-foreground hover:bg-muted hidden rounded-md px-2.5 py-1.5 text-xs sm:inline-flex"
        >
          Fit India
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={onResetView}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-md border"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={onToggleFullscreen}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-md border"
        >
          {fullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
