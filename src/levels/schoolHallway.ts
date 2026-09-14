import type { LevelSpec } from '../game/types';

/**
 * Level 3 — School Hallway, between classes.
 *
 * The first room that is genuinely about *finding the way out*, which is what
 * §10 says rooms three and up are for. A school corridor is the perfect excuse:
 * it is a hundred feet of identical doors, and three of the ones at the far end
 * look exactly like the way out. Only the fire doors are, and they are off to
 * one side rather than dead centre, so the obvious guess is wrong. This is the
 * room where a player learns that the hamster is not optional.
 *
 * It is also the first room whose crowd actually *moves*. The diners downstairs
 * barely roamed — they were an obstacle course, not a threat — and careless play
 * scored better in room two than in room one because of it. Kids between classes
 * are the opposite: everybody is walking somewhere, nobody is looking, and the
 * hallway refills behind you.
 *
 * The lockers jut in from alternating sides, so the climb is a zigzag rather
 * than a straight run. That matters more than it sounds: a straight corridor
 * with a crowd in it has exactly one decision in it, and this way each bank is
 * a choice about which side to take before the crowd closes.
 *
 * Portrait, so you climb the room: the main doors at the bottom, the gym at the
 * top.
 */
export const schoolHallway: LevelSpec = {
  id: 'school-hallway',
  name: 'School Hallway',
  exitLabel: 'the gym fire doors',
  height: 480,
  scenery: 'indoor',

  entry: { x: 50, y: 10 },
  /*
   * Off to the left, not in the middle. Rooms one and two both put the way out
   * where you would look first; this one does not, and the two duds beside it
   * are the more obvious guess.
   */
  exit: { x: 6, y: 466, width: 22, height: 14 },

  local: { species: 'hamster', at: { x: 90, y: 214 } },

  props: [
    // --- things a school would much rather blame ---------------------------
    {
      id: 'locker-row',
      kind: 'blame',
      bounds: { x: 74, y: 62, width: 22, height: 16 },
      blameLine: 'Wow. Now THAT is a locker smell.',
    },
    {
      id: 'gym-bag',
      kind: 'blame',
      bounds: { x: 10, y: 118, width: 18, height: 12 },
      blameLine: 'Somebody needs a bath. And somebody knows who they are.',
    },
    {
      id: 'cafeteria-doors',
      kind: 'blame',
      bounds: { x: 66, y: 168, width: 26, height: 18 },
      blameLine: 'What kind of food are they cooking in the cafeteria?',
    },
    {
      id: 'science-lab',
      kind: 'blame',
      bounds: { x: 8, y: 232, width: 24, height: 18 },
      blameLine: 'Science class has a problem again.',
    },
    {
      id: 'milk-carton',
      kind: 'blame',
      bounds: { x: 70, y: 270, width: 12, height: 10 },
      blameLine: 'Somebody has had a milk in their desk since September.',
    },
    {
      id: 'lost-and-found',
      kind: 'blame',
      bounds: { x: 12, y: 330, width: 22, height: 14 },
      blameLine: "I'm fairly sure the lost and found has become sentient.",
    },
    {
      id: 'kevins-locker',
      kind: 'blame',
      bounds: { x: 54, y: 388, width: 14, height: 20 },
      blameLine: 'KEVIN. Kevin, we have TALKED about this.',
    },

    // --- the only two lungfuls in the building -----------------------------
    // Both sit on the route rather than off it, because the meter never falls
    // and these are the only pauses in the whole climb (§12 checklist).
    { id: 'stairwell-window', kind: 'freshAir', bounds: { x: 87, y: 132, width: 12, height: 18 } },
    { id: 'ac-vent', kind: 'freshAir', bounds: { x: 2, y: 352, width: 12, height: 14 } },

    // --- three ways out, and only one of them is one -----------------------
    // Two of them share the end wall with the real thing, which rooms one and
    // two were not allowed to do (§10). The stairwell door is the mean one: it
    // is on the way, and it looks like an escape long before the end wall does.
    { id: 'boys-room', kind: 'falseExit', bounds: { x: 36, y: 466, width: 18, height: 14 } },
    { id: 'supply-closet', kind: 'falseExit', bounds: { x: 70, y: 466, width: 18, height: 14 } },
    { id: 'stairwell-door', kind: 'falseExit', bounds: { x: 84, y: 300, width: 14, height: 16 } },

    // --- things that will set Toots off ------------------------------------
    { id: 'backpack-pile', kind: 'bump', bounds: { x: 44, y: 88, width: 14, height: 10 } },
    { id: 'trash-can', kind: 'bump', bounds: { x: 30, y: 200, width: 10, height: 12 } },
    { id: 'fire-extinguisher', kind: 'bump', bounds: { x: 92, y: 252, width: 7, height: 12 } },
    { id: 'mop-bucket', kind: 'bump', bounds: { x: 48, y: 312, width: 11, height: 10 } },
    { id: 'open-locker', kind: 'bump', bounds: { x: 38, y: 424, width: 10, height: 16 } },

    /*
     * The lockers, jutting in from alternating sides.
     *
     * The ones on the right stop short of the wall, leaving a squeeze behind
     * them. That gap is not decoration: a bank that runs wall to wall makes a
     * *pocket*, and a pocket with a mandatory fish in it (§11) is a trap — you
     * have to notice on the way past or walk the whole hallway back. The left
     * banks can run to the wall because nothing is parked behind them.
     */
    // All five are the same size, so one drawing serves the lot: prop art is
    // fitted to its footprint, and a bank of a different shape would be the same
    // lockers at a different scale.
    { id: 'lockers-a', kind: 'solid', bounds: { x: 0, y: 54, width: 36, height: 12 } },
    { id: 'lockers-b', kind: 'solid', bounds: { x: 54, y: 106, width: 36, height: 12 } },
    { id: 'lockers-c', kind: 'solid', bounds: { x: 0, y: 166, width: 36, height: 12 } },
    { id: 'lockers-d', kind: 'solid', bounds: { x: 52, y: 222, width: 36, height: 12 } },
    { id: 'lockers-e', kind: 'solid', bounds: { x: 0, y: 286, width: 36, height: 12 } },
    { id: 'trophy-case', kind: 'solid', bounds: { x: 66, y: 342, width: 34, height: 10 } },
    { id: 'radiator', kind: 'solid', bounds: { x: 0, y: 398, width: 26, height: 10 } },
    { id: 'vending-machines', kind: 'solid', bounds: { x: 72, y: 424, width: 24, height: 14 } },
  ],

  nuggets: [
    { x: 50, y: 30 },
    { x: 12, y: 78 },
    { x: 88, y: 92 },
    { x: 44, y: 130 },
    { x: 14, y: 150 },
    { x: 52, y: 196 },
    { x: 90, y: 200 },
    { x: 20, y: 256 },
    { x: 46, y: 272 },
    { x: 84, y: 318 },
    { x: 30, y: 358 },
    { x: 62, y: 348 },
    { x: 8, y: 424 },
    { x: 60, y: 440 },
    { x: 90, y: 462 },
  ],

  /*
   * Kids between classes. They roam about twice as far as the diners did, because
   * everybody in a hallway is on their way somewhere — which makes this the first
   * indoor room where standing still is not safe.
   *
   * Nine of them, the same as the backyard, even though this room is the tallest
   * of the three. The lockers already halve the usable width at every bank, so
   * the *effective* density here is far higher than the count suggests; eleven
   * made the room unwinnable without the decoy, which is a harder rule than room
   * three should be teaching.
   */
  crowd: [
    { at: { x: 66, y: 34 }, roam: 10 },
    { at: { x: 24, y: 96 }, roam: 12 },
    { at: { x: 78, y: 142 }, roam: 9 },
    { at: { x: 36, y: 186 }, roam: 11 },
    { at: { x: 70, y: 244 }, roam: 10 },
    { at: { x: 26, y: 300 }, roam: 13 },
    { at: { x: 58, y: 330 }, roam: 10 },
    { at: { x: 88, y: 372 }, roam: 9 },
    { at: { x: 34, y: 402 }, roam: 12 },
  ],
};
