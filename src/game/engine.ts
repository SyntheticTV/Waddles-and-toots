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
  huntHeat,
  noseAccuracy,
  stageFor,
} from './stink';
import * as T from './tuning';

// ------------------------------------------------------------------ helpers

/**
 * What the room says when Fluffy takes the fall himself rather than there being
 * anything nearby worth blaming. Named, rather than buried in the middle of
 * `tickDecoy`, because every spoken line in the game has to be findable by the
 * script that records them. §7.
 */
export const DECOY_CAT_LINE = 'AH HA! It was the CAT!';

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
  /** The slide ran out under him. Not the same thing as losing the group. */
  | 'slide-empty'
  | 'blame'
  | 'escaped'
  | 'caught'
  | 'local-found'
  | 'local-asleep'
  /** The last nugget went in and the way out just unlocked. */
  | 'gate-open';

export interface GameEvent {
  kind: GameEventKind;
  /** Where it happened, for a puff of art or a floating line. */
  at?: Vec2;
  text?: string;
  /**
   * Decoys only: Fluffy took the fall himself rather than pinning it on a prop,
   * which is the two-beat version of the joke — the accusation, and then the
   * crowd finding out it is not him either (§7).
   */
  tookTheFall?: boolean;
}

export interface Follower {
  id: 'toots' | 'fluffy' | 'sniffsalot';
  pos: Vec2;
  /** Unit-ish heading, so the art can turn them the way they are walking. */
  facing: Vec2;
  /** Actually going somewhere this frame, so the art can walk instead of idle. */
  moving: boolean;
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

/** A nugget going in: a little burst where it was. Presentation only. */
export interface Spark {
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
  /**
   * How long this run has been going, **in seconds**.
   *
   * `step` takes milliseconds and divides; everything stored on the run is
   * seconds. Saying so here because it has now been misread twice — once by a
   * cooldown that was written in milliseconds and so never expired, and once by
   * a best-time that was divided by a thousand it had already been divided by.
   */
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
  /**
   * How many times Toots has gone off this run.
   *
   * Kept on the run rather than counted from events, because events are drained
   * every frame — anything that wants a *total* has to be told as it happens.
   * §13's second star is crossing a room without a single one.
   */
  poofs: number;
  /**
   * When each blame prop was last accused, on the run's own clock.
   *
   * Keyed by prop id so it survives anything that reorders a level's props, and
   * in seconds, because that is what `elapsed` is.
   */
  blamedAt: Record<string, number>;
  /** True once every nugget is in and the gate has swung open. §11. */
  gateOpen: boolean;
  /** Standing in the gateway. With the gate shut, that is worth saying out loud. */
  atExit: boolean;

  crowd: Person[];
  puffs: PoofPuff[];
  sparks: Spark[];

  /** Waddles is on the move. The art walks him rather than idling him. */
  moving: boolean;

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

/**
 * Whether the last run's local turned out to be a Snoozalot.
 *
 * The one piece of state in here that outlives a run, and it earns its place:
 * §9 promises "never twice in a row", and without a memory of the last room
 * that promise cannot be kept. Two narcoleptic locals back to back stops being
 * a surprise and starts being the rule.
 */
let lastWasSnoozalot = false;

/** For tests, which must not inherit whatever the previous one left behind. */
export function forgetSnoozalotHistory(): void {
  lastWasSnoozalot = false;
}

export function createRun(level: LevelSpec, opts: CreateRunOptions = {}): RunState {
  const random = opts.random ?? Math.random;
  const snoozalot =
    opts.allowSnoozalot === false
      ? false
      : (level.local.snoozalot ??
        (!lastWasSnoozalot && random() < T.SNOOZALOT_CHANCE));
  if (opts.allowSnoozalot !== false && level.local.snoozalot === undefined) {
    lastWasSnoozalot = snoozalot;
  }

  const start = { ...level.entry };

  return {
    level,
    outcome: 'playing',
    elapsed: 0,

    waddles: { ...start },
    facing: { x: 0, y: 1 },
    followers: [
      { id: 'toots', pos: { ...start }, facing: { x: 0, y: 1 }, moving: false },
      { id: 'fluffy', pos: { ...start }, facing: { x: 0, y: 1 }, moving: false },
      { id: 'sniffsalot', pos: { ...start }, facing: { x: 0, y: 1 }, moving: false },
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
    poofs: 0,
    blamedAt: {},
    gateOpen: level.nuggets.length === 0,
    atExit: false,

    crowd: level.crowd.map((c, i) => ({
      pos: { ...c.at },
      home: { ...c.at },
      roam: c.roam,
      phase: i * 1.7,
    })),
    puffs: [],
    sparks: [],

    moving: false,

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
  tickDecoy(s, dtMs, input);
  moveCrowd(s, dt);
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
  s.moving = moving;

  if (s.sliding) {
    s.slideLeftMs -= dtMs;
    if (s.slideLeftMs <= 0) {
      s.slideLeftMs = 0;
      s.slideRechargeMs = T.SLIDE_RECHARGE_MS;
      s.sliding = false;
      s.events.push({ kind: 'slide-empty', at: { ...s.waddles } });
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
    if (d < 0.001) {
      f.moving = false;
      return;
    }
    const stepLen = Math.min(d, maxStep);
    const dirX = (target.x - f.pos.x) / d;
    const dirY = (target.y - f.pos.y) / d;
    f.pos.x += dirX * stepLen;
    f.pos.y += dirY * stepLen;
    // Only turn when actually walking, so nobody spins on the spot.
    f.moving = stepLen > 0.04;
    if (stepLen > 0.02) f.facing = { x: dirX, y: dirY };
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
      s.sparks.push({ pos: { ...n.pos }, age: 0 });
      s.events.push({ kind: 'nugget', at: { ...n.pos } });

      // The last one unlocks the way out (§11).
      if (!s.gateOpen && s.collected >= s.nuggets.length) {
        s.gateOpen = true;
        const e = s.level.exit;
        s.events.push({
          kind: 'gate-open',
          at: { x: e.x + e.width / 2, y: e.y + e.height / 2 },
        });
      }
    }
  }
}

/**
 * Fresh air is somewhere you stand, not something you pick up (§5).
 *
 * Step in and the clock stops and his nose clears; step out and both start again
 * almost at once. The sliver of grace is only so that walking through a sprinkler
 * does not strobe the bark on and off.
 */
function checkFreshAir(s: RunState, dt: number): void {
  let inAir = false;
  for (const prop of s.level.props) {
    if (prop.kind !== 'freshAir') continue;
    if (distToProp(s.waddles, prop) < T.FRESH_AIR_RADIUS) {
      inAir = true;
      break;
    }
  }
  s.freshAirLock = inAir ? T.FRESH_AIR_GRACE_SECONDS : Math.max(0, s.freshAirLock - dt);
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

  /*
   * Walking the group into the local wakes it up — and startles Toots, because
   * bumping anything startles Toots (§6). Waking your own compass therefore
   * costs a poof and a chunk of the meter, which makes it a decision rather than
   * a free retry (§9).
   */
  const onTheLocal =
    dist(toots.pos, s.local.pos) < T.BUMP_RADIUS || dist(s.waddles, s.local.pos) < T.BUMP_RADIUS;
  if (onTheLocal && (s.local.mood === 'asleep' || s.local.mood === 'drowsy')) {
    nudgeLocal(s);
    bumped = true;
  }

  if (!bumped) return;

  s.stink = applyPoof(s.stink);
  s.poofCooldownMs = T.POOF_COOLDOWN_MS;
  s.puffs.push({ pos: { x: toots.pos.x, y: toots.pos.y - 3 }, age: 0 });
  s.poofs += 1;
  s.events.push({ kind: 'poof', at: { ...toots.pos } });
}

/**
 * Where everybody goes.
 *
 * Three moods, and a person is only ever in one of them:
 *
 * - **Milling.** Orbiting their own patch of the room, minding their business.
 * - **Hunting.** Past `HUNT_FROM` on the meter they have a fair idea where the
 *   smell is coming from, and anybody near enough walks at Toots — faster the
 *   worse it gets (§5).
 * - **Distracted.** While Fluffy is holding them, whatever he pinned it on is far
 *   more interesting than the skunk, and the whole room drifts over to look at it.
 *   That is the gap the player moves through.
 *
 * Everyone moves *toward a target* rather than being placed on a curve, so
 * changing mood is a turn rather than a teleport.
 */
function moveCrowd(s: RunState, dt: number): void {
  const toots = s.followers[0].pos;
  const heat = huntHeat(s.stink);
  const distracted = s.decoyHoldMs > 0;
  const lure = distracted ? (s.blame?.at ?? null) : null;

  for (const p of s.crowd) {
    p.phase += dt * (1 + heat * 2.2);

    let target: Vec2;
    let speed: number;

    let hunting = false;

    if (lure) {
      // Crowding round the cheese cart, the mop bucket, the pool.
      target = lure;
      speed = T.DECOY_PULL_SPEED;
    } else if (heat > 0 && dist(p.pos, toots) < T.HUNT_RADIUS) {
      hunting = true;
      // A wobble on the approach, so nine people closing in still read as a
      // crowd of individuals rather than one homing missile.
      target = {
        x: toots.x + Math.cos(p.phase * 1.6) * 3,
        y: toots.y + Math.sin(p.phase * 1.3) * 3,
      };
      speed = T.CROWD_HUNT_SPEED * heat;
    } else {
      target = {
        x: p.home.x + Math.cos(p.phase) * p.roam * 0.55,
        y: p.home.y + Math.sin(p.phase * 0.8) * p.roam * 0.4,
      };
      speed = T.CROWD_IDLE_SPEED;
    }

    const dx = target.x - p.pos.x;
    const dy = target.y - p.pos.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.001) {
      const stepLen = Math.min(d, speed * dt);
      let sx = dx / d;
      let sy = dy / d;

      /*
       * Anybody who is not actually chasing him gives the group a wide berth, and
       * gets out of the way sharpish if it comes at them. Nobody minding their own
       * business has a reason to barge into a skunk, and a round that ends because
       * somebody wandered into you is a round you could not have seen coming —
       * which breaks "failing is funny, not sad" (§2.4). The threat has to come
       * from people who are visibly trying.
       */
      let step = stepLen;
      if (!hunting) {
        const ax = p.pos.x - toots.x;
        const ay = p.pos.y - toots.y;
        const al = Math.hypot(ax, ay) || 1;
        if (al < T.CATCH_RADIUS * 2.8) {
          // Excuse me. Backing off, and quicker than a stroll.
          sx = ax / al;
          sy = ay / al;
          step = T.CROWD_IDLE_SPEED * 2.4 * dt;
        } else {
          const nx = p.pos.x + sx * stepLen;
          const ny = p.pos.y + sy * stepLen;
          if (Math.hypot(nx - toots.x, ny - toots.y) < T.CATCH_RADIUS * 2.8) {
            sx = -ay / al;
            sy = ax / al;
          }
        }
      }

      p.pos.x += sx * step;
      p.pos.y += sy * step;
    }

    p.pos.x = clamp(p.pos.x, 2, T.WORLD_WIDTH - 2);
    p.pos.y = clamp(p.pos.y, 0, s.level.height);
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

  // Pin it on something in the room — but of the props near enough to be
  // believable, take the one *furthest from Toots*, because the whole room is
  // about to walk over to look at it and they must walk away from him, not
  // through him. If nothing qualifies, Fluffy puts the stripes on and leads them
  // off himself.
  const toots = s.followers[0].pos;
  let pick: Prop | null = null;
  let pickGap = -Infinity;
  for (const prop of s.level.props) {
    if (prop.kind !== 'blame') continue;
    if (distToProp(s.waddles, prop) > T.DECOY_RANGE) continue;
    const gap = distToProp(toots, prop);
    if (gap > pickGap) {
      pickGap = gap;
      pick = prop;
    }
  }

  const useScapegoat = pick !== null && pickGap >= T.DECOY_MIN_GAP;
  s.stink = applyDecoy(s.stink, useScapegoat ? 'scapegoat' : 'skunk');
  s.suspicion = applyDecoyToSuspicion(s.suspicion);
  s.decoyCooldownMs = T.DECOY_COOLDOWN_MS;
  s.decoyHoldMs = T.DECOY_HOLD_MS;

  const text = useScapegoat && pick?.blameLine ? pick.blameLine : DECOY_CAT_LINE;
  // Fluffy legs it back down the room in his stripes and they follow him, which
  // is away from wherever Waddles is trying to get to.
  const at = useScapegoat && pick
    ? centerOf(pick)
    : {
        x: clamp(toots.x + (toots.x < T.WORLD_WIDTH / 2 ? 26 : -26), 4, T.WORLD_WIDTH - 4),
        y: Math.max(2, toots.y - 26),
      };
  s.blame = { text, at, leftMs: T.DECOY_HOLD_MS };
  s.events.push({ kind: 'decoy', at, text, tookTheFall: !useScapegoat });
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

  /*
   * People start saying what they think it is.
   *
   * A prop that has just been blamed goes quiet for a while, and the room picks
   * the nearest one that has not. Without that, standing anywhere near the
   * potato salad meant hearing about the potato salad every three seconds for
   * the rest of the round — the same joke, on a loop, which is the fastest way
   * to make the best writing in the game annoying.
   *
   * Passing over a prop on cooldown rather than simply going quiet is the better
   * half of the rule: the room works *down* its shortlist. In a supermarket with
   * eleven suspects that is the entire character of the level.
   */
  if (!decoyHolding && !s.blame && stageFor(s.stink) === 'blame') {
    let nearest: Prop | null = null;
    let nearestD = Infinity;
    for (const prop of s.level.props) {
      if (prop.kind !== 'blame' || !prop.blameLine) continue;
      const said = s.blamedAt[prop.id];
      if (said !== undefined && s.elapsed - said < T.BLAME_COOLDOWN_SECONDS) continue;
      const d = distToProp(s.waddles, prop);
      if (d < nearestD) {
        nearestD = d;
        nearest = prop;
      }
    }
    if (nearest?.blameLine && nearestD < 46) {
      s.blamedAt[nearest.id] = s.elapsed;
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
    // The group notices, and says so in a bubble (§9). `text` is what one of
    // them thinks, not what anybody says out loud — §14.2 still stands.
    s.events.push({ kind: 'local-asleep', at: { ...l.pos }, text: pickAsleepLine(s) });
  }
}

/**
 * What the group says when the local goes under. One of them always has an
 * opinion, and one of them teaches the player the word for it.
 *
 * Exported because every spoken line in the game has to be findable by the script
 * that records them — and these are spoken now, not just printed (§14.2).
 */
export const ASLEEP_LINES = [
  "Awww, he's asleep.",
  'Oh no. He must be a Snoozalot.',
  'Not again!',
];

function pickAsleepLine(s: RunState): string {
  // Deterministic from the run, so the same run always reads the same.
  return ASLEEP_LINES[Math.floor(s.elapsed * 7) % ASLEEP_LINES.length];
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

  // He is a dog: while one fish is still out there, that is all he cares about,
  // however far away it is.
  let target: Vec2 | null = null;
  let best = Infinity;
  for (const n of s.nuggets) {
    if (n.taken) continue;
    const d = dist(n.pos, s.waddles);
    if (d < best) {
      best = d;
      target = n.pos;
    }
  }
  // Nothing left to find: only now does he want everybody out (§8).
  if (!target) {
    target = { x: s.level.exit.x + s.level.exit.width / 2, y: s.level.exit.y };
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

  for (const spark of s.sparks) {
    spark.age += dt;
    spark.pos.y += 11 * dt;
  }
  s.sparks = s.sparks.filter((spark) => spark.age < T.SPARK_LIFE);
}

function checkOutcome(s: RunState): void {
  const toots = s.followers[0];

  // Somebody got a hand on him. Doesn't matter how calm the room was — unless
  // Fluffy currently has the entire room looking at a bowl of potato salad, in
  // which case nobody has a hand free (§7). That window is the whole reason the
  // decoy exists, and it is what the player is spending the cooldown on.
  if (s.decoyHoldMs <= 0) {
    for (const p of s.crowd) {
      if (dist(p.pos, toots.pos) < T.CATCH_RADIUS) {
        s.outcome = 'caught';
        s.events.push({ kind: 'caught', at: { ...toots.pos } });
        return;
      }
    }
  }

  if (s.suspicion >= T.SUSPICION_MAX) {
    s.outcome = 'caught';
    s.events.push({ kind: 'caught', at: { ...toots.pos } });
    return;
  }

  const e = s.level.exit;
  const inExit =
    s.waddles.x > e.x - 2 &&
    s.waddles.x < e.x + e.width + 2 &&
    s.waddles.y > e.y - 4 &&
    s.waddles.y < e.y + e.height + 6;

  s.atExit = inExit;
  if (!inExit) return;

  // The gate stays shut until every nugget is in. §11.
  if (!s.gateOpen) return;

  // The whole group gets out, or nobody does.
  const tail = s.followers[s.followers.length - 1];
  if (dist(s.waddles, tail.pos) > T.LEASH_WARN) return;

  s.outcome = 'escaped';
  s.events.push({ kind: 'escaped', at: { ...s.waddles } });
}
