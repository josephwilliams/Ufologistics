"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RaceId } from "@/game/types";
import { RACES, PLAYABLE } from "@/game/gc/races";
import { DECK_STATS } from "@/game/gc/events";
import { SITES } from "@/game/gc/sites";
import { STATES } from "@/game/gc/map";
import { seedLabel } from "@/game/rng";

/** Module scope: rolling a seed is impure and must not happen during render. */
function rollSemilla(typed: number | null): number {
  return typed ?? ((Math.random() * 0xffffffff) >>> 0);
}

export default function TitleScreen({
  onStart,
}: {
  onStart: (r: RaceId, seed: number, tutorial: boolean) => void;
}) {
  const [seedText, setSemillaText] = useState("");
  const [tutorial, setTutorial] = useState(true);

  // A typed seed hashes deterministically; an empty box means "roll one at
  // click time". It must not be rolled during render — the server and the
  // client would disagree and hydration would fail.
  const typedSemilla = useMemo(() => {
    if (!seedText.trim()) return null;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedText.length; i++) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }, [seedText]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <header className="text-center">
        <div className="mono text-[10px] uppercase tracking-[0.3em] text-ink3">
          Sector 4 · Gran Colombia · desde noviembre de 1954
        </div>
        <div className="rule-thick my-2" />
        <h1 className="display press text-[42px] leading-[0.86] sm:text-[76px]">
          UFOLOGÍSTICA
        </h1>
        <div className="rule-thick my-2" />
        <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-ink2 sm:text-[16px]">
          Usted dirige la operación secreta de carga de la Tierra sobre el Sector 4. Conecte
          rutas, mueva carga y evite que los periódicos entiendan qué es usted. El año pasado,
          en las afueras de Caracas, dos hombres declararon que algo intentó subirlos a una
          nave. Desde entonces medio continente mira al cielo.
        </p>
      </header>

      <div className="mt-5 flex justify-center">
        <label className="paper-card mono flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[12px]">
          <input
            type="checkbox"
            checked={tutorial}
            onChange={(e) => setTutorial(e.target.checked)}
            className="h-4 w-4 accent-[var(--spot)]"
          />
          <span>
            <span className="uppercase tracking-wider">Primera partida guiada</span>
            <span className="block text-[10px] text-ink3">
              Un informe de once pasos que le acompaña mientras conecta su primera ruta.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {PLAYABLE.map((id) => {
          const r = RACES[id];
          return (
            <div key={id} className="paper-card flex flex-col p-3">
              <div className="mono text-[9px] uppercase tracking-[0.18em] text-ink3">
                {r.caste}
              </div>
              <h2 className="display press mt-0.5 text-[24px] leading-none">{r.name}</h2>
              <div className="mono mt-1 text-[11px] italic text-spot">{r.tagline}</div>
              <div className="rule-thin my-2" />
              <p className="text-[13px] leading-snug text-ink2">{r.concept}</p>
              <ul className="mt-2 flex flex-1 flex-col gap-1">
                {r.rules.map((rule, i) => (
                  <li key={i} className="flex gap-1.5 text-[12px] leading-snug">
                    <span className="mono text-spot">▪</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mono mt-2 grid grid-cols-2 gap-1 border-t border-ink pt-2 text-[10px]">
                <span>Inicio: {r.currency.symbol} {r.startCash}</span>
                <span>Rutas: {r.maxRoutes}</span>
                <span>Sospecha: ×{r.noiseMul}</span>
                <span>Divulgación: {r.startDisclosure}%</span>
              </div>
              <button
                className="slab slab-dark mt-2.5 w-full px-3 py-2.5 text-[14px]"
                onClick={() => onStart(id, rollSemilla(typedSemilla), tutorial)}
              >
                Dirigir esta operación
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <label className="mono flex items-center gap-2 text-[11px] uppercase tracking-wider">
          Semilla
          <input
            value={seedText}
            onChange={(e) => setSemillaText(e.target.value)}
            placeholder="al azar"
            className="w-40 border border-rule bg-paper px-2 py-1 text-[12px] normal-case tracking-normal"
          />
          <span className="text-ink3">{typedSemilla === null ? "rolled at start" : seedLabel(typedSemilla)}</span>
        </label>
        <p className="mono text-center text-[10px] leading-relaxed text-ink3">
          {DECK_STATS.defs} eventos escritos ·{" "}
          {DECK_STATS.variants.toLocaleString("es")} realizaciones distintas · {SITES.length} sitios ·{" "}
          {STATES.length} estados
          <br />
          La misma semilla reproduce el mismo mundo. La barra espaciadora pausa.
        </p>

        <p className="mono mt-4 text-center text-[11px] uppercase tracking-[0.18em]">
          <Link
            href="/"
            className="border-b border-spot/50 pb-0.5 text-spot transition-colors hover:border-spot"
          >
            Prefer English? → Ufologistics · Sector 7, North America
          </Link>
        </p>
      </div>
    </div>
  );
}
