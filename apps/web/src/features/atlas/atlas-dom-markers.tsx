/**
 * DOM markers for Atlas places + traditional labels.
 * Guaranteed visible — does not depend on MapLibre style/source layers.
 */
"use client";

import { Marker } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import { cn } from "@/lib/utils";

const CATEGORY_COLOR: Record<string, string> = {
  kingdom: "#e37400",
  city: "#1a73e8",
  forest: "#188038",
  battlefield: "#c5221f",
  ashrama: "#9334e6",
  river: "#039be5",
  mountain: "#5f6368",
  pilgrimage: "#f9ab00",
  sacred: "#f9ab00",
  region: "#b06000",
  sea: "#1967d2",
};

type AtlasDomMarkersProps = {
  places: FeatureCollection;
  labels: FeatureCollection;
  routeStops: FeatureCollection;
  showLabels: boolean;
  showRoutes: boolean;
  selectedSlug: string | null;
  onPlaceClick: (slug: string) => void;
};

export function AtlasDomMarkers({
  places,
  labels,
  routeStops,
  showLabels,
  showRoutes,
  selectedSlug,
  onPlaceClick,
}: AtlasDomMarkersProps) {
  return (
    <>
      {places.features.map((f) => {
        if (f.geometry.type !== "Point") return null;
        const props = f.properties as {
          id?: string;
          slug?: string;
          name?: string;
          category?: string;
        } | null;
        if (!props?.slug || !props.id) return null;
        const [lng, lat] = f.geometry.coordinates;
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
        const selected = props.slug === selectedSlug;
        const color = CATEGORY_COLOR[props.category ?? ""] ?? "#80868b";
        return (
          <Marker
            key={props.id}
            longitude={lng}
            latitude={lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPlaceClick(props.slug!);
            }}
          >
            <button
              type="button"
              title={props.name ?? props.slug}
              aria-label={props.name ?? props.slug}
              className={cn(
                "rounded-full border-2 border-white shadow-md transition-transform",
                selected ? "h-4 w-4 scale-125" : "h-3 w-3 hover:scale-110",
              )}
              style={{ backgroundColor: color }}
            />
          </Marker>
        );
      })}

      {showLabels
        ? labels.features.map((f) => {
            if (f.geometry.type !== "Point") return null;
            const props = f.properties as {
              id?: string;
              name?: string;
              kind?: string;
            } | null;
            if (!props?.id || !props.name) return null;
            const [lng, lat] = f.geometry.coordinates;
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
            const color = CATEGORY_COLOR[props.kind ?? ""] ?? "#202124";
            return (
              <Marker
                key={`lbl-${props.id}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
                style={{ pointerEvents: "none" }}
              >
                <span
                  className="whitespace-nowrap text-[11px] font-semibold leading-none"
                  style={{
                    color,
                    textShadow:
                      "0 0 3px #fff, 0 0 3px #fff, 1px 1px 2px #fff, -1px -1px 2px #fff",
                  }}
                >
                  {props.name}
                </span>
              </Marker>
            );
          })
        : null}

      {showRoutes
        ? routeStops.features.map((f) => {
            if (f.geometry.type !== "Point") return null;
            const props = f.properties as {
              id?: string;
              slug?: string;
              name?: string;
              category?: string;
              importance?: number;
            } | null;
            if (!props?.id) return null;
            const [lng, lat] = f.geometry.coordinates;
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
            const active = props.category === "active";
            return (
              <Marker
                key={`stop-${props.id}-${props.importance ?? 0}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  if (props.slug) onPlaceClick(props.slug);
                }}
              >
                <button
                  type="button"
                  title={props.name ?? "Stop"}
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-md",
                    active ? "h-7 w-7 bg-orange-500 text-xs" : "h-5 w-5 bg-amber-800 text-[10px]",
                  )}
                >
                  {props.importance ?? ""}
                </button>
              </Marker>
            );
          })
        : null}
    </>
  );
}
