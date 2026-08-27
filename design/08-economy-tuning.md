# Level 1 — Economy Tuning

Concrete numbers so Level 1 (24 cycles) is **winnable but tight**: a careful operator promotes;
a greedy or sloppy one trips Disclosure. Includes a worked 24-cycle trace (success + failure).

> **Reconciliation with the build:** the prototype implements **5 currencies** — Biomass ≋, Footage
> ◉, Genome ✶, Tribute ▼, Standing ✦ — and *no separate Scrip*. So upkeep is **netted against the
> route's own faction-currency yield** (you skim what you haul to keep flying). Where `06` said
> "Scrip $," read "the route's faction currency." Standing ✦ remains the regulatory currency.

---

## 1. Core rates

| Knob | Value | Note |
|---|---|---|
| Cycle | 1 ops turn | a route delivers ~1×/cycle at speed ×1.0 |
| Base run yield | **10** (faction currency) | before craft×crew×corridor multipliers |
| Base run exposure | **+6** | before multipliers; region pool |
| Exposure decay | **−2 / idle cycle** | laying low cools |
| Start | Standing **5 ✦**, Exposure **24**, Disclosure **0**, ledger **0** | residual crash heat |
| Upkeep | per `03` (additive), **paid from the route's yield** | net = gross − upkeep |

**Net yield example** (Disc Mk-I × Tall Grey × Night Run = ×1.10 yield, upkeep 5):
`10 × 1.10 − 5 = +6 net / cycle`, at exposure `6 × 0.56 = +3.4 / cycle`. A clean, modest earner.

---

## 2. Contract payouts (lump, on completion)

Scaled so one mid contract ≈ several cycles of grind, and the splashy ones force a risk choice.
(Currency per patron: Grey ≋ · Nordic ◉ · Mantid ✶ · Reptilian ▼ · Federation ✦.)

| Tier | Examples | Payout | Deliveries to clear | Net exposure over run |
|---|---|---|---|---|
| **Starter** | G1 Milk Run, N1 First Tourists | 80–90 | 3 | +15 … +20 |
| **Standard** | G2, N2, M1 | 120–150 | 4–5 | +25 … +45 |
| **Reach** | G3, N3, M2, R1 | 200–300 | 5–6 | +40 … +90 |
| **Splash** | G4, N4, M3, R2, M4 | 320–500 | 6–8 | +60 … +130 |
| **Apex** | R3, R4 | 480–600 | 8 | +110 … +180 |

**Federation compliance** (the relief valve): F1 pays **+3 ✦ and −15 Disclosure**; F2 pays **+2 ✦,
−10 Disclosure**; F3 costs **2 ✦ or a fine**; F4 is the renewal gate.

---

## 3. Mitigation & incident costs

| Item | Cost | Effect |
|---|---|---|
| Weather Cover | 15 (faction cur.) | Exposure −15 |
| Witness Intimidation | 20 | Exposure −30 (30% backfire) |
| MiB Cleanup | 40 | Exposure −20, void T1–T2 spill |
| Radar Spoofing | 25 upkeep/cyc | nullify radar incidents |
| Staged Explanation | 30 + **1 ✦** | Exposure −25, Disclosure spill −  |
| Document Suppression | **1 ✦** | remove evidence, Disclosure − |
| Ignored T1 / T2 / T3 / T4 | — | Exposure +5–8 / +12–20 / +25–40 / Disclosure +50 |

**Standing flow:** you start with 5 ✦, earn ~2–3 ✦ per compliance contract and +3 at a clean audit,
and the expensive mitigations cost 1–5 ✦. So across 24 cycles you'll bank ~12–16 ✦ and spend most of
it — Standing is *always* scarce. That scarcity is the brake on spamming cover-ups.

---

## 4. Audit thresholds (from `06`)

| Cycle | Gate | Pass condition |
|---|---|---|
| 8 | Audit 1 | Disclosure < 50 (ideally < 30 for the +3 ✦ commendation) |
| 16 | Audit 2 | Disclosure < 50, no standing probation |
| 24 | **License Renewal (F4)** | Disclosure < 50 → **promotion to Crew Chief** |

Snap audit any cycle Disclosure ≥ 75.

---

## 5. Worked 24-cycle trace — the careful operator (WIN)

| Cyc | Action | Ledger Δ | Exp | Disc | Note |
|---|---|---|---|---|---|
| 1 | Pick Grey; wire Ranch α → Roswell | — | 24 | 0 | crash heat baseline |
| 2 | Route runs | +6 ≋ | 27 | 0 | first money |
| 3 | Accept **G1 Milk Run** | — | 30 | 0 | board unlocks |
| 4–5 | Deliver ×3 → G1 clears | +80 ≋ | 38 | 0 | first big payout |
| 6 | **EX-03 Highway Lights** (T1) | — | 38 | 0 | draw at Warm band |
| 7 | Staged Explanation ("Venus") | −30 ≋, −1 ✦ | 28 | 0 | cheap, clean |
| **8** | **Audit 1** | +3 ✦ | 28 | 6 | Disc<30 → **Commendation** |
| 9 | Accept **N2 Neon Cover**; reroute via Vegas | — | 26 | 6 | low-exposure pivot |
| 10–13 | Tourism runs (×0.32 expo) | +140 ◉ | 30 | 6 | sprawl safely |
| 12 | **EX-13 Contactee** (T2) | — | 30 | 6 | discredit him |
| 13 | Staged Explanation | −30 ◉, −1 ✦ | 22 | 4 | Disc dips |
| 14 | Accept **R1 Tonnage Quota** (greed) | — | 22 | 4 | the temptation |
| 15 | Heavy runs over Pampas | +130 ▼ | 48 | 4 | exposure spikes |
| **16** | **Audit 2** | — | 48 | 22 | Disc<50 → **Pass** |
| 17 | **EX-14 Mutilation Flap** (T2) | — | 48 | 22 | greed's bill |
| 18 | MiB Cleanup | −40 ▼ | 28 | 22 | bought down |
| 19 | Accept **F1 Keep the Lid On** | +3 ✦, −15 Disc | 24 | 7 | the relief valve |
| 20–22 | Steady Nordic runs | +120 ◉ | 22 | 7 | bank quietly |
| 23 | Document Suppression (pre-empt a photo) | −1 ✦ | 22 | 4 | tidy |
| **24** | **License Renewal** | — | 22 | 4 | Disc<50 → **PROMOTION → Crew Chief** |

Ends rich-ish, **Disclosure 4, Standing ~6** — promoted. The R1 greed was survivable *because* it was
paid down immediately and offset with compliance.

---

## 6. Worked trace — the greedy operator (LOSS)

Same start, but stacks Reptilian apex contracts and ignores incidents to chase payout:

| Cyc | Action | Exp | Disc | Note |
|---|---|---|---|---|
| 1–7 | R1 + R2 stacked, Direct Line daylight, no mitigation | 78 | 18 | Critical band |
| **8** | Audit 1 | 78 | 38 | Pass, but barely — band is Critical |
| 9–12 | R3 Strip the Reserve, ignore EX-14, EX-17 | 92 | 64 | Blown band, Disclosure bleeding +5/cyc |
| 13 | **EX-19 Downed Craft** (T3) ignored | 100 | 79 | the next Roswell |
| **14** | **Snap audit** (Disc ≥ 75) | — | 79 | **Censure** — premium contracts locked |
| 15 | **EX-23 Authenticated** (T4) | — | 100 | **Disclosure Event — LOSS** |

The numbers make the thesis unavoidable: **profit is easy; the masquerade is the constraint.** You
*can* out-earn the careful player for ~12 cycles — and still lose the license.

---

## 7. Tuning levers (if it plays too easy / too hard)

- **Too easy:** raise base run exposure (6→8), shorten audit interval, raise apex payouts (tempt
  harder), lower ✦ income.
- **Too hard:** raise exposure decay (−2→−3), lower incident draw chance per band, add +1 starting ✦.
- The single most important balance point: **a clean route must net positive while keeping a region
  in the Warm band indefinitely** — that's the sustainable floor the player builds on.
