import type { LevelSpec } from '../game/types';

/**
 * Level 6 — Big Save Grocery.
 *
 * The room with the most things to blame in the game, by a distance: eleven of
 * them, against seven or eight everywhere else. That is the joke and it is also
 * the level. A supermarket is the one place on earth where "something smells" is
 * not a mystery but a *shortlist* — the durian, the fish counter, the cheese, the
 * pet food, whatever happened on aisle four this morning — so the crowd spends
 * the whole room confidently accusing the wrong thing. The danger here is not
 * that they work it out quickly. It is that a room this loud makes you careless.
 *
 * Structurally it is the opposite of the school hallway. There the locker banks
 * jutted in from alternating sides and forced a serpentine: one way through, and
 * the room decided it. Here the shelving runs down the *middle* of each aisle
 * with a gap at both ends, so every row is a fresh left-or-right choice with no
 * wrong answer until the crowd makes one. Six rows, six decisions, and the trick
 * is reading which end is about to fill up rather than finding the one gap.
 *
 * Fresh air is the open chillers, scattered rather than lined up — the beach put
 * all of its air down one side and made the route the puzzle; this room spreads
 * it so no single lane is safe.
 *
 * In at the middle, out through the loading bay at the **bottom**.
 */
export const cornerGrocery: LevelSpec = {
  id: 'big-save-grocery',
  name: 'Big Save Grocery',
  exitLabel: 'the loading bay doors',
  height: 500,
  scenery: 'indoor',

  /** The cross aisle in the middle, which is where you would come in anyway. */
  entry: { x: 50, y: 250 },

  /** Out the back, past the pallets. */
  exit: { x: 12, y: 0, width: 22, height: 14 },

  /** Somebody's ferret, loose in here since the pet aisle incident. */
  local: { species: 'ferret', at: { x: 90, y: 212 } },

  props: [
    // --- the shortlist ------------------------------------------------------
    {
      id: 'durian',
      kind: 'blame',
      bounds: { x: 62, y: 72, width: 16, height: 14 },
      blameLine: 'Somebody has opened the durian. Somebody has OPENED the DURIAN.',
    },
    {
      id: 'fish-counter',
      kind: 'blame',
      bounds: { x: 10, y: 103, width: 26, height: 16 },
      blameLine: "It's the fish counter. It's Tuesday. Neither of those is a coincidence.",
    },
    {
      id: 'cheese-case',
      kind: 'blame',
      bounds: { x: 76, y: 145, width: 20, height: 14 },
      blameLine: 'That is the cheese aisle doing exactly what the cheese aisle does.',
    },
    {
      id: 'aisle-four',
      kind: 'blame',
      bounds: { x: 34, y: 166, width: 20, height: 12 },
      blameLine:
        'There is a cleanup on aisle four. There has been a cleanup on aisle four since ten this morning.',
    },
    {
      id: 'onion-sacks',
      kind: 'blame',
      bounds: { x: 8, y: 222, width: 20, height: 14 },
      blameLine: 'Forty pounds of onions. Somebody in this building ordered forty pounds of onions.',
    },
    {
      id: 'rotisserie',
      kind: 'blame',
      bounds: { x: 70, y: 271, width: 22, height: 16 },
      blameLine: 'That is the chicken that has been going round since breakfast.',
    },
    {
      id: 'pickle-jar',
      kind: 'blame',
      bounds: { x: 30, y: 295, width: 12, height: 12 },
      blameLine: "A jar has given up in the pickle aisle and it's taking the rest of us with it.",
    },
    {
      id: 'wilted-greens',
      kind: 'blame',
      bounds: { x: 84, y: 341, width: 14, height: 14 },
      blameLine: 'The wilted greens bin has stopped being a bin and become a science project.',
    },
    {
      id: 'pet-food',
      kind: 'blame',
      bounds: { x: 2, y: 392, width: 22, height: 14 },
      blameLine: 'The pet food aisle is having a moment. The pet food aisle is having a MOMENT.',
    },
    {
      id: 'abandoned-trolley',
      kind: 'blame',
      bounds: { x: 54, y: 403, width: 18, height: 14 },
      blameLine: 'Whose trolley is this? WHOSE TROLLEY IS THIS?',
    },
    {
      id: 'tannoy',
      kind: 'blame',
      bounds: { x: 46, y: 186, width: 12, height: 14 },
      blameLine: 'Cleanup on aisle one. And two. And three. Cleanup on aisles one through fifty.',
    },
    {
      id: 'bleach-aisle',
      kind: 'blame',
      bounds: { x: 20, y: 441, width: 20, height: 14 },
      blameLine: 'The bleach aisle is trying its absolute best. The bleach aisle is losing.',
    },

    /*
     * The open chillers. Scattered on purpose: the beach put every lungful down
     * one side and made the route itself the puzzle, so doing it again would be
     * the same room with shelves in it. Spread out, no single lane is the safe
     * one and the air has to be gone *to*.
     */
    { id: 'chiller-1', kind: 'freshAir', bounds: { x: 4, y: 52, width: 14, height: 14 } },
    { id: 'chiller-2', kind: 'freshAir', bounds: { x: 86, y: 200, width: 14, height: 14 } },
    { id: 'chiller-3', kind: 'freshAir', bounds: { x: 44, y: 345, width: 14, height: 14 } },
    { id: 'chiller-4', kind: 'freshAir', bounds: { x: 80, y: 455, width: 14, height: 14 } },

    // --- three doors marked STAFF, and one loading bay -----------------------
    { id: 'staff-room', kind: 'falseExit', bounds: { x: 44, y: 0, width: 18, height: 14 } },
    { id: 'stockroom', kind: 'falseExit', bounds: { x: 74, y: 0, width: 18, height: 14 } },
    { id: 'warehouse-door', kind: 'falseExit', bounds: { x: 2, y: 284, width: 14, height: 16 } },

    // --- things that will set Toots off -------------------------------------
    { id: 'tin-tower', kind: 'bump', bounds: { x: 46, y: 97, width: 11, height: 14 } },
    { id: 'basket-stack', kind: 'bump', bounds: { x: 88, y: 247, width: 10, height: 12 } },
    { id: 'wet-floor-sign', kind: 'bump', bounds: { x: 24, y: 259, width: 10, height: 12 } },
    { id: 'crisp-display', kind: 'bump', bounds: { x: 84, y: 326, width: 12, height: 12 } },
    { id: 'shopping-trolley', kind: 'bump', bounds: { x: 38, y: 383, width: 12, height: 11 } },
    { id: 'pallet', kind: 'bump', bounds: { x: 66, y: 471, width: 12, height: 10 } },

    /*
     * The aisles: shelving down the middle of the room with a gap at either end.
     *
     * That is the whole structural idea and it is deliberately the inverse of
     * the school's lockers, which jutted in from alternating sides and left one
     * way through. Here there are always two, so every row is a choice rather
     * than a route, and the skill is reading which end is about to fill up.
     *
     * Three of the six are broken in the middle by a promotional stand, so those
     * rows are a three-way choice rather than a two-way one.
     *
     * That mix is not decoration. With all six running unbroken, getting past a
     * row meant walking its whole length to an end, six times over — the path
     * through the room was so long that the meter, not the crowd, decided every
     * run, and proper play cleared it seven times in twenty. Six identical rows
     * is also a pattern, and a pattern stops being a decision.
     */
    { id: 'aisle-1', kind: 'solid', bounds: { x: 28, y: 60, width: 44, height: 14 } },
    { id: 'aisle-2a', kind: 'solid', bounds: { x: 24, y: 129, width: 19, height: 14 } },
    { id: 'aisle-2b', kind: 'solid', bounds: { x: 57, y: 129, width: 19, height: 14 } },
    { id: 'aisle-3', kind: 'solid', bounds: { x: 28, y: 198, width: 44, height: 14 } },
    { id: 'aisle-4a', kind: 'solid', bounds: { x: 28, y: 309, width: 15, height: 14 } },
    { id: 'aisle-4b', kind: 'solid', bounds: { x: 57, y: 309, width: 15, height: 14 } },
    { id: 'aisle-5a', kind: 'solid', bounds: { x: 24, y: 378, width: 19, height: 14 } },
    { id: 'aisle-5b', kind: 'solid', bounds: { x: 57, y: 378, width: 19, height: 14 } },
    { id: 'aisle-6', kind: 'solid', bounds: { x: 28, y: 447, width: 44, height: 14 } },
    { id: 'checkouts', kind: 'solid', bounds: { x: 40, y: 479, width: 40, height: 12 } },
  ],

  /*
   * Sixteen fish, spread over both halves.
   *
   * They sit in the lanes between the aisles rather than at the ends, so getting
   * one commits you to a lane before you can see who is coming up it — which is
   * the closest this room gets to the thing a real supermarket does, where the
   * shelves mean you meet people rather than see them coming.
   */
  nuggets: [
    { x: 50, y: 231 },
    { x: 74, y: 221 },
    { x: 34, y: 179 },
    { x: 14, y: 152 },
    { x: 90, y: 126 },
    { x: 44, y: 117 },
    { x: 70, y: 91 },
    { x: 20, y: 83 },
    { x: 54, y: 36 },
    { x: 30, y: 276 },
    { x: 60, y: 290 },
    { x: 18, y: 328 },
    { x: 78, y: 362 },
    { x: 44, y: 398 },
    { x: 26, y: 419 },
    { x: 68, y: 431 },
  ],

  /*
   * Shoppers. They roam less than the beach crowd — nobody hurries in a
   * supermarket — but there are more of them and they are in the lanes, which is
   * exactly where you have to be. A slow person in a narrow aisle is worse than
   * a quick one in an open room.
   */
  crowd: [
    { at: { x: 30, y: 40 }, roam: 12 },
    { at: { x: 72, y: 53 }, roam: 11 },
    { at: { x: 26, y: 109 }, roam: 13 },
    { at: { x: 66, y: 122 }, roam: 12 },
    { at: { x: 44, y: 178 }, roam: 14 },
    { at: { x: 18, y: 234 }, roam: 12 },
    { at: { x: 62, y: 250 }, roam: 15 },
    { at: { x: 74, y: 355 }, roam: 12 },
  ],
};
