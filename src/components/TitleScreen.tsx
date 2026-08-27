"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RaceId } from "@/game/types";
import type { ContentPack } from "@/game/content";
import { seedLabel } from "@/game/rng";
import { CraftArt } from "./game/PixelArt";
import Mark from "./Mark";

/**
 * Every word on the screen. The two editions differ only in their content pack
 * and this object — the layout below is shared, because they had drifted into
 * two near-identical 250-line files.
 */
export type TitleCopy = {
  sector: string;
  wordmark: string;
  pitch: string;
  era: string;
  choose: string;
  chosen: string;
  routes: string;
  noise: string;
  disclosure: string;
  base: string;
  capital: string;
  target: string;
  guidedTitle: string;
  guidedBody: string;
  seed: string;
  seedPlaceholder: string;
  seedAria: string;
  /** e.g. "24 authored events · 13,741 realisations · 61 sites · 92 states" */
  meta: (p: ContentPack) => string;
  seedNote: string;
  cta: string;
  altHref: string;
  altLabel: string;
  /** Number formatting differs between editions. */
  locale: string;
};

/** The silhouette each operation is recognised by. */
const SIGNATURE_HULL: Record<RaceId, string> = {
  grey: "scout",
  nordic: "liner",
  mantid: "triangle",
};

/** Module scope: rolling a seed is impure and must not happen during render. */
function rollSeed(typed: number | null): number {
  return typed ?? ((Math.random() * 0xffffffff) >>> 0);
}

export default function TitleScreen({
  pack,
  copy,
  onStart,
}: {
  pack: ContentPack;
  copy: TitleCopy;
  onStart: (r: RaceId, seed: number, tutorial: boolean) => void;
}) {
  const [seedText, setSeedText] = useState("");
  const [tutorial, setTutorial] = useState(true);
  const [picked, setPicked] = useState<RaceId>("grey");

  // A typed seed hashes deterministically; an empty box means "roll one at
  // click time". It must not be rolled during render — the server and the
  // client would disagree and hydration would fail.
  const typedSeed = useMemo(() => {
    if (!seedText.trim()) return null;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedText.length; i++) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }, [seedText]);

  const races = pack.races;
  const race = races[picked];
  const playable: RaceId[] = ["grey", "nordic", "mantid"];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
      <header className="rise text-center" style={{ ["--d" as string]: "0ms" }}>
        <div className="mono text-[11px] uppercase tracking-[0.34em] text-ink3">
          {copy.sector}
        </div>
        <div className="mt-5 flex items-center justify-center gap-4 sm:gap-5">
          <Mark className="h-9 w-auto shrink-0 text-cyan drop-shadow-[0_0_10px_var(--cyan)] sm:h-12" />
          <h1 className="display press text-[clamp(30px,8.2vw,66px)] leading-[0.86]">
            {copy.wordmark}
          </h1>
        </div>
        <div className="rule-thick mx-auto mt-5 max-w-md" />
        <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-ink2">
          {copy.pitch}
        </p>
        <div className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-ink3">
          {copy.era}
        </div>
      </header>

      <div
        className="mono rise mt-14 text-center text-[11px] uppercase tracking-[0.3em] text-ink3"
        style={{ ["--d" as string]: "90ms" }}
      >
        {copy.choose}
      </div>

      <div
        className="rise mt-4 grid items-stretch gap-3 sm:grid-cols-3"
        style={{ ["--d" as string]: "150ms" }}
      >
        {playable.map((id) => {
          const r = races[id];
          const on = id === picked;
          return (
            <button
              key={id}
              onClick={() => setPicked(id)}
              aria-pressed={on}
              className={`paper-card flex h-full flex-col px-5 py-5 text-left transition-all duration-200 ${
                on
                  ? "border-cyan bg-paper3/70 shadow-[0_0_0_2px_var(--cyan),0_0_18px_-2px_var(--cyan),inset_0_0_22px_-14px_var(--cyan)]"
                  : "opacity-[0.82] hover:border-ink3 hover:opacity-100"
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
                    ✓ {copy.chosen}
                  </span>
                )}
              </div>

              <div
                className={`mt-3 flex h-[74px] items-center justify-center border border-rule/60 bg-paper/40 px-2 transition-opacity ${
                  on ? "" : "opacity-80"
                }`}
              >
                <CraftArt defId={SIGNATURE_HULL[id]} className="h-[54px] w-auto" />
              </div>

              <div className="display press mt-3 text-[25px] leading-[1.05] sm:min-h-[2.1em]">
                {r.name}
              </div>
              <div className="mono mt-2 text-[12px] italic leading-snug text-spot sm:min-h-[2.6em]">
                {r.tagline}
              </div>
              <dl className="mono mt-auto grid grid-cols-3 gap-2 border-t border-rule pt-3 text-[11px]">
                <div>
                  <dt className="text-ink3">{copy.routes}</dt>
                  <dd className="mt-0.5 text-[15px]">{r.maxRoutes}</dd>
                </div>
                <div>
                  <dt className="text-ink3">{copy.noise}</dt>
                  <dd className="mt-0.5 text-[15px]">×{r.noiseMul}</dd>
                </div>
                <div>
                  <dt className="text-ink3">{copy.disclosure}</dt>
                  <dd className="mt-0.5 text-[15px]">{r.startDisclosure}%</dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>

      <section key={picked} className="slam paper-card mt-3 px-6 py-7 sm:px-9 sm:py-9">
        <div className="mono text-[11px] uppercase tracking-[0.22em] text-ink3">{race.caste}</div>

        <p className="mt-4 max-w-2xl text-[17px] leading-[1.65] text-ink2">{race.concept}</p>

        {/* Quadrants rather than bullets: each rule is a separate fact and reads
            better delimited than in a list that looks like prose. An odd rule
            count spans the last cell full width so the grid isn't ragged. */}
        <ul className="mt-7 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
          {race.rules.map((rule, i) => {
            const lone = race.rules.length % 2 === 1 && i === race.rules.length - 1;
            return (
              <li
                key={rule}
                className={`flex gap-3 bg-paper2 px-5 py-4 text-[15px] leading-[1.55] text-ink2 ${
                  lone ? "sm:col-span-2" : ""
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
            {copy.base}: <span className="text-ink">{pack.siteById[race.homeId].name}</span>
          </span>
          <span>
            {copy.capital}:{" "}
            <span className="text-ink">
              {race.currency.symbol} {race.startCash}
            </span>
          </span>
          <span>
            {copy.target}:{" "}
            <span className="text-ink">
              {race.goalTarget.toLocaleString(copy.locale)} · {race.goalLabel.toLowerCase()}
            </span>
          </span>
        </div>

        <button
          onClick={() => onStart(picked, rollSeed(typedSeed), tutorial)}
          className="slab slab-dark alien-cta mt-7 w-full px-6 py-4 text-[17px]"
        >
          <span>{copy.cta}</span>
        </button>
      </section>

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
              {copy.guidedTitle}
            </span>
            <span className="mt-1 block text-[14px] leading-snug text-ink3">
              {copy.guidedBody}
            </span>
          </span>
        </label>

        <label className="paper-card flex items-center gap-3 px-5 py-4">
          <span className="mono whitespace-nowrap text-[12px] uppercase tracking-[0.16em] text-ink3">
            {copy.seed}
          </span>
          <input
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            placeholder={copy.seedPlaceholder}
            aria-label={copy.seedAria}
            className="mono w-28 border-b border-rule bg-transparent pb-1 text-[14px] text-ink outline-none placeholder:text-ink3 focus:border-spot"
          />
          {typedSeed !== null && (
            <span className="mono text-[11px] text-ink3">{seedLabel(typedSeed)}</span>
          )}
        </label>
      </div>

      <p
        className="mono rise mt-10 text-center text-[11px] leading-loose tracking-wide text-ink3"
        style={{ ["--d" as string]: "300ms" }}
      >
        {copy.meta(pack)}
        <br />
        {copy.seedNote}
      </p>

      <p className="rise mt-6 text-center" style={{ ["--d" as string]: "340ms" }}>
        <Link
          href={copy.altHref}
          className="mono text-[11px] uppercase tracking-[0.2em] text-ink3 underline decoration-ink3/40 underline-offset-[6px] transition-colors hover:text-spot hover:decoration-spot"
        >
          {copy.altLabel}
        </Link>
      </p>
    </div>
  );
}
