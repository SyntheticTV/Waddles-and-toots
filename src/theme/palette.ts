/**
 * The game's ink set. Kept deliberately small — flat cartoon colors with heavy
 * outlines, the same palette the design bible uses so art, UI and docs agree.
 *
 * See GAME_DESIGN.md §14 (comedy rules): green clouds, watering eyes, waving
 * hands. Nothing gross is ever drawn, so the stink is always *this* green.
 */
export const palette = {
  /** Outline color for everything. Near-black with a green bias. */
  ink: '#18211B',
  inkSoft: '#4C5A50',

  paper: '#FFFBF0',
  paperShade: '#F6F1E2',

  /** The smell. Wash -> full -> deep as the meter climbs. */
  stinkWash: '#E9F2D4',
  stink: '#8FBF33',
  stinkDeep: '#4F7A1C',

  /** Fish nuggets, and Waddles' beak and feet. */
  nugget: '#E89A1C',

  /** Crowd alarm, warnings, the slide leash. */
  alarm: '#D94A2E',

  /** Water, fresh air, Mr. Sniffsalot's pointer. */
  sea: '#2A6E8C',
  breeze: '#9FD8EE',

  white: '#FFFFFF',
} as const;

/** Fill for the haze overlay at each stink stage (see stink.ts). */
export const hazeByStage = ['#8FBF3300', '#8FBF3333', '#7FAF2B66', '#4F7A1C99'] as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];
