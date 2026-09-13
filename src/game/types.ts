/**
 * Shared shapes for the game. See GAME_DESIGN.md for what each of these means
 * in play — this file is only the data side of it.
 */

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Rooms are authored in world units, not pixels, so a level plays the same on a
 * phone and an iPad. The room is always `WORLD_WIDTH` units wide (see tuning.ts)
 * and as tall as the level says.
 *
 * Portrait means you climb the room: y = 0 is the entrance at the bottom of the
 * screen, y = height is the exit at the top.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * What the room is made of, so the art knows whether to lay down grass or a
 * floor. Rooms default to 'yard'.
 */
export type SceneryKind = 'yard' | 'indoor';

/** How far along the stink meter the crowd is. See GAME_DESIGN.md §5. */
export type StinkStage = 'calm' | 'sniff' | 'blame' | 'panic';

export type PropKind =
  /** Something the crowd can wrongly blame the smell on. */
  | 'blame'
  /**
   * A door, gate, hatch or window that looks like the way out and is not (§10).
   * Walking into one does nothing at all, which is the point: from room three
   * onward the exit has to be *found*, and that is what the local is for.
   */
  | 'falseExit'
  /** Open window, ocean breeze, AC vent — clears Sniffsalot's nose. */
  | 'freshAir'
  /** Startles Toots on contact: gurgle, poof, the meter jumps. */
  | 'bump'
  /** Just furniture. Blocks movement. */
  | 'solid';

export interface Prop {
  id: string;
  kind: PropKind;
  /** Footprint in world units. */
  bounds: Rect;
  /** What the crowd calls it when they blame it. Blame props only. */
  blameLine?: string;
}

/** The animal who lives in this room and knows the way out. §9. */
export interface LocalSpec {
  /** e.g. "squirrel", "dolphin", "kitchen mouse" */
  species: string;
  /** Where they wait to be found. */
  at: Vec2;
  /**
   * Whether this local is a Snoozalot. Left undefined in the level file — the
   * run decides, roughly one room in four, never twice in a row.
   */
  snoozalot?: boolean;
}

export interface CrowdSpec {
  /** Where this person mills about. */
  at: Vec2;
  /** How far they wander from `at`, in world units. */
  roam: number;
}

export interface LevelSpec {
  id: string;
  /** Shown on the level card. */
  name: string;
  /** How the group gets out: "the side gate", "the kitchen back door". */
  exitLabel: string;
  /** Room height in world units. Width is always WORLD_WIDTH. */
  height: number;
  /** What the floor of this room is. Defaults to 'yard'. */
  scenery?: SceneryKind;
  /** Where the conga line comes in, at the bottom. */
  entry: Vec2;
  /** The way out, at the top. */
  exit: Rect;
  local: LocalSpec;
  props: Prop[];
  nuggets: Vec2[];
  crowd: CrowdSpec[];
}

export type RunOutcome = 'playing' | 'escaped' | 'caught';
