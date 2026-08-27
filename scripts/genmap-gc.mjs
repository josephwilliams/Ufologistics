// Generate src/game/gc/map.ts — Gran Colombia (CO/VE/EC/PA) admin-1 outlines.
//
//   node scripts/genmap-gc.mjs
//
// Two differences from scripts/genmap.mjs, both forced by the region:
//
//  1. Source is Natural Earth 1:10m, not 1:50m. The 1:50m admin-1 file only
//     covers nine large federal states (RUS/USA/IND/IDN/CHN/BRA/CAN/AUS/ZAF) —
//     none of these four countries appear in it at all.
//  2. Projection is Mercator, not Albers. Gran Colombia straddles the equator
//     (-5°..16°), and an Albers cone with parallels that span zero degenerates:
//     n = (sin lat1 + sin lat2)/2 -> 0.069, so the cone flattens and rho blows
//     up. Mercator is conformal at the equator and, over a 21° band, distorts
//     area by only a few percent.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const SRC = resolve(ROOT, ".cache/ne_10m_admin_1.geojson");
const OUT = resolve(ROOT, "src/game/gc/map.ts");
const COUNTRIES = ["COL", "VEN", "ECU", "PAN"];
// Galápagos sits ~1000 km off Ecuador and drags the bounding box 8° west,
// squeezing the mainland into two-thirds of the frame for one unit nobody can
// reach by road. Dropped for the same reason usmap.mjs drops Alaska and Hawaii.
const SKIP = new Set(["ECW"]);

if (!existsSync(SRC)) {
  console.log(`fetching ${SRC_URL} (~39MB, cached)`);
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  mkdirSync(dirname(SRC), { recursive: true });
  writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
}
console.log(`source ${(statSync(SRC).size / 1048576).toFixed(0)}MB`);

const VIEW_W = 1000;
const VIEW_H = 780; // region is squarer than CONUS (~1.1:1), so a taller box
const PAD = 14;
const D2R = Math.PI / 180;

/** Mercator. Y is negated so north is up in SVG coordinates. */
function mercator([lon, lat]) {
  const phi = Math.max(-85, Math.min(85, lat)) * D2R;
  return [lon * D2R, -Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}

function perpDist(p, a, b) {
  const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  let idx = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, idx + 1), eps).slice(0, -1),
    ...simplify(pts.slice(idx), eps),
  ];
}

const geo = JSON.parse(readFileSync(SRC, "utf8"));
const sel = geo.features.filter(
  (f) =>
    COUNTRIES.includes(f.properties.adm0_a3) &&
    !SKIP.has(String(f.properties.iso_3166_2).replace("-", "")),
);
console.log(`${sel.length} admin-1 units across ${COUNTRIES.join("/")}`);

// iso_3166_2 is populated for every unit here and is unique by construction;
// the bare subdivision part is not (EC-Y and VE-Y both exist), so keep both
// halves and drop the dash: CO-ANT -> COANT.
// iso_3166_2 is not quite unique here: Natural Earth files Bogotá D.C. and the
// surrounding department of Cundinamarca both as CO-CUN. Suffix any repeat so
// every unit has its own key and its own suspicion pool.
const seen = new Map();
const uniqueCode = (raw) => {
  const n = (seen.get(raw) ?? 0) + 1;
  seen.set(raw, n);
  return n === 1 ? raw : `${raw}${n}`;
};

const projected = sel.map((f) => {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return {
    code: uniqueCode(String(f.properties.iso_3166_2).replace("-", "")),
    name: f.properties.name,
    country: f.properties.adm0_a3,
    rings: polys.map((poly) => poly[0].map(mercator)),
  };
});

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const s of projected) for (const r of s.rings) for (const [x, y] of r) {
  if (x < minX) minX = x; if (y < minY) minY = y;
  if (x > maxX) maxX = x; if (y > maxY) maxY = y;
}
const scale = Math.min((VIEW_W - PAD * 2) / (maxX - minX), (VIEW_H - PAD * 2) / (maxY - minY));
const offX = PAD + (VIEW_W - PAD * 2 - (maxX - minX) * scale) / 2 - minX * scale;
const offY = PAD + (VIEW_H - PAD * 2 - (maxY - minY) * scale) / 2 - minY * scale;
const toScreen = ([x, y]) => [x * scale + offX, y * scale + offY];

const EPS = 0.5;
const round = (v) => Math.round(v * 10) / 10;
const out = [];
for (const s of projected) {
  const rings = s.rings
    .map((r) => simplify(r.map(toScreen), EPS))
    .filter((r) => r.length > 3)
    .filter((r) => {
      let a = 0;
      for (let i = 0; i < r.length; i++) {
        const j = (i + 1) % r.length;
        a += r[i][0] * r[j][1] - r[j][0] * r[i][1];
      }
      return Math.abs(a / 2) > 5;
    });
  if (!rings.length) continue;
  const d = rings
    .map((r) => "M" + r.map(([x, y]) => `${round(x)},${round(y)}`).join("L") + "Z")
    .join("");
  out.push({ code: s.code, name: s.name, country: s.country, d });
}
out.sort((a, b) => a.code.localeCompare(b.code));

const ts = `// GENERATED by scripts/genmap-gc.mjs — do not edit by hand.
//
// Gran Colombia (Colombia, Venezuela, Ecuador, Panama) admin-1 outlines,
// Mercator projection, simplified and pre-fit to the ${VIEW_W}x${VIEW_H} viewBox.
// Source: Natural Earth 1:10m admin-1 (public domain).

export const MAP_W = ${VIEW_W};
export const MAP_H = ${VIEW_H};

export type MapState = { code: string; name: string; country: string; d: string };

export const STATES: MapState[] = ${JSON.stringify(out, null, 0).replace(/\},\{/g, "},\n  {").replace(/^\[/, "[\n  ").replace(/\]$/, ",\n]")};

const D2R = Math.PI / 180;
const SCALE = ${scale};
const OFF_X = ${offX};
const OFF_Y = ${offY};

/** Same Mercator the outlines were built with, for placing sites by lat/lon. */
export function project(lon: number, lat: number): [number, number] {
  const phi = Math.max(-85, Math.min(85, lat)) * D2R;
  const x = lon * D2R;
  const y = -Math.log(Math.tan(Math.PI / 4 + phi / 2));
  return [x * SCALE + OFF_X, y * SCALE + OFF_Y];
}
`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, ts);
console.log(`wrote ${OUT}  ${out.length} units, ${(ts.length / 1024).toFixed(0)}KB`);
