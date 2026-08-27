"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RaceId } from "@/game/types";
import { RACES, PLAYABLE } from "@/game/gc/races";
import { DECK_STATS } from "@/game/gc/events";
import { SITES, SITE_BY_ID } from "@/game/gc/sites";
import { STATES } from "@/game/gc/map";
import { seedLabel } from "@/game/rng";
import { CraftArt } from "./PixelArt";
import Mark from "../Mark";

/** La silueta con la que se reconoce a cada operación en el cielo. */
const NAVE_INSIGNIA: Record<RaceId, string> = {
  grey: "scout",
  nordic: "liner",
  mantid: "triangle",
};

/** Ámbito de módulo: sortear una semilla es impuro y no puede ocurrir al pintar. */
function rollSemilla(typed: number | null): number {
  return typed ?? ((Math.random() * 0xffffffff) >>> 0);
}

/**
 * Portada de la edición Gran Colombia.
 *
 * Antes mostraba las tres razas desplegadas a la vez: concepto, cuatro o cinco
 * reglas y una tabla de cifras, por triplicado. Unas 350 palabras a 13px, y en
 * español el texto corre un 20% más largo que en inglés. Ahora la fila de
 * arriba sólo permite *elegir* — nombre, lema y tres cifras — y el expediente
 * de la raza seleccionada se abre debajo, con una medida de línea legible.
 */
export default function TitleScreen({
  onStart,
}: {
  onStart: (r: RaceId, seed: number, tutorial: boolean) => void;
}) {
  const [seedText, setSemillaText] = useState("");
  const [tutorial, setTutorial] = useState(true);
  const [picked, setPicked] = useState<RaceId>("grey");

  // Una semilla escrita se convierte en número de forma determinista; la
  // casilla vacía significa «sortear al pulsar». No puede sortearse al pintar:
  // el servidor y el cliente discreparían y la hidratación fallaría.
  const typedSemilla = useMemo(() => {
    if (!seedText.trim()) return null;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedText.length; i++) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }, [seedText]);

  const race = RACES[picked];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
      {/* --- Cabecera ---------------------------------------------------- */}
      <header className="rise text-center" style={{ ["--d" as string]: "0ms" }}>
        <div className="mono text-[11px] uppercase tracking-[0.34em] text-ink3">
          Sector 4 · Gran Colombia
        </div>
        <div className="mt-5 flex items-center justify-center gap-4 sm:gap-5">
          <Mark className="h-9 w-auto shrink-0 text-cyan drop-shadow-[0_0_10px_var(--cyan)] sm:h-12" />
          <h1 className="display press text-[clamp(30px,8.2vw,66px)] leading-[0.86]">
            UFOLOGÍSTICA
          </h1>
        </div>
        <div className="rule-thick mx-auto mt-5 max-w-md" />
        <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-ink2">
          Dirija la operación secreta de carga de la Tierra. Que la prensa no
          averigüe qué es usted.
        </p>
        <div className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-ink3">
          Desde noviembre de 1954
        </div>
      </header>

      {/* --- Elegir raza -------------------------------------------------- */}
      <div
        className="mono rise mt-14 text-center text-[11px] uppercase tracking-[0.3em] text-ink3"
        style={{ ["--d" as string]: "90ms" }}
      >
        Elija su operación
      </div>

      <div
        className="rise mt-4 grid items-stretch gap-3 sm:grid-cols-3"
        style={{ ["--d" as string]: "150ms" }}
      >
        {PLAYABLE.map((id) => {
          const r = RACES[id];
          const on = id === picked;
          return (
            <button
              key={id}
              onClick={() => setPicked(id)}
              aria-pressed={on}
              className={`paper-card flex h-full flex-col px-5 py-5 text-left transition-all duration-200 ${
                on
                  ? "border-cyan bg-paper3/70 shadow-[0_0_0_2px_var(--cyan),0_0_18px_-2px_var(--cyan),inset_0_0_22px_-14px_var(--cyan)]"
                  : "opacity-[0.82] hover:opacity-100 hover:border-ink3"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }}
                />
                <span className="mono truncate text-[10px] uppercase tracking-[0.18em] text-ink3">
                  {r.caste.split(" · ")[0]}
                </span>
                {on && (
                  <span className="mono ml-auto shrink-0 text-[10px] uppercase tracking-[0.16em] text-cyan">
                    ✓ elegida
                  </span>
                )}
              </div>
              <div
                className={`mt-3 flex h-[74px] items-center justify-center border border-rule/60 bg-paper/40 px-2 transition-opacity ${
                  on ? "" : "opacity-80"
                }`}
              >
                <CraftArt defId={NAVE_INSIGNIA[id]} className="h-[54px] w-auto" />
              </div>
              <div className="display press mt-3 text-[25px] leading-[1.05] sm:min-h-[2.1em]">
                {r.name}
              </div>
              <div className="mono mt-2 text-[12px] italic leading-snug text-spot sm:min-h-[2.6em]">
                {r.tagline}
              </div>
              <dl className="mono mt-auto grid grid-cols-3 gap-2 border-t border-rule pt-3 text-[11px]">
                <div>
                  <dt className="text-ink3">Rutas</dt>
                  <dd className="mt-0.5 text-[15px]">{r.maxRoutes}</dd>
                </div>
                <div>
                  <dt className="text-ink3">Ruido</dt>
                  <dd className="mt-0.5 text-[15px]">×{r.noiseMul}</dd>
                </div>
                <div>
                  <dt className="text-ink3">Divulg.</dt>
                  <dd className="mt-0.5 text-[15px]">{r.startDisclosure}%</dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>

      {/* --- Expediente de la raza elegida -------------------------------- */}
      <section key={picked} className="slam paper-card mt-3 px-6 py-7 sm:px-9 sm:py-9">
        <div className="mono text-[11px] uppercase tracking-[0.22em] text-ink3">
          {race.caste}
        </div>

        <p className="mt-4 max-w-2xl text-[17px] leading-[1.65] text-ink2">{race.concept}</p>

        {/* Cuadrantes, no viñetas: cada regla es un hecho independiente y se lee
            mejor delimitada que en una lista que parece prosa. Con un número
            impar de reglas, la última ocupa el ancho completo para que la
            retícula no quede desportillada. */}
        <ul className="mt-7 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
          {race.rules.map((rule, i) => {
            const solitaria = race.rules.length % 2 === 1 && i === race.rules.length - 1;
            return (
              <li
                key={rule}
                className={`flex gap-3 bg-paper2 px-5 py-4 text-[15px] leading-[1.55] text-ink2 ${
                  solitaria ? "sm:col-span-2" : ""
                }`}
              >
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-spot" />
                <span>{rule}</span>
              </li>
            );
          })}
        </ul>

        <div className="mono mt-7 flex flex-wrap gap-x-8 gap-y-2 border-t border-rule pt-4 text-[12px] text-ink3">
          <span>
            Base: <span className="text-ink">{SITE_BY_ID[race.homeId].name}</span>
          </span>
          <span>
            Capital inicial:{" "}
            <span className="text-ink">
              {race.currency.symbol} {race.startCash}
            </span>
          </span>
          <span>
            Objetivo:{" "}
            <span className="text-ink">
              {race.goalTarget.toLocaleString("es")} · {race.goalLabel.toLowerCase()}
            </span>
          </span>
        </div>

        <button
          onClick={() => onStart(picked, rollSemilla(typedSemilla), tutorial)}
          className="slab slab-dark alien-cta mt-7 w-full px-6 py-4 text-[17px]"
        >
          <span>Dirigir esta operación</span>
        </button>
      </section>

      {/* --- Ajustes de partida ------------------------------------------- */}
      <div
        className="rise mt-10 grid gap-3 sm:grid-cols-[1fr_auto]"
        style={{ ["--d" as string]: "230ms" }}
      >
        <label className="paper-card flex cursor-pointer items-start gap-3 px-5 py-4">
          <input
            type="checkbox"
            checked={tutorial}
            onChange={(e) => setTutorial(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--spot)]"
          />
          <span>
            <span className="mono block text-[12px] uppercase tracking-[0.16em]">
              Primera partida guiada
            </span>
            <span className="mt-1 block text-[14px] leading-snug text-ink3">
              Once pasos que le acompañan mientras conecta su primera ruta.
            </span>
          </span>
        </label>

        <label className="paper-card flex items-center gap-3 px-5 py-4">
          <span className="mono whitespace-nowrap text-[12px] uppercase tracking-[0.16em] text-ink3">
            Semilla
          </span>
          <input
            value={seedText}
            onChange={(e) => setSemillaText(e.target.value)}
            placeholder="al azar"
            aria-label="Semilla de la partida"
            className="mono w-28 border-b border-rule bg-transparent pb-1 text-[14px] text-ink outline-none placeholder:text-ink3 focus:border-spot"
          />
          {typedSemilla !== null && (
            <span className="mono text-[11px] text-ink3">{seedLabel(typedSemilla)}</span>
          )}
        </label>
      </div>

      {/* --- Pie ----------------------------------------------------------- */}
      <p
        className="mono rise mt-10 text-center text-[11px] leading-loose tracking-wide text-ink3"
        style={{ ["--d" as string]: "300ms" }}
      >
        {DECK_STATS.defs} eventos escritos · {DECK_STATS.variants.toLocaleString("es")}{" "}
        realizaciones distintas · {SITES.length} sitios · {STATES.length} estados
        <br />
        La misma semilla reproduce el mismo mundo. La barra espaciadora pausa.
      </p>

      <p className="rise mt-6 text-center" style={{ ["--d" as string]: "340ms" }}>
        <Link
          href="/"
          className="mono text-[11px] uppercase tracking-[0.2em] text-ink3 underline decoration-ink3/40 underline-offset-[6px] transition-colors hover:text-spot hover:decoration-spot"
        >
          Prefer English? → Ufologistics · Sector 7
        </Link>
      </p>
    </div>
  );
}
