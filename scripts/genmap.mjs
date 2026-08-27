// Generate src/game/usmap.ts — contiguous-48 SVG paths in a fixed viewBox.
// Albers Equal Area Conic (the standard CONUS projection), then Douglas-Peucker
// simplify, then fit-to-box so the paths are authored in final screen units.
//
//   node scripts/genmap.mjs
//
// The output is committed, so this only needs re-running to change the
// projection, the viewBox or the simplification tolerance. Source geometry is
// Natural Earth 1:50m admin-1 (public domain), fetched once and cached under
// .cache/ rather than committed — it is 2.3 MB and nothing at runtime reads it.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson";
const SRC = resolve(ROOT, ".cache/ne_50m_admin_1_states_provinces.geojson");
const OUT = resolve(ROOT, "src/game/usmap.ts");

if (!existsSync(SRC)) {
  console.log(`fetching ${SRC_URL}`);
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  mkdirSync(dirname(SRC), { recursive: true });
  writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
  console.log(`cached -> ${SRC}`);
}

const VIEW_W = 1000;
const VIEW_H = 620;
const PAD = 14;

// --- Albers Equal Area Conic, CONUS standard parallels -----------------------
const D2R = Math.PI / 180;
const lat0 = 37.5 * D2R;
const lon0 = -96 * D2R;
const lat1 = 29.5 * D2R;
const lat2 = 45.5 * D2R;
const n = 0.5 * (Math.sin(lat1) + Math.sin(lat2));
const C = Math.cos(lat1) ** 2 + 2 * n * Math.sin(lat1);
const rho0 = Math.sqrt(C - 2 * n * Math.sin(lat0)) / n;

function albers([lon, lat]) {
  const l = lon * D2R;
  const p = lat * D2R;
  const theta = n * (l - lon0);
  const rho = Math.sqrt(C - 2 * n * Math.sin(p)) / n;
  // Y is negated so north is up in SVG coords (d3 does this in scaleTranslate).
  return [rho * Math.sin(theta), rho * Math.cos(theta) - rho0];
}

// --- Douglas-Peucker ---------------------------------------------------------
function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= eps) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, idx + 1), eps).slice(0, -1),
    ...simplify(pts.slice(idx), eps),
  ];
}

// --- Load + filter -----------------------------------------------------------
const geo = JSON.parse(readFileSync(SRC, "utf8"));
const SKIP = new Set(["AK", "HI", "PR", "VI", "GU", "MP", "AS", "DC"]);

const states = geo.features.filter((f) => {
  const p = f.properties;
  return p.iso_a2 === "US" && p.postal && !SKIP.has(p.postal);
});

// Project every ring, collecting rings per state.
const projected = states.map((f) => {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  const rings = [];
  for (const poly of polys) {
    // outer ring only — interior holes are noise at this scale
    const ring = poly[0].map(albers);
    rings.push(ring);
  }
  return { postal: f.properties.postal, name: f.properties.name, rings };
});

// --- Fit to viewBox ----------------------------------------------------------
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const s of projected) {
  for (const r of s.rings) {
    for (const [x, y] of r) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
const scale = Math.min(
  (VIEW_W - PAD * 2) / (maxX - minX),
  (VIEW_H - PAD * 2) / (maxY - minY),
);
const offX = PAD + (VIEW_W - PAD * 2 - (maxX - minX) * scale) / 2 - minX * scale;
const offY = PAD + (VIEW_H - PAD * 2 - (maxY - minY) * scale) / 2 - minY * scale;

const toScreen = ([x, y]) => [x * scale + offX, y * scale + offY];


// --- Build paths -------------------------------------------------------------
const EPS = 0.55; // in final screen units — tuned for a clean engraved look
const round = (v) => Math.round(v * 10) / 10;

const out = [];
for (const s of projected) {
  const screenRings = s.rings
    .map((r) => simplify(r.map(toScreen), EPS))
    .filter((r) => r.length > 3)
    // drop tiny offshore islands; keep rings with meaningful area
    .filter((r) => {
      let a = 0;
      for (let i = 0; i < r.length; i++) {
        const j = (i + 1) % r.length;
        a += r[i][0] * r[j][1] - r[j][0] * r[i][1];
      }
      return Math.abs(a / 2) > 6;
    });
  if (!screenRings.length) continue;

  const d = screenRings
    .map((r) => "M" + r.map((p) => `${round(p[0])} ${round(p[1])}`).join("L") + "Z")
    .join("");

  // label anchor = centroid of the largest ring
  let best = screenRings[0];
  let bestA = 0;
  for (const r of screenRings) {
    let a = 0;
    for (let i = 0; i < r.length; i++) {
      const j = (i + 1) % r.length;
      a += r[i][0] * r[j][1] - r[j][0] * r[i][1];
    }
    if (Math.abs(a) > bestA) {
      bestA = Math.abs(a);
      best = r;
    }
  }
  const cx = best.reduce((t, p) => t + p[0], 0) / best.length;
  const cy = best.reduce((t, p) => t + p[1], 0) / best.length;

  out.push({ code: s.postal, name: s.name, d, cx: round(cx), cy: round(cy) });
}

out.sort((a, b) => a.code.localeCompare(b.code));

const ts = `// GENERATED — do not edit by hand. Run \`node scripts/genmap.mjs\`.
// Contiguous-48 outlines, Albers Equal Area Conic (parallels 29.5/45.5, origin
// -96/37.5), simplified and pre-fit to the ${VIEW_W}x${VIEW_H} viewBox below.

export const MAP_W = ${VIEW_W};
export const MAP_H = ${VIEW_H};

export type StateShape = {
  /** USPS code, e.g. "NM" */
  code: string;
  name: string;
  /** SVG path data in viewBox units */
  d: string;
  /** label anchor */
  cx: number;
  cy: number;
};

/** Project a real lat/lon into viewBox units with the same transform as the paths. */
export function project(lon: number, lat: number): [number, number] {
  const D2R = Math.PI / 180;
  const n = ${n};
  const C = ${C};
  const rho0 = ${rho0};
  const lon0 = ${lon0};
  const theta = n * (lon * D2R - lon0);
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * D2R)) / n;
  const x = rho * Math.sin(theta);
  const y = rho * Math.cos(theta) - rho0;
  return [x * ${scale} + ${offX}, y * ${scale} + ${offY}];
}

export const STATES: StateShape[] = ${JSON.stringify(out, null, 0)
  .replace(/\},\{/g, "},\n  {")
  .replace(/^\[/, "[\n  ")
  .replace(/\]$/, ",\n]")};
`;

writeFileSync(OUT, ts);
const kb = (ts.length / 1024).toFixed(1);
console.log(`wrote ${OUT}`);
console.log(`${out.length} states, ${kb} KB`);
console.log(out.map((s) => s.code).join(" "));
// sanity: Roswell NM should land inside the map
const [rx, ry] = toScreen(albers([-104.52, 33.39]));
console.log("Roswell ->", round(rx), round(ry));
