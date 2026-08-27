import type {
  EventDef,
  GameState,
  RealizedEvent,
  Route,
  Site,
} from "../types";
import type { Rng } from "../rng";
import { SITES, SITE_BY_ID } from "../sites";
import { STATES } from "../usmap";
import { VOCAB } from "./vocab";
import { SIGHTINGS } from "./sightings";
import { HUMANS } from "./humans";
import { FACTIONS_EVENTS } from "./factions";
import { WEIRD } from "./weird";

export const DECK: EventDef[] = [
  ...SIGHTINGS,
  ...HUMANS,
  ...FACTIONS_EVENTS,
  ...WEIRD,
];

const STATE_NAME: Record<string, string> = Object.fromEntries(
  STATES.map((s) => [s.code, s.name]),
);

/** Rough count of distinct surface texts a def can produce. */
function variantsOf(def: EventDef): number {
  const text = def.headline + def.dek + def.choices.map((c) => c.note).join("");
  let n = 1;
  for (const slot of Object.keys(VOCAB)) {
    if (text.includes(`{${slot}}`)) n *= VOCAB[slot].length;
  }
  return n;
}

/** Deck statistics, surfaced in the UI so the variety claim is checkable. */
export const DECK_STATS = {
  defs: DECK.length,
  byTag: DECK.reduce<Record<string, number>>((acc, d) => {
    for (const t of d.tags) acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {}),
  /** Total distinct realised texts across the whole deck. */
  variants: DECK.reduce((t, d) => t + variantsOf(d), 0),
};

// ---------------------------------------------------------------------------
// Realisation: pick a def that fits the current state, bind it to a real site
// and route, then fill its {slots}.
// ---------------------------------------------------------------------------

function eligible(def: EventDef, s: GameState, focus: Site | null): boolean {
  if (def.races && !def.races.includes(s.race)) return false;
  if (def.needsRoute && s.routes.length === 0) return false;
  if (def.minDisclosure !== undefined && s.disclosure < def.minDisclosure) return false;
  if (def.kinds) {
    if (!focus || !def.kinds.includes(focus.kind)) return false;
  }
  if (def.minHeat !== undefined) {
    const h = focus ? (s.suspicion[focus.state] ?? 0) : 0;
    if (h < def.minHeat) return false;
  }
  return true;
}

/**
 * Choose what the event is about. Prefer somewhere you are actually operating —
 * events that land on your own routes read as consequences rather than noise.
 */
function pickFocus(s: GameState, rng: Rng): { site: Site | null; route: Route | null } {
  const active = s.routes.filter((r) => !r.paused);
  if (active.length && rng.chance(0.75)) {
    const route = rng.pick(active);
    const site = SITE_BY_ID[route.fromId] ?? null;
    return { site, route };
  }
  // Otherwise somewhere hot, so pressure builds where the mess is.
  const hot = SITES.filter((site) => (s.suspicion[site.state] ?? 0) > 20);
  const pool = hot.length ? hot : SITES;
  return { site: rng.pick(pool), route: null };
}

function fill(template: string, rng: Rng, site: Site | null): string {
  return template.replace(/\{(\w+)\}/g, (whole, slot: string) => {
    if (slot === "site") return site?.name ?? "the site";
    if (slot === "place") return site?.place ?? "the sector";
    if (slot === "state") return site ? (STATE_NAME[site.state] ?? site.state) : "the state";
    const pool = VOCAB[slot];
    return pool ? rng.pick(pool) : whole;
  });
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** Nights since the start map onto a date from July 1947 forward. */
export function datelineFor(night: number): string {
  const start = new Date(Date.UTC(1947, 6, 8));
  const d = new Date(start.getTime() + night * 86400000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Draw one event appropriate to the current state, or null if nothing fits. */
export function drawEvent(s: GameState, rng: Rng): RealizedEvent | null {
  const { site, route } = pickFocus(s, rng);
  const recent = new Set(s.recentEvents ?? []);
  const eligibleDefs = DECK.filter((d) => eligible(d, s, site));
  // Prefer anything not drawn lately; fall back to the full set if the filters
  // have narrowed things so far that everything eligible is also recent.
  const fresh = eligibleDefs.filter((d) => !recent.has(d.id));
  const pool = fresh.length ? fresh : eligibleDefs;
  if (!pool.length) return null;

  // Weight toward higher tiers as disclosure climbs — the game gets meaner.
  const pressure = s.disclosure / 100;
  const def = rng.weighted(pool, (d) => {
    const tierFit = 1 + (d.tier - 1) * pressure * 1.1;
    return d.weight * tierFit;
  });

  return {
    defId: def.id,
    tier: def.tier,
    tags: def.tags,
    headline: fill(def.headline, rng, site),
    dek: fill(def.dek, rng, site),
    dateline: datelineFor(s.night),
    paper: rng.pick(VOCAB.paper),
    choices: def.choices.map((c) => ({ ...c, note: fill(c.note, rng, site) })),
    focusSiteId: site?.id ?? null,
    focusStateCode: site?.state ?? null,
    focusRouteId: route?.id ?? null,
    night: s.night,
  };
}
