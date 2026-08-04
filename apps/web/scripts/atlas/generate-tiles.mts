/**
 * Generate Web Mercator XYZ tiles from the Ancient Bhārata master plate.
 *
 * The plate image is treated as equirectangular over the educational
 * projection bounds (see DEFAULT_ATLAS_PROJECTION). Overlay JSON is never
 * read here — artwork and data stay separate.
 *
 * Usage (from apps/web):
 *   pnpm exec tsx scripts/atlas/generate-tiles.mts
 *   pnpm exec tsx scripts/atlas/generate-tiles.mts --master path/to/20k.png --max-zoom 12
 *
 * Replacing artwork later: drop a new master image, re-run this script,
 * update base-map.json tile URL / zoom if needed. No app logic changes.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(__dirname, "../..");

/** Keep in sync with DEFAULT_ATLAS_PROJECTION in @divine/types. */
type AtlasProjection = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const DEFAULT_ATLAS_PROJECTION: AtlasProjection = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 66.5,
  maxLng: 97.5,
};

type Args = {
  master: string;
  outDir: string;
  minZoom: number;
  maxZoom: number;
  tileSize: number;
  format: "webp" | "png";
};

function parseArgs(argv: string[]): Args {
  const defaults: Args = {
    master: path.join(
      WEB_ROOT,
      "public/images/atlas/ancient-bharata-map.jpg",
    ),
    outDir: path.join(WEB_ROOT, "public/tiles/ancient-bharata"),
    minZoom: 3,
    maxZoom: 8,
    tileSize: 256,
    format: "webp",
  };
  const args = { ...defaults };
  // pnpm may forward a literal "--" separator; skip it.
  const tokens = argv.filter((a) => a !== "--");
  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    if (a === "--master") args.master = path.resolve(tokens[++i]!);
    else if (a === "--out") args.outDir = path.resolve(tokens[++i]!);
    else if (a === "--min-zoom") args.minZoom = Number(tokens[++i]);
    else if (a === "--max-zoom") args.maxZoom = Number(tokens[++i]);
    else if (a === "--tile-size") args.tileSize = Number(tokens[++i]);
    else if (a === "--png") args.format = "png";
    else if (a?.startsWith("-")) {
      console.error(`Unknown flag: ${a}`);
      console.error(
        "Usage: pnpm generate:atlas-tiles [-- --master <image> --max-zoom N]",
      );
      process.exit(1);
    }
  }
  return args;
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function lngLatToWorldPixel(
  lng: number,
  lat: number,
  z: number,
  tileSize: number,
): { x: number; y: number } {
  const scale = tileSize * 2 ** z;
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin(lat * DEG2RAD);
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldPixelToLngLat(
  x: number,
  y: number,
  z: number,
  tileSize: number,
): { lng: number; lat: number } {
  const scale = tileSize * 2 ** z;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = RAD2DEG * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lng, lat };
}

function tileRangeForBounds(
  proj: AtlasProjection,
  z: number,
  tileSize: number,
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const nw = lngLatToWorldPixel(proj.minLng, proj.maxLat, z, tileSize);
  const se = lngLatToWorldPixel(proj.maxLng, proj.minLat, z, tileSize);
  const n = 2 ** z;
  return {
    xMin: Math.max(0, Math.floor(nw.x / tileSize)),
    xMax: Math.min(n - 1, Math.floor(se.x / tileSize)),
    yMin: Math.max(0, Math.floor(nw.y / tileSize)),
    yMax: Math.min(n - 1, Math.floor(se.y / tileSize)),
  };
}

function samplePlate(
  plate: Buffer,
  plateW: number,
  plateH: number,
  channels: number,
  lng: number,
  lat: number,
  proj: AtlasProjection,
): [number, number, number, number] {
  if (
    lng < proj.minLng ||
    lng > proj.maxLng ||
    lat < proj.minLat ||
    lat > proj.maxLat
  ) {
    return [0, 0, 0, 0];
  }
  const u = (lng - proj.minLng) / (proj.maxLng - proj.minLng);
  const v = (proj.maxLat - lat) / (proj.maxLat - proj.minLat);
  const px = Math.min(plateW - 1, Math.max(0, Math.floor(u * plateW)));
  const py = Math.min(plateH - 1, Math.max(0, Math.floor(v * plateH)));
  const i = (py * plateW + px) * channels;
  const r = plate[i] ?? 0;
  const g = plate[i + 1] ?? r;
  const b = plate[i + 2] ?? r;
  const a = channels >= 4 ? (plate[i + 3] ?? 255) : 255;
  return [r, g, b, a];
}

async function renderTile(opts: {
  plate: Buffer;
  plateW: number;
  plateH: number;
  channels: number;
  z: number;
  x: number;
  y: number;
  tileSize: number;
  proj: AtlasProjection;
  format: "webp" | "png";
  outPath: string;
}): Promise<void> {
  const {
    plate,
    plateW,
    plateH,
    channels,
    z,
    x,
    y,
    tileSize,
    proj,
    format,
    outPath,
  } = opts;
  const rgba = Buffer.alloc(tileSize * tileSize * 4);
  for (let py = 0; py < tileSize; py++) {
    for (let px = 0; px < tileSize; px++) {
      const worldX = x * tileSize + px + 0.5;
      const worldY = y * tileSize + py + 0.5;
      const { lng, lat } = worldPixelToLngLat(worldX, worldY, z, tileSize);
      const [r, g, b, a] = samplePlate(
        plate,
        plateW,
        plateH,
        channels,
        lng,
        lat,
        proj,
      );
      const i = (py * tileSize + px) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = a;
    }
  }

  // Skip fully transparent tiles.
  let opaque = false;
  for (let i = 3; i < rgba.length; i += 4) {
    if ((rgba[i] ?? 0) > 0) {
      opaque = true;
      break;
    }
  }
  if (!opaque) return;

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  let pipeline = sharp(rgba, {
    raw: { width: tileSize, height: tileSize, channels: 4 },
  });
  if (format === "webp") {
    pipeline = pipeline.webp({ quality: 82, alphaQuality: 80 });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9 });
  }
  await pipeline.toFile(outPath);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const proj = DEFAULT_ATLAS_PROJECTION;

  console.log(`Master: ${args.master}`);
  console.log(`Out:    ${args.outDir}`);
  console.log(`Zoom:   ${args.minZoom}–${args.maxZoom} @ ${args.tileSize}px`);

  const meta = await sharp(args.master).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const plate = meta.data;
  const plateW = meta.info.width;
  const plateH = meta.info.height;
  const channels = meta.info.channels;

  console.log(`Plate:  ${plateW}×${plateH} (${channels}ch)`);

  await fs.rm(args.outDir, { recursive: true, force: true });
  await fs.mkdir(args.outDir, { recursive: true });

  let written = 0;
  for (let z = args.minZoom; z <= args.maxZoom; z++) {
    const range = tileRangeForBounds(proj, z, args.tileSize);
    const ext = args.format;
    for (let x = range.xMin; x <= range.xMax; x++) {
      for (let y = range.yMin; y <= range.yMax; y++) {
        const outPath = path.join(args.outDir, `${z}`, `${x}`, `${y}.${ext}`);
        await renderTile({
          plate,
          plateW,
          plateH,
          channels,
          z,
          x,
          y,
          tileSize: args.tileSize,
          proj,
          format: args.format,
          outPath,
        });
        try {
          await fs.access(outPath);
          written += 1;
        } catch {
          /* skipped transparent */
        }
      }
    }
    console.log(`z=${z} done (${range.xMin}–${range.xMax} × ${range.yMin}–${range.yMax})`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    master: path.relative(WEB_ROOT, args.master),
    plateWidth: plateW,
    plateHeight: plateH,
    minZoom: args.minZoom,
    maxZoom: args.maxZoom,
    tileSize: args.tileSize,
    format: args.format,
    projection: proj,
    tileCount: written,
    urlTemplate: `/tiles/ancient-bharata/{z}/{x}/{y}.${args.format}`,
  };
  await fs.writeFile(
    path.join(args.outDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`Wrote ${written} tiles + manifest.json`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
