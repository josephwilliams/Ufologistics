// Core data model. Deliberately flat and serializable — GameState is the whole
// save file, and the engine is a pure (state, action) -> state reducer over it.

export type StateCode = string;

// ---------------------------------------------------------------------------
// Factions
// ---------------------------------------------------------------------------

/** The three you can play. */
export type RaceId = "grey" | "nordic" | "mantid";

/** Everyone with an opinion about you — includes the two races you didn't pick. */
export type FactionId =
  | "grey"
  | "nordic"
  | "mantid"
  | "draco"
  | "federation"
  | "mj12"
  | "movement";

export type Faction = {
  id: FactionId;
  name: string;
  short: string;
  /** One-line read on what they want from you. */
  wants: string;
  playable: boolean;
};

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export type SiteKind =
  | "base" // your HQ / forward bases
  | "ranch" // cattle, biomass — Grey bread and butter
  | "town" // people — subjects for Grey volume and Mantid specimens
  | "landmark" // wonders — the only thing Nordic tours are worth anything at
  | "military" // high value, high suspicion, will shoot back
  | "city" // press, population, MJ-12 contacts
  | "anomaly"; // the weird ones — gates, lights, thin places

export type Site = {
  id: string;
  name: string;
  /** "Alamosa, CO" — the dateline under a headline. */
  place: string;
  state: StateCode;
  lat: number;
  lon: number;
  kind: SiteKind;
  /** Base harvest value for extractive races. */
  yield: number;
  /** Tour value for Nordic. 0 = nothing worth showing anyone. */
  appeal: number;
  /** Suspicion multiplier for operating here. 1 = ordinary. */
  risk: number;
  /** Real-lore hook, shown in the inspector. */
  note: string;
  /** Needs an unlock before it can be wired. */
  startLocked?: boolean;
  /** Deliberately out at sea — `state` is the sector it answers to. */
  offshore?: boolean;
};

/** Per-run mutable state for a site. */
export type SiteState = {
  id: string;
  /** Depletes as you work it; recovers slowly if left alone. */
  stock: number;
  /** Mantid only — specimens waiting to be collected. */
  specimens: Specimen[];
  /** Mantid only — converted into a processing lab. */
  isLab: boolean;
  /** Mantid only — finished sequences held at a lab, by grade, awaiting shipment. */
  sequences: number[];
  /** Locked sites need an unlock before they can be wired. */
  locked: boolean;
  /** Nordic only — a site that has been spoiled pays nothing. */
  spoiled: boolean;
};

// ---------------------------------------------------------------------------
// Mantid specimens — the matching puzzle
// ---------------------------------------------------------------------------

export type TraitId = string;

export type Specimen = {
  id: string;
  /** Two traits; buyers demand combinations. */
  traits: [TraitId, TraitId];
  /** 1-3. Higher grade = worth more, harder to source. */
  grade: number;
  /** Night it appeared — they decay. */
  born: number;
};

// ---------------------------------------------------------------------------
// Craft, crew, corridors
// ---------------------------------------------------------------------------

export type CraftDef = {
  id: string;
  name: string;
  /** Which races can field it. */
  races: RaceId[];
  cost: number;
  /** Cargo delivered per completed run. */
  capacity: number;
  /** viewBox units per night. */
  speed: number;
  /** Suspicion added per leg, before crew/corridor multipliers. */
  noise: number;
  upkeep: number;
  blurb: string;
};

export type CrewDef = {
  id: string;
  name: string;
  races: RaceId[];
  /** Multiplier on cargo. */
  yieldMul: number;
  /** Multiplier on suspicion. */
  noiseMul: number;
  upkeep: number;
  blurb: string;
};

export type CorridorDef = {
  id: string;
  name: string;
  /** Multiplier on effective distance (longer = slower but often cooler). */
  lengthMul: number;
  noiseMul: number;
  blurb: string;
};

/** A craft you own. */
export type Craft = {
  id: string;
  defId: string;
  /** null = in the hangar. */
  routeId: string | null;
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export type Route = {
  id: string;
  /** Where the cargo comes from. */
  fromId: string;
  /** Where it goes — your base, or a lab for Mantid first-hop. */
  toId: string;
  craftId: string;
  crewId: string;
  corridorId: string;
  /** 0..1 along the current leg. */
  progress: number;
  /** true = heading toward `toId`. */
  outbound: boolean;
  /** Screen-space length in viewBox units, after corridor multiplier. */
  distance: number;
  /** States the corridor passes over — these take the suspicion. */
  crosses: StateCode[];
  /** Runs completed, for the inspector. */
  runs: number;
  /** Paused routes cost upkeep but generate nothing and no suspicion. */
  paused: boolean;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventTier = 1 | 2 | 3 | 4;

export type EventTag =
  | "sighting"
  | "human"
  | "faction"
  | "weird"
  | "boon"
  | "crisis";

/** Declarative outcome. Every field is optional and additive. */
export type Effect = {
  cash?: number;
  standing?: number;
  disclosure?: number;
  /** Suspicion delta on the event's focus state. */
  suspicion?: number;
  /** Suspicion delta on every state at once. */
  suspicionAll?: number;
  /** Faction standing deltas. */
  faction?: Partial<Record<FactionId, number>>;
  /** Destroy the craft on the focus route. */
  loseCraft?: boolean;
  /** Tear down the focus route. */
  loseRoute?: boolean;
  /** Grant a craft by def id. */
  grantCraft?: string;
  /** Spoil the focus site (Nordic: it stops paying). */
  spoilSite?: boolean;
  /** Unlock a locked site by id, or "random" for any locked one. */
  unlockSite?: string;
  /** Add specimens at the focus site (Mantid). */
  spawnSpecimens?: number;
  /** Flat progress toward the run goal. */
  goal?: number;
};

export type EventChoice = {
  label: string;
  /** Shown greyed with the requirement if unaffordable. */
  cost?: { cash?: number; standing?: number };
  /** Applied immediately on pick. */
  effect: Effect;
  /** Chance the choice goes wrong instead. */
  backfire?: { chance: number; effect: Effect; note: string };
  /** Result line printed in the ledger. */
  note: string;
};

/** Template with {slot} tokens filled from the vocab pools at realize time. */
export type EventDef = {
  id: string;
  tier: EventTier;
  tags: EventTag[];
  /** Relative draw weight. */
  weight: number;
  /** Restrict to races that should see this. Omit = all. */
  races?: RaceId[];
  /** Only draw when the focus site is one of these kinds. */
  kinds?: SiteKind[];
  /** Minimum global disclosure before this can be drawn. */
  minDisclosure?: number;
  /** Minimum suspicion on the focus state. */
  minHeat?: number;
  /** Requires at least one active route. */
  needsRoute?: boolean;
  headline: string;
  dek: string;
  choices: EventChoice[];
};

/** An EventDef with its slots filled and its target bound. */
export type RealizedEvent = {
  defId: string;
  tier: EventTier;
  tags: EventTag[];
  headline: string;
  dek: string;
  dateline: string;
  paper: string;
  choices: EventChoice[];
  focusSiteId: string | null;
  focusStateCode: StateCode | null;
  focusRouteId: string | null;
  night: number;
};

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export type Phase = "menu" | "playing" | "won" | "lost";

export type LogEntry = {
  night: number;
  text: string;
  /** "dispatch" is a minor item that settled itself without stopping the clock. */
  kind: "run" | "event" | "system" | "money" | "dispatch";
};

export type GameState = {
  seed: number;
  rngCursor: number;
  phase: Phase;
  race: RaceId;
  night: number;

  cash: number;
  standing: number;
  disclosure: number;
  /** Progress toward the race's win condition. */
  goal: number;
  goalTarget: number;

  suspicion: Record<StateCode, number>;
  factions: Record<FactionId, number>;

  sites: Record<string, SiteState>;
  fleet: Craft[];
  routes: Route[];
  unlocks: string[];

  /** Blocking newspaper on screen; the clock stops while it's up. */
  pending: RealizedEvent | null;
  log: LogEntry[];

  /** Nights until the next event roll is allowed — stops event spam. */
  eventCooldown: number;
  /** Ids of the most recent draws, so the deck does not repeat itself. */
  recentEvents: string[];
  /** Why the run ended. */
  ending: string | null;
};
