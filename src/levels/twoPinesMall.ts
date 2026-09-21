import type { LevelSpec } from '../game/types';

/**
 * Level 8 — Two Pines Mall.
 *
 * Two floors, and the lift between them.
 *
 * A lift on its own would not be a room at all — there is nothing to cross —
 * which is why it is the *link* between two shopping floors rather than a level
 * of its own. Every verb the game already has still applies on each floor, and
 * the ride is a punchline the player sets off: three seconds sealed in a metal
 * box with a skunk and a stranger who has an opinion about it.
 *
 * The shape of the room makes both rides compulsory. The group comes in on the
 * ground floor, most of the fish are upstairs, and the way out is the main doors
 * back down on the ground — so it is up, sweep, and back down with a full meter
 * and a lift ride to sit through on the way.
 *
 * Shop frontage runs down both sides with a concourse up the middle, which is
 * what a mall looks like and also what keeps the floors readable: the lanes are
 * obvious, and everything that is not a shop is placed in them.
 */
export const twoPinesMall: LevelSpec = {
  id: 'two-pines-mall',
  name: 'Two Pines Mall',
  exitLabel: 'the main doors',
  height: 452,
  scenery: 'indoor',

  /** In at the middle of the ground floor. */
  entry: { x: 50, y: 104 },

  /** The main doors, at the bottom — which means coming back down for them. */
  exit: { x: 38, y: 0, width: 24, height: 14 },

  /** The mall rabbit, who lives behind the fountain and fears nothing. */
  local: { species: 'rabbit', at: { x: 88, y: 268 } },

  props: [
    // --- nine things a mall would much rather blame --------------------
    {
      id: 'food-court',
      kind: 'blame',
      bounds: { x: 32, y: 60, width: 24, height: 16 },
      blameLine: 'The food court has a new restaurant, I guess.',
    },
    {
      id: 'fragrance-counter',
      kind: 'blame',
      bounds: { x: 62, y: 118, width: 20, height: 16 },
      blameLine: "That's a new perfume smell. And not a good one.",
    },
    {
      id: 'pretzel-stand',
      kind: 'blame',
      bounds: { x: 30, y: 160, width: 22, height: 14 },
      blameLine: 'That pretzel has been turning under that light since ten this morning.',
    },
    {
      id: 'mall-fountain',
      kind: 'blame',
      bounds: { x: 40, y: 36, width: 22, height: 14 },
      blameLine: 'Nobody has changed the fountain water since the fountain was installed.',
    },
    {
      id: 'candle-shop',
      kind: 'blame',
      bounds: { x: 30, y: 290, width: 24, height: 16 },
      blameLine: 'Somebody has lit every candle in there at once. Every single one.',
    },
    {
      id: 'pet-shop',
      kind: 'blame',
      bounds: { x: 40, y: 334, width: 22, height: 16 },
      blameLine: 'It is the pet shop. It is ALWAYS going to be the pet shop.',
    },
    {
      id: 'shoe-shop',
      kind: 'blame',
      bounds: { x: 28, y: 380, width: 24, height: 14 },
      blameLine: 'Four hundred people have tried those on and not one of them bought them.',
    },
    {
      id: 'food-bins',
      kind: 'blame',
      bounds: { x: 64, y: 410, width: 20, height: 16 },
      blameLine: 'The bins behind the food court are having a day.',
    },
    {
      id: 'vape-kiosk',
      kind: 'blame',
      bounds: { x: 34, y: 268, width: 20, height: 14 },
      blameLine: 'Whatever that kiosk is selling, it is not for breathing.',
    },

    /*
     * The lift. Both ends point at each other; `levels-test` checks that they do
     * and that they are on different floors.
     */
    // --- two ends of one lift ----------------------------------------
    { id: 'lift-down', kind: 'lift', linkTo: 'lift-up', bounds: { x: 42, y: 176, width: 16, height: 18 } },
    { id: 'lift-up', kind: 'lift', linkTo: 'lift-down', bounds: { x: 42, y: 250, width: 16, height: 18 } },

    // --- somewhere to breathe ----------------------------------------
    { id: 'ac-vent', kind: 'freshAir', bounds: { x: 2, y: 100, width: 12, height: 14 } },
    { id: 'chiller-1', kind: 'freshAir', bounds: { x: 86, y: 190, width: 14, height: 14 } },
    { id: 'chiller-2', kind: 'freshAir', bounds: { x: 2, y: 332, width: 14, height: 14 } },
    { id: 'breeze-1', kind: 'freshAir', bounds: { x: 86, y: 418, width: 12, height: 16 } },

    // --- five ways out that are not -----------------------------------
    { id: 'staff-room', kind: 'falseExit', bounds: { x: 0, y: 0, width: 18, height: 14 } },
    { id: 'stockroom', kind: 'falseExit', bounds: { x: 70, y: 0, width: 18, height: 14 } },
    { id: 'front-desk-door', kind: 'falseExit', bounds: { x: 0, y: 438, width: 18, height: 14 } },
    { id: 'prop-cupboard', kind: 'falseExit', bounds: { x: 74, y: 438, width: 18, height: 14 } },
    { id: 'warehouse-door', kind: 'falseExit', bounds: { x: 86, y: 128, width: 14, height: 16 } },

    // --- things that will set Toots off -------------------------------
    { id: 'basket-stack', kind: 'bump', bounds: { x: 56, y: 84, width: 10, height: 12 } },
    { id: 'wet-floor-sign', kind: 'bump', bounds: { x: 22, y: 130, width: 10, height: 12 } },
    { id: 'shopping-trolley', kind: 'bump', bounds: { x: 54, y: 196, width: 12, height: 11 } },
    { id: 'water-bottles', kind: 'bump', bounds: { x: 58, y: 268, width: 10, height: 12 } },
    { id: 'crisp-display', kind: 'bump', bounds: { x: 20, y: 356, width: 12, height: 12 } },
    { id: 'pallet', kind: 'bump', bounds: { x: 30, y: 424, width: 12, height: 10 } },

    /*
     * Shop frontage down both sides, and the slab that makes two floors two
     * floors. Nothing crosses it but the lift.
     */
    // --- the shops ----------------------------------------------------
    { id: 'shops1-l0', kind: 'solid', bounds: { x: 0, y: 32, width: 20, height: 16 } },
    { id: 'shops1-r0', kind: 'solid', bounds: { x: 80, y: 44, width: 20, height: 16 } },
    { id: 'shops1-l1', kind: 'solid', bounds: { x: 0, y: 84, width: 20, height: 16 } },
    { id: 'shops1-r1', kind: 'solid', bounds: { x: 80, y: 96, width: 20, height: 16 } },
    { id: 'shops1-l2', kind: 'solid', bounds: { x: 0, y: 136, width: 20, height: 16 } },
    { id: 'shops1-r2', kind: 'solid', bounds: { x: 80, y: 148, width: 20, height: 16 } },
    { id: 'shops2-l0', kind: 'solid', bounds: { x: 0, y: 264, width: 20, height: 16 } },
    { id: 'shops2-r0', kind: 'solid', bounds: { x: 80, y: 276, width: 20, height: 16 } },
    { id: 'shops2-l1', kind: 'solid', bounds: { x: 0, y: 316, width: 20, height: 16 } },
    { id: 'shops2-r1', kind: 'solid', bounds: { x: 80, y: 328, width: 20, height: 16 } },
    { id: 'shops2-l2', kind: 'solid', bounds: { x: 0, y: 368, width: 20, height: 16 } },
    { id: 'shops2-r2', kind: 'solid', bounds: { x: 80, y: 380, width: 20, height: 16 } },
    { id: 'slab', kind: 'solid', bounds: { x: 0, y: 210, width: 100, height: 24 } },
  ],

  /*
   * Weighted upstairs. The way out is on the ground floor, so clearing the room
   * leaves the group a lift ride away from it — which is the "where does the
   * last fish leave you standing" rule with a three-second wait bolted on.
   */
  nuggets: [
    { x: 30, y: 40 },
    { x: 66, y: 70 },
    { x: 34, y: 100 },
    { x: 70, y: 138 },
    { x: 46, y: 156 },
    { x: 32, y: 258 },
    { x: 68, y: 250 },
    { x: 44, y: 286 },
    { x: 72, y: 310 },
    { x: 30, y: 330 },
    { x: 58, y: 352 },
    { x: 36, y: 378 },
    { x: 70, y: 396 },
    { x: 48, y: 424 },
    { x: 62, y: 440 },
  ],

  /*
   * Shoppers, split across both floors. They roam like the school's crowd rather
   * than the restaurant's: everybody in a mall is on their way somewhere, but
   * slowly, and none of them is in a hurry to get out of your way.
   */
  crowd: [
    { at: { x: 30, y: 46 }, roam: 10 },
    { at: { x: 68, y: 110 }, roam: 12 },
    { at: { x: 40, y: 150 }, roam: 11 },
    { at: { x: 34, y: 272 }, roam: 12 },
    { at: { x: 70, y: 320 }, roam: 11 },
    { at: { x: 44, y: 384 }, roam: 12 },
    { at: { x: 64, y: 430 }, roam: 10 },
  ],
};
