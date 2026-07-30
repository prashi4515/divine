"use client";

import {
  ATLAS_VIEWBOX,
  projectLatLng,
  semanticLevelFromScale,
  type SemanticLevel,
} from "@/lib/atlas/geo";
import {
  CARDINAL_LABELS,
  KINGDOM_REGIONS,
  MOUNTAIN_LABELS,
  RIVER_PATHS,
  SEA_LABELS,
  himalayaWashPath,
  indiaLandPath,
  kingdomPath,
  lankaLandPath,
  riverPathD,
  vindhyaWashPath,
  type KingdomRegion,
} from "@/lib/atlas/geography";

function centroid(k: KingdomRegion): { x: number; y: number } {
  let sx = 0;
  let sy = 0;
  for (const [lat, lng] of k.ring) {
    const p = projectLatLng(lat, lng);
    sx += p.x;
    sy += p.y;
  }
  const n = k.ring.length || 1;
  return { x: sx / n, y: sy / n };
}

/**
 * Museum-style parchment base — coastline, mountain wash, soft region labels.
 * Not a node graph: territories are faint ink washes, not opaque cards.
 */
export function AtlasBaseMap({
  scale,
  showKingdoms,
}: {
  scale: number;
  showKingdoms: boolean;
}) {
  const level: SemanticLevel = semanticLevelFromScale(scale);
  const land = indiaLandPath();
  const lanka = lankaLandPath();
  const himalaya = himalayaWashPath();
  const vindhya = vindhyaWashPath();

  return (
    <g className="atlas-base" aria-hidden>
      <defs>
        <linearGradient id="ocean" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#c5d8e6" />
          <stop offset="55%" stopColor="#aec8da" />
          <stop offset="100%" stopColor="#96b4c8" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f3e6c8" />
          <stop offset="50%" stopColor="#e8d4a8" />
          <stop offset="100%" stopColor="#dcc290" />
        </linearGradient>
        <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a6a48" />
          <stop offset="60%" stopColor="#b89468" />
          <stop offset="100%" stopColor="#d4b888" />
        </linearGradient>
        <pattern
          id="parchment"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <rect width="48" height="48" fill="transparent" />
          <circle cx="6" cy="10" r="0.6" fill="#5a3f18" opacity="0.045" />
          <circle cx="28" cy="30" r="0.8" fill="#5a3f18" opacity="0.035" />
          <circle cx="40" cy="14" r="0.45" fill="#5a3f18" opacity="0.04" />
        </pattern>
      </defs>

      <rect
        width={ATLAS_VIEWBOX.width}
        height={ATLAS_VIEWBOX.height}
        fill="url(#ocean)"
      />
      <rect
        width={ATLAS_VIEWBOX.width}
        height={ATLAS_VIEWBOX.height}
        fill="url(#parchment)"
      />

      <path
        d={land}
        fill="url(#land)"
        stroke="#8a6a40"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d={lanka}
        fill="url(#land)"
        stroke="#8a6a40"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Himalayan / Hindukush relief */}
      <path d={himalaya} fill="url(#mtn)" opacity="0.55" />
      <path
        d={himalaya}
        fill="none"
        stroke="#6a4a28"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path d={vindhya} fill="#c4a878" opacity="0.28" />

      {/* Thar wash */}
      <ellipse
        cx={projectLatLng(27, 72).x}
        cy={projectLatLng(27, 72).y}
        rx="52"
        ry="36"
        fill="#e0c878"
        opacity="0.28"
      />
      {level >= 2 ? (
        <text
          x={projectLatLng(27.2, 71.5).x}
          y={projectLatLng(27.2, 71.5).y}
          fill="#8a6a30"
          fontSize="9"
          fontFamily="Georgia, serif"
          opacity="0.55"
          letterSpacing="0.12em"
        >
          THAR
        </text>
      ) : null}

      {/* Soft kingdom washes + museum ALL-CAPS labels */}
      {showKingdoms
        ? KINGDOM_REGIONS.map((k) => {
            const c = centroid(k);
            return (
              <g key={k.id}>
                <path
                  d={kingdomPath(k)}
                  fill="#c4a878"
                  fillOpacity={level === 1 ? 0.14 : 0.07}
                  stroke="#8a6a40"
                  strokeWidth="0.7"
                  strokeOpacity="0.28"
                />
                {level <= 2 ? (
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#3d2a12"
                    fontSize={level === 1 ? 11 : 8}
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontWeight="700"
                    letterSpacing="0.08em"
                    opacity={level === 1 ? 0.85 : 0.55}
                    style={{ pointerEvents: "none" }}
                  >
                    {k.iast.toUpperCase()}
                  </text>
                ) : null}
              </g>
            );
          })
        : null}

      {RIVER_PATHS.map((r) => (
        <g key={r.id}>
          <path
            d={riverPathD(r)}
            fill="none"
            stroke="#1a3a50"
            strokeWidth={r.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          {level >= 2 ? (
            <text
              x={
                projectLatLng(...r.points[Math.floor(r.points.length / 2)]!)
                  .x + 5
              }
              y={
                projectLatLng(...r.points[Math.floor(r.points.length / 2)]!)
                  .y - 3
              }
              fill="#1a3a50"
              fontSize="8"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              opacity="0.7"
            >
              {r.name}
            </text>
          ) : null}
        </g>
      ))}

      {level >= 2
        ? MOUNTAIN_LABELS.map((m) => {
            const p = projectLatLng(m.lat, m.lng);
            return (
              <text
                key={m.name}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                fill="#5a4030"
                fontSize="9"
                fontFamily="Georgia, serif"
                letterSpacing="0.05em"
                opacity="0.65"
                fontWeight="600"
              >
                {m.name.toUpperCase()}
              </text>
            );
          })
        : null}

      {SEA_LABELS.map((s) => {
        const p = projectLatLng(s.lat, s.lng);
        return (
          <text
            key={s.name}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            fill="#1a4058"
            fontSize="12"
            fontFamily="Georgia, 'Times New Roman', serif"
            letterSpacing="0.2em"
            opacity="0.45"
          >
            {s.name}
          </text>
        );
      })}

      <g transform="translate(500, 40)">
        <text
          textAnchor="middle"
          fill="#3d2a12"
          fontSize="13"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.18em"
          opacity="0.75"
          fontWeight="700"
        >
          REGION AND PLACES MENTIONED IN THE MAHĀBHĀRATA
        </text>
        <text
          y="15"
          textAnchor="middle"
          fill="#6a4b1e"
          fontSize="8"
          fontFamily="Georgia, serif"
          letterSpacing="0.14em"
          opacity="0.55"
        >
          EDUCATIONAL ATLAS · APPROXIMATE TRADITIONAL PLACEMENTS
        </text>
      </g>

      {CARDINAL_LABELS.map((c) => (
        <text
          key={c.name}
          x={c.x}
          y={c.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#5a3f18"
          fontSize="12"
          fontFamily="Georgia, serif"
          fontWeight="700"
          opacity="0.35"
        >
          {c.name}
        </text>
      ))}
    </g>
  );
}
