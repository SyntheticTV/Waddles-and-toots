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


/**
 * What somebody says a few seconds after a toot, all game long.
 *
 * This is the biggest list in the game by a long way, and it has to be: the
 * player sets these off themselves, dozens of times a round, so a list short
 * enough to notice is a list that stops being funny by the second room. They are
 * dealt from a shuffled bag rather than picked at random — see `voices.ts` — so
 * every one of them is heard before any of them comes round again.
 *
 * Nobody is named as the speaker. The joke is that it could be anybody in the
 * room, and the casting gives each line its own voice for free.
 */
export const TOOT_REACTIONS = [
  'Oh my.',
  "What's that smell?",
  'Oh my goodness.',
  'Whew wee!',
  'Whoa.',
  'Uggh.',
  'Who cut the cheese?',
  "That's rank.",
  'My goodness.',
  "That's spicy.",
  'Wow.',
  'Did you do that?',
  "That's ripe.",
  'Foul. FOUL!',
  "That's a crime against the nostrils.",
  'Smells like something died and came back for revenge.',
  'Roadkill, anyone?',
  "Oh, that's a war crime.",
  'That owes me an apology.',
  'That could knock a buzzard off a manure truck.',
  'Bill. Did that just follow you in?',
  'What an odor.',
  'Awww, the smell of silence.',
  "Who's marinating in regret?",
  'Eau de dumpster.',
  'Smells like ambition without a bath.',
  'Call the smell police.',
  'Did something crawl in and give up?',
  'Boy howdy.',
  'The air in here has seen things.',
  "I didn't order this with my meal.",
  "Whatever's cooking, it's not food anymore.",
  'Man, I just got ambushed.',
  "Someone's recycling smells.",
  'I do not consent to this.',
  "That's clearly not going down without a fight.",
  'This place reeks.',
  "That's not a smell, it's a hazard.",
  'Nose: betrayed.',
  'Smell check failed.',
  'This is not it.',
  "Someone's losing this fight.",
  "That's respectfully rancid.",
  'Whew. No.',
  'Smells like regret.',
  'Nope.',
  'Noped right out.',
  "That's a whole vibe, and not a good one.",
  "That's main character energy.",
  'Breathing through my mouth now.',
  'Nose says run.',
  "That's a lot to take in.",
  'Smells like a bad decision.',

  // and a few more in the same spirit
  'Somebody check the casserole.',
  "Oh, that one's got a flavour.",
  'I can HEAR that smell.',
  'My eyes are doing a bit.',
  "That's a two-window problem.",
  'I felt that in my teeth.',
  'The plants are wilting.',
  "That's not allowed.",
  'Sir. SIR.',
  "I'm tasting colours.",
  "That's a personal attack.",
  'Excuse me — was that legal?',
  'I have questions.',
  'Somebody owes this room a refund.',
  'That one had a wind-up.',
  'Put it back.',
  'The paint is coming off the wall.',
  'I would like to speak to whoever is responsible.',
  'Respectfully: no.',
] as const;

/**
 * What somebody says on the way between floors.
 *
 * The lift is the only place in the game where the player cannot move, and this
 * is what they get for it: three seconds in a sealed metal box with a skunk and
 * a stranger, and the stranger has an opinion. Dealt from a bag like the toot
 * reactions, so a mall you ride four times is four different remarks.
 */
export const ELEVATOR_LINES = [
  'Do not push that button again.',
  "Oh. Oh, that one's going to leave a mark.",
  'Man... let me OFF this thing.',
  'Which one of us is going to say it?',
  'Three floors. Three. We have three floors of this.',
  'I am holding my breath until the doors open.',
  'Sir, this is a lift.',
  'Somebody has brought something in here with them.',
  'I would like to take the stairs. I would like that very much.',
  "We're all thinking it.",
  'Is it going to be like this the whole way up?',
  'I have made a terrible mistake.',
  'Nobody move. Nobody breathe.',
  "That's the fourth floor, and I'm getting out at the second.",
  'Going down? I am certainly going down.',
] as const;

/** Every stock line in the game, for anything that needs the full list. */
export const ALL_STOCK_LINES: readonly string[] = [
  ...NOTICED,
  ...PANIC,
  ...CAUGHT,
  ...DECOY_PAYOFF,
  ...TOOT_REACTIONS,
  ...ELEVATOR_LINES,
];
