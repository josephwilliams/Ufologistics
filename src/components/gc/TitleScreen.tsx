"use client";

import type { RaceId } from "@/game/types";
import { CONTENT } from "@/game/content";
import Shared, { type TitleCopy } from "../TitleScreen";

/** Sector 4. La maqueta vive en ../TitleScreen; aquí sólo van las palabras. */
const COPY: TitleCopy = {
  sector: "Sector 4 · Gran Colombia",
  wordmark: "UFOLOGÍSTICA",
  pitch:
    "Dirija la operación secreta de carga de la Tierra. Que la prensa no averigüe qué es usted.",
  era: "Desde noviembre de 1954",
  choose: "Elija su operación",
  chosen: "elegida",
  routes: "Rutas",
  noise: "Ruido",
  disclosure: "Divulg.",
  base: "Base",
  capital: "Capital inicial",
  target: "Objetivo",
  guidedTitle: "Primera partida guiada",
  guidedBody: "Once pasos que le acompañan mientras conecta su primera ruta.",
  seed: "Semilla",
  seedPlaceholder: "al azar",
  seedAria: "Semilla de la partida",
  meta: (p) =>
    `${p.deckStats.defs} eventos escritos · ${p.deckStats.variants.toLocaleString("es")} realizaciones distintas · ${p.sites.length} sitios · ${p.states.length} estados`,
  seedNote: "La misma semilla reproduce el mismo mundo. La barra espaciadora pausa.",
  cta: "Dirigir esta operación",
  altHref: "/",
  altLabel: "Prefer English? → Ufologistics · Sector 7",
  locale: "es",
};

export default function TitleScreen({
  onStart,
}: {
  onStart: (r: RaceId, seed: number, tutorial: boolean) => void;
}) {
  return <Shared pack={CONTENT.gc} copy={COPY} onStart={onStart} />;
}
