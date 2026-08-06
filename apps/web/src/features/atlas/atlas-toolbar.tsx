/**
 * Atlas top toolbar — reset and fullscreen controls outside the map.
 */
"use client";

import {
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { useMessages } from "@/lib/i18n/use-messages";

type AtlasToolbarProps = {
  onResetView: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function AtlasToolbar({
  onResetView,
  fullscreen,
  onToggleFullscreen,
}: AtlasToolbarProps) {
  const t = useMessages();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-background/95 p-1 backdrop-blur-md shadow-lg pointer-events-auto">
      <button
        type="button"
        onClick={onResetView}
        className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>{t.resetView}</span>
      </button>

      <div className="h-4 w-px bg-border/60" aria-hidden />

      <button
        type="button"
        aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
        title={fullscreen ? t.exitFullscreen : t.fullscreen}
        onClick={onToggleFullscreen}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        {fullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
