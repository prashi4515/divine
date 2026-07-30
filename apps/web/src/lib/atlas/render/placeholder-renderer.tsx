/**
 * Placeholder SVG renderer — structural only (no parchment / illustration).
 * Proves polygons, markers, clusters, paths, and layers without artwork.
 * Replace by registering another AtlasRenderer with the same scene contract.
 */
"use client";

import * as React from "react";
import type { AtlasRenderer, AtlasRenderProps } from "@/lib/atlas/render/types";
import type { AtlasIconId } from "@divine/types";

function iconShape(iconId: AtlasIconId, selected: boolean): React.ReactNode {
  const stroke = selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const fill = selected ? "hsl(var(--foreground) / 0.2)" : "hsl(var(--muted) / 0.8)";
  switch (iconId) {
    case "icon.kingdom":
      return (
        <rect
          x={-5}
          y={-5}
          width={10}
          height={10}
          rx={1.5}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
        />
      );
    case "icon.city":
      return <circle r={4.5} fill={fill} stroke={stroke} strokeWidth={1.2} />;
    case "icon.mountain":
      return (
        <polygon
          points="-6,4 0,-6 6,4"
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
        />
      );
    case "icon.river":
      return (
        <path
          d="M-6,0 Q-2,-4 0,0 T6,0"
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
        />
      );
    case "icon.forest":
      return (
        <circle r={4} fill={fill} stroke={stroke} strokeWidth={1.2} strokeDasharray="2 1.5" />
      );
    case "icon.battlefield":
      return (
        <polygon
          points="0,-5 5,0 0,5 -5,0"
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
        />
      );
    case "icon.cluster":
      return (
        <circle r={10} fill="hsl(var(--muted))" stroke={stroke} strokeWidth={1.4} />
      );
    default:
      return <circle r={3.5} fill={fill} stroke={stroke} strokeWidth={1} />;
  }
}

function ringToPath(ring: Array<{ x: number; y: number }>): string {
  if (ring.length === 0) return "";
  return (
    ring
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z"
  );
}

function PlaceholderSvgView({
  scene,
  viewport,
  handlers,
  className,
}: AtlasRenderProps) {
  const { width: vbW, height: vbH } = {
    width: scene.projection.viewBoxWidth,
    height: scene.projection.viewBoxHeight,
  };
  const { x, y, k } = viewport.camera;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${vbW} ${vbH}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Ancient Bhārata atlas (structural map)"
    >
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        {/* Base frame — not illustrated land */}
        <rect
          x={0}
          y={0}
          width={vbW}
          height={vbH}
          fill="hsl(var(--muted) / 0.35)"
        />
        <rect
          x={12}
          y={12}
          width={vbW - 24}
          height={vbH - 24}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        {/* Kingdom polygons */}
        {scene.polygons.map((poly) => (
          <path
            key={poly.id}
            d={poly.rings.map(ringToPath).join(" ")}
            fill="hsl(var(--muted) / 0.45)"
            stroke="hsl(var(--muted-foreground) / 0.35)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          >
            <title>{poly.title}</title>
          </path>
        ))}

        {/* Travel paths */}
        {scene.paths.map((path) => {
          const d = path.points
            .map(
              (p, i) =>
                `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
            )
            .join(" ");
          return (
            <path
              key={path.id}
              d={d}
              fill="none"
              stroke={
                path.active
                  ? "hsl(var(--foreground))"
                  : "hsl(var(--muted-foreground) / 0.55)"
              }
              strokeWidth={path.active ? 2.2 : 1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={path.active ? undefined : "6 4"}
              vectorEffect="non-scaling-stroke"
              opacity={path.active ? 1 : 0.7}
            >
              <title>{path.title}</title>
            </path>
          );
        })}

        {/* Clusters */}
        {scene.clusters.map((c) => (
          <g
            key={c.id}
            transform={`translate(${c.point.x} ${c.point.y})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlers?.onSelectCluster?.(c.id, c.placeIds);
            }}
          >
            {iconShape("icon.cluster", false)}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              style={{ fontSize: 9, fontWeight: 600 }}
            >
              {c.count}
            </text>
          </g>
        ))}

        {/* Markers */}
        {scene.markers.map((m) => (
          <g
            key={m.id}
            transform={`translate(${m.point.x} ${m.point.y})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlers?.onSelectPlace?.(m.slug);
            }}
            onMouseEnter={() => handlers?.onHoverPlace?.(m.id)}
            onMouseLeave={() => handlers?.onHoverPlace?.(null)}
          >
            {iconShape(m.iconId, m.selected)}
            {m.labelVisible ? (
              <text
                x={0}
                y={12}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 8, fontFamily: "var(--font-serif, serif)" }}
              >
                {m.name}
              </text>
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
}

export const placeholderAtlasRenderer: AtlasRenderer = {
  id: "placeholder",
  label: "Structural SVG (Atlas 2.0)",
  render(props) {
    return <PlaceholderSvgView {...props} />;
  },
};
