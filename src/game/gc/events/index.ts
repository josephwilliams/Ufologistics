// Edición Gran Colombia: sólo aporta contenido y calendario. Toda la lógica de
// sorteo vive en ../../deck.ts y es la misma que usa la edición de EE. UU.

import { makeDeck } from "../../deck";
import { SITES, SITE_BY_ID } from "../sites";
import { STATES } from "../map";
import { VOCAB } from "./vocab";
import { DECK_GC } from "./deck";

const MESES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

const deck = makeDeck({
  defs: DECK_GC,
  vocab: VOCAB,
  sites: SITES,
  siteById: SITE_BY_ID,
  stateName: Object.fromEntries(STATES.map((s) => [s.code, s.name])),
  months: MESES,
  // La oleada venezolana de 1954 es el punto de partida del expediente.
  epoch: { year: 1954, month: 10, day: 28 },
  fallback: { site: "el sitio", place: "el sector", state: "el estado" },
  // En español la fecha va «28 NOV 1954», sin coma.
  formatDate: (m, d) => `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
});

export const DECK = DECK_GC;
export const DECK_STATS = deck.DECK_STATS;
export const drawEvent = deck.drawEvent;
export const datelineFor = deck.datelineFor;
