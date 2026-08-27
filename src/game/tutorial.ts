import type { GameState } from "./types";
import { RACES, goalObjective } from "./races";
import { SITE_BY_ID } from "./sites";

// A coached first run. Steps either advance on their own when the player does
// the thing (`done`), or wait for a Next tap when they are purely explanatory.
// The predicate approach means the tutorial never blocks the game — you can
// ignore it entirely and it will just tick along behind you.

export type TutorialCtx = {
  state: GameState;
  selectedId: string | null;
  /** Site the wiring flow is currently anchored to. */
  linkFrom: string | null;
  /** Deliveries banked since the tutorial started. */
  everDelivered: boolean;
  /** Has any event been answered. */
  everAnsweredEvent: boolean;
  /** Has any route had its crew or corridor changed from the default. */
  everTunedRoute: boolean;
};

export type TutorialStep = {
  id: string;
  /** A few titles vary by race, so this may be a function. */
  title: string | ((c: TutorialCtx) => string);
  body: (c: TutorialCtx) => string;
  /** Auto-advance when this becomes true. Omit for a Next-button step. */
  done?: (c: TutorialCtx) => boolean;
  /** Nudge the player to a tab before showing this. */
  tab?: "map" | "routes" | "hangar" | "world";
  /** Show the pointer on the speed controls. */
  highlight?: "speed" | "map" | "routes" | "meters";
};

const KIND_PLURAL: Record<string, string> = {
  ranch: "ranches",
  town: "small towns",
  landmark: "landmarks",
  military: "military sites",
  city: "cities",
  anomaly: "anomalies",
  base: "bases",
};

export const TUTORIAL: TutorialStep[] = [
  {
    id: "welcome",
    title: "You are the new operator",
    body: (c) => {
      const race = RACES[c.state.race];
      const disc = Math.round(c.state.disclosure);
      const inherited =
        c.state.race === "grey"
          ? `Your predecessor put a craft into a sheep pasture at Roswell and the cover story only just held. You inherit his mess — that is why Disclosure already reads ${disc}%.`
          : `Somebody else put a craft into a sheep pasture at Roswell last month. Not your operation, but the whole planet is watching the sky now, and Disclosure already reads ${disc}%.`;
      return `${inherited} Your job is to ${goalObjective(race)} before the papers work out what you are.`;
    },
    highlight: "meters",
  },
  {
    id: "read-meters",
    title: "Three words decide the run",
    body: () =>
      "Three words, one chain. Your craft make NOISE. Noise builds SUSPICION in each state it passes over. Suspicion feeds DISCLOSURE, the loss meter — at 100% your licence is revoked and the run is over. Suspicion cools on its own if you leave a place alone; Disclosure does not.",
    highlight: "meters",
  },
  {
    id: "pick-site",
    title: "Pick somewhere to work",
    body: (c) => {
      const names = RACES[c.state.race].harvestKinds.map((k) => KIND_PLURAL[k] ?? k);
      const kinds =
        names.length > 1
          ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
          : names[0];
      return `Tap a site on the map. You can work ${kinds}. Tapping one shows what it pays, how risky it is, and the real case behind it.`;
    },
    done: (c) => !!c.selectedId && c.selectedId !== RACES[c.state.race].homeId,
    tab: "map",
    highlight: "map",
  },
  {
    id: "start-wiring",
    title: "Wire it up",
    body: () =>
      "In the panel under the map, hit “Wire a route from here”. Legal destinations will light up on the map — tap one to finish the route.",
    done: (c) => !!c.linkFrom || c.state.routes.length > 0,
    tab: "map",
    highlight: "map",
  },
  {
    id: "finish-wiring",
    title: "Now tap the lit destination",
    body: (c) =>
      c.state.race === "mantid"
        ? "Mantid cargo has to reach a lab, or Dulce Substation itself. Only those will light up."
        : `${
            c.state.race === "nordic" ? "Every tour returns to" : "Everything you lift goes home to"
          } ${SITE_BY_ID[RACES[c.state.race].homeId].name}. It is the only lit site.`,
    done: (c) => c.state.routes.length > 0,
    tab: "map",
    highlight: "map",
  },
  {
    id: "run-clock",
    title: "Start the clock",
    body: () =>
      "The craft shuttles that route forever without further instruction. Hit ▶ at the top right to let the nights run — and Space, or ❚❚, to stop them.",
    done: (c) => c.state.night > 2,
    highlight: "speed",
  },
  {
    id: "first-delivery",
    title: (c) => (c.state.race === "nordic" ? "The tour pays when it lands" : "Cargo pays on arrival"),
    body: (c) =>
      `Watch it cross the map. ${
        c.state.race === "nordic"
          ? "The charter pays out once the guests are home"
          : "It pays out when it reaches the far end"
      }, and that is what moves your ${
        RACES[c.state.race].goalShort
      }. Every leg it flies also raises suspicion in every state it crosses.`,
    done: (c) => c.everDelivered,
    highlight: "map",
  },
  {
    id: "suspicion",
    title: "Suspicion is drawn on the map",
    body: () =>
      "The coloured dot screen over each state is how suspicious it is — cyan is calm, magenta is about to become your problem. Long routes smear suspicion across every state they overfly, which is why a short ugly route often beats a long pretty one.",
    highlight: "map",
  },
  {
    id: "tune",
    title: "Every route has three dials",
    body: () =>
      "Open ROUTES. Every route has a craft, a crew and a corridor, and all three trade cargo against noise. Direct is the fastest corridor and the loudest; Strict Night Ops is the quietest in the game and wastes most of the day waiting.",
    done: (c) => c.everTunedRoute,
    tab: "routes",
    highlight: "routes",
  },
  {
    id: "event",
    title: "The papers will notice",
    body: () =>
      "Every so often a newspaper stops the clock and asks you something. Read these carefully: buying a story off is the ONLY thing in the game that pushes Disclosure back down. Everything else only adds to it. Ignoring the cheap option every time is how most runs are lost.",
    done: (c) => c.everAnsweredEvent,
  },
  {
    id: "done",
    title: "That is the whole game",
    body: (c) =>
      `Wire routes, keep the map calm, buy off the press, and ${goalObjective(
        RACES[c.state.race],
      )} before Disclosure reaches 100%. Everything else is detail you can read off the cards. Good luck — try not to be the next Roswell.`,
  },
];

