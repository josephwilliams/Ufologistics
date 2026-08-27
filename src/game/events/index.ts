// US edition deck. All the draw logic lives in ../deck.ts and is shared with
// the Gran Colombia edition; this file only supplies the content and calendar.

import type { EventDef } from "../types";
import { makeDeck } from "../deck";
import { SITES, SITE_BY_ID } from "../sites";
import { STATES } from "../usmap";
import { VOCAB } from "./vocab";
import { SIGHTINGS } from "./sightings";
import { HUMANS } from "./humans";
import { FACTIONS_EVENTS } from "./factions";
import { WEIRD } from "./weird";

export const DECK: EventDef[] = [...SIGHTINGS, ...HUMANS, ...FACTIONS_EVENTS, ...WEIRD];

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const deck = makeDeck({
  defs: DECK,
  vocab: VOCAB,
  sites: SITES,
  siteById: SITE_BY_ID,
  stateName: Object.fromEntries(STATES.map((s) => [s.code, s.name])),
  months: MONTHS,
  epoch: { year: 1947, month: 6, day: 8 },
  fallback: { site: "the site", place: "the sector", state: "the state" },
  formatDate: (m, d) => `${m[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
});

export const DECK_STATS = deck.DECK_STATS;
export const drawEvent = deck.drawEvent;
export const datelineFor = deck.datelineFor;
