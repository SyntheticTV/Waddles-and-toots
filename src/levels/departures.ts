import type { LevelSpec } from '../game/types';

/**
 * Level 7 — Gate 14, Departures.
 *
 * The first room that is **wider than standard**, and the first whose way out is
 * in a *side* wall rather than an end.
 *
 * A terminal is the only place where this is not contrived. Everywhere else, a
 * wall of identical doors has to be explained; an airport simply has them —
 * gates, toilets, the staff door, the lift down to baggage, and the one jet
 * bridge that actually goes anywhere. Six ways out of this room and five of them
 * are somebody else's flight.
 *
 * The width does the rest of the work. Every room so far has been a hundred
 * units across, which at the normal zoom means the player can very nearly see
 * from one wall to the other. At a hundred and sixty they cannot: a terminal is
 * a place you cross *sideways*, and the crowd on the far side is genuinely out
 * of sight rather than merely far away. That is the point of the room, and it is
 * why the seating is laid out in long banks running with the width rather than
 * against it.
 *
 * In at the middle, as every room does from four onward.
 */
export const departures: LevelSpec = {
  id: 'gate-14-departures',
  name: 'Gate 14',
  exitLabel: 'the jet bridge',
  height: 360,
  /** Half again as wide as a standard room. */
  width: 160,
  scenery: 'indoor',

  entry: { x: 80, y: 180 },

  /*
   * The jet bridge, in the right-hand wall.
   *
   * `exitSide` works it out from the fact that it is flush against that wall, so
   * nothing in the level says which way is out — and the camera, the arrow and
   * the dog's nose all follow from it on their own.
   */
  exit: { x: 146, y: 168, width: 14, height: 26 },

  /**
   * Somebody's hamster, out of its carrier since security and thoroughly at
   * home. Not the grocery's ferret, and not a cat — Fluffy is the cat (§7).
   */
  local: { species: 'hamster', at: { x: 18, y: 208 } },

  props: [
    // --- eight things an airport would much rather blame --------------------
    {
      id: 'bag-check',
      kind: 'blame',
      bounds: { x: 22, y: 22, width: 26, height: 16 },
      blameLine: "That's a bag check that turned into a lot more than a bag check.",
    },
    {
      id: 'toilet-door',
      kind: 'blame',
      bounds: { x: 96, y: 22, width: 20, height: 16 },
      blameLine: 'It is coming from that direction and I will not be saying anything further.',
    },
    {
      id: 'shoe-trays',
      kind: 'blame',
      bounds: { x: 40, y: 104, width: 22, height: 12 },
      blameLine: 'Four hundred people took their shoes off in this room today. Four hundred.',
    },
    {
      id: 'jet-exhaust',
      kind: 'blame',
      bounds: { x: 120, y: 102, width: 22, height: 16 },
      blameLine: "Oof — that's some jet exhaust right there.",
    },
    {
      id: 'duty-free',
      kind: 'blame',
      bounds: { x: 30, y: 182, width: 24, height: 16 },
      blameLine: "Whoa. That's new. That one is NEW.",
    },
    {
      id: 'lost-luggage',
      kind: 'blame',
      bounds: { x: 118, y: 183, width: 24, height: 14 },
      blameLine: 'Somebody has been reunited with a bag they should have left lost.',
    },
    {
      id: 'food-court',
      kind: 'blame',
      bounds: { x: 18, y: 262, width: 28, height: 16 },
      blameLine: 'Whatever is on that hot plate has been on that hot plate since Tuesday.',
    },
    {
      id: 'cleaning-cart',
      kind: 'blame',
      bounds: { x: 112, y: 263, width: 20, height: 14 },
      blameLine: 'It stings. It stings the nostrils.',
    },

    /*
     * Air conditioning, which in a terminal is both everywhere and useless.
     * Scattered thinly rather than laid down one side like the beach, so no
     * single lane across the room is the safe one.
     */
    { id: 'ac-vent', kind: 'freshAir', bounds: { x: 2, y: 103, width: 12, height: 14 } },
    { id: 'chiller-1', kind: 'freshAir', bounds: { x: 70, y: 183, width: 14, height: 14 } },
    { id: 'breeze-1', kind: 'freshAir', bounds: { x: 146, y: 262, width: 12, height: 16 } },

    /*
     * Five ways out that are not, spread across three different walls — which
     * no room has done before. Until now a dud has always shared a wall with
     * the real one or sat somewhere on the way to it.
     */
    { id: 'staff-room', kind: 'falseExit', bounds: { x: 0, y: 126, width: 14, height: 18 } },
    { id: 'stockroom', kind: 'falseExit', bounds: { x: 0, y: 250, width: 14, height: 18 } },
    { id: 'boys-room', kind: 'falseExit', bounds: { x: 146, y: 96, width: 14, height: 18 } },
    { id: 'pier-gate', kind: 'falseExit', bounds: { x: 40, y: 346, width: 20, height: 14 } },
    { id: 'front-desk-door', kind: 'falseExit', bounds: { x: 100, y: 346, width: 20, height: 14 } },

    // --- things that will set Toots off -------------------------------------
    { id: 'basket-stack', kind: 'bump', bounds: { x: 130, y: 24, width: 10, height: 12 } },
    { id: 'wet-floor-sign', kind: 'bump', bounds: { x: 66, y: 24, width: 10, height: 12 } },
    { id: 'shopping-trolley', kind: 'bump', bounds: { x: 68, y: 105, width: 12, height: 11 } },
    { id: 'water-bottles', kind: 'bump', bounds: { x: 60, y: 264, width: 10, height: 12 } },
    { id: 'pallet', kind: 'bump', bounds: { x: 86, y: 265, width: 12, height: 10 } },
    { id: 'tin-tower', kind: 'bump', bounds: { x: 96, y: 183, width: 11, height: 14 } },

    /*
     * The seating, which is the skeleton of the room: four rows of three,
     * running *with* the width. Banks across the direction of travel would
     * make it a corridor again, and the point of a wide room is that getting
     * sideways past something is a real journey.
     *
     * The gaps between them are twenty-six units. Ten was a trap — the conga
     * line wedged and poofed eight times in thirty seconds trying to squeeze
     * through — and everything else in the room is placed in the lanes these
     * leave, rather than dropped in and nudged until it fitted.
     */
    { id: 'seats-1', kind: 'solid', bounds: { x: 8, y: 70, width: 28, height: 12 } },
    { id: 'seats-2', kind: 'solid', bounds: { x: 62, y: 70, width: 28, height: 12 } },
    { id: 'seats-3', kind: 'solid', bounds: { x: 116, y: 70, width: 28, height: 12 } },
    { id: 'seats-4', kind: 'solid', bounds: { x: 8, y: 150, width: 28, height: 12 } },
    { id: 'seats-5', kind: 'solid', bounds: { x: 62, y: 150, width: 28, height: 12 } },
    { id: 'seats-6', kind: 'solid', bounds: { x: 116, y: 150, width: 28, height: 12 } },
    { id: 'seats-7', kind: 'solid', bounds: { x: 8, y: 230, width: 28, height: 12 } },
    { id: 'seats-8', kind: 'solid', bounds: { x: 62, y: 230, width: 28, height: 12 } },
    { id: 'seats-9', kind: 'solid', bounds: { x: 116, y: 230, width: 28, height: 12 } },
    { id: 'seats-10', kind: 'solid', bounds: { x: 8, y: 306, width: 28, height: 12 } },
    { id: 'seats-11', kind: 'solid', bounds: { x: 62, y: 306, width: 28, height: 12 } },
    { id: 'seats-12', kind: 'solid', bounds: { x: 116, y: 306, width: 28, height: 12 } },
  ],

  /*
   * Weighted hard to the *west*, away from the jet bridge.
   *
   * Spread evenly, this room was trivial: the gate sits seventy units from where
   * the group comes in, on the same line, so the moment the last fish was in
   * they were already standing next to the door. Thirty runs out of thirty, in
   * half a minute. Fourteen of the eighteen are now at the far end, so clearing
   * the room leaves the whole width between the group and the way out — with a
   * high meter and a terminal's worth of people in between.
   *
   * It is the same lesson the yoga studio taught: what costs a player is not
   * where the fish are, it is where the *last* one leaves them standing.
   */
  nuggets: [
    { x: 10, y: 24 },
    { x: 30, y: 24 },
    { x: 50, y: 24 },
    { x: 74, y: 24 },
    { x: 98, y: 24 },
    { x: 20, y: 116 },
    { x: 42, y: 116 },
    { x: 66, y: 116 },
    { x: 88, y: 116 },
    { x: 130, y: 116 },
    { x: 10, y: 184 },
    { x: 30, y: 184 },
    { x: 50, y: 184 },
    { x: 74, y: 184 },
    { x: 98, y: 184 },
    { x: 20, y: 276 },
    { x: 42, y: 276 },
    { x: 66, y: 276 },
  ],

  /*
   * A terminal's worth of people, and the widest spread of any room.
   *
   * They roam like the beach crowd rather than the restaurant's — everybody in
   * an airport is either walking somewhere or about to — but there is far more
   * floor for them to do it on, so the density is lower than the count suggests.
   */
  crowd: [
    { at: { x: 24, y: 26 }, roam: 14 },
    { at: { x: 58, y: 34 }, roam: 16 },
    { at: { x: 92, y: 26 }, roam: 18 },
    { at: { x: 132, y: 34 }, roam: 20 },
    { at: { x: 34, y: 106 }, roam: 16 },
    { at: { x: 68, y: 114 }, roam: 18 },
    { at: { x: 102, y: 106 }, roam: 20 },
    { at: { x: 142, y: 114 }, roam: 14 },
    { at: { x: 24, y: 186 }, roam: 18 },
    { at: { x: 58, y: 194 }, roam: 20 },
    { at: { x: 92, y: 186 }, roam: 14 },
    { at: { x: 132, y: 194 }, roam: 16 },
    { at: { x: 34, y: 266 }, roam: 20 },
    { at: { x: 68, y: 274 }, roam: 14 },
  ],
};
