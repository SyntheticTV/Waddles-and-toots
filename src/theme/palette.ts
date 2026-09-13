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

/**
 * The art set: everything the room is drawn out of, on top of the ink set above.
 *
 * Kept deliberately warm and desaturated. The stink green is the only saturated
 * green in the game, so grass, hedges and pool water stay sage and khaki —
 * otherwise the haze stops reading as "something here is WRONG".
 */
export const art = {
  // --- the yard ---------------------------------------------------------
  grass: '#DCE4C0',
  grassMown: '#D3DCB2',
  grassTuft: '#B7C98C',
  hedge: '#A9BE86',
  hedgeDark: '#8CA469',
  soil: '#CBB68E',
  /** Indoors: a warm board floor, kept pale so the stink green still reads. */
  floor: '#E3D4BC',
  patio: '#E7E0CE',
  patioLine: '#D2C9B2',

  // --- stuff ------------------------------------------------------------
  wood: '#C79A63',
  woodDark: '#A2713F',
  metal: '#C2C6C9',
  metalDark: '#8A9095',
  charcoal: '#5A5750',
  plastic: '#E4B9C6',
  poolWater: '#BFD9C9',
  salad: '#F0DC9B',
  saladBit: '#DCC067',

  cream: '#F7E8D0',
  snout: '#C98A86',

  // --- people -----------------------------------------------------------
  skin: ['#F2C89B', '#D9A272', '#B0754A', '#7D4F2E', '#F7DCC0'],
  shirt: ['#6E8FB5', '#C4706A', '#7FA86B', '#C99A4A', '#8C7BB0', '#59A2A0'],
  hair: ['#3A2A20', '#6B4A2E', '#C09A50', '#2B2B2B', '#8C5A3C'],
} as const;

/**
 * Coats. Each animal gets a lit tone, a mid tone, a shadow tone and a contour,
 * because a contour in the fur's own dark brown reads as an animal where a
 * contour in flat black reads as a sticker. The light is always upper-left, so
 * `lit` belongs at the top-left of a shape and `deep` at the bottom-right.
 */
export const coat = {
  penguin: { lit: '#36443C', mid: '#1B241F', deep: '#0A0F0C', line: '#070B09' },
  bib: { lit: '#FFFDF5', mid: '#F2E9D6', deep: '#D9CFB8' },
  skunk: { lit: '#2C352E', mid: '#161D18', deep: '#070A08', line: '#050807' },
  /**
   * Fluffy is a white cat. White on a pale yard is a contrast problem, so he is
   * warm off-white rather than paper-white, his shadow tone does real work, and
   * his contour is a dark warm grey — dark enough to hold him against the grass
   * without turning him into a cut-out.
   */
  cat: { lit: '#FFFFFF', mid: '#F0EADD', deep: '#CFC6B4', line: '#6B6459' },
  catBelly: { lit: '#FFFFFF', mid: '#FAF6EE', deep: '#E6DFD2' },
  dog: { lit: '#D6A35E', mid: '#B48040', deep: '#8A5C28', line: '#452C14' },
  saddle: { lit: '#55412F', mid: '#3B2C22', deep: '#271D16' },
  squirrel: { lit: '#D29F62', mid: '#B27F47', deep: '#8A5F2E', line: '#563617' },
  white: { lit: '#FCF6E9', mid: '#F0E7D4', deep: '#D5C9B0' },
  nose: { lit: '#4A3F3A', mid: '#2A2320', deep: '#161110' },
  tongue: '#C9707A',
  innerEar: '#C98A86',
} as const;
