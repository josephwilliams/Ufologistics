"use client";

import type { GameState, Route, Site } from "@/game/types";
import { RACES, FACTIONS, standingLabel } from "@/game/races";
import { SITE_BY_ID } from "@/game/sites";
import {
  CRAFT_BY_ID,
  CORRIDOR_BY_ID,
  CORRIDORS,
  craftFor,
  crewsFor,
} from "@/game/craft";
import { LAB_COST, deliveryValue, legNoise, routeError } from "@/game/engine";
import { PHOTOS, plateFor } from "@/game/photos";
import { CraftArt, SiteFallbackArt } from "./PixelArt";

const KIND_LABEL: Record<string, string> = {
  base: "Base",
  ranch: "Ranch",
  town: "Town",
  landmark: "Landmark",
  military: "Military",
  city: "City",
  anomaly: "Anomaly",
};

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono border-b border-rule pb-1 text-[10px] uppercase tracking-[0.2em]">
      {children}
    </div>
  );
}

/**
 * A site's halftone plate: a real public-domain photograph reduced to 1-bit
 * ordered dither, tinted by the theme via a CSS mask. Sites Commons had no
 * PD image for fall back to pixel art.
 */
function SitePlate({ siteId, name }: { siteId: string; name: string }) {
  const src = plateFor(siteId);
  const credit = PHOTOS[siteId];
  return (
    <figure className="mt-2 border border-rule bg-paper3/40">
      <div className="relative aspect-[8/5] w-full overflow-hidden">
        {src ? (
          <div
            role="img"
            aria-label={`Halftone photograph of ${name}`}
            className="plate absolute inset-0"
            style={{
              WebkitMaskImage: `url(${src})`,
              maskImage: `url(${src})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-2 opacity-70">
            <SiteFallbackArt />
          </div>
        )}
      </div>
      <figcaption className="mono truncate border-t border-rule px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-ink3">
        {credit ? `${credit.licence} · commons` : "no photograph on file"}
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Site inspector — also the route-wiring entry point.
// ---------------------------------------------------------------------------

export function SiteInspector({
  state,
  site,
  linkFrom,
  onStartLink,
  onCancelLink,
  onCompleteLink,
  onBuildLab,
}: {
  state: GameState;
  site: Site;
  linkFrom: string | null;
  onStartLink: (id: string) => void;
  onCancelLink: () => void;
  onCompleteLink: (toId: string) => void;
  onBuildLab: (id: string) => void;
}) {
  const race = RACES[state.race];
  const st = state.sites[site.id];
  const suspicion = state.suspicion[site.state] ?? 0;
  const canSource =
    !st.locked && !st.spoiled && (st.isLab || race.harvestKinds.includes(site.kind));
  const idleCraft = state.fleet.filter((c) => !c.routeId);

  const linkErr = linkFrom ? routeError(state, linkFrom, site.id, idleCraft[0]?.id ?? "") : null;

  return (
    <div className="paper-card p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="display press truncate text-[19px] leading-tight">{site.name}</div>
          <div className="mono text-[10px] uppercase tracking-[0.14em] text-ink3">
            {site.place} · {KIND_LABEL[site.kind]}
          </div>
        </div>
        <div className="mono shrink-0 text-right text-[10px]">
          <div>suspicion {Math.round(suspicion)}</div>
          <div className="text-ink3">{site.state}</div>
        </div>
      </div>

      {/* The primary action sits directly under the name. It used to live at the
          foot of the card, below a ~240px plate, which on a phone put it behind
          the tutorial's coach card — unreachable at the exact step that asks
          you to press it. */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {!linkFrom && canSource && (
          <button
            className="slab slab-dark px-3 py-2.5 text-[13px]"
            disabled={idleCraft.length === 0}
            onClick={() => onStartLink(site.id)}
          >
            {idleCraft.length ? "Wire a route from here" : "No idle craft"}
          </button>
        )}
        {linkFrom && linkFrom !== site.id && (
          <>
            <button
              className="slab slab-spot px-3 py-2.5 text-[13px]"
              disabled={!!linkErr}
              onClick={() => onCompleteLink(site.id)}
            >
              Deliver to {site.name}
            </button>
            <button className="slab px-3 py-2.5 text-[13px]" onClick={onCancelLink}>
              Cancel
            </button>
          </>
        )}
        {linkFrom === site.id && (
          <button className="slab px-3 py-2.5 text-[13px]" onClick={onCancelLink}>
            Cancel wiring
          </button>
        )}
      </div>
      {linkFrom && linkFrom !== site.id && linkErr && (
        <div className="mono mt-1.5 text-[10px] text-spot">{linkErr}</div>
      )}

      <SitePlate siteId={site.id} name={site.name} />

      <p className="mt-2 text-[13px] leading-snug text-ink2">{site.note}</p>

      <div className="mono mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
        <div className="border border-rule px-1.5 py-1">
          <div className="text-ink3">YIELD</div>
          <div className="text-[13px]">{site.yield || "—"}</div>
        </div>
        <div className="border border-rule px-1.5 py-1">
          <div className="text-ink3">APPEAL</div>
          <div className="text-[13px]">{site.appeal || "—"}</div>
        </div>
        <div className="border border-rule px-1.5 py-1">
          <div className="text-ink3">RISK</div>
          <div className="text-[13px]">×{site.risk}</div>
        </div>
      </div>

      {st.locked && (
        <div className="mono mt-2 border border-spot px-2 py-1 text-[10px] uppercase text-spot">
          Sealed — you have no way in yet
        </div>
      )}
      {st.spoiled && (
        <div className="mono mt-2 border border-spot px-2 py-1 text-[10px] uppercase text-spot">
          Spoiled — worthless to the charter now
        </div>
      )}

      {state.race === "mantid" && (
        <div className="mono mt-2 flex items-center justify-between gap-2 text-[10px]">
          <span>
            {st.isLab ? "LAB" : "no lab"} · {st.specimens.length} specimens ·{" "}
            {st.sequences.length} sequences
          </span>
          {!st.isLab && site.kind !== "base" && (
            <button
              className="slab px-2 py-1 text-[10px]"
              disabled={state.cash < LAB_COST}
              onClick={() => onBuildLab(site.id)}
            >
              Build lab ({LAB_COST})
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export function RouteRow({
  state,
  route,
  onReconfigure,
  onToggle,
  onRemove,
}: {
  state: GameState;
  route: Route;
  onReconfigure: (
    id: string,
    patch: { crewId?: string; corridorId?: string; craftId?: string },
  ) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const race = RACES[state.race];
  const craft = CRAFT_BY_ID[state.fleet.find((c) => c.id === route.craftId)?.defId ?? ""];
  const from = SITE_BY_ID[route.fromId];
  const to = SITE_BY_ID[route.toId];
  const nightsPerLeg = craft ? route.distance / craft.speed : 0;
  const value = deliveryValue(state, route);
  const suspicion = legNoise(state, route);

  return (
    <div className="paper-card p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold">
            {from.name} → {to.name}
          </div>
          <div className="mono truncate text-[10px] text-ink3">
            {craft?.name} · {route.runs} runs · {nightsPerLeg.toFixed(1)} nights/leg
          </div>
        </div>
        <div className="mono shrink-0 text-right text-[10px]">
          {state.race !== "mantid" && (
            <div>
              {race.currency.symbol}
              {value.toFixed(0)}/run
            </div>
          )}
          <div className="text-spot">+{suspicion.toFixed(1)} noise/leg</div>
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {/* Which hull flies this route. Only idle craft can be swapped in; the
            one currently assigned stays listed so the select has a value. */}
        <label className="mono col-span-2 text-[9px] uppercase tracking-wider text-ink3">
          Craft
          <select
            className="mt-0.5 block w-full border border-rule bg-paper px-1 py-1 text-[11px] normal-case tracking-normal text-ink"
            value={route.craftId}
            onChange={(e) => onReconfigure(route.id, { craftId: e.target.value })}
          >
            {state.fleet
              .filter((c) => c.id === route.craftId || !c.routeId)
              .map((c) => {
                const d = CRAFT_BY_ID[c.defId];
                return (
                  <option key={c.id} value={c.id}>
                    {d?.name ?? c.defId}
                    {c.id === route.craftId ? " (flying this)" : " (idle)"} — cargo {d?.capacity},
                    speed {d?.speed}, noise {d?.noise}
                  </option>
                );
              })}
          </select>
        </label>
        <label className="mono text-[9px] uppercase tracking-wider text-ink3">
          Crew
          <select
            className="mt-0.5 block w-full border border-rule bg-paper px-1 py-1 text-[11px] normal-case tracking-normal text-ink"
            value={route.crewId}
            onChange={(e) => onReconfigure(route.id, { crewId: e.target.value })}
          >
            {crewsFor(state.race).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — cargo ×{c.yieldMul}, noise ×{c.noiseMul}
              </option>
            ))}
          </select>
        </label>
        <label className="mono text-[9px] uppercase tracking-wider text-ink3">
          Corridor
          <select
            className="mt-0.5 block w-full border border-rule bg-paper px-1 py-1 text-[11px] normal-case tracking-normal text-ink"
            value={route.corridorId}
            onChange={(e) => onReconfigure(route.id, { corridorId: e.target.value })}
          >
            {CORRIDORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — distance ×{c.lengthMul}, noise ×{c.noiseMul}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mono mt-1 text-[10px] leading-snug text-ink3">
        {CORRIDOR_BY_ID[route.corridorId]?.blurb}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        <button className="slab px-3 py-2 text-[11px]" onClick={() => onToggle(route.id)}>
          {route.paused ? "Resume flights" : "Pause flights"}
        </button>
        <button className="slab px-3 py-2 text-[11px]" onClick={() => onRemove(route.id)}>
          Delete route
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hangar
// ---------------------------------------------------------------------------

export function Hangar({
  state,
  onBuy,
}: {
  state: GameState;
  onBuy: (defId: string) => void;
}) {
  const race = RACES[state.race];
  const idle = state.fleet.filter((c) => !c.routeId);

  return (
    <div className="flex flex-col gap-2">
      <div className="mono text-[11px]">
        {state.fleet.length} hulls · {idle.length} idle · {state.routes.length}/
        {race.maxRoutes} routes wired
      </div>
      {craftFor(state.race).map((c) => {
        const owned = state.fleet.filter((f) => f.defId === c.id).length;
        return (
          <div key={c.id} className="paper-card p-2">
            <div className="mb-1.5 border border-rule bg-paper3/30 px-2 py-1">
              <CraftArt defId={c.id} className="max-h-14" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">
                  {c.name}
                  {owned > 0 && <span className="mono text-ink3"> ×{owned}</span>}
                </div>
                <div className="mono text-[10px] text-ink3">
                  cargo {c.capacity} · speed {c.speed} · noise ×{c.noise} · upkeep {c.upkeep}
                </div>
              </div>
              <button
                className="slab shrink-0 px-2 py-1 text-[11px]"
                disabled={state.cash < c.cost}
                onClick={() => onBuy(c.id)}
              >
                {c.cost}
              </button>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-ink2">{c.blurb}</p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standing + ledger
// ---------------------------------------------------------------------------

export function Standings({ state }: { state: GameState }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.values(FACTIONS)
        .filter((f) => f.id !== state.race)
        .map((f) => {
          const v = state.factions[f.id];
          return (
            <div key={f.id} className="paper-card p-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold">{f.name}</span>
                <span
                  className={`mono text-[10px] ${v < -40 ? "text-spot" : "text-ink3"}`}
                >
                  {standingLabel(v)} ({v > 0 ? "+" : ""}
                  {Math.round(v)})
                </span>
              </div>
              <div className="mt-1 h-1.5 border border-rule bg-paper">
                <div
                  className={`h-full ${v < 0 ? "bg-spot" : "bg-ink"}`}
                  style={{
                    width: `${Math.abs(v) / 2}%`,
                    marginLeft: v < 0 ? `${50 - Math.abs(v) / 2}%` : "50%",
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] leading-snug text-ink2">{f.wants}</div>
            </div>
          );
        })}
    </div>
  );
}

export function Ledger({ state }: { state: GameState }) {
  return (
    <div className="flex flex-col gap-1">
      {state.log.map((e, i) => (
        <div key={i} className="border-b border-ink/20 pb-1 text-[12px] leading-snug">
          <span className="mono mr-1.5 text-[10px] text-ink3">N{e.night}</span>
          <span className={e.kind === "event" ? "" : "text-ink2"}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}
