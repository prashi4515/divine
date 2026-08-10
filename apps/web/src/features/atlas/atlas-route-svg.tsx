"use client";

import * as React from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { AtlasRoute } from "@divine/types";
import type { AtlasPlace } from "@/lib/atlas/geo";

const KNOWN_ROUTE_COORDS: Record<string, [number, number]> = {
  "city.indraprastha": [77.25, 28.61],
  "indraprastha": [77.25, 28.61],
  "forest.kamyaka": [76.30, 29.80],
  "kamyaka": [76.30, 29.80],
  "forest.dvaita": [75.80, 29.30],
  "dvaita": [75.80, 29.30],
  "kingdom.virata": [76.85, 26.90],
  "virata": [76.85, 26.90],
  "matsya": [76.85, 26.90],
  "city.hastinapura": [78.02, 29.17],
  "hastinapura": [78.02, 29.17],
  "place.kurukshetra": [76.82, 29.96],
  "kurukshetra": [76.82, 29.96],
  "place.gokula": [77.72, 27.43],
  "gokula": [77.72, 27.43],
  "place.vrindavana": [77.70, 27.58],
  "vrindavana": [77.70, 27.58],
  "city.mathura": [77.67, 27.49],
  "mathura": [77.67, 27.49],
  "city.dvaraka": [68.96, 22.24],
  "dvaraka": [68.96, 22.24],
  "kingdom.pancala": [79.40, 28.35],
  "pancala": [79.40, 28.35],
  "kingdom.kashi": [83.00, 25.31],
  "kashi": [83.00, 25.31],
  "kingdom.magadha": [85.30, 24.80],
  "magadha": [85.30, 24.80],
  "river.sarasvati": [76.50, 29.50],
  "sarasvati": [76.50, 29.50],
  "river.yamuna": [77.50, 28.50],
  "yamuna": [77.50, 28.50],
  "river.ganga": [78.50, 28.00],
  "ganga": [78.50, 28.00],
  "forest.naimisharanya": [80.48, 27.35],
  "naimisharanya": [80.48, 27.35],
};

type AtlasRouteSvgProps = {
  map: MapLibreMap | null;
  activeRoute: AtlasRoute | null;
  places: readonly AtlasPlace[];
};

export function AtlasRouteSvg({ map, activeRoute, places }: AtlasRouteSvgProps) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!map) return;

    function update() {
      setTick((t) => t + 1);
    }

    map.on("move", update);
    map.on("zoom", update);
    map.on("resize", update);

    return () => {
      map.off("move", update);
      map.off("zoom", update);
      map.off("resize", update);
    };
  }, [map]);

  if (!map || !activeRoute) return null;

  const byId = new Map<string, AtlasPlace>();
  for (const p of places) {
    byId.set(p.id, p);
    byId.set(p.slug, p);
  }

  const points: Array<{ x: number; y: number }> = [];

  if (activeRoute.stops && activeRoute.stops.length >= 2) {
    for (const stop of activeRoute.stops) {
      try {
        const pt = map.project([stop.longitude, stop.latitude]);
        points.push({ x: pt.x, y: pt.y });
      } catch {
        /* ignore map project error */
      }
    }
  } else {
    for (const pid of activeRoute.placeIds) {
      const bare = pid.replace(/^[a-z]+\./, "");
      const p = byId.get(pid) ?? byId.get(bare);
      let coords: [number, number] | undefined;

      if (p) {
        coords = [p.atlas.longitude, p.atlas.latitude];
      } else if (KNOWN_ROUTE_COORDS[pid] || KNOWN_ROUTE_COORDS[bare]) {
        coords = KNOWN_ROUTE_COORDS[pid] ?? KNOWN_ROUTE_COORDS[bare];
      }

      if (coords) {
        try {
          const pt = map.project(coords);
          points.push({ x: pt.x, y: pt.y });
        } catch {
          /* map project ignore */
        }
      }
    }
  }

  if (points.length < 2) return null;

  const d = points
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
      <defs>
        <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Soft Casing Glow */}
      <path
        d={d}
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
        filter="url(#routeGlow)"
      />
      {/* Refined 2px Historical Dashed Line */}
      <path
        d={d}
        fill="none"
        stroke="#d97706"
        strokeWidth="2.25"
        strokeDasharray="6 4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}
