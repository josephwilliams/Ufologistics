"use client";

import type { RaceId } from "@/game/types";
import { CONTENT } from "@/game/content";
import Shared, { type TitleCopy } from "../TitleScreen";

/** Sector 7. The layout lives in ../TitleScreen; this is only the English deck. */
const COPY: TitleCopy = {
  sector: "Sector 7 · North America",
  wordmark: "UFOLOGISTICS",
  pitch: "Run Earth's secret freight operation. Don't let the papers work out what you are.",
  era: "From July 1947",
  choose: "Choose your operation",
  chosen: "chosen",
  routes: "Routes",
  noise: "Noise",
  disclosure: "Discl.",
  base: "Base",
  capital: "Starting capital",
  target: "Target",
  guidedTitle: "Guided first run",
  guidedBody: "Eleven steps that walk you through wiring your first route.",
  seed: "Seed",
  seedPlaceholder: "random",
  seedAria: "Run seed",
  meta: (p) =>
    `${p.deckStats.defs} authored events · ${p.deckStats.variants.toLocaleString()} distinct realisations · ${p.sites.length} sites · ${p.states.length} states`,
  seedNote: "The same seed replays the same world. Space bar pauses.",
  cta: "Run this operation",
  altHref: "/gran-colombia",
  altLabel: "¿Prefiere jugar en español? → Ufologística · Gran Colombia",
  locale: "en",
};

export default function TitleScreen({
  onStart,
}: {
  onStart: (r: RaceId, seed: number, tutorial: boolean) => void;
}) {
  return <Shared pack={CONTENT.us} copy={COPY} onStart={onStart} />;
}
