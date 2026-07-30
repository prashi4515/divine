/**
 * @deprecated Legacy MVP coastline / river artwork.
 * Kingdom rings have moved to `content/knowledge/atlas/polygons.json`.
 * New Atlas features must use the Atlas 2.0 scene engine + renderer —
 * do not extend this module. See docs/Atlas.md.
 */
import { projectLatLng, type Point } from "@/lib/atlas/geo";

export type KingdomRegion = {
  id: string;
  name: string;
  iast: string;
  entityId?: string;
  capital?: string;
  fill: string;
  stroke: string;
  /** Ring of [lat, lng] */
  ring: Array<[number, number]>;
};

export type RiverPath = {
  id: string;
  name: string;
  stroke: string;
  width: number;
  points: Array<[number, number]>;
};

function ringToPath(ring: Array<[number, number]>, close = true): string {
  const parts = ring.map(([lat, lng], i) => {
    const { x, y } = projectLatLng(lat, lng);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return parts.join(" ") + (close ? " Z" : "");
}

export function kingdomPath(region: KingdomRegion): string {
  return ringToPath(region.ring, true);
}

export function riverPathD(river: RiverPath): string {
  return ringToPath(river.points, false);
}

/**
 * Indian subcontinent + NW frontier coastline (clockwise from Kutch).
 * Extra vertices for a museum-map silhouette (not a low-poly potato).
 */
export const INDIA_COASTLINE: Array<[number, number]> = [
  [24.0, 67.8],
  [23.6, 68.4],
  [23.0, 69.2],
  [22.4, 69.0],
  [21.9, 69.8],
  [21.5, 71.2],
  [21.2, 72.2],
  [20.7, 72.7],
  [20.0, 72.8],
  [19.2, 72.85],
  [18.5, 72.9],
  [17.7, 73.1],
  [16.8, 73.3],
  [15.9, 73.6],
  [15.0, 74.0],
  [14.2, 74.4],
  [13.3, 74.7],
  [12.5, 75.0],
  [11.6, 75.5],
  [10.8, 75.9],
  [10.0, 76.2],
  [9.3, 76.5],
  [8.7, 76.8],
  [8.2, 77.2],
  [8.08, 77.55],
  [8.2, 77.9],
  [8.6, 78.2],
  [9.2, 79.0],
  [9.8, 79.4],
  [10.5, 79.85],
  [11.2, 79.9],
  [12.0, 80.05],
  [12.8, 80.25],
  [13.5, 80.3],
  [14.3, 80.15],
  [15.0, 80.1],
  [15.7, 80.5],
  [16.3, 81.5],
  [16.9, 82.4],
  [17.7, 83.3],
  [18.5, 84.2],
  [19.3, 85.0],
  [20.0, 86.0],
  [20.8, 86.8],
  [21.5, 87.2],
  [21.9, 88.0],
  [22.3, 88.6],
  [22.8, 89.2],
  [23.5, 90.0],
  [24.2, 91.0],
  [25.0, 91.8],
  [25.8, 92.2],
  [26.4, 91.5],
  [26.8, 90.2],
  [27.2, 88.8],
  [27.6, 87.5],
  [28.0, 86.0],
  [28.4, 84.5],
  [28.8, 83.0],
  [29.3, 81.5],
  [29.8, 80.2],
  [30.4, 79.0],
  [31.0, 78.2],
  [31.8, 77.4],
  [32.6, 76.6],
  [33.5, 75.8],
  [34.4, 75.0],
  [35.2, 74.2],
  [35.8, 73.2],
  [35.9, 71.8],
  [35.4, 70.8],
  [34.5, 70.2],
  [33.5, 70.0],
  [32.2, 70.0],
  [31.0, 70.3],
  [29.8, 70.5],
  [28.5, 69.5],
  [27.2, 68.8],
  [26.0, 68.0],
  [25.0, 67.2],
  [24.4, 67.4],
  [24.0, 67.8],
];

export const SRI_LANKA: Array<[number, number]> = [
  [9.8, 79.9],
  [9.5, 80.5],
  [8.5, 81.2],
  [7.2, 81.8],
  [6.2, 81.0],
  [6.0, 80.2],
  [6.8, 79.9],
  [8.0, 79.8],
  [9.8, 79.9],
];

export function indiaLandPath(): string {
  return ringToPath(INDIA_COASTLINE, true);
}

export function lankaLandPath(): string {
  return ringToPath(SRI_LANKA, true);
}

/** Himalayan / Hindukush mountain wash (museum-map brown relief). */
export const HIMALAYA_WASH: Array<[number, number]> = [
  [35.5, 70.5],
  [35.8, 74.0],
  [34.0, 76.5],
  [32.0, 78.5],
  [30.0, 80.5],
  [28.5, 85.0],
  [27.5, 90.0],
  [26.8, 92.0],
  [27.8, 92.0],
  [29.0, 88.0],
  [30.5, 84.0],
  [32.5, 80.0],
  [34.5, 77.0],
  [36.0, 74.0],
  [36.2, 71.0],
  [35.5, 70.5],
];

export function himalayaWashPath(): string {
  return ringToPath(HIMALAYA_WASH, true);
}

export function vindhyaWashPath(): string {
  return ringToPath(
    [
      [24.5, 74.5],
      [24.2, 80.0],
      [23.5, 84.0],
      [22.8, 84.0],
      [23.2, 80.0],
      [23.5, 74.5],
      [24.5, 74.5],
    ],
    true,
  );
}

/** Soft Mahajanapada / epic kingdom territories (educational, not surveyed). */
export const KINGDOM_REGIONS: KingdomRegion[] = [
  {
    id: "gandhara",
    name: "Gandhara",
    iast: "Gāndhāra",
    entityId: "kingdom.gandhara",
    capital: "Takṣaśilā",
    fill: "#9b7bb8",
    stroke: "#6a4a88",
    ring: [
      [35.2, 69.5],
      [35.0, 73.2],
      [33.0, 73.5],
      [32.5, 70.0],
    ],
  },
  {
    id: "kamboja",
    name: "Kamboja",
    iast: "Kāmboja",
    entityId: "kingdom.kamboja",
    fill: "#8a9bb0",
    stroke: "#5a6a80",
    ring: [
      [36.0, 70.5],
      [35.8, 73.0],
      [34.5, 73.2],
      [34.2, 70.8],
    ],
  },
  {
    id: "kuru",
    name: "Kuru",
    iast: "Kuru",
    entityId: "kingdom.kuru",
    capital: "Hastināpura",
    fill: "#c4a060",
    stroke: "#8a6a30",
    ring: [
      [30.5, 75.8],
      [30.3, 78.5],
      [28.4, 78.8],
      [28.2, 76.0],
    ],
  },
  {
    id: "pancala",
    name: "Pancala",
    iast: "Pañcāla",
    entityId: "kingdom.pancala",
    capital: "Ahicchatra / Kāmpilya",
    fill: "#b890c8",
    stroke: "#7a5088",
    ring: [
      [28.8, 78.6],
      [28.6, 80.8],
      [27.0, 81.0],
      [26.8, 78.8],
    ],
  },
  {
    id: "surasena",
    name: "Surasena",
    iast: "Śūrasena",
    entityId: "kingdom.surasena",
    capital: "Mathurā",
    fill: "#c89080",
    stroke: "#8a5040",
    ring: [
      [28.0, 76.8],
      [27.9, 78.2],
      [26.9, 78.4],
      [26.8, 76.9],
    ],
  },
  {
    id: "matsya",
    name: "Matsya",
    iast: "Matsya",
    entityId: "kingdom.virata",
    capital: "Virāṭanagara",
    fill: "#7aaa70",
    stroke: "#4a7a40",
    ring: [
      [27.8, 75.0],
      [27.6, 76.8],
      [26.0, 76.6],
      [25.8, 74.8],
    ],
  },
  {
    id: "vatsa",
    name: "Vatsa",
    iast: "Vatsa",
    entityId: "kingdom.vatsa",
    capital: "Kauśāmbī",
    fill: "#6a9ab8",
    stroke: "#3a6a88",
    ring: [
      [26.2, 80.5],
      [26.0, 82.0],
      [25.0, 82.2],
      [24.8, 80.6],
    ],
  },
  {
    id: "kosala",
    name: "Kosala",
    iast: "Kosala",
    entityId: "kingdom.kosala",
    capital: "Śrāvastī / Ayodhyā",
    fill: "#c8a878",
    stroke: "#8a6840",
    ring: [
      [28.0, 81.2],
      [27.8, 83.5],
      [26.0, 83.8],
      [25.8, 81.4],
    ],
  },
  {
    id: "kashi",
    name: "Kasi",
    iast: "Kāśī",
    entityId: "kingdom.kashi",
    capital: "Vārāṇasī",
    fill: "#d0b070",
    stroke: "#907040",
    ring: [
      [25.8, 82.4],
      [25.7, 83.6],
      [24.9, 83.8],
      [24.8, 82.5],
    ],
  },
  {
    id: "malla",
    name: "Malla",
    iast: "Malla",
    entityId: "kingdom.malla",
    fill: "#a8b888",
    stroke: "#688048",
    ring: [
      [27.2, 83.2],
      [27.0, 84.5],
      [26.2, 84.6],
      [26.0, 83.3],
    ],
  },
  {
    id: "vajji",
    name: "Vajji",
    iast: "Vṛji",
    entityId: "kingdom.vajji",
    capital: "Vaiśālī",
    fill: "#98b8a8",
    stroke: "#588878",
    ring: [
      [26.5, 84.5],
      [26.3, 86.0],
      [25.5, 86.2],
      [25.3, 84.6],
    ],
  },
  {
    id: "anga",
    name: "Anga",
    iast: "Aṅga",
    entityId: "kingdom.anga",
    capital: "Campā",
    fill: "#c89880",
    stroke: "#886040",
    ring: [
      [25.5, 86.2],
      [25.3, 87.8],
      [24.5, 88.0],
      [24.3, 86.4],
    ],
  },
  {
    id: "magadha",
    name: "Magadha",
    iast: "Magadha",
    entityId: "kingdom.magadha",
    capital: "Rājagṛha / Pāṭaliputra",
    fill: "#c07060",
    stroke: "#883828",
    ring: [
      [25.5, 84.5],
      [25.3, 86.2],
      [24.0, 86.5],
      [23.8, 84.6],
    ],
  },
  {
    id: "cedi",
    name: "Cedi",
    iast: "Cedi",
    entityId: "kingdom.cedi",
    capital: "Śuktimatī",
    fill: "#b09870",
    stroke: "#786040",
    ring: [
      [25.0, 79.5],
      [24.8, 81.2],
      [23.5, 81.4],
      [23.3, 79.6],
    ],
  },
  {
    id: "avanti",
    name: "Avanti",
    iast: "Avanti",
    entityId: "kingdom.avanti",
    capital: "Ujjayinī",
    fill: "#d08860",
    stroke: "#985030",
    ring: [
      [24.2, 74.8],
      [24.0, 77.2],
      [22.2, 77.5],
      [22.0, 74.8],
    ],
  },
  {
    id: "assaka",
    name: "Assaka",
    iast: "Aśmaka",
    entityId: "kingdom.assaka",
    capital: "Potana",
    fill: "#70a878",
    stroke: "#407850",
    ring: [
      [19.8, 76.5],
      [19.5, 79.5],
      [17.8, 79.8],
      [17.5, 76.8],
    ],
  },
  {
    id: "yadava",
    name: "Yadava",
    iast: "Yādava",
    entityId: "city.dvaraka",
    capital: "Dvārakā",
    fill: "#b070a0",
    stroke: "#804070",
    ring: [
      [23.0, 68.8],
      [22.8, 71.5],
      [21.2, 71.8],
      [21.0, 68.8],
    ],
  },
  {
    id: "vidarbha",
    name: "Vidarbha",
    iast: "Vidarbha",
    entityId: "kingdom.vidarbha",
    capital: "Kuṇḍinapura",
    fill: "#88a070",
    stroke: "#587040",
    ring: [
      [21.8, 77.0],
      [21.5, 80.0],
      [19.5, 80.2],
      [19.2, 77.2],
    ],
  },
  {
    id: "chedi-south",
    name: "Dasarna",
    iast: "Daśārṇa",
    fill: "#a89078",
    stroke: "#786050",
    ring: [
      [23.8, 77.5],
      [23.5, 79.5],
      [22.2, 79.6],
      [22.0, 77.6],
    ],
  },
];

export const RIVER_PATHS: RiverPath[] = [
  {
    id: "sindhu",
    name: "Indus (Sindhu)",
    stroke: "#3d6a8a",
    width: 3.4,
    points: [
      [35.5, 74.5],
      [34.0, 73.0],
      [32.0, 72.0],
      [30.0, 71.0],
      [28.0, 69.5],
      [26.0, 68.2],
      [24.5, 67.5],
    ],
  },
  {
    id: "sarasvati",
    name: "Sarasvatī",
    stroke: "#5a8498",
    width: 1.6,
    points: [
      [30.2, 76.8],
      [29.2, 75.5],
      [28.0, 74.0],
      [26.5, 72.5],
    ],
  },
  {
    id: "yamuna",
    name: "Yamunā",
    stroke: "#4a7a9a",
    width: 2.6,
    points: [
      [31.0, 78.4],
      [29.5, 77.5],
      [28.0, 77.3],
      [27.2, 77.8],
      [25.4, 81.8],
    ],
  },
  {
    id: "ganga",
    name: "Gaṅgā",
    stroke: "#3a6a8a",
    width: 3.6,
    points: [
      [30.9, 79.0],
      [29.5, 78.2],
      [28.0, 79.0],
      [26.5, 80.5],
      [25.3, 83.0],
      [25.4, 85.0],
      [24.5, 87.5],
      [22.5, 89.0],
    ],
  },
  {
    id: "son",
    name: "Śoṇa",
    stroke: "#4a7a90",
    width: 1.8,
    points: [
      [23.5, 82.0],
      [24.2, 83.5],
      [25.0, 84.8],
    ],
  },
  {
    id: "chambal",
    name: "Carmaṇvatī",
    stroke: "#4a7a90",
    width: 1.8,
    points: [
      [26.0, 76.5],
      [25.0, 77.0],
      [24.0, 78.5],
      [25.4, 81.5],
    ],
  },
  {
    id: "narmada",
    name: "Narmadā",
    stroke: "#3d7088",
    width: 2.4,
    points: [
      [22.8, 81.5],
      [22.6, 79.0],
      [22.2, 76.5],
      [21.7, 73.5],
      [21.6, 72.5],
    ],
  },
  {
    id: "shipra",
    name: "Śiprā",
    stroke: "#4a7a90",
    width: 1.4,
    points: [
      [23.5, 75.5],
      [23.2, 75.8],
      [22.7, 75.9],
    ],
  },
  {
    id: "godavari",
    name: "Godāvarī",
    stroke: "#3d7088",
    width: 2.6,
    points: [
      [19.9, 73.5],
      [19.5, 76.0],
      [18.8, 78.5],
      [17.5, 81.0],
      [16.5, 82.2],
    ],
  },
  {
    id: "krishna-river",
    name: "Kṛṣṇā",
    stroke: "#3d7088",
    width: 2.2,
    points: [
      [17.9, 73.8],
      [16.8, 76.5],
      [16.2, 79.0],
      [15.9, 81.0],
    ],
  },
  {
    id: "kaveri",
    name: "Kāverī",
    stroke: "#3d7088",
    width: 2.0,
    points: [
      [12.4, 75.5],
      [11.5, 76.8],
      [11.0, 78.2],
      [10.8, 79.8],
    ],
  },
  {
    id: "sarayu",
    name: "Sarayū",
    stroke: "#4a7a90",
    width: 1.6,
    points: [
      [28.5, 81.0],
      [27.5, 82.0],
      [26.8, 82.5],
    ],
  },
];

export const MOUNTAIN_LABELS: Array<{
  name: string;
  lat: number;
  lng: number;
}> = [
  { name: "Himālaya", lat: 30.5, lng: 82 },
  { name: "Hindukush", lat: 35.2, lng: 70.5 },
  { name: "Vindhya", lat: 23.5, lng: 80 },
  { name: "Arāvalli", lat: 26.5, lng: 74.5 },
  { name: "Western Ghats", lat: 14, lng: 75.2 },
  { name: "Eastern Ghats", lat: 16, lng: 81.5 },
];

export const SEA_LABELS: Array<{ name: string; lat: number; lng: number }> = [
  { name: "ARABIAN SEA", lat: 16, lng: 68.5 },
  { name: "BAY OF BENGAL", lat: 15, lng: 90 },
  { name: "INDIAN OCEAN", lat: 7.5, lng: 78 },
];

export const CARDINAL_LABELS = [
  { name: "N", x: 500, y: 22 },
  { name: "S", x: 500, y: 1160 },
  { name: "W", x: 22, y: 590 },
  { name: "E", x: 978, y: 590 },
] as const;

export function projected(lat: number, lng: number): Point {
  return projectLatLng(lat, lng);
}
