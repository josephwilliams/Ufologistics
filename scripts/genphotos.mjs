// Fetch a public-domain photograph for each site from Wikimedia Commons and
// bake it into a 1-bit halftone plate, the way a 1947 paper would have printed
// it. Output is committed; this only needs re-running to change sites or style.
//
//   node scripts/genphotos.mjs [siteId ...]
//
// Licensing: PD/CC0 only. Anything with a share-alike or attribution-required
// licence is rejected outright, so the baked plates carry no obligations. The
// source, author and licence of every accepted image are still recorded in
// src/game/photos.ts and shown in-game.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public/plates");
const CACHE = resolve(ROOT, ".cache/photos");
const OUT_TS = resolve(ROOT, "src/game/photos.ts");

const W = 224;
const H = 140;

// Licences we will accept. Everything else is skipped.
const OK_LICENCE = /^(public domain|cc0|pd|no restrictions)/i;

// Search hints where the site name alone finds the wrong thing.
const QUERY = {
  roswell: "Roswell Army Air Field 1947",
  shasta: "Mount Shasta volcano Siskiyou",
  dulce: "Archuleta Mesa New Mexico",
  snippy: "San Luis Valley Colorado",
  cimarron: "Cimarron New Mexico",
  amarillo: "Texas Panhandle cattle",
  valentine: "Nebraska Sandhills",
  milescity: "Custer County Montana",
  elko: "Ruby Mountains Nevada",
  vale: "Malheur County Oregon",
  guthrie: "West Texas ranch land",
  bellefourche: "Belle Fourche South Dakota",
  dodgecity: "Dodge City Kansas stockyards",
  pecos: "Pecos Texas",
  lusk: "Wyoming prairie",
  kelly: "Hopkinsville Kentucky",
  pointpleasant: "Ohio River West Virginia bridge",
  exeter: "Exeter New Hampshire",
  pascagoula: "Pascagoula Mississippi",
  flatwoods: "Sutton West Virginia",
  aurora: "Aurora Texas Wise County",
  levelland: "Levelland Texas",
  socorro: "Socorro New Mexico",
  lincoln: "Franconia Notch New Hampshire",
  mcminnville: "McMinnville Oregon",
  elmwood: "Pierce County Wisconsin",
  fyffe: "DeKalb County Alabama",
  gulfbreeze: "Pensacola Florida bay",
  grandcanyon: "Grand Canyon",
  devilstower: "Devils Tower Wyoming",
  sedona: "Sedona Arizona red rocks",
  niagara: "Niagara Falls New York aerial",
  yellowstone: "Yellowstone hot spring",
  craterlake: "Crater Lake Oregon",
  badlands: "Badlands National Park South Dakota",
  monumentvalley: "Monument Valley",
  mammoth: "Mammoth Cave Kentucky",
  sanddunes: "Great Sand Dunes Colorado",
  salem: "Salem Massachusetts witch house",
  coralcastle: "Coral Castle Florida",
  marfa: "Marfa Texas Presidio County",
  brownmtn: "Brown Mountain North Carolina",
  bermuda: "Key West Florida sea",
  cahokia: "Cahokia Mounds Monks Mound",
  serpentmound: "Serpent Mound Ohio",
  skinwalker: "Uintah Basin Utah",
  superstition: "Superstition Mountains Arizona",
  area51: "Groom Lake Nevada",
  wrightpat: "Wright-Patterson Air Force Base",
  whitesands: "White Sands Missile Range V-2",
  losalamos: "Los Alamos New Mexico laboratory",
  oakridge: "Oak Ridge Tennessee K-25",
  hanford: "Hanford Site B Reactor",
  canaveral: "Cape Canaveral launch 1950s",
  malmstrom: "Malmstrom Air Force Base Minuteman",
  cheyennemtn: "Cheyenne Mountain Complex",
  edwards: "Muroc Army Air Field",
  dc: "United States Capitol 1940s",
  nyc: "New York City skyline 1940s",
  chicago: "Chicago Illinois 1940s",
  la: "Los Angeles California 1940s",
  denver: "Denver Colorado 1940s",
  seattle: "Seattle Washington harbor",
  miami: "Miami Florida 1940s",
};

// ---------------------------------------------------------------------------

function siteList() {
  // Parse ids straight out of sites.ts rather than importing TS from node.
  const src = readFileSync(resolve(ROOT, "src/game/sites.ts"), "utf8");
  const out = [];
  const re = /id:\s*"([a-z0-9]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*place:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ id: m[1], name: m[2], place: m[3] });
  return out;
}

// Wikimedia asks for a descriptive UA and a modest request rate. Hammering it
// gets you 429s, so every call goes through a throttle with backoff.
const UA = "ufologistics-asset-build/1.0 (offline game asset generation; contact via repo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastCall = 0;
const MIN_GAP = 1100;

async function polite(url) {
  const wait = MIN_GAP - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  for (let attempt = 0; attempt < 5; attempt++) {
    lastCall = Date.now();
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" } });
    if (res.status === 429 || res.status === 503) {
      const backoff = 2500 * 2 ** attempt;
      await sleep(backoff);
      continue;
    }
    if (!res.ok) throw new Error(`http ${res.status}`);
    return res;
  }
  throw new Error("rate limited after 5 attempts");
}

async function api(params) {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({ format: "json", ...params });
  return (await polite(url)).json();
}

async function findPhoto(site) {
  const search = QUERY[site.id] ?? `${site.name} ${site.place}`;
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${search} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "700",
  });
  const pages = Object.values(data?.query?.pages ?? {});
  const scored = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const em = ii.extmetadata ?? {};
    const lic = em.LicenseShortName?.value ?? "";
    if (!OK_LICENCE.test(lic)) continue;
    if (!ii.thumburl) continue;
    // Prefer landscape; the plate is 8:5.
    const ratio = (ii.width ?? 1) / (ii.height ?? 1);
    if (ratio < 0.95) continue;
    scored.push({
      file: p.title.replace(/^File:/, ""),
      thumb: ii.thumburl,
      page: ii.descriptionurl,
      licence: lic,
      author: String(em.Artist?.value ?? "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80),
      score: Math.abs(ratio - 1.6),
    });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored[0] ?? null;
}

/**
 * Grayscale -> normalise -> 4x4 Bayer ordered dither to pure 1-bit.
 * Ordered dithering is what gives the regular newsprint screen; error-diffusion
 * looks too modern and too smooth.
 */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

async function toPlate(buf) {
  const base = sharp(buf)
    .resize(W, H, { fit: "cover", position: "attention" })
    .grayscale()
    .normalise();

  // Adaptive levels. A 1-bit ordered dither only has tonal range near the
  // middle: a photo whose mean sits at 60 crushes to solid ink, one at 200
  // disappears. Measure the actual distribution and pull it onto the midpoint
  // with a contrast limited by the image's own spread.
  const st = await base.clone().stats();
  const { mean, stdev } = st.channels[0];
  const TARGET = 142;
  const contrast = Math.max(0.62, Math.min(1.25, 52 / Math.max(18, stdev)));
  const offset = TARGET - mean * contrast;

  const { data, info } = await base
    .linear(contrast, offset)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // RGBA out: ink pixels opaque black, paper pixels fully transparent, so the
  // plate can be tinted per theme by using it as a CSS mask.
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = y * info.width + x;
      const v = data[i * info.channels];
      const t = (BAYER4[y & 3][x & 3] + 0.5) * (255 / 16);
      const ink = v < t;
      const o = i * 4;
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = ink ? 255 : 0;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ palette: true, colours: 2, compressionLevel: 9 })
    .toBuffer();
}

// ---------------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const only = process.argv.slice(2);
const sites = siteList().filter((s) => !only.length || only.includes(s.id));
console.log(`${sites.length} sites\n`);

const credits = {};
let ok = 0;
let miss = 0;

for (const site of sites) {
  process.stdout.write(`  ${site.id.padEnd(16)}`);
  try {
    const found = await findPhoto(site);
    if (!found) {
      console.log("no PD image found");
      miss++;
      continue;
    }
    const cacheFile = resolve(CACHE, `${site.id}.bin`);
    let raw;
    if (existsSync(cacheFile)) {
      raw = readFileSync(cacheFile);
    } else {
      const r = await polite(found.thumb);
      raw = Buffer.from(await r.arrayBuffer());
      writeFileSync(cacheFile, raw);
    }
    const plate = await toPlate(raw);
    writeFileSync(resolve(OUT_DIR, `${site.id}.png`), plate);
    credits[site.id] = {
      file: found.file,
      licence: found.licence,
      author: found.author || "unknown",
      page: found.page,
      bytes: plate.length,
    };
    ok++;
    console.log(`ok  ${(plate.length / 1024).toFixed(1)}kb  ${found.licence}`);
  } catch (e) {
    miss++;
    console.log("FAILED", e.message);
  }
}

// Merge with any existing credits so a partial re-run does not drop entries.
let prior = {};
if (existsSync(OUT_TS)) {
  const m = readFileSync(OUT_TS, "utf8").match(/export const PHOTOS[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (m) {
    try {
      prior = JSON.parse(m[1]);
    } catch {
      prior = {};
    }
  }
}
const merged = { ...prior, ...credits };

writeFileSync(
  OUT_TS,
  `// GENERATED — do not edit by hand. Run \`node scripts/genphotos.mjs\`.
// Public-domain photographs from Wikimedia Commons, reduced to 1-bit ordered-
// dither plates in /public/plates. Only PD/CC0 sources are accepted, so no
// attribution is legally required; it is recorded and displayed anyway.

export type Plate = {
  /** Original file name on Commons. */
  file: string;
  licence: string;
  author: string;
  /** Commons description page. */
  page: string;
};

export const PHOTOS: Record<string, Plate> = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(merged)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, { file: v.file, licence: v.licence, author: v.author, page: v.page }]),
    ),
    null,
    2,
  )};

/** Path to a site's halftone plate, or null if we have none. */
export function plateFor(siteId: string): string | null {
  return PHOTOS[siteId] ? \`/plates/\${siteId}.png\` : null;
}
`,
);

console.log(`\n${ok} plates, ${miss} missing -> ${OUT_DIR}`);
