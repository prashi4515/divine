"use client";

import type { ReactNode } from "react";
import {
  Compass,
  Crosshair,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AtlasControlsProps = {
  fullscreen: boolean;
  onFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitIndia: () => void;
  onLocate: () => void;
  locateDisabled?: boolean;
  panelOpen?: boolean;
};

export function AtlasControls({
  fullscreen,
  onFullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitIndia,
  onLocate,
  locateDisabled,
  panelOpen,
}: AtlasControlsProps) {
  const items: Array<{
    label: string;
    aria: string;
    onClick: () => void;
    icon: ReactNode;
    disabled?: boolean;
  }> = [
    {
      label: "Zoom in",
      aria: "Zoom in",
      onClick: onZoomIn,
      icon: <Plus className="h-5 w-5" />,
    },
    {
      label: "Zoom out",
      aria: "Zoom out",
      onClick: onZoomOut,
      icon: <Minus className="h-5 w-5" />,
    },
    {
      label: "Reset",
      aria: "Reset view",
      onClick: onReset,
      icon: <RotateCcw className="h-5 w-5" />,
    },
    {
      label: "Fit India",
      aria: "Fit India",
      onClick: onFitIndia,
      icon: <Compass className="h-5 w-5" />,
    },
    {
      label: "Locate",
      aria: "Locate selected place",
      onClick: onLocate,
      icon: <Crosshair className="h-5 w-5" />,
      disabled: locateDisabled,
    },
    {
      label: fullscreen ? "Exit" : "Full",
      aria: fullscreen ? "Exit fullscreen" : "Fullscreen",
      onClick: onFullscreen,
      icon: fullscreen ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <Maximize2 className="h-5 w-5" />
      ),
    },
  ];

  return (
    <div
      data-atlas-ui
      className={cn(
        "pointer-events-auto absolute z-30 transition-[right] duration-200",
        "bottom-4 left-1/2 -translate-x-1/2",
        "sm:bottom-5 sm:left-auto sm:translate-x-0",
        panelOpen ? "sm:right-[24rem]" : "sm:right-5",
      )}
    >
      <div className="flex gap-1 rounded-2xl border border-[#c4a574]/50 bg-[#faf3e0]/95 p-1.5 shadow-xl backdrop-blur-md sm:flex-col">
        {items.map((item) => (
          <button
            key={item.aria}
            type="button"
            aria-label={item.aria}
            title={item.label}
            disabled={item.disabled}
            onClick={item.onClick}
            className={cn(
              "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl px-3 text-[#5a3f18] transition",
              "hover:bg-[#efe0c0] active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6a3a]",
              item.disabled && "cursor-not-allowed opacity-35",
            )}
          >
            {item.icon}
            <span className="hidden text-[11px] font-medium sm:inline">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
