"use client";

import type { GameState, RealizedEvent } from "@/game/types";
import { RACES } from "@/game/gc/races";
import { canAfford, hasAffordableChoice } from "@/game/engine";
import { EventArt } from "./PixelArt";

const TIER_KICKER = ["", "LOCAL ITEM", "REGIONAL STORY", "WIRE PICKUP", "NATIONAL FRONT PAGE"];

function Cost({ cost }: { cost?: { cash?: number; standing?: number } }) {
  if (!cost || (!cost.cash && !cost.standing)) return null;
  return (
    <span className="mono text-[11px] whitespace-nowrap">
      {cost.cash ? `−${cost.cash}` : ""}
      {cost.cash && cost.standing ? " · " : ""}
      {cost.standing ? `−${cost.standing}✦` : ""}
    </span>
  );
}

export default function Newspaper({
  event,
  state,
  onChoose,
  onPass,
}: {
  event: RealizedEvent;
  state: GameState;
  onChoose: (i: number) => void;
  onPass: () => void;
}) {
  const race = RACES[state.race];
  const stuck = !hasAffordableChoice(state);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] p-0 sm:items-center sm:p-4">
      <div className="slam paper-card max-h-[92svh] w-full max-w-xl overflow-y-auto rail sm:max-h-[88vh]">
        {/* Masthead */}
        <div className="border-b border-rule px-4 pt-3">
          <div className="mono flex items-baseline justify-between text-[10px] uppercase tracking-[0.16em]">
            <span>{event.paper}</span>
            <span>{event.dateline}</span>
          </div>
          <div className="rule-thick my-2" />
          <div className="mono mb-1 text-[10px] uppercase tracking-[0.2em] text-spot">
            {TIER_KICKER[event.tier]}
          </div>
        </div>

        <div className="px-4 py-3">
          {/* Uppercased in CSS: templates are written in caps but the {slot}
              fills are mixed case, and a headline must not be. */}
          <h2 className="display press text-[27px] uppercase leading-[0.94] sm:text-[34px]">
            {event.headline}
          </h2>
          <div className="rule-thin my-3" />
          <div className="mb-3 border border-rule bg-paper3/30 px-3 py-2">
            <EventArt tags={event.tags} className="max-h-28" />
          </div>
          <p className="dropcap text-[15px] leading-[1.45] text-ink2">{event.dek}</p>
        </div>

        <div className="rule-thin mx-4" />

        {/* Choices set as a column of classified-ad slabs. */}
        <div className="flex flex-col gap-2 p-4 pt-3">
          {event.choices.map((c, i) => {
            const ok = canAfford(state, c.cost);
            return (
              <button
                key={i}
                disabled={!ok}
                onClick={() => onChoose(i)}
                className="slab w-full px-3 py-2.5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[15px] font-semibold leading-snug">{c.label}</span>
                  <Cost cost={c.cost} />
                </div>
                {c.backfire && (
                  <div className="mono mt-1 text-[10px] uppercase tracking-wider text-spot">
                    {Math.round(c.backfire.chance * 100)}% chance this goes wrong
                  </div>
                )}
                {!ok && (
                  <div className="mono mt-1 text-[10px] uppercase tracking-wider text-ink3">
                    Cannot cover it
                  </div>
                )}
              </button>
            );
          })}

          {stuck && (
            <button onClick={onPass} className="slab slab-spot w-full px-3 py-2.5 text-left">
              <span className="text-[15px] font-semibold">Dejar que corra</span>
              <div className="mono mt-1 text-[10px] uppercase tracking-wider">
                Nothing you can afford — it goes to press
              </div>
            </button>
          )}
        </div>

        <div className="mono flex items-center justify-between border-t border-rule px-4 py-2 text-[11px]">
          <span>
            {race.currency.symbol} {Math.round(state.cash)}
          </span>
          <span>✦ {Math.round(state.standing)}</span>
          <span className={state.disclosure > 70 ? "text-spot" : ""}>
            DISCLOSURE {state.disclosure.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
