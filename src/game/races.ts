import type { Faction, FactionId, RaceId, SiteKind } from "./types";

// ---------------------------------------------------------------------------
// The three playable races.
//
// The design rule here: each one has to change *what you spend your attention
// on*, not just its numbers. Grey plays a triage queue. Nordic plays a
// preservation game where the correct move is often to do nothing. Mantid plays
// a matching puzzle with two-hop supply chains. Same map, three different games.
// ---------------------------------------------------------------------------

export type Mechanic = "sloppy" | "purity" | "chains";

export type RaceDef = {
  id: RaceId;
  name: string;
  caste: string;
  tagline: string;
  currency: { name: string; symbol: string };
  /** The one-line pitch for the play concept. */
  concept: string;
  /** Rules that actually differ, for the race-select card. */
  rules: string[];
  mechanic: Mechanic;
  color: string;
  ink: string;

  homeId: string;
  startCash: number;
  startDisclosure: number;
  startCraft: string[];
  maxRoutes: number;

  /** Site kinds you may wire as a cargo source. */
  harvestKinds: SiteKind[];
  yieldMul: number;
  noiseMul: number;

  goalTarget: number;
  /** Column heading in the HUD, e.g. "Biomass quota". */
  goalLabel: string;
  /** Verb phrase for prose; {n} is replaced with goalTarget. A heading does
   *  not survive being dropped into a sentence ("hit the footage booked"). */
  goalObjective: string;
  /** Possessive noun phrase, e.g. "your biomass quota". */
  goalShort: string;
  /** Shown on the win screen. */
  winText: string;
};

export const RACES: Record<RaceId, RaceDef> = {
  grey: {
    id: "grey",
    name: "Zeta Greys",
    caste: "Labor tier · subcontractor",
    tagline: "Move the volume. Apologise later.",
    currency: { name: "Biomass", symbol: "⌬" },
    concept:
      "Cheap saucers, sloppy crews, more routes than you can watch. You are permanently over-extended and the job is triage.",
    rules: [
      "Up to 9 routes — the widest network in the game.",
      "Crews are sloppy: every active route can throw its own incident, any night.",
      "Suspicion runs 35% more suspicious. You will be buying silence constantly.",
      "Harvest ranches and small towns. Nobody misses a cow.",
    ],
    mechanic: "sloppy",
    color: "#2f6b46",
    ink: "#14361f",
    homeId: "roswell",
    startCash: 260,
    startDisclosure: 24,
    startCraft: ["scout", "scout", "pill"],
    maxRoutes: 9,
    harvestKinds: ["ranch", "town"],
    yieldMul: 1,
    noiseMul: 1.35,
    goalTarget: 2200,
    goalLabel: "Biomass quota",
    goalObjective: "move {n} units of biomass off this planet",
    goalShort: "biomass quota",
    winText:
      "The Reptilian buyers got their tonnage and nobody important ever printed the word 'saucer' above the fold. You are promoted to Crew Chief. Somewhere, a farmer is still explaining the lights to a bored deputy.",
  },

  nordic: {
    id: "nordic",
    name: "Pleiadian Nordics",
    caste: "Outside the pyramid · charter tourism",
    tagline: "Sell the appeal. Don't scuff it.",
    currency: { name: "Footage", symbol: "◉" },
    concept:
      "You don't harvest anything. You bring paying tourists to look at Earth, and Earth is only worth looking at while it's unspoiled. Doing less is frequently the correct move.",
    rules: [
      "Only 4 routes. They are expensive and they are tours, not freight.",
      "You cannot harvest. Landmarks and anomalies only.",
      "Purity: a tour pays less the more suspicious its state becomes — and above 60 the site is spoiled for good.",
      "Other operators' suspicion spoils your sites too. You will be cleaning up messes you did not make.",
    ],
    mechanic: "purity",
    color: "#8a6a1f",
    ink: "#4a3708",
    homeId: "shasta",
    startCash: 540,
    startDisclosure: 10,
    startCraft: ["liner"],
    maxRoutes: 4,
    harvestKinds: ["landmark", "anomaly"],
    yieldMul: 1.15,
    // Tours are conspicuous on purpose — being seen IS the product — and there
    // are only 4 of them. At the old 0.35 a leg made 0.29 suspicion against a
    // nightly bleed of 0.15 flat, so it was absorbed before it landed: no state
    // ever passed 45, nothing ever reached the spoil line at 60, and the purity
    // mechanic this race is built around could not fire once in 200 nights.
    noiseMul: 3,
    goalTarget: 1900,
    goalLabel: "Footage booked",
    goalObjective: "book {n} hours of tourist footage",
    goalShort: "footage bookings",
    winText:
      "Ten thousand Pleiadian tourists went home with a memory of a blue world that did not know it was being watched, and the gift shop cleared its quota. Licence renewed. Earth remains, technically, a nature documentary.",
  },

  mantid: {
    id: "mantid",
    name: "Mantid Directorate",
    caste: "Director tier · research authority",
    tagline: "Fewer runs. Correct runs.",
    currency: { name: "Sequence", symbol: "⟁" },
    concept:
      "A matching puzzle wearing a transport game. Towns grow specimens with random traits; buyers want specific pairs; nothing is worth anything until it has been through a lab.",
    rules: [
      "Two-hop chains: site → lab → home. A direct run is worth a fraction.",
      "You must build labs yourself, on sites you've already wired.",
      "Specimens spawn with random traits and decay if you leave them.",
      "6 routes. Every one of them should be deliberate.",
    ],
    mechanic: "chains",
    color: "#4a2f6b",
    ink: "#2a1740",
    homeId: "dulce",
    startCash: 400,
    startDisclosure: 16,
    startCraft: ["scout", "triangle"],
    maxRoutes: 6,
    harvestKinds: ["town", "military", "anomaly"],
    yieldMul: 1,
    noiseMul: 0.9,
    goalTarget: 55,
    goalLabel: "Hybrid Program",
    goalObjective: "deliver {n} sequence-grades to the Hybrid Program",
    goalShort: "sequence count",
    winText:
      "Fourteen viable sequences. The Directorate signs off, the hybrid line goes into production, and a generation of people who pass for human start filing into ordinary jobs in ordinary towns. Nobody will ever run a headline about this one.",
  },
};

export const PLAYABLE: RaceId[] = ["grey", "nordic", "mantid"];

// ---------------------------------------------------------------------------
// Everyone with an opinion about you. The two races you didn't pick stay in the
// world as patrons and rivals, so every run touches all of them.
// ---------------------------------------------------------------------------

export const FACTIONS: Record<FactionId, Faction> = {
  grey: {
    id: "grey",
    name: "Zeta Greys",
    short: "Zeta",
    wants: "Tonnage, and for you to stay out of their airspace.",
    playable: true,
  },
  nordic: {
    id: "nordic",
    name: "Pleiadian Nordics",
    short: "Nordic",
    wants: "That you leave the pretty parts alone.",
    playable: true,
  },
  mantid: {
    id: "mantid",
    name: "Mantid Directorate",
    short: "Mantid",
    wants: "Clean specimens and the right to say no.",
    playable: true,
  },
  draco: {
    id: "draco",
    name: "Draco Aristocracy",
    short: "Draco",
    wants: "Volume, now, and a reason to drop the masquerade.",
    playable: false,
  },
  federation: {
    id: "federation",
    name: "Galactic Federation",
    short: "Federation",
    wants: "Compliance. They hold your harvesting licence.",
    playable: false,
  },
  mj12: {
    id: "mj12",
    name: "Majestic 12",
    short: "MJ-12",
    wants: "Technology, deniability, and their retainer paid on time.",
    playable: false,
  },
  movement: {
    id: "movement",
    name: "The Disclosure Movement",
    short: "Movement",
    wants: "To prove you exist. Growing every year.",
    playable: false,
  },
};

/** The run objective as a sentence fragment, with the target filled in. */
export function goalObjective(r: RaceDef): string {
  return r.goalObjective.replace("{n}", r.goalTarget.toLocaleString());
}

/** Standing bands for display. */
export function standingLabel(v: number): string {
  if (v >= 60) return "Patron";
  if (v >= 25) return "Favourable";
  if (v >= -10) return "Neutral";
  if (v >= -45) return "Strained";
  return "Hostile";
}
