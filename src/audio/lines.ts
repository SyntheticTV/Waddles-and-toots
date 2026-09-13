/**
 * Everything the crowd says that isn't authored in a level.
 *
 * This is a plain data module on purpose: it imports nothing, so it can be read
 * by the app *and* by a build script that has to know every line in the game up
 * front — which is what pre-recording the voices needs.
 *
 * The level files own the rest. A prop's `blameLine` is level content, because
 * what the room blames depends on what is in the room.
 *
 * More than one of each, because a gag that repeats word for word stops being a
 * gag (GAME_DESIGN.md §14.1).
 */

/** "...do you smell that?" — the first head turning. §5 stage 1. */
export const NOTICED = [
  '...do you smell that?',
  'What is that?',
  'Does anyone else smell that?',
] as const;

/** §5 stage 3. */
export const PANIC = ['EVERYBODY OUT!', 'OUT! OUT! OUT!', 'I can taste it!'] as const;

/** They worked it out and got him. */
export const CAUGHT = ['It was the SKUNK!', 'Got him!', 'I knew it!'] as const;

/** The second half of the cat gag, once they have had a proper sniff of him. §7. */
export const DECOY_PAYOFF = [
  "...that's not it either.",
  '...no, that is not it.',
] as const;

/** Every stock line in the game, for anything that needs the full list. */
export const ALL_STOCK_LINES: readonly string[] = [
  ...NOTICED,
  ...PANIC,
  ...CAUGHT,
  ...DECOY_PAYOFF,
];
