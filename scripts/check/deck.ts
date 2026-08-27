// Reports the real size of the event deck, and fails on authoring mistakes.
import { DECK, DECK_STATS } from "../../src/game/events";
import { VOCAB } from "../../src/game/events/vocab";

const ids = new Set<string>();
let bad = 0;
const KNOWN = new Set([...Object.keys(VOCAB), "site", "place", "state"]);

for (const d of DECK) {
  if (ids.has(d.id)) { console.log("DUPLICATE id:", d.id); bad++; }
  ids.add(d.id);
  if (!d.choices.length) { console.log("no choices:", d.id); bad++; }
  const text = d.headline + d.dek + d.choices.map((c) => c.label + c.note).join("");
  for (const m of text.matchAll(/\{(\w+)\}/g)) {
    if (!KNOWN.has(m[1])) { console.log(`unknown slot {${m[1]}} in ${d.id}`); bad++; }
  }
}

console.log("authored event definitions:", DECK_STATS.defs);
console.log("by tag:", DECK_STATS.byTag);
console.log("distinct realisations:", DECK_STATS.variants.toLocaleString());
console.log("tier spread:", DECK.reduce<Record<number, number>>((a, d) => ((a[d.tier] = (a[d.tier] ?? 0) + 1), a), {}));
console.log("race-gated:", DECK.filter((d) => d.races).length, "| kind-gated:", DECK.filter((d) => d.kinds).length);
console.log(bad ? `FAILED (${bad} problems)` : "deck ok");
if (bad) process.exit(1);
