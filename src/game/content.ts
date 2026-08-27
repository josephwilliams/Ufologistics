// Content registry.
//
// The engine is edition-agnostic: every rule in engine.ts is the same for the
// US and Gran Colombia editions, and only the data underneath differs. Rather
// than fork the engine, each edition registers a pack here and the engine
// resolves it from GameState.edition — so the reducer stays pure and the
// balance sim can play either edition through exactly the same code path.

import type { Edition, GameState, RaceId, Site } from "./types";
import type { RaceDef } from "./races";
import type { CorridorDef, CraftDef, CrewDef } from "./types";
import type { Rng } from "./rng";
import type { RealizedEvent } from "./types";

import { SITES as US_SITES, SITE_BY_ID as US_SITE_BY_ID, siteXY as usSiteXY } from "./sites";
import { STATES as US_STATES, MAP_W as US_W, MAP_H as US_H, project as usProject } from "./usmap";
import { RACES as US_RACES } from "./races";
import * as usCraft from "./craft";
import { drawEvent as usDraw, datelineFor as usDateline, DECK_STATS as US_DECK } from "./events";

import { SITES as GC_SITES, SITE_BY_ID as GC_SITE_BY_ID, siteXY as gcSiteXY } from "./gc/sites";
import { STATES as GC_STATES, MAP_W as GC_W, MAP_H as GC_H, project as gcProject } from "./gc/map";
import { RACES as GC_RACES } from "./gc/races";
import * as gcCraft from "./gc/craft";
import { drawEvent as gcDraw, datelineFor as gcDateline, DECK_STATS as GC_DECK } from "./gc/events";

export type { Edition };

export type ContentPack = {
  id: Edition;
  sites: Site[];
  siteById: Record<string, Site>;
  siteXY: (id: string) => [number, number];
  states: { code: string; name: string }[];
  mapW: number;
  mapH: number;
  project: (lon: number, lat: number) => [number, number];
  races: Record<RaceId, RaceDef>;
  craft: CraftDef[];
  crews: CrewDef[];
  corridors: CorridorDef[];
  craftById: Record<string, CraftDef>;
  crewById: Record<string, CrewDef>;
  corridorById: Record<string, CorridorDef>;
  craftFor: (race: string) => CraftDef[];
  crewsFor: (race: string) => CrewDef[];
  drawEvent: (s: GameState, rng: Rng) => RealizedEvent | null;
  datelineFor: (night: number) => string;
  deckStats: { defs: number; byTag: Record<string, number>; variants: number };
  /**
   * Every string the engine itself emits. The rules are shared; the words are
   * not, so they travel with the pack rather than being baked into engine.ts.
   */
  text: EngineText;
};

export type EngineText = {
  err: {
    unknownSite: string;
    sameEnds: string;
    tooManyRoutes: (race: string, max: number) => string;
    locked: (site: string) => string;
    spoiled: (site: string) => string;
    wrongKind: (race: string) => string;
    noCraft: string;
    craftBusy: string;
    mantidDest: (home: string) => string;
    mustDeliverTo: (home: string) => string;
    alreadyWired: string;
  };
  log: {
    stoodDown: (from: string, to: string) => string;
    spoiledTour: (site: string) => string;
    sloppy: (site: string) => string;
    sequences: (n: number, grades: number, home: string) => string;
    unanswered: (headline: string) => string;
    opened: (dateline: string, race: string, home: string) => string;
  };
  end: { disclosed: string; insolvent: string };
};

const US_TEXT: EngineText = {
  err: {
    unknownSite: "Unknown site.",
    sameEnds: "A route needs two different ends.",
    tooManyRoutes: (race, max) => `${race} may run only ${max} routes.`,
    locked: (site) => `${site} is not open to you yet.`,
    spoiled: (site) => `${site} is spoiled.`,
    wrongKind: (race) => `${race} cannot work a site of that kind.`,
    noCraft: "No such craft.",
    craftBusy: "That craft is already assigned.",
    mantidDest: (home) => `Mantid cargo must go to a lab or to ${home}.`,
    mustDeliverTo: (home) => `Deliveries must go to ${home}.`,
    alreadyWired: "That leg is already wired.",
  },
  log: {
    stoodDown: (from, to) => `Stood down ${from} → ${to}.`,
    spoiledTour: (site) => `${site} is spoiled — the tours are worthless now.`,
    sloppy: (site) =>
      `Sloppy handling on the ${site} run — a witness, a photograph, a small item in the paper.`,
    sequences: (n, grades, home) =>
      `${n} sequence${n > 1 ? "s" : ""} delivered to ${home} (+${grades} to the programme).`,
    unanswered: (h) => `${h} — nothing you could afford would have helped. It runs.`,
    opened: (dateline, race, home) => `${dateline} — ${race} operation opens at ${home}.`,
  },
  end: {
    disclosed:
      "Public disclosure. Your licence is revoked, the assets are seized, and Earth goes to auction. You are the reason there is now a word for what you were.",
    insolvent:
      "Insolvent. The Federation calls in your licence against your debts and a rival takes over the sector by the end of the quarter.",
  },
};

const GC_TEXT: EngineText = {
  err: {
    unknownSite: "Sitio desconocido.",
    sameEnds: "Una ruta necesita dos extremos distintos.",
    tooManyRoutes: (race, max) => `${race} sólo puede operar ${max} rutas.`,
    locked: (site) => `${site} todavía no está abierto para usted.`,
    spoiled: (site) => `${site} está arruinado.`,
    wrongKind: (race) => `${race} no puede trabajar un sitio de ese tipo.`,
    noCraft: "No existe esa nave.",
    craftBusy: "Esa nave ya está asignada.",
    mantidDest: (home) => `La carga mántida debe ir a un laboratorio o a ${home}.`,
    mustDeliverTo: (home) => `Las entregas deben ir a ${home}.`,
    alreadyWired: "Ese tramo ya está conectado.",
  },
  log: {
    stoodDown: (from, to) => `Suspendida ${from} → ${to}.`,
    spoiledTour: (site) => `${site} queda arruinado: las excursiones ya no valen nada.`,
    sloppy: (site) =>
      `Descuido en el trayecto de ${site}: un testigo, una fotografía y una nota breve en el periódico.`,
    sequences: (n, grades, home) =>
      `${n} secuencia${n > 1 ? "s" : ""} entregada${n > 1 ? "s" : ""} en ${home} (+${grades} al programa).`,
    unanswered: (h) => `${h} — nada de lo que podía pagar habría servido. Se publica.`,
    opened: (dateline, race, home) => `${dateline} — ${race} abre operación en ${home}.`,
  },
  end: {
    disclosed:
      "Divulgación pública. Le revocan la licencia, incautan los activos y la Tierra sale a subasta. Usted es la razón por la que ahora existe una palabra para lo que era.",
    insolvent:
      "Insolvente. La Federación ejecuta su licencia contra las deudas y un rival se queda con el sector antes de que acabe el trimestre.",
  },
};

export const CONTENT: Record<Edition, ContentPack> = {
  us: {
    id: "us",
    sites: US_SITES, siteById: US_SITE_BY_ID, siteXY: usSiteXY,
    states: US_STATES, mapW: US_W, mapH: US_H, project: usProject,
    races: US_RACES,
    craft: usCraft.CRAFT, crews: usCraft.CREWS, corridors: usCraft.CORRIDORS,
    craftById: usCraft.CRAFT_BY_ID, crewById: usCraft.CREW_BY_ID, corridorById: usCraft.CORRIDOR_BY_ID,
    craftFor: usCraft.craftFor, crewsFor: usCraft.crewsFor,
    drawEvent: usDraw, datelineFor: usDateline, deckStats: US_DECK, text: US_TEXT,
  },
  gc: {
    id: "gc",
    sites: GC_SITES, siteById: GC_SITE_BY_ID, siteXY: gcSiteXY,
    states: GC_STATES, mapW: GC_W, mapH: GC_H, project: gcProject,
    races: GC_RACES,
    craft: gcCraft.CRAFT, crews: gcCraft.CREWS, corridors: gcCraft.CORRIDORS,
    craftById: gcCraft.CRAFT_BY_ID, crewById: gcCraft.CREW_BY_ID, corridorById: gcCraft.CORRIDOR_BY_ID,
    craftFor: gcCraft.craftFor, crewsFor: gcCraft.crewsFor,
    drawEvent: gcDraw, datelineFor: gcDateline, deckStats: GC_DECK, text: GC_TEXT,
  },
};

/** The pack a given run is played with. */
export function contentOf(s: { edition?: Edition }): ContentPack {
  return CONTENT[s.edition ?? "us"];
}
