// Shared event machinery.
//
// The draw logic — eligibility, focus selection, tier weighting by disclosure,
// recent-draw suppression, slot filling — is identical for every edition. Only
// the *content* differs: which defs, which vocabulary, which sites, which
// calendar. So the logic lives here once and each edition binds it to its own
// data via makeDeck().

import type { EventDef, GameState, RealizedEvent, Route, Site } from "./types";
import type { Rng } from "./rng";

export type DeckContext = {
  defs: EventDef[];
  /** Slot pools, keyed by slot name: {witness} -> vocab.witness. */
  vocab: Record<string, readonly string[]>;
  sites: Site[];
  siteById: Record<string, Site>;
  /** Map from state code to its printable name. */
  stateName: Record<string, string>;
  /** Month abbreviations, in the edition's language. */
  months: string[];
  /** Night 0 of the campaign. */
  epoch: { year: number; month: number; day: number };
  /** Words used when a slot has nothing to bind to. */
  fallback: { site: string; place: string; state: string };
  /** Renders a date; editions differ (US "JUL 8, 1947" vs "8 JUL 1947"). */
  formatDate: (months: string[], d: Date) => string;
};

export type Deck = {
  DECK: EventDef[];
  DECK_STATS: { defs: number; byTag: Record<string, number>; variants: number };
  drawEvent: (s: GameState, rng: Rng) => RealizedEvent | null;
  datelineFor: (night: number) => string;
};

export function makeDeck(ctx: DeckContext): Deck {
  const { defs, vocab, sites, siteById, stateName } = ctx;

  /** Rough count of distinct surface texts a def can produce. */
  function variantsOf(def: EventDef): number {
    const text = def.headline + def.dek + def.choices.map((c) => c.note).join("");
    let n = 1;
    for (const slot of Object.keys(vocab)) {
      if (text.includes(`{${slot}}`)) n *= vocab[slot].length;
    }
    return n;
  }

  const DECK_STATS = {
    defs: defs.length,
    byTag: defs.reduce<Record<string, number>>((acc, d) => {
      for (const t of d.tags) acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {}),
    variants: defs.reduce((t, d) => t + variantsOf(d), 0),
  };

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
   * Choose what the event is about. Prefer somewhere you are actually
   * operating — events on your own routes read as consequences, not noise.
   */
  function pickFocus(s: GameState, rng: Rng): { site: Site | null; route: Route | null } {
    const active = s.routes.filter((r) => !r.paused);
    if (active.length && rng.chance(0.75)) {
      const route = rng.pick(active);
      return { site: siteById[route.fromId] ?? null, route };
    }
    const hot = sites.filter((site) => (s.suspicion[site.state] ?? 0) > 20);
    return { site: rng.pick(hot.length ? hot : sites), route: null };
  }

  function fill(template: string, rng: Rng, site: Site | null): string {
    return template.replace(/\{(\w+)\}/g, (whole, slot: string) => {
      if (slot === "site") return site?.name ?? ctx.fallback.site;
      if (slot === "place") return site?.place ?? ctx.fallback.place;
      if (slot === "state") {
        return site ? (stateName[site.state] ?? site.state) : ctx.fallback.state;
      }
      const pool = vocab[slot];
      return pool ? rng.pick(pool) : whole;
    });
  }

  function datelineFor(night: number): string {
    const start = Date.UTC(ctx.epoch.year, ctx.epoch.month, ctx.epoch.day);
    return ctx.formatDate(ctx.months, new Date(start + night * 86400000));
  }

  function drawEvent(s: GameState, rng: Rng): RealizedEvent | null {
    const { site, route } = pickFocus(s, rng);
    const recent = new Set(s.recentEvents ?? []);
    const eligibleDefs = defs.filter((d) => eligible(d, s, site));
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
      paper: rng.pick(vocab.paper),
      choices: def.choices.map((c) => ({ ...c, note: fill(c.note, rng, site) })),
      focusSiteId: site?.id ?? null,
      focusStateCode: site?.state ?? null,
      focusRouteId: route?.id ?? null,
      night: s.night,
    };
  }

  return { DECK: defs, DECK_STATS, drawEvent, datelineFor };
}
