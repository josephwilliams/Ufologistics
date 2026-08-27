import { STATES } from "./usmap";
import type { StateCode } from "./types";

// Point-in-state lookup, used to decide which states a flight corridor passes
// over (and therefore which ones take the suspicion). The paths are already in
// viewBox units, so this is pure 2D — no projection at query time.

type Ring = number[][];

/** Parse the generated "M x y L x y ... Z" path data back into rings. */
function parseRings(d: string): Ring[] {
  const rings: Ring[] = [];
  for (const chunk of d.split("M").slice(1)) {
    const nums = chunk.replace(/Z/g, "").split(/[L\s]+/).filter(Boolean).map(Number);
    const ring: Ring = [];
    for (let i = 0; i + 1 < nums.length; i += 2) ring.push([nums[i], nums[i + 1]]);
    if (ring.length > 2) rings.push(ring);
  }
  return rings;
}

type Poly = { code: StateCode; rings: Ring[]; minX: number; minY: number; maxX: number; maxY: number };

const POLYS: Poly[] = STATES.map((s) => {
  const rings = parseRings(s.d);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rings)
    for (const [x, y] of r) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  return { code: s.code, rings, minX, minY, maxX, maxY };
});

function inRing(x: number, y: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Which state covers this point, or null out at sea. */
export function stateAt(x: number, y: number): StateCode | null {
  for (const p of POLYS) {
    if (x < p.minX || x > p.maxX || y < p.minY || y > p.maxY) continue;
    for (const r of p.rings) if (inRing(x, y, r)) return p.code;
  }
  return null;
}

/** Nearest state by centroid — the fallback for offshore points. */
export function nearestState(x: number, y: number): StateCode {
  let best = STATES[0];
  let bestD = Infinity;
  for (const s of STATES) {
    const d = (s.cx - x) ** 2 + (s.cy - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best.code;
}

/**
 * States a straight corridor passes over. Sampled rather than clipped — a
 * corridor that clips a state's corner should still warm it up a little.
 */
export function statesAlong(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  samples = 14,
): StateCode[] {
  const seen = new Set<StateCode>();
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    const code = stateAt(x, y) ?? nearestState(x, y);
    seen.add(code);
  }
  return [...seen];
}
