// Deterministic PRNG. A seed reproduces an entire run, which is what makes
// "seeded world state" replayability possible and lets the sim be tested
// headlessly. mulberry32 — small, fast, good enough distribution for a game.

export type Rng = {
  next(): number;
  int(n: number): number;
  range(a: number, b: number): number;
  chance(p: number): boolean;
  pick<T>(arr: readonly T[]): T;
  sample<T>(arr: readonly T[], n: number): T[];
  weighted<T>(arr: readonly T[], weight: (t: T) => number): T;
  /** Cursor, so a save file can resume the exact stream. */
  cursor(): number;
};

export function makeRng(seed: number, cursor = 0): Rng {
  let s = seed >>> 0;
  let calls = 0;

  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    calls++;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Fast-forward to restore a saved stream position.
  for (let i = 0; i < cursor; i++) next();
  calls = cursor;

  return {
    next,
    int: (n) => Math.floor(next() * n),
    range: (a, b) => a + next() * (b - a),
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    sample(arr, n) {
      const pool = arr.slice();
      const out: (typeof pool)[number][] = [];
      const take = Math.min(n, pool.length);
      for (let i = 0; i < take; i++) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return out;
    },
    weighted(arr, weight) {
      let total = 0;
      for (const item of arr) total += Math.max(0, weight(item));
      if (total <= 0) return arr[Math.floor(next() * arr.length)];
      let roll = next() * total;
      for (const item of arr) {
        roll -= Math.max(0, weight(item));
        if (roll <= 0) return item;
      }
      return arr[arr.length - 1];
    },
    cursor: () => calls,
  };
}


/** Human-readable seed for display / sharing. */
export function seedLabel(seed: number): string {
  return seed.toString(36).toUpperCase().padStart(7, "0").slice(-7);
}
