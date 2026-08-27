# Ufologistics — v2 design (as built)

> **This supersedes [`SPIKE.md`](SPIKE.md) and `design/*.md`**, which describe a much larger
> game (nested-zoom globe, five levels, interstellar late game, procedural galaxy). That
> version was too big to build and too big to *play*. This is the version that exists.

**Logline:** you run Earth's secret harvesting operation from a 2D newspaper map of the
United States, 1947 onward. Wire routes, move cargo, and keep the papers from working out
what you are.

---

## What changed from the spike

| Spike | v2 |
|---|---|
| Nested-zoom 3D globe (three.js) | Flat SVG map of the contiguous 48 |
| Whole Earth → solar system → galaxy | USA only |
| 5 campaign levels + sandbox | One run, one sector |
| 5 factions as flavour, 1 playable path | **3 playable races, full alternate rulesets** |
| Exposure + Disclosure two-meter model | Per-state **Suspicion** → global **Disclosure** |
| 24-card incident deck | **102 authored events → 10,888 realisations** |
| Dark sci-fi UI | Newsprint + pixel art, in two editions |
| Tens of hours | **~45–90 minutes a run** |

Three.js, `@react-three/*` and `geist` are gone. Runtime dependencies are `next`, `react`,
`react-dom`. The map geometry is baked into `src/game/usmap.ts` at build time, so nothing is
fetched at runtime and the game works offline once loaded.

---

## Presentation

**Two editions of the same paper**, toggled from the HUD and remembered between
sessions:

- **NIGHT** (default) — the same layout printed in fluorescent inks on black.
  Suspicion is a neon ramp (cyan → acid → amber → magenta), routes and craft glow,
  meters bloom. You run night operations; neon needs somewhere dark.
- **DAY** — the original newsprint. Ink on cheap stock, one spot colour,
  halftone tints.

Every colour is a CSS variable; no component hard-codes one. The edition is set
on `<html>` by a pre-paint boot script and the toggle is pure CSS + DOM, so it
never enters React's hydration path.

## Images

Two sources, each used where it is the right medium:

**Site photographs** — 63 of the 64 sites carry a real photograph from Wikimedia
Commons, reduced at build time to a 224×140 **1-bit Bayer ordered dither**: a
newspaper halftone plate. Tone mapping is adaptive (measure the image's mean and
spread, pull it onto the dither's usable midpoint) because a 1-bit screen has no
range at the ends. Plates ship as black-on-transparent PNGs used as CSS **masks**,
so they take the edition's ink colour instead of being stuck as black. Total
weight: ~200 KB for all 63.

Only **public-domain / CC0** sources are accepted — anything share-alike or
attribution-required is rejected outright, so the baked plates carry no
obligations. Source, author and licence are recorded in `src/game/photos.ts`
and shown under each plate anyway. Roswell, pleasingly, resolves to the actual
1947 *Roswell Daily Record* front page.

**Pixel art** — hand-authored scenes for everything a photograph can't cover:
6 event vignettes (one per tag), 8 craft portraits, site glyphs, the saucer
sprite, and a fallback plate for the one site with no PD photo (Yellowstone).
Authored as character grids in `PixelArt.tsx`, padded at render time so they can
be edited as pictures rather than counted.

## Tutorial

An 11-step guided first run, on by default from the title screen. Steps either
advance on a **predicate over GameState** (`routes.length > 0`, `runs > 0`,
`log has an event`) or wait for a Next tap when they are purely explanatory. It
never blocks input — ignore it entirely and it ticks along behind you, or skip
it outright. Because every milestone is derivable from `GameState`, the tutorial
holds no duplicate state of its own.

---

## The three races

The design rule: each race changes **what you spend your attention on**, not just its numbers.

### Zeta Greys — *volume, triage*
Cheap saucers, up to **9 routes**, sloppy crews. Suspicion runs ×1.35 and every active route can
throw its own incident on any night. You are permanently over-extended and the job is
deciding what to let burn. Harvests ranches and towns. Quota: 2,200 Biomass.

### Pleiadian Nordics — *purity, curation*
**No harvesting at all.** Only 4 routes, and they are tours: you fly paying tourists to
landmarks and anomalies. Payout scales *down* with the suspicion in the destination state, and
above 60 suspicion a site is **spoiled permanently**. Other factions' suspicion spoils your sites too,
so you spend the run cooling messes you did not make. Doing less is frequently correct.
Quota: 1,900 Footage.

### Mantid Directorate — *chains, matching*
A two-hop supply chain wearing a transport game. Towns grow **specimens** with random traits;
they must be flown to a **lab you built and paid for**, processed into sequences, and then
flown *home*. Skip either hop and you earn nothing. Specimens decay if you leave them.
6 routes, each one deliberate. Quota: 55 sequence-grades.

All three interact with every other faction: **Draco** (buyer and threat), **Federation**
(regulator, audits, holds your licence), **MJ-12** (human collaborators on a retainer),
**the Disclosure Movement** (antagonist that grows), and the two races you *didn't* pick,
who show up as patrons and rivals.

---

## Core loop

1. **Wire a route** — tap a source site, tap a legal destination. A craft shuttles it forever.
2. **Tune it** — craft × crew × corridor multiply into yield, speed and suspicion. A loud craft
   flown by a careful crew down a cold corridor is a genuinely different proposition from a
   quiet craft flown fast and direct.
3. **Suspicion accumulates per state** along the corridor, not just at the endpoints. Long routes
   smear suspicion across everything they overfly.
4. **Events fire** every 9–22 nights as a newspaper that stops the clock. Answer or ignore.
5. **Disclosure** is the loss meter. It rises from unanswered events and from any state left
   above 45 suspicion. Hit 100 and your licence is revoked.

Time is **nights**, ~2.4s each at 1×. A run is roughly 150–250 nights.

---

## Events

102 authored definitions across `src/game/events/{sightings,humans,factions,weird}.ts`.
Each carries `{slot}` tokens filled at draw time from `vocab.ts` — 30 witnesses, 30 oddities,
18 officials, 20 papers, 16 creatures, 18 objects. That yields **10,888 distinct realisations**
(`npm run check:deck` prints the live count).

Draws are filtered by race, site kind, disclosure floor and suspicion floor, then weighted so
higher tiers grow more likely as Disclosure climbs — the game gets meaner as you get worse.

Every event is bound to a real site and, 75% of the time, to one of *your* active routes, so
events read as consequences rather than noise.

---

## Balance

Set with `npm run sim`, not by intuition — a bot plays each race across many seeds:

```
25 seeds/race, 400-night cap
race      win  lose  t/o  medNight  avgDisc  avgHeat  medCash  medGoal%
grey       25     0    0       191     58.3      303       91       100
nordic     22     3    0       164     38.6       18      554       100
mantid     25     0    0       149     35.2      139      669       100
```

**Caveat:** the bot is competent and cautious, so it rarely loses. These numbers show the
run *length* is right; they do not prove the difficulty is. That needs human playtesting.
All tuning lives in one place: `TUNE` in `src/game/engine.ts`.

---

## Architecture

```
src/game/          pure, no React — importable by the headless sim
  usmap.ts         GENERATED: 48 state paths, Albers, pre-fit to 1000×620
  photos.ts        GENERATED: plate credits + licences
  tutorial.ts      11 steps, each a predicate over GameState
  geo.ts           point-in-state + which states a corridor overflies
  sites.ts         64 real US locations (real coords, real UFO cases)
  races.ts         the three rulesets
  craft.ts         8 craft × 6 crews × 6 corridors
  events/          102 event defs + slot vocab + realiser
  engine.ts        newGame / tick / chooseOption — a pure reducer over GameState
  rng.ts           seeded PRNG; GameState stores the cursor, so saves resume the stream

src/components/game/   the React layer, all client-side
scripts/               genmap.mjs, genphotos.mjs, sim.ts, check/{sites,deck}.ts
public/plates/         63 baked 1-bit halftone plates (~200 KB total)
```

`GameState` is the entire save file and the engine is `(state, action) => state`, which is
what lets `scripts/sim.ts` play thousands of runs headlessly.

**Seeded worlds:** the same seed reproduces a whole run — starting suspicion distribution,
specimen traits, every event draw and every backfire roll.

---

## Verification

```bash
npm run check   # typecheck + lint + site placement + deck audit
npm run sim     # balance harness
npm run genmap  # regenerate the map from Natural Earth (cached in .cache/)
npm run genphotos  # re-fetch + re-dither the site plates from Commons
```

`check:sites` asserts all 64 sites resolve to the state they claim (they are placed by real
lat/lon and projected, so this catches both bad coordinates and projection regressions).

---

## Known gaps

- Difficulty is bot-verified, not human-verified.
- Mantid trait *matching* is implemented as grade-based value; buyers do not yet demand
  specific trait pairs, so the puzzle is shallower than the pitch.
- `unlocks` exists on `GameState` but only events unlock sites; there is no tech tree.
- The 6 locked military sites open only via the `unlockSite` event effect.
- No audio.
- One site (Yellowstone) has no PD photograph and uses the pixel fallback.
- Plate search is query-driven, so a few photos are only loosely "the place" —
  they read as period newsprint either way, but they are not curated one by one.
