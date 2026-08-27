import type { CorridorDef, CraftDef, CrewDef } from "./types";

// ---------------------------------------------------------------------------
// A route is craft × crew × corridor. The three multiply, so the interesting
// builds are the ones that trade on different axes: a loud craft flown by a
// careful crew down a cold corridor is a genuinely different proposition from
// a quiet craft flown fast and direct.
// ---------------------------------------------------------------------------

export const CRAFT: CraftDef[] = [
  {
    id: "pill",
    name: "Foo Fighter",
    races: ["grey", "nordic", "mantid"],
    cost: 90,
    capacity: 5,
    speed: 62,
    noise: 0.7,
    upkeep: 2,
    blurb: "A glowing pill the size of a barrel. Fast, nearly free, barely carries anything.",
  },
  {
    id: "scout",
    name: "Scout Saucer",
    races: ["grey", "mantid"],
    cost: 165,
    capacity: 12,
    speed: 44,
    noise: 1,
    upkeep: 5,
    blurb: "The boxcar of the fleet. Everything the popular imagination thinks a saucer is.",
  },
  {
    id: "vessel",
    name: "Sample Vessel",
    races: ["mantid"],
    cost: 310,
    capacity: 14,
    speed: 40,
    noise: 0.75,
    upkeep: 8,
    blurb: "Refrigerated bays and a very quiet drive. Built to keep specimens viable, not to hurry.",
  },
  {
    id: "triangle",
    name: "Black Triangle",
    races: ["grey", "nordic", "mantid"],
    cost: 345,
    capacity: 26,
    speed: 30,
    noise: 0.55,
    upkeep: 11,
    blurb:
      "Heavy lift, slow, and low exposure for the best possible reason: witnesses assume it is one of theirs.",
  },
  {
    id: "lantern",
    name: "Lantern Barge",
    races: ["nordic"],
    cost: 235,
    capacity: 16,
    speed: 36,
    noise: 0.5,
    upkeep: 7,
    blurb: "A small charter hull with an observation floor. Quiet, warm, and slower than the brochure claims.",
  },
  {
    id: "cigar",
    name: "Cigar Cruiser",
    races: ["grey", "mantid"],
    cost: 430,
    capacity: 34,
    speed: 34,
    noise: 1.3,
    upkeep: 14,
    blurb: "Long-haul freight. Two hundred feet of unmistakable silhouette, so fly it where nobody looks up.",
  },
  {
    id: "liner",
    name: "Charter Liner",
    races: ["nordic"],
    cost: 495,
    capacity: 30,
    speed: 32,
    noise: 0.4,
    upkeep: 16,
    blurb:
      "Observation decks, a comfort rating, and a hull finish that reads as cloud from below. The Nordic workhorse.",
  },
  {
    id: "harvester",
    name: "Heavy Harvester",
    races: ["grey"],
    cost: 580,
    capacity: 48,
    speed: 24,
    noise: 2,
    upkeep: 21,
    blurb:
      "Reptilian Heavy Works. Maximum tonnage, maximum noise, and no pretence whatsoever about the masquerade.",
  },
];

export const CRAFT_BY_ID: Record<string, CraftDef> = Object.fromEntries(
  CRAFT.map((c) => [c.id, c]),
);

export const CREWS: CrewDef[] = [
  {
    id: "auto",
    name: "Unmanned",
    races: ["grey", "nordic", "mantid"],
    yieldMul: 0.75,
    noiseMul: 0.7,
    upkeep: 0,
    blurb: "Nobody aboard. Cheap and quiet, and it fumbles a quarter of the load.",
  },
  {
    id: "drone",
    name: "Grey Drones",
    races: ["grey", "mantid"],
    yieldMul: 1,
    noiseMul: 1.3,
    upkeep: 3,
    blurb: "Short Greys, four to a hull. Tireless, obedient, and the reason blurry photographs exist.",
  },
  {
    id: "tall",
    name: "Tall Grey Supervisor",
    races: ["grey", "mantid"],
    yieldMul: 1.15,
    noiseMul: 0.78,
    upkeep: 7,
    blurb: "One manager riding along. Measurably fewer incidents, measurably more paperwork.",
  },
  {
    id: "attendants",
    name: "Nordic Attendants",
    races: ["nordic"],
    yieldMul: 1.3,
    noiseMul: 0.55,
    upkeep: 9,
    blurb: "Tall, courteous, and unnervingly photogenic. Guests rate the tour higher when they are aboard.",
  },
  {
    id: "mantidsci",
    name: "Mantid Aboard",
    races: ["mantid", "grey"],
    yieldMul: 1.5,
    noiseMul: 0.85,
    upkeep: 14,
    blurb:
      "Required to certify premium output. Scarce, expensive, and it will report on you as readily as for you.",
  },
  {
    id: "hybrid",
    name: "Hybrid Crew",
    races: ["grey", "nordic", "mantid"],
    yieldMul: 1.2,
    noiseMul: 0.42,
    upkeep: 11,
    blurb: "They pass. If one is seen on the ground, the witness reports a person, and no file is opened.",
  },
];

export const CREW_BY_ID: Record<string, CrewDef> = Object.fromEntries(
  CREWS.map((c) => [c.id, c]),
);

export const CORRIDORS: CorridorDef[] = [
  {
    id: "direct",
    name: "Direct",
    lengthMul: 1,
    noiseMul: 1,
    blurb: "Straight there. Fastest turnaround, and everyone underneath gets a clear look.",
  },
  {
    id: "highalt",
    name: "High Altitude",
    lengthMul: 1.15,
    noiseMul: 0.74,
    blurb: "Above the weather. Reads as a star to the naked eye, and as a problem to radar.",
  },
  {
    id: "nap",
    name: "Nap-of-the-Earth",
    lengthMul: 1.32,
    noiseMul: 0.56,
    blurb: "Down in the terrain, under the radar horizon. Slow, and the occasional motorist gets a story.",
  },
  {
    id: "coastal",
    name: "Coastal Run",
    lengthMul: 1.48,
    noiseMul: 0.44,
    blurb: "Out over water wherever possible. A long way round and almost nobody to see it.",
  },
  {
    id: "night",
    name: "Strict Night Ops",
    lengthMul: 1.72,
    noiseMul: 0.32,
    blurb: "Move only in full dark. Coldest corridor available and it wastes most of the day waiting.",
  },
  {
    id: "vortex",
    name: "Vortex Transit",
    lengthMul: 0.58,
    noiseMul: 1.25,
    blurb:
      "Cut through the thin places. Half the transit time, and the arrival is not always in the expected condition.",
  },
];

export const CORRIDOR_BY_ID: Record<string, CorridorDef> = Object.fromEntries(
  CORRIDORS.map((c) => [c.id, c]),
);

/** Craft a race is allowed to buy. */
export function craftFor(race: string): CraftDef[] {
  return CRAFT.filter((c) => (c.races as string[]).includes(race));
}

export function crewsFor(race: string): CrewDef[] {
  return CREWS.filter((c) => (c.races as string[]).includes(race));
}
