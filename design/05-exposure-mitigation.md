# Level 1 — Exposure & Mitigation System

Americas theatre · 1947–1965. This spec upgrades the prototype's single meter (where
`Exposure == loss`) into a **two-meter consequence chain**:

> **Exposure** is *operational heat* — it drives incidents. **Disclosure** is the *loss meter* — it
> only moves when incidents go unmitigated (or the Federation punishes you). You no longer lose by
> running hot; you lose by letting the heat become a *story you can't kill*.

---

## 1. The two meters

| Meter | Range | Driven by | Decays? | Role |
|---|---|---|---|---|
| **Exposure** (Americas heat) | 0–100 | every route run (craft × crew × corridor); residual crash heat | yes, −2 / cycle when idle | Sets the **draw rate & severity** of incidents |
| **Disclosure** (global) | 0–100 | **only** unmitigated incidents + Federation penalties | barely (only via Staged Explanation / disinfo / Federation help) | The **loss meter**. 100 = Disclosure Event |

**Why split them:** it makes mitigation a *system*, not a slider. Running hot is fine if you clean up
after yourself; the danger is the incident you ignore. It also gives the Federation something real to
judge (Disclosure), separate from your day-to-day grind (Exposure).

### Exposure accrual & decay

```
exposure += run.baseExposure × craft.expoMul × crew.expoMul × corridor.expoMul
exposure -= 2 per idle cycle           // laying low cools the region
exposure  = clamp(0, 100)
```

Residual crash heat seeds Level 1 at ~24 (the predecessor's mess). Corridor/crew/craft are the
**first line of defense (avoidance)** — see `03-route-customization.md`.

### Exposure bands → incident draw

Each cycle, roll once against the current band. The band caps the **severity tier** you can draw.

| Band | Range | Color | Draw chance / cycle | Max tier |
|---|---|---|---|---|
| **Cold** | 0–25 | green | 8% | T1 Whisper |
| **Warm** | 26–50 | teal | 25% | T2 Flap |
| **Hot** | 51–75 | gold | 50% | T3 Crisis |
| **Critical** | 76–90 | orange | 80% | T3 Crisis (×2 draws) |
| **Blown** | 91–100 | red | 100% | T4 Breach + Disclosure bleed (+5/cycle) |

**Forced draws:** a site's *event hook* (see `01-sites-americas.md`) or a contract *wrinkle* (see
`02-contracts-l1.md`) can force a specific card regardless of band — that's how scripted moments and
the tutorial beats fire.

---

## 2. The six mitigation tools

The **second line of defense (management)**. Tools are how you answer incidents; each has a niche,
a cost, a cooldown, an era gate, and a backfire.

| Tool | Counters | Effect | Cost | CD | Era | Faction | Backfire / limit |
|---|---|---|---|---|---|---|---|
| **MiB Cleanup** | human witnesses, contactees | −20 Exposure; voids T1–T2 Disclosure spill | $$ + 1 cycle | 1 cyc | 1947 | Human / MJ-12 | 15%: spawns **EX-?? Men-in-Black sighting** (T1) |
| **Weather Cover** | lights / sightings | −15 Exposure | $ | — | 1947 | Federation / natural | only when weather/season allows (auto-pairs with **Storm-Mask** corridor) |
| **Radar Spoofing** | radar & military detection | nullifies radar incident; −30 on radar-type; cancels scramble | upkeep (tech) | 2 cyc | 1952 | Mantid / tech | 10%: a sharp operator logs the spoof → T2 |
| **Witness Intimidation** | a single named witness | −30 Exposure, instant, cheap | $ | — | 1947 | Reptilian | **30%: resentment → delayed EX-20 Whistleblower**; nudges Reptilian alignment |
| **Staged Explanation** | media / public sightings | −25 Exposure **and** −Disclosure spill (debunk) | $$ + 1 Standing | 1 cyc | 1948 | Federation | overuse (3+ in 5 cycles) → *credibility fatigue*: future stagings −50% |
| **Document Suppression** | press / photo / film / reports | removes the evidence; blocks future escalation; −Disclosure | 1 Standing | 1 cyc | 1947 | Federation / Human | 15%: a copy survives → seeds **EX-24 The Briefing Leaks** |

**Design read:** avoidance (corridor/crew) is cheap but passive; mitigation is active but costs cash,
Standing, cooldowns, and risk. **Witness Intimidation** is the dark-cheap option that quietly walks
you toward the Reptilian alignment; **Staged Explanation + Document Suppression** are the
Federation-aligned "play by the rules" path. The tool you reach for *is* a roleplay choice.

---

## 3. The Event Deck — 24 exposure incidents

Card format: `ID · Title — Tier · Faction`, trigger, **Δ if ignored**, one-line narrative, and a
responses table (`response | cost | outcome`). "Ignore" is always available; its cost is the Δ.

### Tier 1 — Whisper (minor; Exposure +5…+8, no Disclosure spill unless they compound)

**EX-01 · Blurry Snapshot — T1 · Nordic**
Trigger: a daylight route ends near a populated attraction. **Δ ignore: Exposure +8.**
*"A father at the canyon rim swings his Brownie skyward. Click. He won't know what he has until the drugstore develops it next week."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 1 Standing | Seize the film at the drugstore; voided |
| Staged Explanation | $ | "Weather balloon." Exposure +2 |
| Ignore | — | Exposure +8; a 2nd in-region T1 escalates to **EX-12** |

**EX-02 · Drained Steer — T1 · Grey/Reptilian**
Trigger: 2+ Grey harvest runs from one ranch in a cycle. **Δ ignore: +6.**
*"The hand finds the steer at dawn — bloodless, surgical, not a coyote's work."*
| Response | Cost | Outcome |
|---|---|---|
| Weather Cover | $ | "Predator / lightning." Voided |
| MiB Cleanup | $$ | Quietly buy the ranch's silence; −20 Exposure |
| Ignore | — | +6; feeds a regional **EX-14 Mutilation Flap** |

**EX-03 · Highway Lights — T1 · Grey**
Trigger: Direct Line corridor at night near a road. **Δ ignore: +5.**
*"A trucker on Route 66 watches three lights pace his cab, then snap away faster than thought."*
| Response | Cost | Outcome |
|---|---|---|
| Witness Intimidation | $ | −30 Exposure (30% backfire) |
| Staged Explanation | $ | "Venus / aircraft." Exposure +1 |
| Ignore | — | +5 (harmless alone) |

**EX-04 · Radio Interference — T1 · Mantid**
Trigger: a route passes through the Zone of Silence. **Δ ignore: +7.**
*"Ham operators across three states log the same dead air at the same minute."*
| Response | Cost | Outcome |
|---|---|---|
| Radar Spoofing | upkeep | Jam the band; voided |
| Ignore | — | +7; compounds toward **EX-10** |

**EX-05 · Flattened Field — T1 · Nordic**
Trigger: any landing at a rural harvest site. **Δ ignore: +6 (but +Nordic tourism demand).**
*"A perfect circle pressed into the wheat. By Sunday there are tour buses."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 1 Standing | Fence it off, classify it; voided |
| Ignore | — | +6 Exposure **and** +Nordic demand (free advertising) |

**EX-06 · Curious Sheriff — T1 · Human**
Trigger: base Exposure > 30. **Δ ignore: +8.**
*"The county sheriff keeps finding reasons to drive past the ranch gate."*
| Response | Cost | Outcome |
|---|---|---|
| MiB Cleanup | $$ | "Federal matter, son." −20 Exposure |
| Witness Intimidation | $ | −30 (30% backfire → an angry lawman) |
| Ignore | — | +8; recurs, climbing |

**EX-07 · Bush Pilot's Log — T1 · Federation**
Trigger: a route in Alaska / Canada. **Δ ignore: +7.**
*"A mail pilot notes a 'foo fighter' off his wingtip in the logbook. Logs get read."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 1 Standing | The page goes missing; voided |
| Staged Explanation | $ | "Ice crystals / St. Elmo's fire." Exposure +2 |
| Ignore | — | +7 |

**EX-08 · Schoolyard Drawing — T1 · Grey**
Trigger: a Grey medical/abductee run near a town. **Δ ignore: +5.**
*"Half the second grade drew the same silver men this week. The teacher is asking questions."*
| Response | Cost | Outcome |
|---|---|---|
| MiB Cleanup (gentle) | $ | A kindly "doctor" visits the school; voided |
| Ignore | — | +5 (harmless, but it compounds across cycles) |

### Tier 2 — Flap (moderate; Exposure +12…+20, Disclosure spill +3…+6)

**EX-09 · The Weekly Prints It — T2 · Federation**
Trigger: 2 unmitigated T1 in the same region. **Δ ignore: Exposure +15, Disclosure +3.**
*"FLYING DISC OVER OUR TOWN, says the front page. The wire services subscribe to small papers, too."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 1 Standing | Pull the run; voided |
| Staged Explanation | $$ + 1 Standing | Official debunk; Exposure +4, no Disclosure |
| Witness Intimidation (editor) | $ | −30 Exposure (30% backfire → **EX-20**) |
| Ignore | — | +15 / Disclosure +3 |

**EX-10 · Tower Radar Blip — T2 · Mantid**
Trigger: a route near a city airport with no Radar Spoof active. **Δ ignore: +14.**
*"The controller watches an unknown cross the pattern at impossible speed, then nothing."*
| Response | Cost | Outcome |
|---|---|---|
| Radar Spoofing | upkeep | Phantom returns; voided |
| Staged Explanation | $$ | "Anomalous propagation / weather." Exposure +3 |
| Ignore | — | +14; risks **EX-11** |

**EX-11 · Jet Scramble — T2 · Reptilian**
Trigger: a hot daytime route near a base or city. **Δ ignore: +18 and a craft-loss roll.**
*"Two interceptors claw for altitude. Their guns are hot. (Remember Mantell.)"*
| Response | Cost | Outcome |
|---|---|---|
| Radar Spoofing | upkeep | Blind them; voided |
| Evade (Tic-Tac / Vortex) | speed check | Outrun them; Exposure +5 |
| Ignore | — | +18; on fail, **EX-19 Downed Craft** |

**EX-12 · The Photo Sells — T2 · Federation**
Trigger: an unmitigated **EX-01**. **Δ ignore: +16, Disclosure +4.**
*"A picture editor in Chicago slides cash across a diner table. It's a good, clear shot."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 1 Standing | Buy/seize the negative; voided |
| Staged Explanation | $$ + 1 Standing | "Obvious hoax / lens flare." Exposure +4 |
| Ignore | — | +16 / Disclosure +4; feeds **EX-22 / EX-23** |

**EX-13 · Contactee Goes Public — T2 · Nordic**
Trigger: a Nordic tourism route + a contactee site (Sedona). **Δ ignore: +12 (+Nordic demand).**
*"A man in a desert tells a ballroom he dined with the Space Brothers. The era is primed to laugh."*
| Response | Cost | Outcome |
|---|---|---|
| Staged Explanation (discredit) | $ | Brand him a crank; voided, −Disclosure |
| MiB Cleanup | $$ | Quiet word; −20 Exposure |
| Ignore | — | +12 Exposure **and** +Nordic demand (the kooks sell tickets) |

**EX-14 · Mutilation Flap — T2 · Reptilian**
Trigger: 3+ Reptilian/Grey runs in a region. **Δ ignore: +18, Disclosure +5.**
*"Six ranches, one county, same week. The drained cattle make the evening news."*
| Response | Cost | Outcome |
|---|---|---|
| Weather Cover | $ | "Predators / a satanic cult." Exposure +4 |
| MiB Cleanup | $$ | Sweep the ranches; −20 Exposure |
| Ignore | — | +18 / Disclosure +5 |

**EX-15 · Missing Time — T2 · Mantid**
Trigger: a Grey abductee run. **Δ ignore: +14.**
*"A couple drives a back road and arrives two hours late with no memory of the gap. (Hill, '61.)"*
| Response | Cost | Outcome |
|---|---|---|
| Staged Explanation | $$ | "Fatigue / carbon monoxide." Exposure +3 |
| Witness Intimidation | $ | −30 (30% backfire) |
| Ignore | — | +14; under hypnosis it can resurface |

**EX-16 · Radar-Visual Over the Capital — T2 · Federation**
Trigger: a route near a major radar city at high Exposure. **Δ ignore: +20, Disclosure +6.**
*"Controllers and airline pilots see the same lights over the Capitol. (Washington, July '52.)"*
| Response | Cost | Outcome |
|---|---|---|
| Radar Spoofing **+** Staged Explanation | upkeep + $$ + 1 Standing | "Temperature inversion." Voided |
| Ignore | — | +20 / Disclosure +6; risks **EX-17** |

### Tier 3 — Crisis (major; Exposure +25…+40, Disclosure +8…+15, regional scrutiny)

**EX-17 · Blue Book Opens a File — T3 · Federation**
Trigger: regional Exposure > 70 sustained 3 cycles. **Δ ignore: +30, Disclosure +10, ongoing scrutiny.**
*"The Air Force assigns your region a case officer. He is methodical, and he keeps coming back."*
| Response | Cost | Outcome |
|---|---|---|
| Staged Explanation (feed debunkables) | $$$ + 2 Standing | Bury them in easy hoaxes; −Disclosure, scrutiny ends |
| Document Suppression | 2 Standing | Classify the file; scrutiny paused |
| Ignore | — | +30 / Disclosure +10; region stays watched |

**EX-18 · The Town That Saw It — T3 · Nordic/Federation**
Trigger: a low daytime route over a populated corridor (Phoenix Lights). **Δ ignore: +35, Disclosure +12.**
*"A whole town watches a silent V drift overhead at dusk. (Levelland '57 / Lubbock '51.)"*
| Response | Cost | Outcome |
|---|---|---|
| Staged Explanation | $$$ + 2 Standing | "Mass hysteria / weather." Exposure halved |
| MiB sweep | $$$ | Door-to-door; −30 Exposure (slow) |
| Ignore | — | +35 / Disclosure +12; escalates to **EX-22** |

**EX-19 · Downed Craft — T3 · Mantid**
Trigger: a Vortex Skip loss roll, or losing an intercept (**EX-11**). **Δ ignore: +40, Disclosure +15.**
*"A saucer is in a mesa field, smoking. Somewhere a rancher is already on the phone. This is how the last guy started."*
| Response | Cost | Outcome |
|---|---|---|
| MiB + Document Suppression (rapid recovery) | $$$ + 2 Standing + 1 cycle | Race the locals; recover the craft, +Mantid tech, voided |
| Reptilian: scorch the site | $$ | Destroy everything incl. evidence; −Disclosure but +Exposure (a fire is news too) |
| Ignore | — | +40 / Disclosure +15 — **the next Roswell**, with your name on it |

**EX-20 · Whistleblower — T3 · Human**
Trigger: 2+ Witness Intimidation backfires, or a disgruntled human asset. **Δ ignore: +30, Disclosure +10.**
*"Someone who knows too much has stopped being afraid, and has started talking to a reporter."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression | 2 Standing | Discredit & bury their evidence; voided |
| Staged Explanation | $$ + 1 Standing | "Disgruntled fantasist." −Disclosure |
| Witness Intimidation (again) | $ | −30 now, **but guarantees a worse return** |
| Ignore | — | +30 / Disclosure +10 |

**EX-21 · Congressional Question — T3 · Federation**
Trigger: Disclosure > 50. **Δ ignore: +25, Disclosure +8, −Standing.**
*"A senator reads 'the saucer reports' into the record and asks the Air Force to explain itself."*
| Response | Cost | Outcome |
|---|---|---|
| Burn Standing to bury it | 3 Standing | Hearing quietly tabled |
| Staged Explanation (official statement) | $$$ | "No threat to national security." Disclosure held |
| Ignore | — | +25 / Disclosure +8 and a Federation Standing hit |

**EX-22 · Film at Eleven — T3 · Federation**
Trigger: unmitigated **EX-12 / EX-18** in the TV era (post-1950). **Δ ignore: +38, Disclosure +14.**
*"Newsreel footage of your saucer runs nationally between the ballgame and the weather."*
| Response | Cost | Outcome |
|---|---|---|
| Document Suppression (pull the reel) | 3 Standing | Hard, costly; voided if it lands |
| Staged Explanation (on-air expert debunk) | $$$ + 2 Standing | Halves Disclosure |
| Ignore | — | +38 / Disclosure +14; primes **EX-23** |

### Tier 4 — Breach (catastrophe; threatens the run)

**EX-23 · The Photographs Are Authenticated — T4 · Federation**
Trigger: 3+ unmitigated media incidents (EX-12/22) **and** Disclosure > 60. **Δ ignore: Disclosure +50.**
*"Independent experts can't find the seams. The photo is real, and now everyone knows the experts said so."*
| Response | Cost | Outcome |
|---|---|---|
| All-hands cover-up | Doc Suppression + Staged Explanation + 4 Standing | Disclosure clawed back to survivable; you've spent everything |
| **Go loud (Draco branch)** | — | Embrace it: convert to the occupation endgame (see `SPIKE.md`) |
| Ignore | — | Disclosure +50 → near-certain **Disclosure Event (loss)** |

**EX-24 · The Briefing Leaks — T4 · Human/Federation**
Trigger: a Document Suppression backfire at high Disclosure, or Disclosure > 70. **Δ ignore: Disclosure → loss.**
*"A classified briefing — your operation, on letterhead — is in a journalist's hands. (The MJ-12 papers.)"*
| Response | Cost | Outcome |
|---|---|---|
| Massive discredit campaign | 5 Standing | Brand the documents a forgery (the real-world MJ-12 debunk); Disclosure held at the brink |
| Go loud (Draco branch) | — | Stop hiding |
| Ignore | — | **Disclosure Event — license revoked, run over** |

---

## 4. How it plugs into the loop

```
   ┌──────────────────────────────────────────────────────────────────────┐
   │                                                                        │
   ▼                                                                        │
CONTRACTS ──set objectives──▶ ROUTES (craft × crew × corridor)             │
 (02 board)                      │  each run adds heat                      │ pay you in
   ▲                             ▼                                          │ currency / Standing
   │                        EXPOSURE (Americas heat) ──high band raises──┐  │
   │                             │  decays when idle                     │  │
   │                             ▼                                       ▼  │
   │                        INCIDENTS (24-card deck) ◀──forced draws── site hooks /
   │                             │                                    contract wrinkles
   │   prevented / converted     ▼
   │   by ───────────────▶ MITIGATION (6 tools: $, Standing, cooldown, backfire)
   │                             │  unmitigated → spill
   │                             ▼
   └──────── FEDERATION ◀──── DISCLOSURE (global loss meter)
            JUDGMENT  reads Disclosure + Standing at each audit:
            pass → promotion · 50–75 → probation · 100 → Disclosure Event
            and offers F1–F4 compliance contracts to claw Disclosure back
```

**Walkthrough (one full lap):** A Reptilian *Tonnage Quota* (**contract**) pushes you to fly a
Livestock Saucer + Reptilian Overseer down a Direct Line (**route**) over the Pampas → regional
**Exposure** spikes into the Hot band → the **deck** draws **EX-14 Mutilation Flap** → you spend
**Witness Intimidation** (**mitigation**) — cheap, but it *backfires* → cycles later **EX-20
Whistleblower** fires → you burn **Document Suppression** to bury it, yet a little **Disclosure** still
spilled → at the next **Federation audit** your Disclosure reads 48: you pass *on probation*, and
**F1 "Keep the Lid On"** appears, paying you to cool the very region you overheated. The greed of the
Reptilian contract created the heat; the Federation profits from selling you the cure. That tension is
the game.

**Where the fork lives:** the *tool you reach for* leans you. Lots of **Witness Intimidation** →
Reptilian alignment (and more whistleblowers). Lots of **Staged Explanation / Document Suppression** →
Federation-compliant. At T4, "Go loud" flips Disclosure from loss-condition to the Draco win.

---

## 5. Lore-compression notes

Almost everything here is **era-native** (1947–65) and used straight:
Roswell '47 · Mantell '48 · Project Sign/Grudge/**Blue Book** ('48–) · Lubbock Lights '51 ·
**Washington flap** '52 · Robertson Panel '53 (the debunking apparatus behind *Staged Explanation*) ·
Adamski contactees '52 · **Levelland** '57 · **Betty & Barney Hill** '61 · Socorro '64.

**Flagged exceptions (compressed forward into the era):**
- **EX-24 / the MJ-12 documents** — surfaced 1984. Used because the *forgery-debunk* response is too
  perfect to omit; treat as an in-era classified leak.
- **Phoenix Lights** (EX-18 trigger site) — 1997; stands in as a generic mass-sighting corridor.
- **Varginha / Buga** event hooks (per `01`) remain compressed as described there.

---

## 6. Build / data notes (for whoever wires this in)

Mirrors the existing `src/data.ts` pattern — pure data, no engine assumptions:

- `Incident` = `{ id, title, tier, faction, trigger, exposureDelta, disclosureDelta, narrative, responses: Response[] }`
- `Response` = `{ label, tool?, cost: {cash?, standing?, cycles?}, effect: {exposure?, disclosure?}, backfire?: { chance, incidentId } }`
- `MitigationTool` = `{ id, name, counters: tag[], effect, cost, cooldown, eraUnlock, faction, backfire }`
- Two scalar meters on game state: `exposure` (already in the prototype) and a **new** `disclosure`.
- **Refactor flag:** the prototype currently loses at `exposure >= 100`. This system moves the
  loss condition to `disclosure >= 100`; `exposure` instead feeds the per-cycle incident roll
  (band table in §1). That's the single behavioral change when this graduates from doc to code.
- Incidents carry `tag`s (`witness`, `radar`, `media`, `photo`, `film`, `report`, `contactee`) so a
  tool's `counters` list resolves which responses are legal — keeps the deck and tools decoupled.
