/**
 * The stink meter — the clock, the difficulty curve and the comedy engine at
 * once (GAME_DESIGN.md §5). Everything here is pure so it can be reasoned about
 * and tested without a device.
 */

import type { StinkStage } from './types';
import {
  CROWD_DENSITY_MULTIPLIER,
  DECOY_SCAPEGOAT_RELIEF,
  DECOY_SKUNK_RELIEF,
  DECOY_SUSPICION_RELIEF,
  NOSE_FAILS_AT,
  POOF_STINK,
  STAGE_BLAME,
  STAGE_PANIC,
  STAGE_SNIFF,
  STINK_DRIFT_PER_SEC,
  STINK_MAX,
  SUSPICION_DECAY_PER_SEC,
  SUSPICION_MAX,
  SUSPICION_PER_SEC_NEAR,
} from './tuning';

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export function stageFor(stink: number): StinkStage {
  if (stink >= STAGE_PANIC) return 'panic';
  if (stink >= STAGE_BLAME) return 'blame';
  if (stink >= STAGE_SNIFF) return 'sniff';
  return 'calm';
}

/** 0–3, handy for indexing per-stage art and lines. */
export function stageIndex(stage: StinkStage): 0 | 1 | 2 | 3 {
  return stage === 'panic' ? 3 : stage === 'blame' ? 2 : stage === 'sniff' ? 1 : 0;
}

export interface StinkTick {
  /** Seconds since the last tick. */
  dt: number;
  /** Is the group standing in a knot of people? */
  crowded: boolean;
  /** Is Fluffy currently holding the crowd's attention? */
  decoyHolding: boolean;
  /** Is the group standing in fresh air? */
  inFreshAir: boolean;
}

/**
 * The meter only ever climbs on its own. Everything the player does is about
 * slowing it down or spending something to buy it back.
 */
export function advanceStink(stink: number, tick: StinkTick): number {
  if (tick.decoyHolding) return stink;

  let rate = STINK_DRIFT_PER_SEC;
  if (tick.crowded) rate *= CROWD_DENSITY_MULTIPLIER;
  // Fresh air doesn't remove the smell, it just stops it pooling.
  if (tick.inFreshAir) rate *= 0.35;

  return clamp(stink + rate * tick.dt, 0, STINK_MAX);
}

/** Gurgle gurgle. Toots got startled. */
export function applyPoof(stink: number): number {
  return clamp(stink + POOF_STINK, 0, STINK_MAX);
}

export type DecoyKind = 'scapegoat' | 'skunk';

/** Fluffy pins it on a prop, or wears the stripes and takes the fall. §7. */
export function applyDecoy(stink: number, kind: DecoyKind): number {
  const relief = kind === 'skunk' ? DECOY_SKUNK_RELIEF : DECOY_SCAPEGOAT_RELIEF;
  return clamp(stink - relief, 0, STINK_MAX);
}

export interface SuspicionTick {
  dt: number;
  /** How many people are close enough to be eyeing the group. */
  watchers: number;
  stink: number;
  decoyHolding: boolean;
}

/**
 * How close the crowd is to working out that it's the skunk. Only really moves
 * once people have started blaming things, because before that nobody is looking.
 */
export function advanceSuspicion(suspicion: number, tick: SuspicionTick): number {
  const stage = stageFor(tick.stink);
  const looking = !tick.decoyHolding && tick.watchers > 0 && (stage === 'blame' || stage === 'panic');

  if (!looking) {
    return clamp(suspicion - SUSPICION_DECAY_PER_SEC * tick.dt, 0, SUSPICION_MAX);
  }

  // Panic makes people frantic, not observant — but there are more of them looking.
  const heat = stage === 'panic' ? 1.35 : 1;
  const rise = SUSPICION_PER_SEC_NEAR * heat * Math.min(tick.watchers, 3) * tick.dt;
  return clamp(suspicion + rise, 0, SUSPICION_MAX);
}

export function applyDecoyToSuspicion(suspicion: number): number {
  return clamp(suspicion - DECOY_SUSPICION_RELIEF, 0, SUSPICION_MAX);
}

/**
 * How much Mr. Sniffsalot's nose can still be trusted, 1 down to 0. §8.
 * Fresh air overrides everything for a few glorious seconds of a perfect lock-on.
 */
export function noseAccuracy(stink: number, freshAirLockLeft: number): number {
  if (freshAirLockLeft > 0) return 1;
  return clamp(1 - stink / NOSE_FAILS_AT, 0, 1);
}

/**
 * How thick the green fog is, 0–1. It eats the top of the screen first, which is
 * where the exit is — that's the point. Never thick enough to lose the group.
 */
export function hazeOpacity(stink: number): number {
  return clamp((stink / STINK_MAX) ** 1.4 * 0.8, 0, 0.8);
}
