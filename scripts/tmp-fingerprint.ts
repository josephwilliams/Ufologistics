// Deterministic fingerprint of engine behaviour, for before/after refactor proof.
import { newGame, tick, chooseOption, passEvent, buildRoute } from "../src/game/engine";
import { RACES } from "../src/game/races";
import { SITES } from "../src/game/sites";
import type { GameState, RaceId } from "../src/game/types";
import { createHash } from "node:crypto";
const out: string[] = [];
for (const race of ["grey","nordic","mantid"] as RaceId[]) {
  for (const seed of [11, 2029, 77777]) {
    let s: GameState = newGame(race, seed);
    const srcs = SITES.filter(x => RACES[race].harvestKinds.includes(x.kind) && !x.startLocked).slice(0, 4);
    for (let i = 0; i < Math.min(2, s.fleet.length); i++) {
      const t = race === "mantid" ? RACES[race].homeId : RACES[race].homeId;
      s = buildRoute(s, srcs[i].id, t, s.fleet[i].id, "auto", "direct");
    }
    for (let n = 0; n < 300 && s.phase === "playing"; n++) {
      if (s.pending) { s = s.pending.choices.length ? chooseOption(s, s.pending.choices.length - 1) : passEvent(s); continue; }
      s = tick(s);
    }
    out.push(`${race}/${seed} night=${s.night} phase=${s.phase} cash=${s.cash.toFixed(4)} goal=${s.goal.toFixed(4)} disc=${s.disclosure.toFixed(6)} susp=${Object.values(s.suspicion).reduce((t,v)=>t+v,0).toFixed(6)} log=${s.log.length} rng=${s.rngCursor}`);
  }
}
console.log(out.join("\n"));
console.log("SHA " + createHash("sha256").update(out.join("\n")).digest("hex").slice(0, 32));
