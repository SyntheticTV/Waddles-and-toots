import type { LevelSpec } from '../game/types';

/**
 * Level 2 — Fine Restaurant. Indoors, tight, and full of things that already
 * smell.
 *
 * Where the backyard was open ground with furniture in it, this room is the
 * opposite: a grid of tables you have to thread the whole line through, with the
 * diners sitting *at* them rather than wandering. The crowd barely roams — but
 * they are sitting exactly where you need to walk, so the puzzle is the route
 * rather than the chase, right up until the meter climbs and they start getting
 * up (§5).
 *
 * It is also the first room where the way out is not obvious. There are three
 * doors in the back wall — the walk-in, the toilets, and the kitchen's back door
 * — and only one of them is a way out. That is what the mouse is for (§10).
 *
 * Portrait, so you climb the room: the dining room at the bottom, the pass and
 * the kitchen at the top.
 */
export const fineRestaurant: LevelSpec = {
  id: 'fine-restaurant',
  name: 'Fine Restaurant',
  exitLabel: "the kitchen's back door",
  height: 440,
  scenery: 'indoor',

  entry: { x: 50, y: 10 },
  // Middle of the back wall. The two duds flank it.
  exit: { x: 43, y: 426, width: 20, height: 14 },

  local: { species: 'mouse', at: { x: 8, y: 296 } },

  props: [
    // --- things a restaurant would much rather blame -----------------------
    {
      id: 'cabbage-pot',
      kind: 'blame',
      bounds: { x: 62, y: 88, width: 20, height: 16 },
      blameLine: 'Oh my goodness, that cabbage smells gross!',
    },
    {
      id: 'cheese-cart',
      kind: 'blame',
      bounds: { x: 14, y: 146, width: 24, height: 18 },
      blameLine: "Whooo weee, that's some strong cheese!",
    },
    {
      id: 'onion-board',
      kind: 'blame',
      bounds: { x: 66, y: 196, width: 22, height: 12 },
      blameLine: "Oh, who cut the onions? I'm crying over here!",
    },
    {
      id: 'truffle-plate',
      kind: 'blame',
      bounds: { x: 26, y: 238, width: 16, height: 12 },
      blameLine: 'That is the truffle. That is a four hundred dollar smell.',
    },
    {
      id: 'fish-plate',
      kind: 'blame',
      bounds: { x: 70, y: 286, width: 18, height: 12 },
      blameLine: "It's the fish special. It's always the fish special.",
    },
    {
      id: 'kitchen-bin',
      kind: 'blame',
      bounds: { x: 8, y: 372, width: 16, height: 20 },
      blameLine: 'Chef! CHEF! Something has died in the walk-in!',
    },
    {
      id: 'table-four',
      kind: 'blame',
      bounds: { x: 38, y: 348, width: 26, height: 20 },
      blameLine: 'Table four would like a word with the manager. About the air.',
    },

    // --- the only two lungfuls in the building -----------------------------
    { id: 'extractor', kind: 'freshAir', bounds: { x: 76, y: 356, width: 18, height: 14 } },
    { id: 'open-window', kind: 'freshAir', bounds: { x: 4, y: 74, width: 12, height: 18 } },

    // --- three doors in the back wall, two of them liars --------------------
    { id: 'walk-in', kind: 'falseExit', bounds: { x: 14, y: 424, width: 18, height: 16 } },
    { id: 'toilet-door', kind: 'falseExit', bounds: { x: 74, y: 424, width: 16, height: 16 } },

    // --- things that will set Toots off ------------------------------------
    { id: 'plate-stack', kind: 'bump', bounds: { x: 54, y: 130, width: 10, height: 12 } },
    { id: 'mop-bucket', kind: 'bump', bounds: { x: 22, y: 206, width: 11, height: 10 } },
    { id: 'wine-rack', kind: 'bump', bounds: { x: 84, y: 246, width: 10, height: 16 } },
    { id: 'high-chair', kind: 'bump', bounds: { x: 32, y: 292, width: 9, height: 12 } },

    // --- the furniture you have to thread the line through ------------------
    { id: 'table-one', kind: 'solid', bounds: { x: 18, y: 42, width: 24, height: 18 } },
    { id: 'table-two', kind: 'solid', bounds: { x: 60, y: 40, width: 24, height: 18 } },
    { id: 'table-three', kind: 'solid', bounds: { x: 36, y: 110, width: 24, height: 18 } },
    { id: 'table-five', kind: 'solid', bounds: { x: 12, y: 262, width: 24, height: 18 } },
    { id: 'table-six', kind: 'solid', bounds: { x: 62, y: 326, width: 24, height: 18 } },
    { id: 'the-pass', kind: 'solid', bounds: { x: 30, y: 392, width: 44, height: 12 } },
  ],

  nuggets: [
    { x: 50, y: 30 },
    { x: 88, y: 64 },
    { x: 10, y: 108 },
    { x: 50, y: 152 },
    { x: 90, y: 148 },
    { x: 30, y: 178 },
    { x: 8, y: 222 },
    { x: 54, y: 224 },
    { x: 90, y: 296 },
    { x: 22, y: 322 },
    { x: 62, y: 362 },
    { x: 40, y: 296 },
    { x: 14, y: 404 },
    { x: 88, y: 400 },
  ],

  // Diners, mostly sitting. They hardly roam — they are simply in the way,
  // which in a room this tight is quite enough.
  crowd: [
    { at: { x: 30, y: 66 }, roam: 5 },
    { at: { x: 72, y: 64 }, roam: 5 },
    { at: { x: 48, y: 134 }, roam: 6 },
    { at: { x: 86, y: 176 }, roam: 7 },
    { at: { x: 14, y: 190 }, roam: 6 },
    { at: { x: 58, y: 254 }, roam: 8 },
    { at: { x: 24, y: 286 }, roam: 5 },
    { at: { x: 78, y: 318 }, roam: 7 },
    { at: { x: 44, y: 366 }, roam: 9 },
    { at: { x: 66, y: 404 }, roam: 8 },
  ],
};
