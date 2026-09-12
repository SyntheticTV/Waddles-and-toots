import type { LevelSpec } from '../game/types';

/**
 * Level 1 — Backyard BBQ. The gentle one: a wide-open yard, a thin crowd, and
 * blame targets sitting in plain sight so a first-time player learns what the
 * meter does before a room gets tight.
 *
 * Portrait, so you climb the yard: patio at the bottom, side gate at the top.
 */
export const backyardBbq: LevelSpec = {
  id: 'backyard-bbq',
  name: 'Backyard BBQ',
  exitLabel: 'the side gate',
  height: 460,

  entry: { x: 50, y: 10 },
  exit: { x: 60, y: 446, width: 24, height: 14 },

  local: { species: 'squirrel', at: { x: 14, y: 312 } },

  props: [
    // --- things the crowd would rather blame -------------------------------
    {
      id: 'potato-salad',
      kind: 'blame',
      bounds: { x: 30, y: 96, width: 24, height: 12 },
      blameLine: "It's GOT to be the potato salad.",
    },
    {
      id: 'grill',
      kind: 'blame',
      bounds: { x: 64, y: 150, width: 20, height: 16 },
      blameLine: 'Something in that grill has gone WRONG.',
    },
    {
      id: 'uncles-shoes',
      kind: 'blame',
      bounds: { x: 12, y: 208, width: 14, height: 9 },
      blameLine: "Dave. DAVE. Is that your shoes again?",
    },
    {
      id: 'trash-can',
      kind: 'blame',
      bounds: { x: 78, y: 268, width: 16, height: 16 },
      blameLine: 'Who put FISH in the trash?',
    },
    {
      id: 'kiddie-pool',
      kind: 'blame',
      bounds: { x: 22, y: 372, width: 26, height: 18 },
      blameLine: "That pool water's been out here since MAY.",
    },

    // --- fresh air ---------------------------------------------------------
    { id: 'sprinkler', kind: 'freshAir', bounds: { x: 8, y: 140, width: 16, height: 16 } },
    { id: 'hedge-gap', kind: 'freshAir', bounds: { x: 86, y: 330, width: 12, height: 20 } },

    // --- things that startle Toots -----------------------------------------
    { id: 'lawn-chairs', kind: 'bump', bounds: { x: 52, y: 226, width: 12, height: 10 } },
    { id: 'croquet-set', kind: 'bump', bounds: { x: 70, y: 300, width: 14, height: 8 } },
    { id: 'wind-chime', kind: 'bump', bounds: { x: 40, y: 398, width: 8, height: 8 } },
    { id: 'water-bowl', kind: 'bump', bounds: { x: 18, y: 62, width: 9, height: 7 } },

    // --- furniture ---------------------------------------------------------
    { id: 'picnic-table', kind: 'solid', bounds: { x: 28, y: 88, width: 28, height: 22 } },
    { id: 'cooler', kind: 'solid', bounds: { x: 60, y: 248, width: 14, height: 11 } },
    { id: 'shed', kind: 'solid', bounds: { x: 0, y: 418, width: 26, height: 30 } },
  ],

  nuggets: [
    { x: 22, y: 44 },
    { x: 72, y: 70 },
    { x: 50, y: 120 },
    { x: 88, y: 132 },
    { x: 16, y: 176 },
    { x: 60, y: 196 },
    { x: 34, y: 244 },
    { x: 84, y: 232 },
    { x: 46, y: 288 },
    { x: 12, y: 336 },
    { x: 66, y: 356 },
    { x: 30, y: 412 },
    { x: 78, y: 420 },
  ],

  crowd: [
    { at: { x: 44, y: 112 }, roam: 10 },
    { at: { x: 70, y: 138 }, roam: 8 },
    { at: { x: 24, y: 186 }, roam: 12 },
    { at: { x: 58, y: 220 }, roam: 10 },
    { at: { x: 82, y: 262 }, roam: 9 },
    { at: { x: 36, y: 292 }, roam: 12 },
    { at: { x: 64, y: 336 }, roam: 10 },
    { at: { x: 26, y: 380 }, roam: 11 },
    { at: { x: 72, y: 404 }, roam: 9 },
  ],
};
