import type { LevelSpec } from '../game/types';

/**
 * Level 4 — Sunrise Yoga.
 *
 * The first room that does not climb.
 *
 * The group comes in through the middle of the studio and the way out is behind
 * them, at the *bottom* of the room, while the three doors at the top — the
 * front desk, the changing room, the prop cupboard — are all duds. Rooms one to
 * three trained the player to head for the top of the screen, and this is the
 * room that charges them for it. There is no way to know which end without the
 * cat, so the cat is no longer a nice-to-have.
 *
 * It is also the worst possible venue for this particular problem, which is why
 * it was on the shortlist from the start: a room full of people being told to
 * breathe in as deeply as they can.
 *
 * The crowd is the interesting part. Yogis hold a pose, so they drift slowly —
 * but the mats are laid in a grid you have to thread, and the two instructors
 * walk the room looking at everybody's form, which means two of the nine are
 * genuinely patrolling rather than milling. Standing still near a mat is safe;
 * standing still in the aisle is not.
 */
export const sunriseYoga: LevelSpec = {
  id: 'sunrise-yoga',
  name: 'Sunrise Yoga',
  exitLabel: 'the fire door behind the mats',
  height: 540,
  scenery: 'indoor',

  /** In at the middle, with half the room behind you and no idea which half. */
  entry: { x: 50, y: 270 },

  /*
   * At the *bottom*. The room is authored the same way every other room is —
   * `exitFacesUp` works it out from where this sits — so nothing else in the
   * level needs to know, and the camera turns round on its own.
   */
  exit: { x: 38, y: 0, width: 22, height: 14 },

  local: { species: 'cat', at: { x: 12, y: 227 } },

  props: [
    // --- a room full of people who are about to breathe in very deeply -----
    {
      id: 'hot-yoga-door',
      kind: 'blame',
      bounds: { x: 70, y: 296, width: 24, height: 18 },
      blameLine: 'That is the hot yoga room. Nobody has opened that door since Tuesday.',
    },
    {
      id: 'diffuser',
      kind: 'blame',
      bounds: { x: 20, y: 394, width: 12, height: 12 },
      blameLine: "I'm sorry — is that the DIFFUSER? Is the diffuser doing that?",
    },
    {
      id: 'mat-pile',
      kind: 'blame',
      bounds: { x: 60, y: 404, width: 22, height: 14 },
      blameLine: "Somebody's mat has reached enlightenment and this is what it smells like.",
    },
    {
      id: 'barbaras-mat',
      kind: 'blame',
      bounds: { x: 14, y: 483, width: 20, height: 12 },
      blameLine: 'Barbara brought her own mat again. Barbara ALWAYS brings her own mat.',
    },
    {
      id: 'kombucha',
      kind: 'blame',
      bounds: { x: 78, y: 178, width: 12, height: 14 },
      blameLine: 'Who brings kombucha to a yoga class? WHO?',
    },
    {
      id: 'sock-basket',
      kind: 'blame',
      bounds: { x: 10, y: 119, width: 20, height: 14 },
      blameLine: 'That is the sock basket. We do not talk about the sock basket.',
    },
    {
      id: 'incense',
      kind: 'blame',
      bounds: { x: 66, y: 76, width: 12, height: 16 },
      blameLine: 'The incense is losing. I want everyone to know the incense is LOSING.',
    },
    {
      id: 'tea-urn',
      kind: 'blame',
      bounds: { x: 26, y: 88, width: 16, height: 14 },
      blameLine: "That's the herbal tea. It has notes of pond.",
    },

    /*
     * Three lungfuls rather than the usual two, and the third one is at the far
     * end on purpose.
     *
     * This is the room where the nose decides everything: it is the nose that
     * tells you which end the way out is at (§8), and the nose only works in
     * clear air. With air only at the near end, a player who sweeps the far end
     * and then finds their nose fogged has no way to learn which way to run and
     * no way to fix it — which is not difficulty, it is a dead end.
     */
    { id: 'studio-window', kind: 'freshAir', bounds: { x: 2, y: 313, width: 12, height: 18 } },
    { id: 'ac-vent', kind: 'freshAir', bounds: { x: 88, y: 113, width: 12, height: 14 } },
    { id: 'fire-vent', kind: 'freshAir', bounds: { x: 2, y: 474, width: 12, height: 16 } },

    // --- three doors at the far end, none of them the way out --------------
    // Every one of them is at the top, because that is where four rooms of
    // training say the exit is. The real one is behind you (§10).
    { id: 'front-desk-door', kind: 'falseExit', bounds: { x: 10, y: 526, width: 18, height: 14 } },
    { id: 'changing-room', kind: 'falseExit', bounds: { x: 42, y: 526, width: 18, height: 14 } },
    { id: 'prop-cupboard', kind: 'falseExit', bounds: { x: 74, y: 526, width: 18, height: 14 } },

    // --- things that will set Toots off ------------------------------------
    { id: 'block-stack', kind: 'bump', bounds: { x: 52, y: 143, width: 11, height: 10 } },
    { id: 'water-bottles', kind: 'bump', bounds: { x: 28, y: 240, width: 10, height: 12 } },
    { id: 'singing-bowl', kind: 'bump', bounds: { x: 84, y: 270, width: 10, height: 8 } },
    { id: 'wobble-board', kind: 'bump', bounds: { x: 44, y: 362, width: 12, height: 9 } },
    { id: 'bolster-pile', kind: 'bump', bounds: { x: 36, y: 464, width: 12, height: 10 } },

    /*
     * The mats, laid out the way a class actually is: rows of three across the
     * room with a walkway either side of the middle one.
     *
     * Scattered islands were the first attempt and the room played like an empty
     * hall — brisk play crossed it in thirty-eight seconds with the meter barely
     * a quarter up, because there was nothing to walk *around*. Rows turn the
     * same floor into a route: the path through this room is now much longer
     * than the room is tall, which is what the hallway got from its lockers.
     */
    { id: 'mat-1-1', kind: 'solid', bounds: { x: 4, y: 60, width: 18, height: 12 } },
    { id: 'mat-1-2', kind: 'solid', bounds: { x: 41, y: 60, width: 18, height: 12 } },
    { id: 'mat-1-3', kind: 'solid', bounds: { x: 78, y: 60, width: 18, height: 12 } },
    { id: 'mat-2-1', kind: 'solid', bounds: { x: 4, y: 160, width: 18, height: 12 } },
    { id: 'mat-2-2', kind: 'solid', bounds: { x: 41, y: 160, width: 18, height: 12 } },
    { id: 'mat-2-3', kind: 'solid', bounds: { x: 78, y: 160, width: 18, height: 12 } },
    { id: 'mat-3-1', kind: 'solid', bounds: { x: 4, y: 340, width: 18, height: 12 } },
    { id: 'mat-3-2', kind: 'solid', bounds: { x: 41, y: 340, width: 18, height: 12 } },
    { id: 'mat-3-3', kind: 'solid', bounds: { x: 78, y: 340, width: 18, height: 12 } },
    { id: 'mat-4-1', kind: 'solid', bounds: { x: 4, y: 440, width: 18, height: 12 } },
    { id: 'mat-4-2', kind: 'solid', bounds: { x: 41, y: 440, width: 18, height: 12 } },
    { id: 'mat-4-3', kind: 'solid', bounds: { x: 78, y: 440, width: 18, height: 12 } },
    { id: 'mirror-wall', kind: 'solid', bounds: { x: 0, y: 240, width: 8, height: 26 } },
  ],

  /*
   * Weighted toward the far end — ten of the seventeen are up past the entrance,
   * seven are down between it and the way out.
   *
   * That weighting is the room. Because every fish is mandatory (§11) you are
   * going to visit both ends whatever you believe, so a false door on its own
   * costs a player almost nothing: by the time the gate unlocks they have been
   * everywhere. What *does* cost them is where the last fish leaves them
   * standing. Weight the fish to the wrong end and the gate tends to open with
   * most of the room between the group and the door, a high meter, and a crowd
   * that is hunting by then.
   *
   * Thirteen-to-four was the first attempt and it made the room unwinnable: the
   * sweep finished at the top and the walk back down through two patrollers at
   * full heat was not survivable by anybody, in any of 20 runs.
   */
  nuggets: [
    // the near half, between the entrance and the way out
    { x: 88, y: 244 },
    { x: 14, y: 236 },
    { x: 60, y: 196 },
    { x: 90, y: 140 },
    { x: 20, y: 120 },
    { x: 84, y: 58 },
    { x: 46, y: 44 },
    // and the far half, which has ten of the seventeen
    { x: 50, y: 296 },
    { x: 86, y: 322 },
    { x: 16, y: 330 },
    { x: 62, y: 376 },
    { x: 90, y: 394 },
    { x: 24, y: 410 },
    { x: 54, y: 428 },
    { x: 86, y: 470 },
    { x: 18, y: 486 },
    { x: 62, y: 516 },
  ],

  /*
   * Six holding a pose and five walking the room, and none of them parked near
   * the door the group comes in by — a patroller forty units from the entrance
   * caught careless play about four seconds in, and dying before you have
   * understood where you are is not difficulty, it is a bad first impression.
   *
   * The patrollers are the ones
   * that matter: in a room where everybody else drifts, a walker is the only
   * thing that will actually come and find you, and with two of them the room
   * played easier than the backyard — brisk play strolled it in thirty-five
   * seconds without once needing the cat.
   */
  crowd: [
    { at: { x: 20, y: 35 }, roam: 6 },
    { at: { x: 46, y: 78 }, roam: 20 },
    { at: { x: 28, y: 173 }, roam: 7 },
    { at: { x: 66, y: 157 }, roam: 22 },
    { at: { x: 72, y: 336 }, roam: 21 },
    { at: { x: 22, y: 289 }, roam: 6 },
    { at: { x: 56, y: 278 }, roam: 24 },
    { at: { x: 30, y: 348 }, roam: 20 },
    { at: { x: 50, y: 418 }, roam: 24 },
    { at: { x: 76, y: 400 }, roam: 7 },
    { at: { x: 40, y: 464 }, roam: 6 },
  ],
};
