// Headless balance harness. Plays each race with a crude but plausible bot
// across many seeds and reports how runs end. Used to set the numbers in
// TUNE and the per-race goal targets.
//
//   npx tsx scripts/sim.ts [nightsCap] [seedsPerRace] [edition]
//
// edition is "us" (default) or "gc" — the engine is shared, so the same bot
// plays either content pack.

import {
  newGame, tick, chooseOption, passEvent, buildRoute, buyCraft, buildLab,
  routeError, canAfford, totalSuspicion,
} from "../src/game/engine";
import type { RaceDef } from "../src/game/races";
import { CONTENT, type Edition } from "../src/game/content";
import type { GameState, RaceId } from "../src/game/types";
import { makeRng } from "../src/game/rng";

const NIGHTS = Number(process.argv[2] ?? 400);
const SEEDS = Number(process.argv[3] ?? 40);
const EDITION = (process.argv[4] ?? "us") as Edition;
const PACK = CONTENT[EDITION];
const { races: RACES, sites: SITES, siteXY, craftFor, crewsFor } = PACK;

function dist(a: string, b: string) {
  const [ax, ay] = siteXY(a);
  const [bx, by] = siteXY(b);
  return Math.hypot(bx - ax, by - ay);
}

/** A bot that plays roughly the way the race intends to be played. */
function play(race: RaceId, seed: number, nightsCap: number) {
  const def: RaceDef = RACES[race];
  let s = newGame(race, seed, EDITION);
  const rng = makeRng(seed ^ 0x9e3779b9);

  // Candidate sources, nearest-first — cheap routes are usually right.
  const sources = SITES.filter(
    (x) => def.harvestKinds.includes(x.kind) && !x.startLocked,
  ).sort((a, b) => dist(a.id, def.homeId) - dist(b.id, def.homeId));

  const crews = crewsFor(race);
  const buyable = craftFor(race).sort((a, b) => a.cost - b.cost);

  let labsBuilt = 0;

  // Guard: the loop only advances the clock on some branches, so a bug that
  // stops it resolving must fail loudly rather than hang.
  let steps = 0;
  while (s.night < nightsCap && s.phase === "playing") {
    if (++steps > nightsCap * 12) {
      throw new Error(`stuck at night ${s.night} (${race}/${seed}), pending=${s.pending?.defId}`);
    }
    // Answer any pending newspaper: prefer the cheapest affordable non-ignore
    // option when disclosure is climbing, else the free one.
    if (s.pending) {
      const opts = s.pending.choices;
      let pick = opts.length - 1;
      if (s.disclosure > 35) {
        for (let i = 0; i < opts.length; i++) {
          if (canAfford(s, opts[i].cost) && (opts[i].effect.disclosure ?? 0) <= 0) {
            pick = i;
            break;
          }
        }
      }
      if (!canAfford(s, opts[pick].cost)) {
        pick = opts.findIndex((o) => canAfford(s, o.cost));
      }
      s = pick < 0 ? passEvent(s) : chooseOption(s, pick);
      continue;
    }

    // Expand: wire an idle craft to the nearest unused source.
    const idle = s.fleet.find((c) => !c.routeId);
    if (idle) {
      if (race === "mantid") {
        // Build the chain: a lab near home, then feeders into it, then lab->home.
        const labSite = s.sites[sources[0]?.id ?? ""];
        if (labSite && !labSite.isLab && s.cash > 260 && labsBuilt === 0) {
          s = buildLab(s, sources[0].id);
          labsBuilt++;
          continue;
        }
        const lab = Object.values(s.sites).find((x) => x.isLab);
        if (lab) {
          const hasReturn = s.routes.some((r) => r.fromId === lab.id && r.toId === def.homeId);
          if (!hasReturn && !routeError(s, lab.id, def.homeId, idle.id)) {
            s = buildRoute(s, lab.id, def.homeId, idle.id, crews[0].id, "direct");
            continue;
          }
          const feeder = sources.find(
            (x) => x.id !== lab.id && !s.routes.some((r) => r.fromId === x.id),
          );
          if (feeder && !routeError(s, feeder.id, lab.id, idle.id)) {
            s = buildRoute(s, feeder.id, lab.id, idle.id, crews[0].id, "nap");
            continue;
          }
        }
      } else {
        const next = sources.find((x) => !s.routes.some((r) => r.fromId === x.id));
        if (next && !routeError(s, next.id, def.homeId, idle.id)) {
          const corridor = race === "nordic" ? "night" : "nap";
          const crew = crews[Math.min(1, crews.length - 1)];
          s = buildRoute(s, next.id, def.homeId, idle.id, crew.id, corridor);
          continue;
        }
      }
    }

    // Buy a hull when flush and there is room to fly it.
    if (s.routes.length < def.maxRoutes && !s.fleet.some((c) => !c.routeId)) {
      const affordable = buyable.filter((c) => c.cost < s.cash * 0.45);
      if (affordable.length) {
        s = buyCraft(s, affordable[affordable.length - 1].id);
        continue;
      }
    }

    void rng;
    s = tick(s);
  }

  return s;
}

type Row = { race: RaceId; wins: number; losses: number; timeouts: number; nights: number[]; disc: number[]; suspicion: number[]; cash: number[]; goalPct: number[] };

const rows: Row[] = [];

for (const race of ["grey", "nordic", "mantid"] as RaceId[]) {
  const row: Row = { race, wins: 0, losses: 0, timeouts: 0, nights: [], disc: [], suspicion: [], cash: [], goalPct: [] };
  for (let i = 0; i < SEEDS; i++) {
    const s: GameState = play(race, 1000 + i * 7919, NIGHTS);
    if (s.phase === "won") { row.wins++; row.nights.push(s.night); }
    else if (s.phase === "lost") row.losses++;
    else row.timeouts++;
    row.disc.push(s.disclosure);
    row.suspicion.push(totalSuspicion(s));
    row.cash.push(s.cash);
    row.goalPct.push((s.goal / s.goalTarget) * 100);
  }
  rows.push(row);
}

const avg = (a: number[]) => (a.length ? a.reduce((t, v) => t + v, 0) / a.length : 0);
const med = (a: number[]) => {
  if (!a.length) return 0;
  const b = [...a].sort((x, y) => x - y);
  return b[Math.floor(b.length / 2)];
};

console.log(`\n${EDITION.toUpperCase()} edition — ${SEEDS} seeds/race, ${NIGHTS}-night cap\n`);
console.log(
  "race".padEnd(8) +
    "win".padStart(5) + "lose".padStart(6) + "t/o".padStart(5) +
    "medNight".padStart(10) + "avgDisc".padStart(9) +
    "avgSusp".padStart(9) + "medCash".padStart(9) + "medGoal%".padStart(10),
);
for (const r of rows) {
  console.log(
    r.race.padEnd(8) +
      String(r.wins).padStart(5) +
      String(r.losses).padStart(6) +
      String(r.timeouts).padStart(5) +
      String(Math.round(med(r.nights))).padStart(10) +
      avg(r.disc).toFixed(1).padStart(9) +
      avg(r.suspicion).toFixed(0).padStart(9) +
      Math.round(med(r.cash)).toString().padStart(9) +
      med(r.goalPct).toFixed(0).padStart(10),
  );
}
console.log();
