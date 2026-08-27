# Route Customization — Craft × Crew × Corridor

A route's final stats are the **product of three layers**. Pick one of each; multiply.

```
final yield    = base × craft.yield    × crew.yield    × corridor.yield
final exposure = base × craft.exposure  × crew.exposure  × corridor.exposure
final speed    = base × craft.speed    × crew.speed    × corridor.speed
upkeep         = craft.upkeep + crew.upkeep + corridor.upkeep   (additive drain)
```

Three readable knobs, ~640 combinations. The skill is finding the combo that fits the contract:
a high-exposure Reptilian quota wants Black Triangle + MiB Liaison + Night Run; a Nordic cruise
wants Nordic Liner + Concierge + Coastal Hug.

## Craft (8)

| Craft | Yield | Exposure | Speed | Upkeep | Era | Flavor |
|---|---|---|---|---|---|---|
| **Scout Pill** | ×0.4 | ×0.5 | ×1.6 | 1 | 1947 | Foo-fighter recon. Barely a blip on anyone's scope. |
| **Disc Mk-I** | ×1.0 | ×1.0 | ×1.0 | 2 | 1947 | The classic saucer. Jack of all trades, master of none. |
| **Livestock Saucer** | ×1.6 | ×1.3 | ×0.8 | 3 | 1950 | A flying corral. Slow, fat, and conspicuous. |
| **Medical Saucer** | ×1.1 | ×1.1 | ×0.9 | 3 | 1952 | Padded bay for delicate cargo. *(req. Mantid)* |
| **Black Triangle** | ×1.8 | ×0.7 | ×0.7 | 5 | 1958 | They think it's the Air Force. Let them. |
| **Cigar Cruiser** | ×1.4 | ×1.0 | ×1.3 | 4 | 1955 | The freight train of the sky — built for the long ocean legs. |
| **Tic-Tac** | ×0.7 | ×0.6 | ×1.8 | 4 | 1962 | Outruns the witness and the radar both. |
| **Nordic Liner** | ×1.5 | ×0.8 | ×0.6 | 6 | 1960 | Observation decks for paying gawkers. *(Nordic)* |

## Crew packages (8)

| Crew | Yield | Exposure | Speed | Upkeep | Era | Flavor |
|---|---|---|---|---|---|---|
| **Grey Drones** | ×1.0 | ×1.25 | ×1.0 | 0.5 | 1947 | Expendable. They don't ask questions — or think. |
| **Grey Pair** | ×1.0 | ×1.0 | ×1.0 | 1 | 1947 | Two grays, one saucer. The default. |
| **Tall Grey Supervisor** | ×1.1 | ×0.8 | ×1.0 | 2 | 1950 | Adult supervision. Fewer blurry photos. |
| **Mantid Director** | ×1.3 | ×0.9 | ×0.9 | 4 | 1952 | Scarce, revered, unsettling. *(gates genome/soul cargo)* |
| **Hybrid Crew** | ×1.0 | ×0.5 | ×1.0 | 3 | 1958 | Look inside and you see a pilot. A human one. |
| **Nordic Concierge** | ×1.4 | ×0.85 | ×0.9 | 4 | 1960 | Five-star service for the discerning visitor. *(Nordic)* |
| **Reptilian Overseer** | ×1.5 | ×1.4 | ×1.1 | 3 | 1955 | Quota is quota. Caution is for the weak. *(Reptilian)* |
| **MiB Liaison** | ×0.9 | ×0.6 | ×1.0 | 3 | 1950 | A man in a black suit rides along to clean up. |

## Corridor doctrines (10)

| Corridor | Yield | Exposure | Speed | Upkeep | Era | Flavor |
|---|---|---|---|---|---|---|
| **Direct Line** | ×1.0 | ×1.2 | ×1.3 | 1 | 1947 | Shortest path. Also the most witnesses. |
| **Night Run** | ×1.0 | ×0.7 | ×0.9 | 1 | 1947 | Owls and operators. |
| **Coastal Hug** | ×1.0 | ×0.85 | ×1.0 | 1 | 1947 | Few witnesses live on the waves. |
| **High-Altitude** | ×1.0 | ×0.8 | ×1.1 | 2 | 1950 | Too high to paint — for now. |
| **Nap-of-Earth** | ×1.0 | ×0.75 | ×0.8 | 2 | 1955 | Skim the canyons; vanish in the clutter. |
| **Desert Dogleg** | ×0.95 | ×0.6 | ×0.85 | 1 | 1947 | Longer, lonelier, safer. |
| **Storm-Mask** | ×1.0 | ×0.55 | ×0.8 | 3 | 1958 | Hide your signature in the thunder. |
| **Test-Window Shadow** | ×1.0 | ×0.4 | ×1.0 | 2 | 1951 | The flash hides everything. So does the fallout. |
| **Vortex Skip** | ×1.1 | ×0.5 | ×1.6 | 4 | 1947 | Fast, quiet — and occasionally you arrive in 1692. *(loss risk)* |
| **Decoy Screen** | ×0.9 | ×0.5 | ×1.0 | 4 | 1960 | Give them ten saucers to chase. None are yours. |

## Worked example

`Disc Mk-I (1.0/1.0/1.0) × Tall Grey (1.1/0.8/1.0) × Night Run (1.0/0.7/0.9)`
→ **yield ×1.10 · exposure ×0.56 · speed ×0.90 · upkeep 5.** A clean, cheap, slightly-slow earner.

`Black Triangle (1.8/0.7/0.7) × Reptilian Overseer (1.5/1.4/1.1) × Test-Window Shadow (1.0/0.4/1.0)`
→ **yield ×2.70 · exposure ×0.39 · speed ×0.77 · upkeep 10.** A monster hauler that hides in the
nuclear flash — expensive, and you'd better not miss the test window.
