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
    <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border bg-background px-3 py-2">
      <button
        type="button"
        onClick={onResetView}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>{t.resetView}</span>
      </button>

      <button
        type="button"
        aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
        title={fullscreen ? t.exitFullscreen : t.fullscreen}
        onClick={onToggleFullscreen}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
