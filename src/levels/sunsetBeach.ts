import type { LevelSpec } from '../game/types';

/**
 * Level 5 — Sunset Beach.
 *
 * The room with nowhere to hide.
 *
 * Every room so far has been made of cover. The backyard had furniture, the
 * restaurant had a grid of tables, the hallway had banks of lockers and the
 * studio had rows of mats — and in all four of them the way to survive a crowd
 * was to put something between you and it. A beach has none of that. There are
 * eight things on it and the rest is open sand, so the crowd can always see you
 * and the only real cover is distance.
 *
 * What replaces cover is **the water's edge**. The sea breeze runs the whole
 * left-hand side, so there is clean air all the way up it — which makes the
 * beach the first room with a genuine route decision rather than a maze. Hug
 * the water and the meter is on hold and the dog's nose works, but you are out
 * in the open with a long way to walk. Cut across the dry sand and it is half
 * the distance and there is not a lungful of clean air on it.
 *
 * The way out is back at the **top** this time. Room four put it at the bottom,
 * and if every room from here reversed it, "it is the other end now" would just
 * be the new rule to memorise. It has to actually vary or the local is pointless
 * again.
 */
export const sunsetBeach: LevelSpec = {
  id: 'sunset-beach',
  name: 'Sunset Beach',
  exitLabel: 'the boardwalk ramp',
  height: 560,
  scenery: 'beach',

  /** In at the middle, as every room does from four onward. */
  entry: { x: 52, y: 280 },

  /** The ramp up to the boardwalk, at the top — and not in the middle of it. */
  exit: { x: 70, y: 546, width: 22, height: 14 },

  /** The otter who lives at the end of the jetty and has seen everything. */
  local: { species: 'otter', at: { x: 14, y: 366 } },

  props: [
    // --- eight things a beach would much rather blame -----------------------
    {
      id: 'seaweed',
      kind: 'blame',
      bounds: { x: 12, y: 148, width: 22, height: 12 },
      blameLine: "That's the seaweed. That's just what the ocean smells like when it gives up.",
    },
    {
      id: 'bait-bucket',
      kind: 'blame',
      bounds: { x: 62, y: 106, width: 12, height: 14 },
      blameLine: 'WHO left the bait bucket in the sun? WHO DID THAT?',
    },
    {
      id: 'low-tide',
      kind: 'blame',
      bounds: { x: 10, y: 466, width: 24, height: 14 },
      blameLine: "It's low tide. Low tide is doing this to us. It is not our fault.",
    },
    {
      id: 'sunscreen',
      kind: 'blame',
      bounds: { x: 78, y: 222, width: 12, height: 12 },
      blameLine: "Somebody's wearing a sunscreen that expired during a different presidency.",
    },
    {
      id: 'old-cooler',
      kind: 'blame',
      bounds: { x: 30, y: 316, width: 20, height: 14 },
      blameLine: 'That cooler has been shut since Saturday. Nobody open it. NOBODY open it.',
    },
    {
      id: 'flip-flops',
      kind: 'blame',
      bounds: { x: 84, y: 396, width: 14, height: 10 },
      blameLine: 'Those flip-flops have walked through things we will never know about.',
    },
    {
      id: 'garys-catch',
      kind: 'blame',
      bounds: { x: 44, y: 442, width: 16, height: 12 },
      blameLine: 'Gary caught something. Gary should not have caught something.',
    },
    {
      id: 'boardwalk-bins',
      kind: 'blame',
      bounds: { x: 40, y: 512, width: 20, height: 16 },
      blameLine: 'The boardwalk bins have developed a personality. And an opinion.',
    },

    /*
     * The sea breeze, the whole way up the water's edge.
     *
     * Five of them, which is more than twice any other room, and that is the
     * level rather than generosity. On a beach with no cover, clean air is the
     * only thing you get for free — but all of it is on one side, so taking it
     * means walking the long way round in full view. That trade is the room.
     */
    { id: 'breeze-1', kind: 'freshAir', bounds: { x: 8, y: 60, width: 12, height: 16 } },
    { id: 'breeze-2', kind: 'freshAir', bounds: { x: 8, y: 196, width: 12, height: 16 } },
    { id: 'breeze-3', kind: 'freshAir', bounds: { x: 8, y: 288, width: 12, height: 16 } },
    { id: 'breeze-4', kind: 'freshAir', bounds: { x: 8, y: 410, width: 12, height: 16 } },
    { id: 'breeze-5', kind: 'freshAir', bounds: { x: 8, y: 520, width: 12, height: 16 } },

    // --- three ways off the beach, and only the ramp is one ------------------
    { id: 'pier-gate', kind: 'falseExit', bounds: { x: 26, y: 546, width: 18, height: 14 } },
    { id: 'dune-path', kind: 'falseExit', bounds: { x: 82, y: 300, width: 16, height: 16 } },
    { id: 'lifeguard-ramp', kind: 'falseExit', bounds: { x: 84, y: 96, width: 14, height: 16 } },

    // --- things that will set Toots off -------------------------------------
    { id: 'sandcastle', kind: 'bump', bounds: { x: 56, y: 178, width: 12, height: 10 } },
    { id: 'beach-ball', kind: 'bump', bounds: { x: 26, y: 244, width: 10, height: 10 } },
    { id: 'spade-bucket', kind: 'bump', bounds: { x: 70, y: 348, width: 10, height: 10 } },
    { id: 'kite', kind: 'bump', bounds: { x: 34, y: 396, width: 11, height: 12 } },
    { id: 'radio', kind: 'bump', bounds: { x: 62, y: 490, width: 11, height: 9 } },

    /*
     * And that is all the cover there is: eight objects on a beach 560 units
     * long. Umbrellas and windbreaks, because both are things you can be *seen
     * around* — an umbrella blocks the group's path without hiding them from
     * anybody, which is the beach's whole character.
     */
    { id: 'umbrella-1', kind: 'solid', bounds: { x: 38, y: 78, width: 18, height: 14 } },
    { id: 'umbrella-2', kind: 'solid', bounds: { x: 74, y: 154, width: 18, height: 14 } },
    { id: 'windbreak-1', kind: 'solid', bounds: { x: 22, y: 202, width: 26, height: 8 } },
    { id: 'umbrella-3', kind: 'solid', bounds: { x: 56, y: 264, width: 18, height: 14 } },
    { id: 'windbreak-2', kind: 'solid', bounds: { x: 62, y: 424, width: 26, height: 8 } },
    { id: 'umbrella-4', kind: 'solid', bounds: { x: 24, y: 358, width: 18, height: 14 } },
    { id: 'rowboat', kind: 'solid', bounds: { x: 66, y: 462, width: 24, height: 12 } },
    { id: 'lifeguard-tower', kind: 'solid', bounds: { x: 82, y: 60, width: 16, height: 22 } },
  ],

  /*
   * Spread the length of the beach, and pulled toward the dry side on purpose.
   *
   * The fish are the reason you cannot simply walk up the waterline. If they all
   * sat in the breeze the route would be one safe corridor and the room would
   * have no decision in it; out on the open sand, every one of them is a trip
   * away from the only clean air there is.
   */
  nuggets: [
    { x: 58, y: 302 },
    { x: 30, y: 274 },
    { x: 86, y: 262 },
    { x: 46, y: 216 },
    { x: 72, y: 190 },
    { x: 20, y: 168 },
    { x: 90, y: 138 },
    { x: 50, y: 118 },
    { x: 28, y: 76 },
    { x: 66, y: 44 },
    { x: 40, y: 352 },
    { x: 78, y: 384 },
    { x: 52, y: 414 },
    { x: 24, y: 432 },
    { x: 88, y: 448 },
    { x: 36, y: 486 },
    { x: 76, y: 520 },
    { x: 20, y: 540 },
  ],

  /*
   * A beach full of people, most of them wandering.
   *
   * Higher roam than any room so far, because nobody on a beach is *doing*
   * anything — they are ambling between the water and their towel, which means
   * the whole surface of the room is in play rather than the gaps between the
   * furniture. With no cover, that is the pressure: there is no spot on this
   * beach that stays empty.
   */
  crowd: [
    { at: { x: 34, y: 42 }, roam: 18 },
    { at: { x: 68, y: 86 }, roam: 20 },
    { at: { x: 46, y: 146 }, roam: 22 },
    { at: { x: 82, y: 196 }, roam: 16 },
    { at: { x: 24, y: 228 }, roam: 19 },
    { at: { x: 70, y: 302 }, roam: 21 },
    { at: { x: 40, y: 338 }, roam: 17 },
    { at: { x: 86, y: 352 }, roam: 15 },
    { at: { x: 30, y: 404 }, roam: 20 },
    { at: { x: 64, y: 448 }, roam: 18 },
    { at: { x: 44, y: 504 }, roam: 22 },
    { at: { x: 82, y: 528 }, roam: 16 },
  ],
};
