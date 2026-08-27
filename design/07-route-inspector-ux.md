# Level 1 — Route Inspector UX

The player-facing surface for the **craft × crew × corridor** model (`03`) and the **live incident
risk** it generates (`05`). Opens when a route is selected. Its job: make the three-layer tradeoff
*legible at a glance*, and make "which corridor / which craft" a decision you can actually reason about.

Design north stars (from the UX principles in the app): **globe-first, layered density, diegetic,
easy-on / deep-to-master, colorblind-safe.** The inspector is the "deep" that hides behind the clean
default — you only see it when you ask for it.

---

## 1. Anatomy (wireframe)

```
┌─ ROUTE INSPECTOR ───────────────────  Ranch α → Roswell  ╳ ┐
│                                                             │
│  ⬡ CRAFT      Disc Mk-I          ▾    ×1.0  ×1.0  ×1.0      │
│  ✦ CREW       Tall Grey Sup.     ▾    ×1.1  ×0.8  ×1.0      │
│  ◈ CORRIDOR   Night Run          ▾    ×1.0  ×0.7  ×0.9      │
│               ─────────────────────   yield  expo  speed    │
├─────────────────────────────────────────────────────────────┤
│  NET     yield ×1.10     exposure ×0.56     speed ×0.90     │
│          ≋ +9 / run                   upkeep  5 $ / cycle    │
├─ RISK ──────────────────────────────────────────────────────┤
│  Region   PERMIAN BASIN     ███████░░░  HOT · 64%           │
│  This line adds            +3.1 heat / cycle                │
│  Vulnerable to             ⟨witness⟩ ⟨photo⟩                │
│  Incident odds             ▓▓▓▓▓░░░░  50%   (up to Crisis)  │
│  Disclosure trend          ▲ slow rise                      │
├─ MITIGATION  (region loadout) ──────────────────────────────┤
│  [ MiB ● ]   [ Weather ○ ]   [ Stage ✦ ]        + deploy    │
├─────────────────────────────────────────────────────────────┤
│            ⏸ pause      ⟲ reroute      ✕ scrap              │
└─────────────────────────────────────────────────────────────┘
```

Icons double as colorblind-safe identifiers: **⬡ craft · ✦ crew · ◈ corridor**; risk tags are
bracketed words, never color alone; bands print as **text + bar + %**.

---

## 2. The three selectors (live combined preview)

Each row is a dropdown showing the chosen component, its three multipliers, and its era/faction lock.
Changing any one recomputes **NET** instantly.

- Locked components (wrong era, wrong faction, not yet unlocked) are greyed with the reason on hover
  ("Mantid Director — requires Mantid patronage").
- **Progressive reveal (ties to the tutorial, `04`):** Beat 4 shows the inspector *read-only* (NET +
  RISK only). Beat 5 unlocks the **◈ Corridor** row. Beat 6 unlocks the **✦ Crew** row. So the panel
  grows its own complexity exactly as the player earns it.

---

## 3. The RISK readout (the reason this screen exists)

Avoidance lives here. The player must be able to answer "if I fly this, what bites me?" without doing
mental math.

| Line | Meaning | Source |
|---|---|---|
| **Region + band** | the current heat where this route operates | Exposure band (`05` §1) |
| **Heat / cycle** | what *this specific line* contributes | `run.baseExposure × NET.expo` |
| **Vulnerable to** | the incident *tags* this route invites (`witness`, `photo`, `radar`, `media`…) | craft/corridor/region → tag set |
| **Incident odds** | draw chance this cycle + max severity tier | band table |
| **Disclosure trend** | ▲▼ arrow: is your cover eroding or healing | Disclosure slope |

"Vulnerable to" is the magic: it tells you *which mitigation to pre-load*. A `⟨radar⟩` route wants
Radar Spoofing standing by; a `⟨photo⟩` route wants Document Suppression. The inspector turns the deck
from a surprise into a plan.

---

## 4. What-if preview (decide before you commit)

Hovering an *unselected* option in any dropdown ghosts the resulting NET and risk deltas inline —
no confirm required to compare:

```
  ◈ CORRIDOR   Night Run ▾
     › Direct Line      → exp ×1.20  odds 78%  ⟨witness⟩+  speed ▲
     › Desert Dogleg    → exp ×0.60  odds 31%  ≋ −0.5      speed ▼
     › Storm-Mask  🔒1958
```

Deltas are signed and color/arrow-coded. This is where the *interesting decision* actually happens —
the player trades speed for stealth with full information.

---

## 5. Mitigation loadout

The bottom strip is the **region's** standing mitigation loadout (not per-route), so tools the
"Vulnerable to" line warns about can be pre-deployed:

- `●` ready · `○` available but unequipped · `✦` costs Standing · `🔒` era-locked.
- `+ deploy` opens the 6-tool tray (`05` §2) with cost, cooldown, and backfire shown.
- When an incident is *live* on this route, the relevant tool pulses and the strip surfaces the
  incident card inline (responses become buttons here).

---

## 6. States

| State | Inspector shows |
|---|---|
| **No route selected** | collapsed; globe clean (layered-density default) |
| **Building** (mid two-click) | a ghost arc + "pick a destination" hint, no stats yet |
| **Active route** | full panel as wireframed |
| **Under incident** | RISK header flips red, the incident card mounts into the Mitigation strip with response buttons + a countdown if timed |
| **Locked component hover** | greyed row + reason tooltip |

---

## 7. Diegetic framing

Per art direction (`/art`): if **Dossier**, the panel is a stamped manila route-card with typewriter
labels and a red `EXPOSURE` ink-meter; if **Saucer-Pop**, it's a glowing alien HUD with chrome dials.
The *information architecture above stays identical* — only the skin changes. Build it data-driven so a
theme swap never touches layout.

---

## 8. Accessibility

- Every faction/risk signal carries an **icon + label**, never hue alone.
- Bands and odds are **text + bar + number**.
- Full keyboard path: select route → `Tab` through selectors → `↑/↓` to preview → `Enter` to commit →
  `D` to deploy mitigation.
- Respects the global font-size setting; the panel reflows, never truncates the NET line.

---

## 9. Interaction flow

```
click route ─▶ inspector opens ─▶ read NET + RISK
     │                                  │
     │                          hover options ─▶ what-if deltas
     ▼                                  ▼
 see "Vulnerable to" ─▶ pre-deploy mitigation ─▶ commit swap
     │                                              │
     └──────────────── route runs hotter/cooler ◀──┘
                         (loop back to RISK)
```

---

## 10. Build / data notes

- Pure read-model over existing data: `craft × crew × corridor` (`03`) → `NET`; region Exposure
  (`05`) → RISK; tools (`05` §2) → loadout. No new sim state — the inspector *renders* state and
  *writes back* the three component choices on a route.
- `Route` gains `craftId`, `crewId`, `corridorId`; `computeNet(route)` is a pure multiply.
- `routeRisk(route, regionExposure) → { band, heatPerCycle, tags, odds, maxTier, disclosureSlope }`.
- Theming via a `skin` token; layout component is skin-agnostic.
- Honors the prototype's current two-click creation — the inspector is the *third* click (select to
  inspect), so it layers on without changing the core verb.
