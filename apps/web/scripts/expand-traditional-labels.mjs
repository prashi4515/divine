/**
 * Expand traditional-labels.json with multilingual name maps via Sanscript.
 * Run from apps/web: node scripts/expand-traditional-labels.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sanscript from "@indic-transliteration/sanscript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(
  root,
  "content/knowledge/atlas/overlays/traditional-labels.json",
);

const data = JSON.parse(fs.readFileSync(file, "utf8"));

/** IAST overrides for plate spellings that are not valid IAST. */
const IAST_BY_ID = {
  "label.city.dwarka": "dvaraka",
  "label.river.ganga": "ganga",
  "label.river.yamuna": "yamuna",
  "label.river.krishna": "krsna",
  "label.river.saraswati": "sarasvati",
  "label.kingdom.kasi": "kasi",
  "label.mountain.vindhya": "vindhya",
  "label.forest.dandaka": "dandaka",
  "label.river.godavari": "godavari",
  "label.river.narmada": "narmada",
};

const SEA_NAMES = {
  "label.sea.arabian": {
    en: "Arabian Sea",
    hi: "Arab Sagar",
    te: "Arabian Sea",
    ta: "Arabian Sea",
    kn: "Arabian Sea",
    ml: "Arabian Sea",
    sa: "Arab Sagarah",
    or: "Arab Sagar",
  },
  "label.sea.bengal": {
    en: "Bay of Bengal",
    hi: "Bangal ki Khadi",
    te: "Bay of Bengal",
    ta: "Bay of Bengal",
    kn: "Bay of Bengal",
    ml: "Bay of Bengal",
    sa: "Vanga Sagarah",
    or: "Bay of Bengal",
  },
  "label.sea.indian": {
    en: "Indian Ocean",
    hi: "Hind Mahasagar",
    te: "Indian Ocean",
    ta: "Indian Ocean",
    kn: "Indian Ocean",
    ml: "Indian Ocean",
    sa: "Hindu Mahasagarah",
    or: "Indian Ocean",
  },
};

const EXTRA = [
  {
    id: "label.city.hastinapura",
    kind: "city",
    lat: 29.16,
    lng: 78.02,
    iast: "hastinapura",
  },
  {
    id: "label.city.kurukshetra",
    kind: "city",
    lat: 29.97,
    lng: 76.85,
    iast: "kuruksetra",
  },
];

function asciiIast(en) {
  return en
    .replace(/ \([NSEW]\)$/g, "")
    .trim()
    .toLowerCase()
    .replace(/dwarka/g, "dvaraka")
    .replace(/sh/g, "s");
}

function scriptsFromIast(iast) {
  return {
    hi: Sanscript.t(iast, "iast", "devanagari"),
    sa: Sanscript.t(iast, "iast", "devanagari"),
    te: Sanscript.t(iast, "iast", "telugu"),
    ta: Sanscript.t(iast, "iast", "tamil"),
    kn: Sanscript.t(iast, "iast", "kannada"),
    ml: Sanscript.t(iast, "iast", "malayalam"),
    or: Sanscript.t(iast, "iast", "oriya"),
  };
}

function expandOne(l) {
  const en = typeof l.name === "string" ? l.name : l.name.en;
  if (SEA_NAMES[l.id]) {
    return {
      id: l.id,
      kind: l.kind,
      lat: l.lat,
      lng: l.lng,
      name: SEA_NAMES[l.id],
    };
  }
  const iast = IAST_BY_ID[l.id] || asciiIast(en);
  let scripts = {};
  try {
    scripts = scriptsFromIast(iast);
  } catch {
    /* keep English */
  }
  return {
    id: l.id,
    kind: l.kind,
    lat: l.lat,
    lng: l.lng,
    iast,
    name: { en, ...scripts },
  };
}

const outLabels = data.labels.map(expandOne);
const ids = new Set(outLabels.map((l) => l.id));
for (const e of EXTRA) {
  if (ids.has(e.id)) continue;
  outLabels.push(
    expandOne({
      id: e.id,
      kind: e.kind,
      lat: e.lat,
      lng: e.lng,
      name: e.id.includes("hastina") ? "Hastinapura" : "Kurukshetra",
      iast: e.iast,
    }),
  );
}

// Prefer curated IAST for extras
for (const e of EXTRA) {
  const hit = outLabels.find((l) => l.id === e.id);
  if (!hit) continue;
  hit.iast = e.iast;
  try {
    hit.name = { en: hit.name.en, ...scriptsFromIast(e.iast) };
  } catch {
    /* ignore */
  }
}

fs.writeFileSync(
  file,
  `${JSON.stringify({ schemaVersion: 1, labels: outLabels }, null, 2)}\n`,
);
console.log(`wrote ${outLabels.length} labels`);
