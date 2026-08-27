"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MAP_W, MAP_H, STATES } from "@/game/usmap";
import { SITES, siteXY } from "@/game/sites";
import { RACES } from "@/game/races";
import type { GameState } from "@/game/types";
import { Glyph, Saucer } from "./sprites";

// Suspicion is shown as halftone density, the way a newspaper would print a tint.
const SUSPICION_BANDS = [8, 22, 38, 55, 72];

function suspicionBand(h: number): number {
  let band = 0;
  for (const t of SUSPICION_BANDS) if (h >= t) band++;
  return band; // 0..5
}

type View = { x: number; y: number; k: number };

export default function UsMap({
  state,
  selectedId,
  onSelect,
  linkFrom,
  legalTargets,
}: {
  state: GameState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** When wiring a route, the origin awaiting a destination. */
  linkFrom: string | null;
  /** Sites that would legally accept the cargo, or null when not wiring. */
  legalTargets?: Set<string> | null;
}) {
  const race = RACES[state.race];
  const wrapRef = useRef<HTMLDivElement>(null);
  const clamp = useCallback((v: View): View => {
    const k = Math.max(0.85, Math.min(6, v.k));
    // Keep at least a third of the map on screen in each axis.
    const maxX = MAP_W * 0.5;
    const minX = MAP_W - MAP_W * k - MAP_W * 0.5;
    const maxY = MAP_H * 0.5;
    const minY = MAP_H - MAP_H * k - MAP_H * 0.5;
    return {
      k,
      x: Math.max(Math.min(v.x, maxX), Math.min(minX, maxX)),
      y: Math.max(Math.min(v.y, maxY), Math.min(minY, maxY)),
    };
  }, []);

  // Phones open zoomed in near home; desktop sees the whole sector. Computed in
  // a lazy initialiser rather than an effect so there is no first-frame jump.
  // Safe to read `window` here: the map only ever mounts client-side, after a
  // race has been chosen or a save restored.
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) {
      return { x: 0, y: 0, k: 1 };
    }
    const k = 2.3;
    const [hx, hy] = siteXY(race.homeId);
    // Pull the focus inland rather than centring on the base exactly: Shasta
    // sits hard against the west coast, and centring on it fills half the
    // screen with Pacific. Mid-map bases (Roswell, Dulce) barely move.
    const INLAND_BIAS = 0.38;
    const fx = hx + (MAP_W / 2 - hx) * INLAND_BIAS;
    const fy = hy + (MAP_H / 2 - hy) * INLAND_BIAS;
    return clamp({ x: MAP_W / 2 - fx * k, y: MAP_H / 2 - fy * k, k });
  });

  // --- pointer handling: drag to pan, pinch to zoom, wheel to zoom ---------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; k: number; cx: number; cy: number } | null>(null);
  const moved = useRef(false);

  const toLocal = (e: React.PointerEvent | React.WheelEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const scale = MAP_W / r.width;
    return { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
  };

  /**
   * Which site is under a point, in post-transform viewBox units. Selection is
   * resolved here rather than by per-site pointer handlers: those needed
   * stopPropagation to work, which stopped the wrapper ever seeing pointerup
   * and left the pointer permanently "down", panning the map forever.
   */
  const pickSiteAt = (local: { x: number; y: number }): string | null => {
    const mx = (local.x - view.x) / view.k;
    const my = (local.y - view.y) / view.k;
    // A ~20 CSS px hit radius, held constant across zoom AND screen width.
    // The old fixed viewBox threshold scaled with the container, which came out
    // under 6px on a phone: glyphs draw at ~5px, so a finger had to land almost
    // exactly on the dot to register.
    const w = wrapRef.current?.getBoundingClientRect().width ?? MAP_W;
    const radius = (20 * (MAP_W / w)) / view.k;
    let best: string | null = null;
    let bestD = radius * radius;
    for (const site of SITES) {
      const [sx, sy] = siteXY(site.id);
      const d = (sx - mx) ** 2 + (sy - my) ** 2;
      if (d < bestD) {
        bestD = d;
        best = site.id;
      }
    }
    return best;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Capture on the wrapper, which never unmounts mid-drag. Capturing on
    // e.target grabs a glyph child that re-renders every tick.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, toLocal(e));
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(b.x - a.x, b.y - a.y),
        k: view.k,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = toLocal(e);

    if (pointers.current.size === 2 && pinch.current) {
      pointers.current.set(e.pointerId, cur);
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const k = pinch.current.k * (d / pinch.current.dist);
      const { cx, cy } = pinch.current;
      setView((v) => {
        const nk = Math.max(0.85, Math.min(6, k));
        return clamp({
          k: nk,
          x: cx - ((cx - v.x) / v.k) * nk,
          y: cy - ((cy - v.y) / v.k) * nk,
        });
      });
      moved.current = true;
      return;
    }

    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 1.5) moved.current = true;
    pointers.current.set(e.pointerId, cur);
    setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const had = pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    // A tap, not a drag: resolve what was under the finger.
    if (had && !moved.current && pointers.current.size === 0) {
      onSelect(pickSiteAt(toLocal(e)));
    }
  };

  /** Safety net: if capture is lost we would otherwise pan forever. */
  const onLostCapture = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const { x, y } = toLocal(e);
    setView((v) => {
      const nk = Math.max(0.85, Math.min(6, v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      return clamp({ k: nk, x: x - ((x - v.x) / v.k) * nk, y: y - ((y - v.y) / v.k) * nk });
    });
  };

  // --- what to draw --------------------------------------------------------
  const routeLines = useMemo(
    () =>
      state.routes.map((r) => {
        const [ax, ay] = siteXY(r.fromId);
        const [bx, by] = siteXY(r.toId);
        // Craft position along the leg it is currently flying.
        const t = r.outbound ? r.progress : 1 - r.progress;
        return {
          r,
          ax,
          ay,
          bx,
          by,
          cx: ax + (bx - ax) * t,
          cy: ay + (by - ay) * t,
        };
      }),
    [state.routes],
  );

  const wiredIds = useMemo(() => {
    const s = new Set<string>();
    for (const r of state.routes) {
      s.add(r.fromId);
      s.add(r.toId);
    }
    return s;
  }, [state.routes]);

  // Sprites shrink as you zoom in so they stay a sane size on screen.
  const spriteScale = 1.5 / Math.sqrt(view.k);

  return (
    <div
      ref={wrapRef}
      className="relative w-full touch-none select-none overflow-hidden border border-rule bg-paper2"
      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onLostCapture}
      onLostPointerCapture={onLostCapture}
      onWheel={onWheel}
    >
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Operations map of the contiguous United States"
      >
        <defs>
          {/* Halftone tints, coarse to dense, for the suspicion overlay. */}
          {[1, 2, 3, 4, 5].map((b) => (
            <pattern
              key={b}
              id={`ht${b}`}
              width={7}
              height={7}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={3.5} cy={3.5} r={0.5 + b * 0.42} fill={`var(--suspicion-${b})`} />
            </pattern>
          ))}
          <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="paperGrain" width={5} height={5} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.35} fill="var(--ink-3)" opacity={0.12} />
          </pattern>
        </defs>

        <rect width={MAP_W} height={MAP_H} fill="var(--paper)" />
        <rect width={MAP_W} height={MAP_H} fill="url(#paperGrain)" />

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* States: outline, then a halftone tint proportional to suspicion. */}
          {STATES.map((st) => {
            const h = state.suspicion[st.code] ?? 0;
            const band = suspicionBand(h);
            return (
              <g key={st.code}>
                <path d={st.d} fill="var(--map-land)" stroke="var(--map-edge)" strokeWidth={0.6} />
                {band > 0 && <path d={st.d} fill={`url(#ht${band})`} opacity={0.85} />}
                {h > 72 && (
                  <path
                    d={st.d}
                    fill="none"
                    stroke="var(--suspicion-5)"
                    strokeWidth={1.4}
                    className="alarm"
                    filter="url(#neonGlow)"
                  />
                )}
              </g>
            );
          })}

          {/* Routes. */}
          {routeLines.map(({ r, ax, ay, bx, by, cx, cy }) => (
            <g key={r.id}>
              <line
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                stroke={r.paused ? "var(--ink-3)" : "var(--cyan)"}
                strokeWidth={r.paused ? 0.8 : 1.5}
                strokeDasharray={r.paused ? "2 5" : "7 5"}
                className={r.paused ? "" : "route-live"}
                opacity={r.paused ? 0.45 : 0.95}
                filter={r.paused ? undefined : "url(#neonGlow)"}
              />
              {!r.paused && (
                <g transform={`translate(${cx} ${cy})`} filter="url(#neonGlow)">
                  <Saucer scale={spriteScale * 0.85} />
                </g>
              )}
            </g>
          ))}

          {/* A route being wired: rubber-band from the chosen origin. */}
          {linkFrom && (
            <circle
              cx={siteXY(linkFrom)[0]}
              cy={siteXY(linkFrom)[1]}
              r={11 * spriteScale}
              fill="none"
              stroke="var(--spot)"
              strokeWidth={1.6}
              className="alarm"
            />
          )}

          {/* Sites. */}
          {SITES.map((site) => {
            const [x, y] = siteXY(site.id);
            const st = state.sites[site.id];
            const selected = selectedId === site.id;
            const wired = wiredIds.has(site.id);
            const dim = st.locked || st.spoiled;
            return (
              <g
                key={site.id}
                transform={`translate(${x} ${y})`}
                opacity={dim ? 0.34 : legalTargets && !legalTargets.has(site.id) && site.id !== linkFrom ? 0.35 : 1}
                style={{ cursor: "pointer" }}
                pointerEvents="none"
              >
                {legalTargets?.has(site.id) && (
                  <circle
                    r={12 * spriteScale}
                    fill="none"
                    stroke="var(--acid)"
                    strokeWidth={1.8}
                    strokeDasharray="3 2"
                    className="route-live"
                    filter="url(#neonGlow)"
                  />
                )}
                {(selected || wired) && (
                  <circle
                    r={9 * spriteScale}
                    fill="var(--paper)"
                    stroke={selected ? "var(--acid)" : "var(--ink-3)"}
                    strokeWidth={selected ? 1.6 : 0.7}
                    filter={selected ? "url(#neonGlow)" : undefined}
                  />
                )}
                <Glyph kind={site.kind} scale={spriteScale} />
                {st.isLab && (
                  <rect
                    x={-9 * spriteScale}
                    y={-9 * spriteScale}
                    width={18 * spriteScale}
                    height={18 * spriteScale}
                    fill="none"
                    stroke="var(--spot)"
                    strokeWidth={1.1}
                  />
                )}
                {selected && (
                  <text
                    y={-13 * spriteScale}
                    textAnchor="middle"
                    className="mono"
                    fontSize={9 / Math.sqrt(view.k)}
                    fill="var(--ink)"
                    stroke="var(--paper)"
                    strokeWidth={2.4}
                    paintOrder="stroke"
                  >
                    {site.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls — thumb-reachable, and the only affordance on a phone. */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        {[
          ["+", 1.35],
          ["−", 1 / 1.35],
        ].map(([label, f]) => (
          <button
            key={label as string}
            aria-label={label === "+" ? "Zoom in" : "Zoom out"}
            className="slab mono h-9 w-9 text-lg leading-none"
            onClick={() =>
              setView((v) =>
                clamp({
                  k: v.k * (f as number),
                  x: MAP_W / 2 - ((MAP_W / 2 - v.x) / v.k) * (v.k * (f as number)),
                  y: MAP_H / 2 - ((MAP_H / 2 - v.y) / v.k) * (v.k * (f as number)),
                }),
              )
            }
          >
            {label as string}
          </button>
        ))}
        <button
          aria-label="Fit whole map"
          className="slab mono h-9 w-9 text-[10px] leading-none"
          onClick={() => setView({ x: 0, y: 0, k: 1 })}
        >
          FIT
        </button>
      </div>
    </div>
  );
}
