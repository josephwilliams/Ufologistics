import type {
  Craft,
  CraftDef,
  Effect,
  GameState,
  LogEntry,
  RaceId,
  Route,
  SiteState,
  Specimen,
  StateCode,
} from "./types";
import { makeRng, type Rng } from "./rng";
import { RACES } from "./races";
import { SITES, SITE_BY_ID, siteXY } from "./sites";
import { STATES } from "./usmap";
import { statesAlong } from "./geo";
import { CORRIDOR_BY_ID, CRAFT_BY_ID, CREW_BY_ID } from "./craft";
import { drawEvent, datelineFor } from "./events";

// ---------------------------------------------------------------------------
// Tuning constants. Collected here because they are the whole balance surface
// and they were set by running scripts/sim.ts, not by intuition.
// ---------------------------------------------------------------------------

export const TUNE = {
  /** Suspicion added per leg before all the multipliers. */
  noiseBase: 2.5,
  /** Fraction of the suspicion that lands on states merely crossed. */
  crossShare: 0.55,
  /** Multiplicative suspicion decay per night. */
  suspicionDecay: 0.985,
  /** Flat suspicion bled off per night. */
  suspicionBleed: 0.15,
  /** Above this, a state starts pushing Disclosure up on its own. */
  suspicionAlarm: 45,
  /** Disclosure per night per point of suspicion above the alarm line. */
  disclosurePerAlarmSuspicion: 0.0011,
  /** Upkeep is charged nightly at this fraction of the listed rate. */
  upkeepScale: 0.1,
  /**
   * Nights between event rolls. Read these as real seconds: at the fastest
   * speed a night is 600ms, so the old 5–13 put a modal in your face every
   * ~5 seconds.
   */
  eventGapMin: 9,
  eventGapMax: 22,
  /** How many recent draws are excluded from the pool, to stop repeats. */
  recentMemory: 14,
  /** Grey only: per-route chance per night of a self-inflicted incident. */
  sloppyChance: 0.011,
  /** Nordic only: suspicion at which a site is spoiled for good. */
  spoilAt: 60,
  /** Mantid: nights a lab takes to turn one specimen into one sequence. */
  labNights: 4,
  /** Mantid: nights before an uncollected specimen is worthless. */
  specimenLife: 45,
  /** Mantid: chance per night a town grows a specimen. */
  specimenSpawn: 0.05,
  /** Site stock regrowth per night, as a fraction of full. */
  stockRegen: 0.004,
  /** Stock consumed per delivery, as a fraction of full. */
  stockDrain: 0.02,
  /** Divisors that turn a site's rating into a payout multiplier near 1. */
  yieldDivisor: 12,
  appealDivisor: 16,
  /** Cash and goal per grade-point of a delivered Mantid sequence. */
  sequenceValue: 26,
};

const TRAITS = [
  "corticalSpindles", "melaninDeficit", "vagalTone", "RH-null",
  "temporalLobeBloom", "mirrorNeuronExcess", "telomereLength", "gutFlora",
  "circadianDrift", "painThreshold", "hyperosmia", "tetrachromacy",
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function emptyHeat(): Record<StateCode, number> {
  const h: Record<StateCode, number> = {};
  for (const s of STATES) h[s.code] = 0;
  return h;
}

export function newGame(race: RaceId, seed: number): GameState {
  const def = RACES[race];
  const rng = makeRng(seed);

  const sites: Record<string, SiteState> = {};
  for (const s of SITES) {
    sites[s.id] = {
      id: s.id,
      stock: 1,
      specimens: [],
      isLab: false,
      sequences: [],
      locked: !!s.startLocked,
      spoiled: false,
    };
  }

  // Seeded world state: a handful of sites start more suspicious or richer than usual,
  // so the same race plays differently from seed to seed.
  const suspicion = emptyHeat();
  suspicion[SITE_BY_ID[def.homeId].state] = def.startDisclosure * 0.8;
  for (const s of rng.sample(STATES, 5)) {
    suspicion[s.code] = rng.range(4, 22);
  }

  const fleet: Craft[] = def.startCraft.map((defId, i) => ({
    id: `c${i}`,
    defId,
    routeId: null,
  }));

  return {
    seed,
    rngCursor: rng.cursor(),
    phase: "playing",
    race,
    night: 0,
    cash: def.startCash,
    standing: 20,
    disclosure: def.startDisclosure,
    goal: 0,
    goalTarget: def.goalTarget,
    suspicion,
    factions: {
      grey: race === "grey" ? 30 : 0,
      nordic: race === "nordic" ? 30 : 0,
      mantid: race === "mantid" ? 30 : 0,
      draco: 0,
      federation: 10,
      mj12: 5,
      movement: -5,
    },
    sites,
    fleet,
    routes: [],
    unlocks: [],
    pending: null,
    log: [
      {
        night: 0,
        kind: "system",
        text: `${datelineFor(0)} — ${def.name} operation opens at ${SITE_BY_ID[def.homeId].name}.`,
      },
    ],
    eventCooldown: 6,
    recentEvents: [],
    ending: null,
  };
}

// ---------------------------------------------------------------------------
// Route construction
// ---------------------------------------------------------------------------

export function routeDistance(fromId: string, toId: string, corridorId: string): number {
  const [ax, ay] = siteXY(fromId);
  const [bx, by] = siteXY(toId);
  const raw = Math.hypot(bx - ax, by - ay);
  return Math.max(30, raw * (CORRIDOR_BY_ID[corridorId]?.lengthMul ?? 1));
}

/** Why a proposed route is illegal, or null if it is fine. */
export function routeError(
  s: GameState,
  fromId: string,
  toId: string,
  craftId: string,
): string | null {
  const def = RACES[s.race];
  const from = SITE_BY_ID[fromId];
  const to = SITE_BY_ID[toId];
  if (!from || !to) return "Unknown site.";
  if (fromId === toId) return "A route needs two different ends.";
  if (s.routes.length >= def.maxRoutes) return `${def.name} may run only ${def.maxRoutes} routes.`;
  if (s.sites[fromId].locked) return `${from.name} is not open to you yet.`;
  if (s.sites[fromId].spoiled) return `${from.name} is spoiled.`;
  // A lab is a valid source regardless of what kind of site it was built on —
  // that is the whole point of the second hop.
  if (!s.sites[fromId].isLab && !def.harvestKinds.includes(from.kind)) {
    return `${def.name} cannot work a site of that kind.`;
  }
  const craft = s.fleet.find((c) => c.id === craftId);
  if (!craft) return "No such craft.";
  if (craft.routeId) return "That craft is already assigned.";

  // Destination rules differ by race: Mantid may deliver into a lab.
  if (s.race === "mantid") {
    if (toId !== def.homeId && !s.sites[toId].isLab) {
      return "Mantid cargo must go to a lab or to Dulce.";
    }
  } else if (toId !== def.homeId) {
    return `Deliveries must go to ${SITE_BY_ID[def.homeId].name}.`;
  }
  if (s.routes.some((r) => r.fromId === fromId && r.toId === toId)) {
    return "That leg is already wired.";
  }
  return null;
}

export function buildRoute(
  s: GameState,
  fromId: string,
  toId: string,
  craftId: string,
  crewId: string,
  corridorId: string,
): GameState {
  if (routeError(s, fromId, toId, craftId)) return s;

  const [ax, ay] = siteXY(fromId);
  const [bx, by] = siteXY(toId);
  const route: Route = {
    id: `r${s.night}-${s.routes.length}-${fromId}`,
    fromId,
    toId,
    craftId,
    crewId,
    corridorId,
    progress: 0,
    outbound: true,
    distance: routeDistance(fromId, toId, corridorId),
    crosses: statesAlong(ax, ay, bx, by),
    runs: 0,
    paused: false,
  };

  return {
    ...s,
    routes: [...s.routes, route],
    fleet: s.fleet.map((c) => (c.id === craftId ? { ...c, routeId: route.id } : c)),
    log: pushLog(s.log, {
      night: s.night,
      kind: "system",
      text: `Wired ${SITE_BY_ID[fromId].name} → ${SITE_BY_ID[toId].name}.`,
    }),
  };
}

export function removeRoute(s: GameState, routeId: string): GameState {
  const route = s.routes.find((r) => r.id === routeId);
  if (!route) return s;
  return {
    ...s,
    routes: s.routes.filter((r) => r.id !== routeId),
    fleet: s.fleet.map((c) => (c.routeId === routeId ? { ...c, routeId: null } : c)),
    log: pushLog(s.log, {
      night: s.night,
      kind: "system",
      text: `Stood down ${SITE_BY_ID[route.fromId].name} → ${SITE_BY_ID[route.toId].name}.`,
    }),
  };
}

export function reconfigureRoute(
  s: GameState,
  routeId: string,
  patch: { crewId?: string; corridorId?: string; craftId?: string },
): GameState {
  const route = s.routes.find((r) => r.id === routeId);
  if (!route) return s;

  // Swapping the hull: the incoming craft must exist and be sitting idle. The
  // outgoing one goes back to the hangar rather than vanishing.
  let fleet = s.fleet;
  const craftId = patch.craftId ?? route.craftId;
  if (craftId !== route.craftId) {
    const incoming = s.fleet.find((c) => c.id === craftId);
    if (!incoming || incoming.routeId) return s;
    fleet = s.fleet.map((c) => {
      if (c.id === route.craftId) return { ...c, routeId: null };
      if (c.id === craftId) return { ...c, routeId };
      return c;
    });
  }

  return {
    ...s,
    fleet,
    routes: s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const corridorId = patch.corridorId ?? r.corridorId;
      return {
        ...r,
        craftId,
        crewId: patch.crewId ?? r.crewId,
        corridorId,
        distance: routeDistance(r.fromId, r.toId, corridorId),
      };
    }),
  };
}

export function toggleRoutePaused(s: GameState, routeId: string): GameState {
  return {
    ...s,
    routes: s.routes.map((r) => (r.id === routeId ? { ...r, paused: !r.paused } : r)),
  };
}

export function buyCraft(s: GameState, defId: string): GameState {
  const def = CRAFT_BY_ID[defId];
  if (!def || s.cash < def.cost) return s;
  return {
    ...s,
    cash: s.cash - def.cost,
    fleet: [...s.fleet, { id: `c${s.night}-${s.fleet.length}`, defId, routeId: null }],
    log: pushLog(s.log, {
      night: s.night,
      kind: "money",
      text: `Acquired a ${def.name} for ${def.cost}.`,
    }),
  };
}

export const LAB_COST = 180;

export function buildLab(s: GameState, siteId: string): GameState {
  if (s.race !== "mantid") return s;
  if (s.cash < LAB_COST || s.sites[siteId].isLab) return s;
  const site = SITE_BY_ID[siteId];
  if (!site || site.kind === "base") return s;
  return {
    ...s,
    cash: s.cash - LAB_COST,
    sites: { ...s.sites, [siteId]: { ...s.sites[siteId], isLab: true } },
    log: pushLog(s.log, {
      night: s.night,
      kind: "system",
      text: `Lab commissioned at ${site.name}.`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Per-night simulation
// ---------------------------------------------------------------------------

function pushLog(log: LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...log].slice(0, 120);
}

/** Cargo value for one completed delivery on this route. */
export function deliveryValue(s: GameState, route: Route): number {
  const race = RACES[s.race];
  const cdef = CRAFT_BY_ID[s.fleet.find((c) => c.id === route.craftId)?.defId ?? ""];
  const crew = CREW_BY_ID[route.crewId];
  const from = SITE_BY_ID[route.fromId];
  const st = s.sites[route.fromId];
  if (!cdef || !crew || !from) return 0;

  // Mantid value is realised at the lab and on delivery home, not per-leg.
  if (s.race === "mantid") return 0;

  const base = cdef.capacity * crew.yieldMul * race.yieldMul;

  if (s.race === "nordic") {
    if (st.spoiled) return 0;
    const suspicion = s.suspicion[from.state] ?? 0;
    const purity = Math.max(0.1, 1 - suspicion / 70);
    return base * (from.appeal / TUNE.appealDivisor) * purity * st.stock;
  }
  return base * (from.yield / TUNE.yieldDivisor) * st.stock;
}

/** Suspicion generated by one completed leg, before it is spread over the corridor. */
export function legNoise(s: GameState, route: Route): number {
  const race = RACES[s.race];
  const cdef = CRAFT_BY_ID[s.fleet.find((c) => c.id === route.craftId)?.defId ?? ""];
  const crew = CREW_BY_ID[route.crewId];
  const corridor = CORRIDOR_BY_ID[route.corridorId];
  const from = SITE_BY_ID[route.fromId];
  if (!cdef || !crew || !corridor || !from) return 0;
  return (
    TUNE.noiseBase *
    cdef.noise *
    crew.noiseMul *
    corridor.noiseMul *
    race.noiseMul *
    from.risk
  );
}

function addSuspicion(suspicion: Record<StateCode, number>, code: StateCode, amount: number) {
  suspicion[code] = Math.max(0, Math.min(100, (suspicion[code] ?? 0) + amount));
}

// ---------------------------------------------------------------------------
// One night, in phases.
//
// tick() used to be a single 230-line function holding eight concerns and
// nesting seven deep. It is split into phases that fold into a shared Turn.
// The phases MUST keep running in this order: the RNG is a seeded cursor, so
// reordering them (or adding a draw) changes the outcome of every saved run.
// ---------------------------------------------------------------------------

/** Mutable accumulators for a single night. Module-private by design. */
type Turn = {
  night: number;
  cash: number;
  goal: number;
  disclosure: number;
  log: LogEntry[];
  suspicion: Record<StateCode, number>;
  sites: Record<string, SiteState>;
  rng: Rng;
};

/** Mantid: a lab shipping finished sequences home — the only place value banks. */
function shipSequences(t: Turn, r: Route, hold: number): void {
  const st = t.sites[r.fromId];
  const shipped = st.sequences.slice(0, hold);
  if (!shipped.length) return;

  t.sites[r.fromId] = { ...st, sequences: st.sequences.slice(shipped.length) };
  for (const grade of shipped) {
    t.cash += TUNE.sequenceValue * grade;
    t.goal += grade;
  }
  t.log = pushLog(t.log, {
    night: t.night,
    kind: "run",
    text: `${shipped.length} sequence${shipped.length > 1 ? "s" : ""} delivered to Dulce (+${shipped.reduce((a, g) => a + g, 0)} to the programme).`,
  });
}

/** Mantid: first hop, carrying raw specimens into a lab. */
function carrySpecimens(t: Turn, r: Route, hold: number): void {
  const from = t.sites[r.fromId];
  const to = t.sites[r.toId];
  const moved = from.specimens.slice(0, hold);
  if (!moved.length) return;

  t.sites[r.fromId] = { ...from, specimens: from.specimens.slice(moved.length) };
  t.sites[r.toId] = { ...to, specimens: [...to.specimens, ...moved] };
}

/** Grey and Nordic: cargo pays on arrival, and working a site wears it down. */
function bankDelivery(t: Turn, s: GameState, r: Route): void {
  const st = t.sites[r.fromId];
  const value = deliveryValue(s, r);
  t.cash += value;
  t.goal += value;
  t.sites[r.fromId] = { ...st, stock: Math.max(0.25, st.stock - TUNE.stockDrain) };

  // Nordic's whole tension: tour a place while the state is hot and you burn it.
  if (s.race === "nordic" && (t.suspicion[SITE_BY_ID[r.fromId].state] ?? 0) > TUNE.spoilAt) {
    t.sites[r.fromId] = { ...t.sites[r.fromId], spoiled: true };
    t.log = pushLog(t.log, {
      night: t.night,
      kind: "system",
      text: `${SITE_BY_ID[r.fromId].name} is spoiled — the tours are worthless now.`,
    });
  }
}

/** A craft reached the far end of an outbound leg: hand the cargo over. */
function unload(t: Turn, s: GameState, r: Route, cdef: CraftDef): void {
  const hold = Math.max(1, Math.round(cdef.capacity / 8));
  if (s.race !== "mantid") return bankDelivery(t, s, r);

  if (t.sites[r.fromId].isLab && r.toId === RACES[s.race].homeId) shipSequences(t, r, hold);
  else if (t.sites[r.toId].isLab) carrySpecimens(t, r, hold);
}

/** Advance every unpaused route one night, banking anything that arrives. */
function flyRoutes(t: Turn, s: GameState): Route[] {
  return s.routes.map((r) => {
    if (r.paused) return r;
    const cdef = CRAFT_BY_ID[s.fleet.find((c) => c.id === r.craftId)?.defId ?? ""];
    if (!cdef) return r;

    t.cash -= (cdef.upkeep + (CREW_BY_ID[r.crewId]?.upkeep ?? 0)) * TUNE.upkeepScale;

    let progress = r.progress + cdef.speed / r.distance;
    let outbound = r.outbound;
    let runs = r.runs;

    if (progress >= 1) {
      progress -= 1;

      // Suspicion lands on arrival regardless of direction, at the source state
      // and — diluted — on everything the corridor overflies.
      const noise = legNoise(s, r);
      const from = SITE_BY_ID[r.fromId];
      addSuspicion(t.suspicion, from.state, noise);
      for (const code of r.crosses) {
        if (code !== from.state) addSuspicion(t.suspicion, code, noise * TUNE.crossShare);
      }

      if (outbound) {
        unload(t, s, r, cdef);
        runs++;
      }
      outbound = !outbound;
    }

    return { ...r, progress, outbound, runs };
  });
}

/** Mantid only: towns grow specimens, labs refine them, neglect rots them. */
function runMantidChain(t: Turn, s: GameState): void {
  const race = RACES[s.race];
  for (const site of SITES) {
    const st = t.sites[site.id];

    if (race.harvestKinds.includes(site.kind) && !st.locked) {
      if (t.rng.chance(TUNE.specimenSpawn) && st.specimens.length < 6) {
        t.sites[site.id] = {
          ...st,
          specimens: [
            ...st.specimens,
            {
              id: `sp${t.night}-${site.id}`,
              traits: [t.rng.pick(TRAITS), t.rng.pick(TRAITS)] as [string, string],
              grade: t.rng.chance(0.18) ? 3 : t.rng.chance(0.4) ? 2 : 1,
              born: t.night,
            },
          ],
        };
      }
    }

    const cur = t.sites[site.id];
    if (cur.isLab && cur.specimens.length && t.night % TUNE.labNights === 0) {
      const [done, ...rest] = cur.specimens;
      t.sites[site.id] = { ...cur, specimens: rest, sequences: [...cur.sequences, done.grade] };
    }

    const after = t.sites[site.id];
    if (after.specimens.length) {
      const alive = after.specimens.filter((sp) => t.night - sp.born < TUNE.specimenLife);
      if (alive.length !== after.specimens.length) {
        t.sites[site.id] = { ...after, specimens: alive };
      }
    }
  }
}

/** Grey only: sloppy crews generate their own headlines. */
function runGreyIncidents(t: Turn, routes: Route[]): void {
  for (const r of routes) {
    if (r.paused) continue;
    if (!t.rng.chance(TUNE.sloppyChance)) continue;

    const from = SITE_BY_ID[r.fromId];
    addSuspicion(t.suspicion, from.state, 7);
    t.disclosure += 0.9;
    t.log = pushLog(t.log, {
      night: t.night,
      kind: "event",
      text: `Sloppy handling on the ${from.name} run — a witness, a photograph, a small item in the paper.`,
    });
  }
}

/** States cool on their own; anything still above the alarm line leaks Disclosure. */
function coolStates(t: Turn): void {
  for (const code of Object.keys(t.suspicion)) {
    t.suspicion[code] = Math.max(0, t.suspicion[code] * TUNE.suspicionDecay - TUNE.suspicionBleed);
    if (t.suspicion[code] > TUNE.suspicionAlarm) {
      t.disclosure += (t.suspicion[code] - TUNE.suspicionAlarm) * TUNE.disclosurePerAlarmSuspicion;
    }
  }
}

/** Sites recover while nobody is working them. */
function regrowStock(t: Turn): void {
  for (const site of SITES) {
    const st = t.sites[site.id];
    if (st.stock < 1) t.sites[site.id] = { ...st, stock: Math.min(1, st.stock + TUNE.stockRegen) };
  }
}

/** How the run ends, if it ends this night. */
function resolveEnding(t: Turn, s: GameState): Pick<GameState, "phase" | "ending"> {
  if (t.disclosure >= 100) {
    return {
      phase: "lost",
      ending:
        "Public disclosure. Your licence is revoked, the assets are seized, and Earth goes to auction. You are the reason there is now a word for what you were.",
    };
  }
  if (t.goal >= s.goalTarget) return { phase: "won", ending: RACES[s.race].winText };
  if (t.cash < -400) {
    return {
      phase: "lost",
      ending:
        "Insolvent. The Federation calls in your licence against your debts and a rival takes over the sector by the end of the quarter.",
    };
  }
  return { phase: s.phase, ending: s.ending };
}

/**
 * Advance one night. Returns the next state; if an event fires, `pending` is
 * set and the caller is expected to stop the clock until it is answered.
 */
export function tick(s: GameState): GameState {
  if (s.phase !== "playing" || s.pending) return s;

  const t: Turn = {
    night: s.night + 1,
    cash: s.cash,
    goal: s.goal,
    disclosure: s.disclosure,
    log: s.log,
    suspicion: { ...s.suspicion },
    sites: { ...s.sites },
    rng: makeRng(s.seed, s.rngCursor),
  };

  const routes = flyRoutes(t, s);
  if (s.race === "mantid") runMantidChain(t, s);
  if (s.race === "grey") runGreyIncidents(t, routes);
  coolStates(t);
  regrowStock(t);

  // Events read the night as it now stands, so they are drawn against staged.
  const staged: GameState = {
    ...s,
    night: t.night,
    cash: t.cash,
    goal: t.goal,
    disclosure: t.disclosure,
    suspicion: t.suspicion,
    sites: t.sites,
    routes,
    log: t.log,
  };

  let eventCooldown = s.eventCooldown - 1;
  let pending = null as GameState["pending"];
  let recentEvents = s.recentEvents;
  if (eventCooldown <= 0) {
    pending = drawEvent(staged, t.rng);
    if (pending) recentEvents = [pending.defId, ...recentEvents].slice(0, TUNE.recentMemory);
    eventCooldown = Math.floor(t.rng.range(TUNE.eventGapMin, TUNE.eventGapMax));
  }

  t.disclosure = Math.max(0, Math.min(100, t.disclosure));

  const next: GameState = {
    ...staged,
    disclosure: t.disclosure,
    pending,
    eventCooldown,
    recentEvents,
    ...resolveEnding(t, s),
    rngCursor: t.rng.cursor(),
  };

  // Tier-1 items are weather, not decisions. Stopping the clock for every
  // little paragraph made the interruptions frequent AND cheap-feeling, so
  // they now settle themselves and turn up in Dispatches. Anything tier 2 or
  // above still stops everything and asks.
  if (next.pending && next.pending.tier === 1) {
    const free = next.pending.choices.findIndex((c) => !c.cost?.cash && canAfford(next, c.cost));
    const done = chooseOption(next, free >= 0 ? free : next.pending.choices.length - 1);
    // Re-file the entry as a dispatch. It reads the same in the log, but the
    // tutorial waits for the player to answer a real newspaper, and one of
    // these settling itself must not count as that.
    return { ...done, log: done.log.map((l, i) => (i === 0 ? { ...l, kind: "dispatch" } : l)) };
  }
  return next;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function canAfford(s: GameState, cost?: { cash?: number; standing?: number }): boolean {
  if (!cost) return true;
  if (cost.cash !== undefined && s.cash < cost.cash) return false;
  if (cost.standing !== undefined && s.standing < cost.standing) return false;
  return true;
}

/** Is there any option the player could actually take? */
export function hasAffordableChoice(s: GameState): boolean {
  if (!s.pending) return false;
  return s.pending.choices.some((c) => canAfford(s, c.cost));
}

/**
 * Let the event happen unanswered. Needed because some events have a price on
 * every option — without this, arriving at one broke would soft-lock the run.
 * The penalty scales with tier, so being unable to act is bad but survivable.
 */
export function passEvent(s: GameState): GameState {
  const ev = s.pending;
  if (!ev) return s;
  const rng = makeRng(s.seed, s.rngCursor);
  const suspicion = { ...s.suspicion };
  if (ev.focusStateCode) addSuspicion(suspicion, ev.focusStateCode, ev.tier * 2);

  return {
    ...s,
    pending: null,
    suspicion,
    disclosure: Math.max(0, Math.min(100, s.disclosure + ev.tier * 1.5)),
    rngCursor: rng.cursor(),
    log: pushLog(s.log, {
      night: s.night,
      kind: "event",
      text: `${ev.headline} — nothing you could afford would have helped. It runs.`,
    }),
  };
}

function applyEffect(s: GameState, e: Effect, focusState: StateCode | null, focusSite: string | null, focusRoute: string | null, rng: Rng): GameState {
  const suspicion = { ...s.suspicion };
  let sites = s.sites;
  let fleet = s.fleet;
  let routes = s.routes;

  if (e.suspicion && focusState) addSuspicion(suspicion, focusState, e.suspicion);
  if (e.suspicionAll) for (const code of Object.keys(suspicion)) addSuspicion(suspicion, code, e.suspicionAll);

  const factions = { ...s.factions };
  if (e.faction) {
    for (const [k, v] of Object.entries(e.faction)) {
      const key = k as keyof typeof factions;
      factions[key] = Math.max(-100, Math.min(100, factions[key] + (v ?? 0)));
    }
  }

  if (e.loseRoute && focusRoute) {
    const r = routes.find((x) => x.id === focusRoute);
    if (r) {
      routes = routes.filter((x) => x.id !== focusRoute);
      fleet = fleet.map((c) => (c.routeId === focusRoute ? { ...c, routeId: null } : c));
    }
  }
  if (e.loseCraft && focusRoute) {
    const r = routes.find((x) => x.id === focusRoute);
    if (r) {
      fleet = fleet.filter((c) => c.id !== r.craftId);
      routes = routes.filter((x) => x.id !== focusRoute);
    }
  }
  if (e.grantCraft) {
    fleet = [...fleet, { id: `c${s.night}-g${fleet.length}`, defId: e.grantCraft, routeId: null }];
  }
  if (e.spoilSite && focusSite) {
    sites = { ...sites, [focusSite]: { ...sites[focusSite], spoiled: true } };
  }
  if (e.unlockSite) {
    const lockedIds = Object.values(sites).filter((x) => x.locked).map((x) => x.id);
    const target = e.unlockSite === "random" ? (lockedIds.length ? rng.pick(lockedIds) : null) : e.unlockSite;
    if (target && sites[target]) {
      sites = { ...sites, [target]: { ...sites[target], locked: false } };
    }
  }
  if (e.spawnSpecimens && focusSite) {
    const st = sites[focusSite];
    const extra: Specimen[] = [];
    for (let i = 0; i < e.spawnSpecimens; i++) {
      extra.push({
        id: `sp${s.night}-x${i}-${focusSite}`,
        traits: [rng.pick(TRAITS), rng.pick(TRAITS)] as [string, string],
        grade: rng.chance(0.3) ? 3 : 2,
        born: s.night,
      });
    }
    sites = { ...sites, [focusSite]: { ...st, specimens: [...st.specimens, ...extra] } };
  }

  return {
    ...s,
    cash: s.cash + (e.cash ?? 0),
    standing: Math.max(-100, Math.min(100, s.standing + (e.standing ?? 0))),
    disclosure: Math.max(0, Math.min(100, s.disclosure + (e.disclosure ?? 0))),
    goal: s.goal + (e.goal ?? 0),
    suspicion,
    factions,
    sites,
    fleet,
    routes,
  };
}

/** Answer the pending newspaper. */
export function chooseOption(s: GameState, index: number): GameState {
  const ev = s.pending;
  if (!ev) return s;
  const choice = ev.choices[index];
  if (!choice || !canAfford(s, choice.cost)) return s;

  const rng = makeRng(s.seed, s.rngCursor);

  let next: GameState = {
    ...s,
    cash: s.cash - (choice.cost?.cash ?? 0),
    standing: s.standing - (choice.cost?.standing ?? 0),
  };

  // Narrow to the backfire itself rather than a boolean, so the branches below
  // need no non-null assertion. rng.chance() still runs exactly once, and only
  // when a backfire exists — the cursor advance has to stay identical.
  const backfire =
    choice.backfire && rng.chance(choice.backfire.chance) ? choice.backfire : null;
  const effect = backfire ? backfire.effect : choice.effect;
  const note = backfire ? backfire.note : choice.note;

  next = applyEffect(next, effect, ev.focusStateCode, ev.focusSiteId, ev.focusRouteId, rng);

  let phase: GameState["phase"] = next.phase;
  let ending = next.ending;
  if (next.disclosure >= 100) {
    phase = "lost";
    ending =
      "Public disclosure. Your licence is revoked, the assets are seized, and Earth goes to auction.";
  } else if (next.goal >= next.goalTarget) {
    phase = "won";
    ending = RACES[next.race].winText;
  }

  return {
    ...next,
    pending: null,
    rngCursor: rng.cursor(),
    phase,
    ending,
    log: pushLog(next.log, {
      night: s.night,
      kind: "event",
      text: `${ev.headline} — ${note}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Derived readouts for the UI
// ---------------------------------------------------------------------------

export function totalSuspicion(s: GameState): number {
  return Object.values(s.suspicion).reduce((t, h) => t + h, 0);
}

export function hottestSectors(s: GameState, n = 3): { code: StateCode; suspicion: number }[] {
  return Object.entries(s.suspicion)
    .map(([code, suspicion]) => ({ code, suspicion }))
    .sort((a, b) => b.suspicion - a.suspicion)
    .slice(0, n);
}

/**
 * States currently past the alarm line — the only thing that pushes Disclosure
 * up on its own, every night, forever. Everything else about the loss meter is
 * one-off. Surfacing the count is what makes the game's central rule legible:
 * keep every state under the line and Disclosure stops climbing by itself.
 */
export function statesOverAlarm(s: GameState): StateCode[] {
  return Object.entries(s.suspicion)
    .filter(([, v]) => v > TUNE.suspicionAlarm)
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => code);
}

/** The alarm line, for UI that needs to draw or name it. */
export const ALARM = TUNE.suspicionAlarm;

export function nightlyNet(s: GameState): number {
  let net = 0;
  for (const r of s.routes) {
    if (r.paused) continue;
    const cdef = CRAFT_BY_ID[s.fleet.find((c) => c.id === r.craftId)?.defId ?? ""];
    const crew = CREW_BY_ID[r.crewId];
    if (!cdef || !crew) continue;
    net -= (cdef.upkeep + crew.upkeep) * TUNE.upkeepScale;
    // Two legs per delivery, so income per night is value / (2 * legNights).
    const legNights = r.distance / cdef.speed;
    if (s.race !== "mantid") net += deliveryValue(s, r) / (2 * legNights);
  }
  return net;
}
