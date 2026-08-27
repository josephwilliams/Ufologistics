"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameState, RaceId } from "@/game/types";
import { RACES } from "@/game/gc/races";
import { SITES, SITE_BY_ID } from "@/game/gc/sites";
import { crewsFor } from "@/game/gc/craft";
import {
  newGame,
  tick,
  chooseOption,
  passEvent,
  buildRoute,
  removeRoute,
  reconfigureRoute,
  routeError,
  toggleRoutePaused,
  buyCraft,
  buildLab,
  hottestSectors,
} from "@/game/engine";
import { TUTORIAL, type TutorialCtx } from "@/game/gc/tutorial";
import Coach from "./Coach";
import TitleScreen from "./TitleScreen";
import { seedLabel } from "@/game/rng";
import UsMap from "./UsMap";
import Hud from "./Hud";
import Newspaper from "./Newspaper";
import {
  Hangar,
  Ledger,
  RouteRow,
  SectionTitle,
  SiteInspector,
  Reputacións,
} from "./Panels";

// Bumped when the GameState shape changes — an old save must not half-load.
const SAVE_KEY = "ufologistica-gc-save-v1";

/**
 * Read a saved run, or null.
 *
 * A save written by an older build can parse as valid JSON and still be the
 * wrong shape. Casting it straight into state crashes on the next render —
 * and because the bad save is still on disk, it crashes again on every reload,
 * leaving no way back to the title screen. So: check the fields the UI
 * actually dereferences, and bin anything that fails.
 */
function loadSave(): GameState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null; // Private mode or storage disabled: play without persistence.
  }
  if (!raw) return null;

  try {
    const v = JSON.parse(raw) as Partial<GameState>;
    const usable =
      typeof v?.night === "number" &&
      typeof v?.disclosure === "number" &&
      typeof v?.race === "string" &&
      v.race in RACES &&
      Array.isArray(v.routes) &&
      Array.isArray(v.fleet) &&
      Array.isArray(v.log) &&
      !!v.sites &&
      !!v.suspicion &&
      !!v.factions;
    if (!usable) throw new Error("unrecognised save shape");
    return v as GameState;
  } catch {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing more to do; returning null still gets us to the title screen.
    }
    return null;
  }
}

/** Milliseconds per night at each speed setting. */
const SPEED_MS = [0, 2400, 1200, 600];

type Tab = "map" | "routes" | "hangar" | "world";

export default function GameShell() {
  const [state, setState] = useState<GameState | null>(null);
  const [speed, setSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("map");
  const [notice, setNotice] = useState<string | null>(null);
  const [tutStep, setTutStep] = useState<number | null>(null);
  // Asking to abandon is an in-app modal, not confirm(): native dialogs are
  // suppressed in a sandboxed frame, which silently killed the button when the
  // game is embedded rather than served from localhost.
  const [askAbandon, setAskAbandon] = useState(false);

  // --- persistence --------------------------------------------------------
  // The title screen renders on the server; a save (if any) swaps in on mount.
  // This setState-in-effect is deliberate and cannot be hoisted into a lazy
  // initialiser: reading localStorage during render would make the client's
  // first paint disagree with the server's and break hydration.
  useEffect(() => {
    const saved = loadSave();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setState(saved);
  }, []);

  // The edition lives on the <html> element, not in React state: the boot
  // script sets it before paint, and CSS renders the right toggle glyph.
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "day" ? "night" : "day";
    root.dataset.theme = next;
    try {
      localStorage.setItem("bt-theme", next);
    } catch {
      // Non-fatal: the choice just won't persist.
    }
  };

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // Quota or private mode — the run just won't survive a refresh.
    }
  }, [state]);

  // --- the clock ----------------------------------------------------------
  const paused = !state || state.phase !== "playing" || !!state.pending || speed === 0;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      // Re-checked inside the updater: an event can land between ticks, and
      // tick() must not run while a newspaper is waiting to be answered.
      () => setState((s) => (s && s.phase === "playing" && !s.pending ? tick(s) : s)),
      SPEED_MS[speed],
    );
    return () => clearInterval(id);
  }, [paused, speed]);

  // Keyboard: space toggles the clock, which is what everyone tries first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement)?.closest("input,select,button")) {
        e.preventDefault();
        setSpeed((s) => (s === 0 ? 1 : 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- actions ------------------------------------------------------------
  const start = (race: RaceId, seed: number, withTutorial: boolean) => {
    setState(newGame(race, seed, "gc"));
    setSelectedId(RACES[race].homeId);
    // The tutorial opens paused so the briefing can be read before anything moves.
    setSpeed(withTutorial ? 0 : 1);
    setTab("map");
    gotoStep(withTutorial ? 0 : null);
  };

  /** Drop the current run and go back to the title screen. */
  const abandonRun = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing to do; the in-memory reset below is what matters.
    }
    setState(null);
    setTutStep(null);
    setSelectedId(null);
    setLinkFrom(null);
    setNotice(null);
    setSpeed(1);
    setAskAbandon(false);
  }, []);

  const completeLink = useCallback(
    (toId: string) => {
      if (!state || !linkFrom) return;
      const idle = state.fleet.find((c) => !c.routeId);
      if (!idle) {
        setNotice("No hay ninguna nave libre para volarla.");
        return;
      }
      // Report why a destination was refused instead of failing silently.
      const err = routeError(state, linkFrom, toId, idle.id);
      if (err) {
        setNotice(err);
        return;
      }
      const crews = crewsFor(state.race);
      const crew = crews[Math.min(1, crews.length - 1)];
      setState((s) => (s ? buildRoute(s, linkFrom, toId, idle.id, crew.id, "direct") : s));
      setLinkFrom(null);
      setNotice(null);
    },
    [linkFrom, state],
  );

  /** While wiring, the sites that would actually accept this cargo. */
  const legalTargets = useMemo(() => {
    if (!state || !linkFrom) return null;
    const idle = state.fleet.find((c) => !c.routeId);
    if (!idle) return new Set<string>();
    return new Set(
      SITES.filter((t) => !routeError(state, linkFrom, t.id, idle.id)).map((t) => t.id),
    );
  }, [state, linkFrom]);

  // Every tutorial milestone is derivable from GameState, so none of it needs
  // to be mirrored into React state.
  const tutCtx: TutorialCtx | null = useMemo(() => {
    if (!state) return null;
    const defaultCrew = crewsFor(state.race)[Math.min(1, crewsFor(state.race).length - 1)].id;
    return {
      state,
      selectedId,
      linkFrom,
      everDelivered: state.routes.some((r) => r.runs > 0) || state.goal > 0,
      everAnsweredEvent: state.log.some((l) => l.kind === "event"),
      everTunedRoute: state.routes.some(
        (r) => r.corridorId !== "direct" || r.crewId !== defaultCrew,
      ),
    };
  }, [state, selectedId, linkFrom]);

  // Move to a step, following whatever tab it wants shown.
  const gotoStep = useCallback((n: number | null) => {
    setTutStep(n);
    const want = n === null ? undefined : TUTORIAL[n]?.tab;
    if (want) setTab(want);
  }, []);

  // Auto-advance any step whose condition the player has satisfied. The
  // timeout lets them see the thing they just did before the card changes.
  useEffect(() => {
    if (tutStep === null || !tutCtx) return;
    if (!TUTORIAL[tutStep]?.done?.(tutCtx)) return;
    const id = setTimeout(
      () => gotoStep(Math.min(tutStep + 1, TUTORIAL.length - 1)),
      550,
    );
    return () => clearTimeout(id);
  }, [tutStep, tutCtx, gotoStep]);

  const selected = state && selectedId ? SITE_BY_ID[selectedId] : null;

  const hotList = useMemo(() => (state ? hottestSectors(state, 4) : []), [state]);

  // --- title / race select -------------------------------------------------
  if (!state) return <TitleScreen onStart={start} />;

  const race = RACES[state.race];

  // --- end of run ----------------------------------------------------------
  if (state.phase !== "playing") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="paper-card p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-spot">
            {state.phase === "won" ? "Licencia renovada" : "Edición final"}
          </div>
          <div className="rule-thick my-2" />
          <h1 className="display press text-[34px] leading-none">
            {state.phase === "won" ? "QUOTA MET" : "DISCLOSURE"}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink2">{state.ending}</p>
          <div className="mono mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div>Nights survived: {state.night}</div>
            <div>Disclosure: {state.disclosure.toFixed(0)}%</div>
            <div>
              {race.goalLabel}: {Math.round(state.goal)}/{state.goalTarget}
            </div>
            <div>Semilla: {seedLabel(state.seed)}</div>
          </div>
          <button
            className="slab slab-dark mt-5 w-full px-3 py-2.5"
            onClick={abandonRun}
          >
            Start another operation
          </button>
        </div>
      </div>
    );
  }

  const routesPanel = (
    <div className="flex flex-col gap-2">
      <SectionTitle>
        Rutas {state.routes.length}/{race.maxRoutes}
      </SectionTitle>
      {state.routes.length === 0 && (
        <p className="text-[13px] leading-snug text-ink2">
          Nada conectado. Elija un sitio en el mapa y pulse{" "}
          <em>conectar una ruta desde aquí</em>, y luego elija {SITE_BY_ID[race.homeId].name}
          {state.race === "mantid" ? " or a lab" : ""} como destino.
        </p>
      )}
      {state.routes.map((r) => (
        <RouteRow
          key={r.id}
          state={state}
          route={r}
          onReconfigure={(id, patch) => setState((s) => (s ? reconfigureRoute(s, id, patch) : s))}
          onToggle={(id) => setState((s) => (s ? toggleRoutePaused(s, id) : s))}
          onRemove={(id) => setState((s) => (s ? removeRoute(s, id) : s))}
        />
      ))}
    </div>
  );

  const worldPanel = (
    <div className="flex flex-col gap-3">
      <div>
        <SectionTitle>Estados más sospechosos</SectionTitle>
        <div className="mono mt-1.5 flex flex-col gap-1 text-[11px]">
          {hotList.map((h) => (
            <div key={h.code} className="flex items-center gap-2">
              <span className="w-7">{h.code}</span>
              <div className="h-2 flex-1 border border-rule bg-paper">
                <div
                  className={h.suspicion > 45 ? "h-full bg-spot" : "h-full bg-ink"}
                  style={{ width: `${Math.min(100, h.suspicion)}%` }}
                />
              </div>
              <span className="w-7 text-right">{Math.round(h.suspicion)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Reputación</SectionTitle>
        <div className="mt-1.5">
          <Reputacións state={state} />
        </div>
      </div>
      <div>
        <SectionTitle>Esta partida</SectionTitle>
        <div className="paper-card mt-1.5 p-2">
          <div className="mono text-[10px] text-ink3">
            Semilla {seedLabel(state.seed)} · noche {state.night} · {race.name}
          </div>
          <button
            className="slab mt-1.5 w-full px-2 py-1.5 text-[12px]"
            onClick={() => {
              if (confirm("¿Abandonar esta partida y volver al inicio?")) abandonRun();
            }}
          >
            Abandonar partida — start over
          </button>
        </div>
      </div>
      <div>
        <SectionTitle>El registro</SectionTitle>
        <div className="mt-1.5">
          <Ledger state={state} />
        </div>
      </div>
    </div>
  );

  const mapPanel = (
    <div className="flex flex-col gap-2">
      <UsMap
        state={state}
        selectedId={selectedId}
        onSelect={(id) => {
          if (linkFrom && id && id !== linkFrom) completeLink(id);
          else setSelectedId(id);
        }}
        linkFrom={linkFrom}
        legalTargets={legalTargets}
      />
      {linkFrom && (
        <div className="mono border border-spot bg-paper2 px-2 py-1.5 text-[11px] text-spot">
          Wiring from {SITE_BY_ID[linkFrom].name} — tap a ringed destination.
          {legalTargets && legalTargets.size === 0 && " Nowhere legal to deliver."}
          {notice && <div className="mt-0.5 font-bold">{notice}</div>}
        </div>
      )}
      {!linkFrom && notice && (
        <div className="mono border border-rule bg-paper2 px-2 py-1.5 text-[11px]">{notice}</div>
      )}
      {selected ? (
        <SiteInspector
          state={state}
          site={selected}
          linkFrom={linkFrom}
          onStartLink={(id) => { setLinkFrom(id); setNotice(null); }}
          onCancelLink={() => { setLinkFrom(null); setNotice(null); }}
          onCompleteLink={completeLink}
          onBuildLab={(id) => setState((s) => (s ? buildLab(s, id) : s))}
        />
      ) : (
        <p className="text-[13px] leading-snug text-ink2">
          Toque un sitio para inspeccionarlo. Pellizque o use la rueda para acercar; arrastre para desplazar.
        </p>
      )}
    </div>
  );

  return (
    <div className={`mx-auto flex min-h-svh max-w-6xl flex-col gap-2 p-2 sm:p-3 ${tutStep !== null ? "pb-64 lg:pb-3" : ""}`}>
      <Hud
        state={state}
        speed={speed}
        onSpeed={setSpeed}
        onToggleTheme={toggleTheme}
        onAbandon={() => setAskAbandon(true)}
        highlight={tutStep !== null ? TUTORIAL[tutStep]?.highlight : undefined}
      />

      {/*
        One tree, two layouts. A panel shows when its tab is selected OR when
        the viewport is wide enough to show everything at once.

        This used to be two sibling branches — `hidden lg:grid` and `lg:hidden`
        — which meant React mounted every panel twice, including the whole
        65-site map, and re-rendered both copies on every tick. Only one was
        ever visible; the other sat there measuring 0x0 and doing the work
        anyway.
      */}
      <div className="gap-3 lg:grid lg:grid-cols-[1fr_340px]">
        <div className={`flex-col gap-2 lg:flex ${tab === "map" ? "flex" : "hidden"}`}>
          {mapPanel}
        </div>
        <div className="rail flex flex-col gap-3 lg:max-h-[78vh] lg:overflow-y-auto lg:pr-1">
          <div className={`lg:block ${tab === "routes" ? "block" : "hidden"}`}>{routesPanel}</div>
          <div className={`lg:block ${tab === "hangar" ? "block" : "hidden"}`}>
            {/* The mobile tab bar already says "Hangar"; the heading is only
                needed on desktop, where all three panels share the rail. */}
            <div className="hidden lg:block">
              <SectionTitle>Hangar</SectionTitle>
            </div>
            <div className="lg:mt-1.5">
              <Hangar state={state} onBuy={(id) => setState((s) => (s ? buyCraft(s, id) : s))} />
            </div>
          </div>
          <div className={`lg:block ${tab === "world" ? "block" : "hidden"}`}>{worldPanel}</div>
        </div>
      </div>

      {/* Mobile tab bar, thumb height, always reachable. */}
      <nav className="sticky bottom-0 z-30 -mx-2 -mb-2 mt-auto grid grid-cols-4 border-t-2 border-rule bg-paper2 lg:hidden">
        {(
          [
            ["map", "Mapa"],
            ["routes", `Rutas ${state.routes.length}`],
            ["hangar", "Hangar"],
            ["world", "Mundo"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id}
            className={`mono min-h-11 border-r border-ink py-2.5 text-[10px] uppercase tracking-wider last:border-r-0 ${
              tab === id ? "bg-ink text-paper" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {askAbandon && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] p-0 sm:items-center sm:p-4">
          <div className="slam paper-card w-full max-w-sm p-3">
            <div className="display press text-[19px] leading-tight">¿Abandonar esta partida?</div>
            <p className="mt-1.5 text-[13px] leading-snug text-ink2">
              Night {state.night} and {Math.round(state.disclosure)}% disclosed. The run is
              deleted and you go back to the title screen.
            </p>
            <div className="mt-2.5 flex gap-1.5">
              <button className="slab slab-spot px-3 py-2.5 text-[13px]" onClick={abandonRun}>
                Abandonar partida
              </button>
              <button
                className="slab px-3 py-2.5 text-[13px]"
                onClick={() => setAskAbandon(false)}
              >
                Seguir jugando
              </button>
            </div>
          </div>
        </div>
      )}

      {tutStep !== null && tutCtx && (
        <Coach
          step={tutStep}
          ctx={tutCtx}
          onNext={() => gotoStep(tutStep + 1 >= TUTORIAL.length ? null : tutStep + 1)}
          onSkip={() => gotoStep(null)}
        />
      )}

      {state.pending && (
        <Newspaper
          event={state.pending}
          state={state}
          onChoose={(i) => setState((s) => (s ? chooseOption(s, i) : s))}
          onPass={() => setState((s) => (s ? passEvent(s) : s))}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Title + race select
// ---------------------------------------------------------------------------
