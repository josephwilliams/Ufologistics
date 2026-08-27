// Sanity check: every authored site must resolve to the state it claims.
// The engine resolves a point via `stateAt() ?? nearestState()`, so that is
// what gets asserted here. Sites flagged `offshore` are expected to be at sea;
// they only have to answer to the right state.
import { SITES, siteXY } from "../../src/game/sites";
import { stateAt, nearestState } from "../../src/game/geo";

let bad = 0;
let atSea = 0;

for (const s of SITES) {
  const [x, y] = siteXY(s.id);
  const exact = stateAt(x, y);
  const effective = exact ?? nearestState(x, y);

  if (!exact) {
    atSea++;
    if (!s.offshore) {
      console.log(
        `  at sea (unflagged): ${s.id.padEnd(16)} renders offshore, answers to ${effective}`,
      );
    }
  }

  if (effective !== s.state) {
    bad++;
    console.log(
      `MISMATCH ${s.id.padEnd(16)} declared=${s.state} effective=${effective} (${x.toFixed(0)},${y.toFixed(0)})`,
    );
  }
}

console.log(`--- ${SITES.length} sites, ${bad} mismatched, ${atSea} offshore`);
if (bad) process.exit(1);
