"use client";

import type { GameState } from "@/game/types";
import { RACES } from "@/game/gc/races";
import { nightlyNet, totalSuspicion, statesOverAlarm, ALARM } from "@/game/engine";
import { datelineFor } from "@/game/gc/events";

/** Full-scale for the nationwide suspicion bar: 48 states, and anything past
 *  roughly a third of that is a map in real trouble. Display only — the loss
 *  condition is Divulgación, and the alarm line lives in TUNE. */
const SUSPICION_SCALE = 900;
const SUSPICION_DANGER = 600;
/** Divulgación is a percentage; flag it once it is closer to 100 than to 0. */
const DISCLOSURE_DANGER = 65;

function Meter({
  label,
  value,
  max,
  danger,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  danger?: boolean;
  /** Unit shown after the number, e.g. "%" for the percentage meters. */
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="min-w-0 flex-1">
      <div className="mono flex items-baseline justify-between text-[9px] uppercase tracking-[0.14em]">
        <span>{label}</span>
        <span className={danger ? "text-spot neon" : ""}>
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-0.5 h-2 border border-rule bg-paper">
        <div
          className={`h-full ${danger ? "bg-spot" : "bg-cyan"}`}
          style={{
            width: `${pct}%`,
            boxShadow: danger ? "0 0 8px var(--spot)" : "0 0 6px var(--cyan)",
          }}
        />
      </div>
    </div>
  );
}

export default function Hud({
  state,
  speed,
  onSpeed,
  onToggleTheme,
  onAbandon,
  highlight,
}: {
  state: GameState;
  speed: number;
  onSpeed: (s: number) => void;
  onToggleTheme: () => void;
  onAbandon: () => void;
  /** Tutorial pointer target. */
  highlight?: "speed" | "map" | "routes" | "meters";
}) {
  const race = RACES[state.race];
  const net = nightlyNet(state);
  const suspicion = totalSuspicion(state);
  const over = statesOverAlarm(state);

  return (
    <div className="border border-rule bg-paper2">
      <div className="flex items-center justify-between gap-1 px-2.5 pt-2">
        <div className="min-w-0">
          <div className="display press truncate text-[14px] leading-none sm:text-[17px]">
            UFOLOGÍSTICA
          </div>
          <div className="mono mt-0.5 truncate text-[9px] uppercase tracking-[0.14em] text-ink3">
            {race.name} · noche {state.night} · {datelineFor(state.night)}
          </div>
        </div>
        <div
          className={`flex shrink-0 ${highlight === "speed" ? "coach rounded-sm" : ""}`}
        >
          <button
            onClick={onAbandon}
            aria-label="Abandonar partida y volver al inicio"
            title="Partida nueva"
            className="slab mono h-9 min-w-8 text-[11px]"
          >
            ⟲
          </button>
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar edición"
            title="Edición noche / día"
            className="slab mono mr-0.5 h-9 min-w-8 text-[9px]"
          >
            <span className="night-only">◐</span>
            <span className="day-only">◑</span>
          </button>
          {[
            [0, "❚❚"],
            [1, "▶"],
            [2, "▶▶"],
            [3, "▶▶▶"],
          ].map(([v, label]) => (
            <button
              key={v as number}
              onClick={() => onSpeed(v as number)}
              aria-label={v === 0 ? "Pausa" : `Velocidad ${v}`}
              aria-pressed={speed === v}
              className={`slab mono h-9 min-w-8 text-[9px] ${speed === v ? "slab-dark" : ""}`}
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>

      <div className="rule-thin mx-2.5 my-2" />

      <div className="grid grid-cols-3 gap-2 px-2.5 pb-1">
        <div>
          <div className="mono text-[9px] uppercase tracking-[0.14em] text-ink3">
            {race.currency.name}
          </div>
          <div className="mono text-[15px] font-bold leading-tight">
            {race.currency.symbol} {Math.round(state.cash)}
          </div>
          <div
            className={`mono text-[9px] ${net < 0 ? "text-spot" : "text-ink3"}`}
            title="Neto por noche de las rutas activas, ya descontado el mantenimiento"
          >
            {net >= 0 ? "+" : ""}
            {net.toFixed(1)}/noche
          </div>
        </div>
        <div>
          <div className="mono text-[9px] uppercase tracking-[0.14em] text-ink3">Reputación</div>
          <div className="mono text-[15px] font-bold leading-tight">
            ✦ {Math.round(state.standing)}
          </div>
          <div className="mono text-[9px] text-ink3">Federación</div>
        </div>
        <div>
          <div className="mono text-[9px] uppercase tracking-[0.14em] text-ink3">
            {race.goalLabel}
          </div>
          <div className="mono text-[15px] font-bold leading-tight">
            {Math.round(state.goal)}
            <span className="text-ink3">/{state.goalTarget}</span>
          </div>
          <div className="mono text-[9px] text-ink3">
            {Math.round((state.goal / state.goalTarget) * 100)}% de la cuota
          </div>
        </div>
      </div>

      <div className={`flex gap-3 px-2.5 pb-2.5 pt-1 ${highlight === "meters" ? "coach" : ""}`}>
        <Meter
          label="Divulgación"
          value={state.disclosure}
          max={100}
          danger={state.disclosure > DISCLOSURE_DANGER}
          suffix="%"
        />
        <Meter
          label="Sospecha (nacional)"
          value={suspicion}
          max={SUSPICION_SCALE}
          danger={suspicion > SUSPICION_DANGER}
        />
      </div>

      {/* Mantid's standing order. It rotates mid-run, so it has to be visible
          at all times or the matching puzzle is guesswork. */}
      {state.race === "mantid" && state.demands.length > 0 && (
        <div className="mono px-2.5 pb-1 text-[9px] uppercase tracking-[0.14em]">
          <span className="text-ink3">El Directorio pide </span>
          <span className="text-spot">{state.demands.join(" · ")}</span>
        </div>
      )}

      {/* The one rule that decides the run, stated plainly. Divulgación only
          climbs on its own while a state sits past the alarm line. */}
      <div className="mono px-2.5 pb-2 text-[9px] uppercase tracking-[0.14em]">
        {over.length === 0 ? (
          <span className="text-ink3">
            Ningún estado supera {ALARM} de sospecha · divulgación estable
          </span>
        ) : (
          <span className="text-spot">
            {over.length} estado{over.length > 1 ? "s" : ""} supera {ALARM} —{" "}
            {over.slice(0, 4).join(" ")}
            {over.length > 4 ? "…" : ""} · divulgación subiendo
          </span>
        )}
      </div>
    </div>
  );
}
