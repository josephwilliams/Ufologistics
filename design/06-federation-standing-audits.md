# Level 1 — Federation Standing & Audit Economy

Americas · 1947–1965. This defines the **regulatory backend**: the ✦ Standing currency, the audit
cadence, the pass/probation/promotion thresholds, and how the Federation's compliance contracts close
the economic loop. The Federation is the *meta-layer* — it sells you the cure for the disease the
other patrons pay you to spread.

---

## 1. Three currencies, three jobs

Keep these distinct — they are *not* interchangeable, and that's the point.

| Currency | Symbol | Earned by | Spent on | Think of it as |
|---|---|---|---|---|
| **Scrip** | `$` | every delivery (the dopamine number) | upkeep, cheap mitigations, evasion | operating cash |
| **Faction Standing** | ≋ ◉ ✶ ▼ | serving a patron's contracts | that faction's craft, crew, ranks, contracts | reputation / demand |
| **Federation Standing** | `✦` | compliance work + clean audits | the license itself + expensive cover | your *permit to operate* |

`$` keeps the lights on. Faction currencies unlock your build. **✦ is the leash** — lose it and you
lose the right to harvest Earth at all.

---

## 2. Federation Standing (✦)

Scarce and precious. You earn it slowly by being a good tenant and spend it in crises.

### Earn

| Source | ✦ |
|---|---|
| Complete a compliance contract (F1 / F2 / F3) | +2 … +4 |
| Audit with Disclosure < 30 (Commendation) | +3 |
| First time Disclosure drops below 25 in a region | +2 (milestone) |
| Voluntarily debunk a sighting the Federation flagged | +1 |

### Spend

| Sink | ✦ |
|---|---|
| Staged Explanation (per use) | 1 |
| Document Suppression (per use) | 1 |
| Bury **EX-17** Blue Book file | 2 |
| Burn **EX-21** Congressional question | 3 |
| Pull **EX-22** national footage | 3 |
| All-hands cover-up **EX-23** | 4 |
| Forgery campaign **EX-24** | 5 |
| Buy down one audit band (Probation → Pass, once per audit) | 3 |

Because the strongest mitigations cost ✦, and ✦ comes mainly from *compliance*, you are structurally
pushed to alternate: lucrative faction runs build heat → crises burn ✦ → you must take dull
compliance work to refill ✦. The grind and the cover-up fund each other.

---

## 3. The audit cadence & License Ledger

A **cycle** is one operations turn. Level 1 runs ~24 cycles.

- **Scheduled audits:** cycle 8, cycle 16, and **cycle 24 = License Renewal (F4)** — the level's
  win/lose gate.
- **Snap audit:** triggered any cycle Disclosure crosses 75 (the Federation doesn't wait).
- Each audit reads **Disclosure** (primary) and **✦ Standing** (modifier).

The **License Ledger** is the player's running scorecard: current Disclosure, ✦, cycles-to-audit,
and whether a probation flag is set.

---

## 4. Audit resolution

| Disclosure at audit | Result | Effect |
|---|---|---|
| **< 30** | **Commendation** | +3 ✦ · unlock a tool or craft · Disclosure −5 (goodwill) |
| **30–49** | **Pass** | proceed, no penalty |
| **50–74** | **Probation** | warning logged · −2 ✦ fine · **two consecutive probations → Revocation (loss)** · may spend 3 ✦ to upgrade to Pass |
| **75–99** | **Censure** | −4 ✦ · license *suspended*: premium (Mantid/Reptilian) contracts locked for 4 cycles · forced compliance |
| **100** | **Disclosure Event** | **loss** — license revoked, bases seized |

Standing acts as a one-time buffer: at Probation you can spend 3 ✦ to convert it to a Pass — but doing
that drains the very reserve you need for the next crisis. Choosing *when* to spend ✦ is the meta-game.

---

## 5. The Federation "store" — compliance contracts (F1–F4)

The Federation is the only patron whose contracts *lower* Disclosure. They're your relief valve.

| Contract | Does | Pays | Catch |
|---|---|---|---|
| **F1 Keep the Lid On** | suppress a hot region | +Standing & $ · Disclosure − | available once Disclosure > 40 |
| **F2 Cover Story** | fabricate a debunk via Hollywood | +Standing | overuse → credibility fatigue |
| **F3 Prime Directive Audit** | inspection after a tribe-contact | *costs* a fine or Standing | bribable (MJ-12) |
| **F4 License Renewal** | the final audit | promotion | the Level 1 win condition |

This is the loop's keystone: the Reptilians pay you to overharvest (heat ↑), then the Federation pays
you to clean it up (heat ↓). You can run that arbitrage forever — *as long as you never let an
incident outrun your ✦*.

---

## 6. The probation → promotion ladder (Level 1 end-state)

At **cycle 24 / License Renewal (F4):**

| Final Disclosure | Outcome |
|---|---|
| **< 50, no active probation** | **Promotion → Crew Chief.** Level 2 (Continental) unlocks: Element-115 fuel, orbital reach |
| **50–74** | Probation extension — replay the final stretch to bring it down |
| **≥ 75** | Demotion / soft-loss — the operation is handed to someone "more discreet" |
| **100 any time** | Disclosure Event — hard loss |

Promotion is gated on Disclosure, *not* profit — you can get filthy rich and still fail renewal if you
were sloppy. That's the whole thesis: the masquerade matters more than the margin.

---

## 7. Cutting the leash (the Draco off-ramp)

If you pledge the **Reptilian / "go loud"** branch (e.g., via **EX-23/24** "Go loud" or **R4 Show of
Force**):

- Audits **stop**; ✦ Standing **freezes** and becomes inert.
- The Federation turns **hostile** — it now actively *raises* your Disclosure and hunts your assets.
- But Disclosure is **no longer a loss meter** — your win condition becomes open occupation.

Standing was the leash. The Reptilian endgame is the act of cutting it. (Level 1 only *teases* this
fork; full commitment lands in later levels — see `SPIKE.md`.)

---

## 8. Tuning (Level 1 concrete values)

| Knob | Value |
|---|---|
| Starting ✦ | 5 |
| Starting Disclosure | 0 (Exposure starts ~24) |
| Cycle length | 1 ops turn |
| Audits | cycle 8, 16, 24 (+ snap at Disclosure ≥ 75) |
| Promotion gate | Disclosure < 50 at cycle 24, no active probation |
| Probation → Revocation | 2 consecutive probations |
| Buy-down cost | 3 ✦ |

---

## 9. Build / data notes

- New game-state scalars: `standing` (✦), `disclosure` (from `05`), `cycle`, `probation: boolean`,
  `nextAuditCycle`.
- `resolveAudit(disclosure, standing) → { result, deltaStanding, locks, lose }` — a pure function over
  the §4 table.
- Compliance contracts reuse the `Contract` shape from `02` with a `disclosureDelta < 0`.
- ✦ costs live on `Response` / `MitigationTool` (from `05`) as `cost.standing`.
- The Draco off-ramp is a one-way `alignment` state flag that disables the audit system.
