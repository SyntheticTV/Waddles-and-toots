/**
 * The simulation for one room.
 *
 * `step()` advances a run by dt seconds. It owns no React and no drawing — the
 * screen reads `RunState` and paints it, and drains `events` for sound and
 * haptics. Keeping it this way means the rules can be reasoned about (and one
 * day tested) without a device. See AGENTS.md.
 */

import type { LevelSpec, Prop, RunOutcome, Vec2 } from './types';
import {
  advanceStink,
  advanceSuspicion,
  applyDecoy,
  applyDecoyToSuspicion,
  applyPoof,
  noseAccuracy,
  stageFor,
} from './stink';
import * as T from './tuning';

// ------------------------------------------------------------------ helpers

const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

function nearestPointInRect(p: Vec2, r: Prop['bounds']): Vec2 {
  return {
    x: clamp(p.x, r.x, r.x + r.width),
    y: clamp(p.y, r.y, r.y + r.height),
  };
}

function distToProp(p: Vec2, prop: Prop): number {
  return dist(p, nearestPointInRect(p, prop.bounds));
}

function centerOf(prop: Prop): Vec2 {
  return { x: prop.bounds.x + prop.bounds.width / 2, y: prop.bounds.y + prop.bounds.height / 2 };
}

// ------------------------------------------------------------------- state

export type GameEventKind =
  | 'poof'
  | 'nugget'
  | 'decoy'
  | 'leash-warning'
  | 'blame'
  | 'escaped'
  | 'caught'
  | 'local-found'
  | 'local-asleep';

export interface GameEvent {
  kind: GameEventKind;
  /** Where it happened, for a puff of art or a floating line. */
  at?: Vec2;
  text?: string;
}

export interface Follower {
  id: 'toots' | 'fluffy' | 'sniffsalot';
  pos: Vec2;
}

export interface Person {
  pos: Vec2;
  home: Vec2;
  roam: number;
  phase: number;
}

export interface PoofPuff {
  pos: Vec2;
  age: number;
}

export type LocalMood = 'waiting' | 'pointing' | 'drowsy' | 'asleep' | 'startled';

export interface InputState {
  /** Unit-ish vector from the d-pad. Zero means standing still. */
  move: Vec2;
  slideHeld: boolean;
  /** Set true for one step when the decoy button is tapped. */
  decoyPressed: boolean;
}

export interface RunState {
  level: LevelSpec;
  outcome: RunOutcome;
  elapsed: number;

  waddles: Vec2;
  facing: Vec2;
  followers: Follower[];
  /** Breadcrumbs of where Waddles has been; the line walks this path. */
  trail: Vec2[];

  stink: number;
  suspicion: number;

  sliding: boolean;
  slideLeftMs: number;
  slideRechargeMs: number;
  /** Set when the line snaps; he has to regroup before sliding again. */
  leashBroken: boolean;

  decoyCooldownMs: number;
  decoyHoldMs: number;

  freshAirLock: number;
  poofCooldownMs: number;

  nuggets: { pos: Vec2; taken: boolean }[];
  collected: number;

  crowd: Person[];
  puffs: PoofPuff[];

  local: { pos: Vec2; species: string; snoozalot: boolean; mood: LocalMood; timerMs: number; found: boolean };

  /** What the crowd is currently blaming, and for how much longer. */
  blame: { text: string; at: Vec2; leftMs: number } | null;

  events: GameEvent[];
}

export interface CreateRunOptions {
  /** Pass false to guarantee a normal local (e.g. the tutorial room). */
  allowSnoozalot?: boolean;
  random?: () => number;
}

export function createRun(level: LevelSpec, opts: CreateRunOptions = {}): RunState {
  const random = opts.random ?? Math.random;
  const snoozalot =
    opts.allowSnoozalot === false ? false : (level.local.snoozalot ?? random() < T.SNOOZALOT_CHANCE);

  const start = { ...level.entry };

  return {
    level,
    outcome: 'playing',
    elapsed: 0,

    waddles: { ...start },
    facing: { x: 0, y: 1 },
    followers: [
      { id: 'toots', pos: { ...start } },
      { id: 'fluffy', pos: { ...start } },
      { id: 'sniffsalot', pos: { ...start } },
    ],
    trail: [{ ...start }],

    stink: 0,
    suspicion: 0,

    sliding: false,
    slideLeftMs: T.SLIDE_MAX_MS,
    slideRechargeMs: 0,
    leashBroken: false,

    decoyCooldownMs: 0,
    decoyHoldMs: 0,

    freshAirLock: 0,
    poofCooldownMs: 0,

    nuggets: level.nuggets.map((pos) => ({ pos: { ...pos }, taken: false })),
    collected: 0,

    crowd: level.crowd.map((c, i) => ({
      pos: { ...c.at },
      home: { ...c.at },
      roam: c.roam,
      phase: i * 1.7,
    })),
    puffs: [],

    local: {
      pos: { ...level.local.at },
      species: level.local.species,
      snoozalot,
      mood: 'waiting',
      timerMs: 0,
      found: false,
    },

    blame: null,
    events: [],
  };
}

// -------------------------------------------------------------------- step

export function step(s: RunState, dtMs: number, input: InputState): void {
  if (s.outcome !== 'playing') return;

  const dt = dtMs / 1000;
  s.elapsed += dt;

  moveWaddles(s, dt, dtMs, input);
  followTheLeader(s, dt);
  collectNuggets(s);
  checkFreshAir(s, dt);
  checkBumps(s, dtMs);
  moveCrowd(s, dt);
  tickDecoy(s, dtMs, input);
  tickStink(s, dt);
  tickLocal(s, dtMs);
  tickPuffs(s, dt);
  checkOutcome(s);
}

// ------------------------------------------------------------ movement

function moveWaddles(s: RunState, dt: number, dtMs: number, input: InputState): void {
  const wantsSlide = input.slideHeld && !s.leashBroken && s.slideRechargeMs <= 0 && s.slideLeftMs > 0;
  const moving = input.move.x !== 0 || input.move.y !== 0;

  s.sliding = wantsSlide && moving;

  if (s.sliding) {
    s.slideLeftMs -= dtMs;
    if (s.slideLeftMs <= 0) {
      s.slideLeftMs = 0;
      s.slideRechargeMs = T.SLIDE_RECHARGE_MS;
      s.sliding = false;
      s.events.push({ kind: 'leash-warning', at: { ...s.waddles } });
    }
  } else {
    if (s.slideRechargeMs > 0) s.slideRechargeMs -= dtMs;
    // Recharge the slide only while the group is together.
    if (!s.leashBroken && s.slideRechargeMs <= 0) {
      s.slideLeftMs = Math.min(T.SLIDE_MAX_MS, s.slideLeftMs + dtMs * 0.55);
    }
  }

  if (!moving) return;

  const len = Math.hypot(input.move.x, input.move.y) || 1;
  const dir = { x: input.move.x / len, y: input.move.y / len };
  s.facing = dir;

  const speed = s.sliding ? T.SLIDE_SPEED : T.WADDLE_SPEED;
  const next = { x: s.waddles.x + dir.x * speed * dt, y: s.waddles.y + dir.y * speed * dt };

  // Resolve one axis at a time so sliding along a wall feels right.
  const tryX = { x: next.x, y: s.waddles.y };
  if (!blocked(s, tryX)) s.waddles.x = tryX.x;
  const tryY = { x: s.waddles.x, y: next.y };
  if (!blocked(s, tryY)) s.waddles.y = tryY.y;

  s.waddles.x = clamp(s.waddles.x, 3, T.WORLD_WIDTH - 3);
  s.waddles.y = clamp(s.waddles.y, 3, s.level.height - 2);

  const last = s.trail[s.trail.length - 1];
  if (!last || dist(last, s.waddles) > 1.2) {
    s.trail.push({ ...s.waddles });
    if (s.trail.length > 400) s.trail.shift();
  }
}

function blocked(s: RunState, p: Vec2): boolean {
  for (const prop of s.level.props) {
    if (prop.kind !== 'solid') continue;
    const b = prop.bounds;
    if (p.x > b.x - 2.5 && p.x < b.x + b.width + 2.5 && p.y > b.y - 2.5 && p.y < b.y + b.height + 2.5) {
      return true;
    }
  }
  return false;
}

/**
 * The conga line walks the path Waddles walked, but nobody can outrun a waddle —
 * so the moment he slides, the line stretches. That stretch is the whole game.
 */
function followTheLeader(s: RunState, dt: number): void {
  const maxStep = T.WADDLE_SPEED * 1.04 * dt;

  s.followers.forEach((f, i) => {
    const target = sampleTrail(s.trail, (i + 1) * T.LINE_SPACING);
    const d = dist(f.pos, target);
    if (d < 0.001) return;
    const stepLen = Math.min(d, maxStep);
    f.pos.x += ((target.x - f.pos.x) / d) * stepLen;
    f.pos.y += ((target.y - f.pos.y) / d) * stepLen;
  });

  const tail = s.followers[s.followers.length - 1];
  const gap = dist(s.waddles, tail.pos);

  if (gap > T.LEASH_BREAK && !s.leashBroken) {
    s.leashBroken = true;
    s.sliding = false;
    s.events.push({ kind: 'leash-warning', at: { ...s.waddles } });
  } else if (s.leashBroken && gap < T.LEASH_WARN) {
    s.leashBroken = false;
  }
}

/** Walk back along the breadcrumbs to find the point `back` units behind. */
function sampleTrail(trail: Vec2[], back: number): Vec2 {
  let remaining = back;
  for (let i = trail.length - 1; i > 0; i--) {
    const a = trail[i];
    const b = trail[i - 1];
    const seg = dist(a, b);
    if (seg >= remaining) {
      const t = seg === 0 ? 0 : remaining / seg;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= seg;
  }
  return { ...trail[0] };
}

// -------------------------------------------------------------- the room

function collectNuggets(s: RunState): void {
  for (const n of s.nuggets) {
    if (n.taken) continue;
    if (dist(n.pos, s.waddles) < T.NUGGET_RADIUS) {
      n.taken = true;
      s.collected += 1;
      s.events.push({ kind: 'nugget', at: { ...n.pos } });
    }
  }
}

function checkFreshAir(s: RunState, dt: number): void {
  let inAir = false;
  for (const prop of s.level.props) {
    if (prop.kind !== 'freshAir') continue;
    if (distToProp(s.waddles, prop) < T.FRESH_AIR_RADIUS) {
      inAir = true;
      break;
    }
  }
  s.freshAirLock = inAir ? T.FRESH_AIR_LOCK_SECONDS : Math.max(0, s.freshAirLock - dt);
}

/** Gurgle gurgle. */
function checkBumps(s: RunState, dtMs: number): void {
  if (s.poofCooldownMs > 0) {
    s.poofCooldownMs -= dtMs;
    return;
  }

  const toots = s.followers[0];
  let bumped = false;

  // Sliding past Toots rattles him.
  if (s.sliding && dist(s.waddles, toots.pos) < T.BUMP_RADIUS) bumped = true;

  if (!bumped) {
    for (const prop of s.level.props) {
      if (prop.kind !== 'bump') continue;
      if (distToProp(toots.pos, prop) < T.BUMP_RADIUS) {
        bumped = true;
        break;
      }
    }
  }

  if (!bumped) return;

  s.stink = applyPoof(s.stink);
  s.poofCooldownMs = T.POOF_COOLDOWN_MS;
  s.puffs.push({ pos: { x: toots.pos.x, y: toots.pos.y - 3 }, age: 0 });
  s.events.push({ kind: 'poof', at: { ...toots.pos } });
}

function moveCrowd(s: RunState, dt: number): void {
  const stage = stageFor(s.stink);
  const panicking = stage === 'panic' && s.decoyHoldMs <= 0;

  for (const p of s.crowd) {
    p.phase += dt * (panicking ? 3.2 : 0.7);
    if (panicking) {
      // Hands in the air, making for the nearest wall.
      const away = p.home.x < T.WORLD_WIDTH / 2 ? -1 : 1;
      p.pos.x = clamp(p.pos.x + away * 16 * dt, 2, T.WORLD_WIDTH - 2);
      p.pos.y += Math.sin(p.phase) * 4 * dt;
    } else {
      p.pos.x = p.home.x + Math.cos(p.phase) * p.roam * 0.5;
      p.pos.y = p.home.y + Math.sin(p.phase * 0.8) * p.roam * 0.35;
    }
  }
}

// ------------------------------------------------------------ the meters

function tickDecoy(s: RunState, dtMs: number, input: InputState): void {
  if (s.decoyCooldownMs > 0) s.decoyCooldownMs -= dtMs;
  if (s.decoyHoldMs > 0) {
    s.decoyHoldMs -= dtMs;
    if (s.decoyHoldMs <= 0) s.blame = null;
  }
  if (s.blame && s.blame.leftMs > 0) s.blame.leftMs -= dtMs;

  if (!input.decoyPressed || s.decoyCooldownMs > 0) return;

  // Pin it on the nearest blame prop if there's one to hand; otherwise Fluffy
  // puts the stripes on and takes the fall himself.
  let nearest: Prop | null = null;
  let nearestD = Infinity;
  for (const prop of s.level.props) {
    if (prop.kind !== 'blame') continue;
    const d = distToProp(s.waddles, prop);
    if (d < nearestD) {
      nearestD = d;
      nearest = prop;
    }
  }

  const useScapegoat = nearest !== null && nearestD < 34;
  s.stink = applyDecoy(s.stink, useScapegoat ? 'scapegoat' : 'skunk');
  s.suspicion = applyDecoyToSuspicion(s.suspicion);
  s.decoyCooldownMs = T.DECOY_COOLDOWN_MS;
  s.decoyHoldMs = T.DECOY_HOLD_MS;

  const text =
    useScapegoat && nearest?.blameLine ? nearest.blameLine : 'AH HA! It was the CAT!';
  const at = useScapegoat && nearest ? centerOf(nearest) : { ...s.followers[1].pos };
  s.blame = { text, at, leftMs: T.DECOY_HOLD_MS };
  s.events.push({ kind: 'decoy', at, text });
}

function tickStink(s: RunState, dt: number): void {
  const toots = s.followers[0];

  let watchers = 0;
  let crowded = false;
  for (const p of s.crowd) {
    const d = dist(p.pos, toots.pos);
    if (d < T.CROWD_RADIUS) crowded = true;
    if (d < T.SUSPICION_RADIUS) watchers += 1;
  }

  const decoyHolding = s.decoyHoldMs > 0;

  s.stink = advanceStink(s.stink, {
    dt,
    crowded,
    decoyHolding,
    inFreshAir: s.freshAirLock > 0,
  });

  s.suspicion = advanceSuspicion(s.suspicion, {
    dt,
    watchers,
    stink: s.stink,
    decoyHolding,
  });

  // People start saying what they think it is.
  if (!decoyHolding && !s.blame && stageFor(s.stink) === 'blame') {
    let nearest: Prop | null = null;
    let nearestD = Infinity;
    for (const prop of s.level.props) {
      if (prop.kind !== 'blame') continue;
      const d = distToProp(s.waddles, prop);
      if (d < nearestD) {
        nearestD = d;
        nearest = prop;
      }
    }
    if (nearest?.blameLine && nearestD < 46) {
      s.blame = { text: nearest.blameLine, at: centerOf(nearest), leftMs: 3000 };
      s.events.push({ kind: 'blame', at: centerOf(nearest), text: nearest.blameLine });
    }
  }

  if (s.blame && s.blame.leftMs <= 0 && s.decoyHoldMs <= 0) s.blame = null;
}

// -------------------------------------------------------------- the local

function tickLocal(s: RunState, dtMs: number): void {
  const l = s.local;
  const near = dist(s.waddles, l.pos) < 24;

  if (!l.found && near) {
    l.found = true;
    l.mood = 'pointing';
    l.timerMs = 0;
    s.events.push({ kind: 'local-found', at: { ...l.pos }, text: l.species });
    return;
  }
  if (!l.found) return;

  l.timerMs += dtMs;

  if (l.mood === 'startled') {
    if (l.timerMs > T.SNOOZE_WAKE_MS) {
      l.mood = 'asleep';
      l.timerMs = 0;
    }
    return;
  }

  if (!l.snoozalot) return;

  if (l.mood === 'pointing' && l.timerMs > T.SNOOZE_AFTER_MS - T.SNOOZE_TELL_MS) {
    l.mood = 'drowsy';
  }
  if (l.mood === 'drowsy' && l.timerMs > T.SNOOZE_AFTER_MS) {
    l.mood = 'asleep';
    l.timerMs = 0;
    s.events.push({ kind: 'local-asleep', at: { ...l.pos } });
  }
}

/** Bump a sleeping local, or set a poof off near them, and they jolt awake. */
export function nudgeLocal(s: RunState): void {
  if (s.local.mood !== 'asleep') return;
  s.local.mood = 'startled';
  s.local.timerMs = 0;
}

// ------------------------------------------------------------- the nose

export interface NoseReading {
  /** Unit vector Sniffsalot is pointing, or null when he's given up. */
  dir: Vec2 | null;
  /** 1 = dead on, 0 = pointing at a mop. */
  accuracy: number;
}

/**
 * Where Mr. Sniffsalot thinks the good stuff is. Nearest nugget if there's one
 * worth having, otherwise the exit — with an error that grows as the room fills
 * up, until he sits down. §8.
 */
export function readNose(s: RunState): NoseReading {
  const accuracy = noseAccuracy(s.stink, s.freshAirLock);
  if (accuracy <= 0.05) return { dir: null, accuracy: 0 };

  let target: Vec2 = { x: s.level.exit.x + s.level.exit.width / 2, y: s.level.exit.y };
  let best = Infinity;
  for (const n of s.nuggets) {
    if (n.taken) continue;
    const d = dist(n.pos, s.waddles);
    if (d < best && d < 90) {
      best = d;
      target = n.pos;
    }
  }

  const trueAngle = Math.atan2(target.y - s.waddles.y, target.x - s.waddles.x);
  // Drift, then wobble, then nonsense.
  const spread = (1 - accuracy) * Math.PI;
  const wobble = Math.sin(s.elapsed * 4) * (1 - accuracy) * 0.6;
  const angle = trueAngle + spread * Math.sin(s.elapsed * 0.9) + wobble;

  return { dir: { x: Math.cos(angle), y: Math.sin(angle) }, accuracy };
}

/** Where the local points — always dead on, as long as they're awake. */
export function readLocal(s: RunState): Vec2 | null {
  const l = s.local;
  if (!l.found) return null;
  if (l.mood === 'asleep' || l.mood === 'drowsy') return null;

  if (l.mood === 'startled') {
    const a = (l.timerMs / 200) % (Math.PI * 2);
    return { x: Math.cos(a), y: Math.sin(a) };
  }

  const exit = { x: s.level.exit.x + s.level.exit.width / 2, y: s.level.exit.y };
  const a = Math.atan2(exit.y - l.pos.y, exit.x - l.pos.x);
  return { x: Math.cos(a), y: Math.sin(a) };
}

// ------------------------------------------------------------------ misc

function tickPuffs(s: RunState, dt: number): void {
  for (const p of s.puffs) {
    p.age += dt;
    p.pos.y -= 6 * dt;
  }
  s.puffs = s.puffs.filter((p) => p.age < 2.2);
}

function checkOutcome(s: RunState): void {
  if (s.suspicion >= T.SUSPICION_MAX) {
    s.outcome = 'caught';
    s.events.push({ kind: 'caught', at: { ...s.followers[0].pos } });
    return;
  }

  const e = s.level.exit;
  const inExit =
    s.waddles.x > e.x - 2 &&
    s.waddles.x < e.x + e.width + 2 &&
    s.waddles.y > e.y - 4 &&
    s.waddles.y < e.y + e.height + 6;

  if (!inExit) return;

  // The whole group gets out, or nobody does.
  const tail = s.followers[s.followers.length - 1];
  if (dist(s.waddles, tail.pos) > T.LEASH_WARN) return;

  s.outcome = 'escaped';
  s.events.push({ kind: 'escaped', at: { ...s.waddles } });
}
