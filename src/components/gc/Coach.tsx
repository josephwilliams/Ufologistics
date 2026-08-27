"use client";

import { TUTORIAL, type TutorialCtx } from "@/game/gc/tutorial";

/**
 * The tutorial's coach mark. Sits above the mobile tab bar and out of the way
 * on desktop. Purely advisory — it never blocks input, so a player who ignores
 * it still plays a normal game.
 */
export default function Coach({
  step,
  ctx,
  onNext,
  onSkip,
}: {
  step: number;
  ctx: TutorialCtx;
  onNext: () => void;
  onSkip: () => void;
}) {
  const s = TUTORIAL[step];
  if (!s) return null;
  const waiting = !!s.done;
  const last = step === TUTORIAL.length - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[52px] z-40 flex justify-center px-2 lg:bottom-4 lg:right-4 lg:left-auto lg:justify-end lg:px-0">
      <div className="paper-card coach pointer-events-auto w-full max-w-md border-spot p-3">
        <div className="mono flex items-center justify-between text-[9px] uppercase tracking-[0.18em]">
          <span className="neon">
            Informe {step + 1}/{TUTORIAL.length}
          </span>
          <button onClick={onSkip} className="-m-2 p-2 underline underline-offset-2 text-ink3">
            saltar
          </button>
        </div>
        <div className="display press mt-1 text-[19px] leading-tight">
          {typeof s.title === "function" ? s.title(ctx) : s.title}
        </div>
        <p className="mt-1.5 text-[13px] leading-snug text-ink2">{s.body(ctx)}</p>

        <div className="mt-2 flex items-center gap-2">
          {waiting ? (
            <span className="mono text-[10px] uppercase tracking-wider text-spot">
              ▸ esperando a que lo haga
            </span>
          ) : (
            <button onClick={onNext} className="slab slab-spot px-4 py-2.5 text-[13px]">
              {last ? "Entendido" : "Siguiente"}
            </button>
          )}
        </div>

        {/* Progress pips — cheap, and it tells you how much is left. */}
        <div className="mt-2 flex gap-0.5">
          {TUTORIAL.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 ${i <= step ? "bg-spot" : "bg-ink3/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
