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
  /**
   * The beach. Dry sand is barely darker than the paper the game is drawn on,
   * which is deliberate — the stink green has to read on top of it, and a
   * saturated golden sand turns every green cloud to mud.
   */
  sand: '#EFE0C2',
  sandWet: '#D6C4A2',
  shell: '#C6B291',
  /** The water, and the foam where it meets the sand. */
  shallow: '#A8D3D8',
  deep: '#6FAFBC',
  foam: '#F4FBFA',
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

/**
 * The animal who lives in each room (§9), by species.
 *
 * Here rather than in `art/characters` so a level can be checked against it
 * without dragging Skia into the check — which matters, because a species with
 * no entry does not fail, it silently comes out looking like a squirrel. That
 * is exactly what happened to the yoga studio, and it went unnoticed because
 * nothing anywhere said the name was wrong.
 *
 * **The local is always an animal, and always one that belongs in the room.**
 * The crowd is drawn by `Person` and the local by `Local`; they are different
 * components and a person can never turn up as the local. Adding a room means
 * adding its animal here.
 *
 * None of them may be a cat. Fluffy is the cat, and §7's whole gag is the room
 * deciding it was "the CAT" — a second cat across the room muddies the one joke
 * the decoy is built on.
 */
export const localCoat = {
  /** Backyard BBQ. */
  squirrel: coat.squirrel,
  /** Fine Restaurant — a kitchen mouse. */
  mouse: { lit: '#C8BFB3', mid: '#AAA095', deep: '#877D72', line: '#4F4841' },
  /** School Hallway — the classroom hamster, escaped again. */
  hamster: { lit: '#E4BC78', mid: '#CDA057', deep: '#A87F3C', line: '#5F4620' },
  /** Sunrise Yoga — the studio rabbit, who is better at this than anybody. */
  rabbit: { lit: '#E8E0D2', mid: '#D2C7B4', deep: '#AEA292', line: '#574F44' },
  /**
   * Sunset Beach — the otter off the end of the jetty.
   *
   * The design doc said a dolphin, and a dolphin would be better if the locals
   * had their own silhouettes; they do not yet, so a dolphin would come out as a
   * blue-grey squirrel. An otter is the animal that belongs on that shoreline
   * *and* survives the shared shape.
   */
  otter: { lit: '#9C7B5A', mid: '#7C5E42', deep: '#58412C', line: '#2E2317' },
  /** Firehouse kitchen, when it exists. */
  dalmatian: { lit: '#FBF6EA', mid: '#EDE6D6', deep: '#CFC6B2', line: '#3A3A3A' },
  /** Petting zoo, when it exists. */
  goat: { lit: '#EEE6D3', mid: '#DCD2BA', deep: '#BCB098', line: '#5A5243' },
} as const;

export type LocalSpecies = keyof typeof localCoat;
