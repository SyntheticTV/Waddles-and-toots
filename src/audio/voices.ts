/**
 * The people talking.
 *
 * The animals never speak — that rule is not negotiable (§14.2). What the crowd
 * says, though, is the best writing in the game, and until now it only existed
 * as text on screen, which is no use at all to the six-year-old this is built
 * for. Every line the room says is now said out loud by the device voice.
 *
 * Three things make that bearable rather than maddening:
 *
 * - **One voice at a time.** `Speech.speak` queues, and a queue means a line
 *   about the potato salad arriving twenty seconds after anybody cared. Lines
 *   have a priority instead: a more urgent one cuts off a lesser one, a lesser
 *   one is dropped.
 * - **A person sounds like themselves.** Pitch and rate come from a hash of the
 *   line, so the one who blames the potato salad sounds the same every time, and
 *   sounds different from the one blaming the grill.
 * - **It stays out of the way.** The tune ducks under a line, and everything is
 *   behind its own switch in settings.
 *
 * Lines are *recorded* where a recording exists — `npm run voices` bakes the
 * game's whole script into `assets/voice/` at build time — and spoken by the
 * device otherwise. That fallback is not a nicety: it is what lets a new line be
 * written and heard immediately, before anybody has re-run the recorder.
 */

import * as Speech from 'expo-speech';

import { getSettings } from '../settings';
import { dealer } from './bag';
import { duckMusic, playSound, playVoiceClip, stopVoiceClips } from './audio';
import { SCREAM_MS, SCREAMS } from './library';
import { CAUGHT, DECOY_PAYOFF, NOTICED, PANIC, TOOT_REACTIONS } from './lines';
import { clipFor } from './voiceClips';

/**
 * Who goes next when two people want to speak.
 *
 * Nobody ever talks *over* anybody: a line in progress is always allowed to
 * finish. Priority no longer decides who interrupts — it decides who gets the
 * channel next, which is a different and much better-behaved rule. Two voices at
 * once is unintelligible, and in a game where the jokes *are* the content,
 * losing half of two lines is worse than hearing one of them a beat late.
 */
const PRIORITY = {
  sniff: 1,
  blame: 2,
  /** One of the group reacting. Worth hearing over the room's muttering. */
  animal: 3,
  decoy: 3,
  /**
   * Somebody's verdict on a toot. Above the muttering because the player pressed
   * a button and is owed the joke they paid for, below panic because by then the
   * room has bigger problems.
   */
  toot: 3,
  panic: 4,
  caught: 5,
} as const;

type LineKind = keyof typeof PRIORITY;

/** Nothing new within this of the last line. */
const MIN_GAP_MS = 900;

/**
 * The beat between one person finishing and the next one starting.
 *
 * Shorter than `MIN_GAP_MS`, because that gap is there to stop the room
 * gabbling at a player who is standing still, and this one only has to read as a
 * second person rather than the same person carrying on.
 */
const QUEUE_GAP_MS = 420;

/**
 * How long a line will wait its turn before giving up.
 *
 * A queue with no expiry is how you end up hearing about the potato salad twenty
 * seconds after anybody cared — the thing the old cut-in rule existed to
 * prevent. Waiting is fine; arriving after its moment is not.
 */
const LINE_WAIT_MS = 2600;

/** The beat before the joke lands. §7. */
const DECOY_PAYOFF_MS = 900;

/**
 * How long the room takes to notice a toot.
 *
 * The delay is the joke. Firing on the frame the poof happens reads as a sound
 * effect; three seconds later reads as somebody across the room slowly working
 * out that something is wrong, which is much funnier and is also long enough for
 * the poof itself to have finished being heard. A little scatter on it stops a
 * long round sounding metronomic.
 */
const TOOT_REACTION_MS = 3000;
const TOOT_SCATTER_MS = 500;

/**
 * How often somebody skips the commentary and just screams.
 *
 * Every fifth or sixth verdict, rather than every fifth: a fixed interval is
 * something a player works out inside two rooms, and a gag you can see coming is
 * not a gag. Randomising between the two keeps it a surprise while keeping the
 * rate roughly what it says on the tin.
 */
export const SCREAM_EVERY = [5, 6];

/**
 * The longest a single line may hold the channel.
 *
 * Everything here hangs on being told when a line finished, and that news comes
 * from the platform — a clip that never reports finishing, a device with no
 * installed voice, an utterance swallowed by an interruption. Any of those would
 * otherwise wedge `speaking` on and the room would never speak again, which is
 * precisely the failure this guards: the crowd going quiet for the rest of the
 * game after one bad line. Longer than any line in the game, short enough that a
 * player would not notice the gap.
 */
const LINE_TIMEOUT_MS = 6000;

let speaking = false;
let speakingPriority = 0;
let lastSpokeAt = 0;
let rotation = 0;
let payoffTimer: ReturnType<typeof setTimeout> | null = null;
let queueTimer: ReturnType<typeof setTimeout> | null = null;
/**
 * The one line waiting its turn.
 *
 * Exactly one, not a list. A backlog is its own failure — the room would spend a
 * quiet moment reciting everything it thought of while it was busy — so a new
 * arrival either outranks whoever is waiting and replaces them, or is dropped.
 */
let pending: { priority: number; at: number; run: () => void } | null = null;
let tootTimer: ReturnType<typeof setTimeout> | null = null;
let screamTimer: ReturnType<typeof setTimeout> | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Everyone in the crowd is a different person, and stays that person. */
function voiceFor(text: string, kind: LineKind): Speech.SpeechOptions {
  const h = hash(text);
  if (kind === 'panic') {
    // Shouted: higher and quicker, because they are halfway to the door.
    return { pitch: 1.2 + (h % 12) / 100, rate: 1.12 + (h % 7) / 100 };
  }
  return { pitch: 0.86 + (h % 38) / 100, rate: 0.94 + ((h >> 5) % 22) / 100 };
}

function pick(list: readonly string[]): string {
  rotation = (rotation + 1) % 9973;
  return list[rotation % list.length];
}

/** Seventy-odd verdicts on a toot, dealt so every one of them is heard. */
const dealToot = dealer(TOOT_REACTIONS);
/** And the screams, so the same one never lands twice running either. */
const dealScream = dealer(SCREAMS);
let tootsUntilScream = SCREAM_EVERY[0];

/**
 * Hold a line back until the channel is free, or decide it is not worth it.
 *
 * Ties go to whoever asked first, so a room full of people muttering does not
 * keep shuffling its own queue.
 */
function remember(priority: number, run: () => void): void {
  if (pending && pending.priority >= priority) return;
  pending = { priority, at: Date.now(), run };
}

function finished(): void {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
  speaking = false;
  speakingPriority = 0;
  duckMusic(false);

  // Whoever was waiting gets their turn, after a beat.
  const next = pending;
  pending = null;
  if (!next) return;
  if (Date.now() - next.at > LINE_WAIT_MS) return;
  if (queueTimer) clearTimeout(queueTimer);
  queueTimer = setTimeout(() => {
    queueTimer = null;
    next.run();
  }, QUEUE_GAP_MS);
}

/**
 * Takes the one voice channel, or decides not to.
 *
 * Screams go through here as well as lines, because a scream is somebody in the
 * room reacting out loud — it is not a sound effect that happens to be a person,
 * and it must not land on top of a punchline.
 */
function claim(priority: number, queued = false): boolean {
  const settings = getSettings();
  // Voices sit under the sound switch: turning sound off should make the game
  // quiet, not quiet-except-for-the-talking.
  if (!settings.sound || !settings.voices) return false;

  const now = Date.now();

  // Somebody is talking. Nothing cuts in — not panic, not being caught.
  if (speaking) return false;
  /*
   * And somebody is already waiting in the gap between two lines, so nothing
   * jumps in front of them either. Without this, a line arriving during that
   * beat takes the channel and the one that had been waiting is dropped when its
   * turn finally comes — queue-jumping, which is the same rudeness by a
   * different route.
   */
  if (!queued && queueTimer) return false;
  // A line that has already waited its turn has served the gap.
  if (!queued && now - lastSpokeAt < MIN_GAP_MS) return false;

  /*
   * A scream holds the channel on a timer of its own, and a stale one would
   * count down to release *this* line's channel instead — so it goes before the
   * new occupant moves in.
   */
  if (screamTimer) {
    clearTimeout(screamTimer);
    screamTimer = null;
  }

  speaking = true;
  speakingPriority = priority;
  lastSpokeAt = now;
  duckMusic(true);

  // Hand the channel back even if nothing ever tells us the line ended.
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(finished, LINE_TIMEOUT_MS);
  return true;
}

/**
 * Says a line, or decides not to. Everything funnels through here so there is
 * exactly one place that knows about queueing, priority and the switches.
 */
function say(text: string, kind: LineKind, then?: () => void, queued = false): void {
  if (!claim(PRIORITY[kind], queued)) {
    // Wait for a gap rather than talking over them — but only one attempt, so a
    // line that still cannot get in when its turn comes is simply late news.
    if (!queued) remember(PRIORITY[kind], () => say(text, kind, then, true));
    return;
  }

  const done = () => {
    finished();
    then?.();
  };

  // A proper recording if we have one...
  const clip = clipFor(text);
  if (clip !== undefined && playVoiceClip(clip, done)) return;

  // ...and the device's own voice if we do not.
  try {
    Speech.speak(text, {
      language: 'en-US',
      ...voiceFor(text, kind),
      onDone: done,
      onStopped: finished,
      onError: finished,
    });
  } catch {
    // A device with no voices installed still gets the line on screen.
    finished();
  }
}

// ------------------------------------------------------------- the lines

/** "...do you smell that?" — the first head turning. §5. */
export function sayNoticed(): void {
  say(pick(NOTICED), 'sniff');
}

/** "EVERYBODY OUT!" */
export function sayPanic(): void {
  say(pick(PANIC), 'panic');
}

/** Whatever the room has decided it must be. Comes from the level. */
export function sayBlame(text: string): void {
  say(text, 'blame');
}

/**
 * Fluffy's moment. When he takes the fall himself it is a two-beat joke — the
 * accusation, a pause while they actually sniff him, and then the deflation —
 * so the payoff is spoken after the first line finishes rather than queued
 * behind it (§7).
 */
export function sayDecoy(text: string, tookTheFallHimself: boolean): void {
  if (!tookTheFallHimself) {
    say(text, 'decoy');
    return;
  }
  say(text, 'decoy', () => {
    const payoff = pick(DECOY_PAYOFF);
    if (payoffTimer) clearTimeout(payoffTimer);
    payoffTimer = setTimeout(() => say(payoff, 'blame'), DECOY_PAYOFF_MS);
  });
}

/**
 * Somebody notices a toot, a few seconds after the fact.
 *
 * Only one reaction is ever in the air: a player holding the button down would
 * otherwise queue up a dozen of them and the room would still be working
 * through the backlog two screens later. A run of toots gets one verdict, which
 * is also how a real room behaves — people react to a smell, not to each
 * individual emission.
 */
export function reactToToot(): void {
  if (tootTimer) return;

  /*
   * Every fifth or sixth reaction, somebody gives up on words. Decided now
   * rather than when the timer fires, so the line and the scream are drawn from
   * their bags in the same order they are heard.
   */
  const screaming = --tootsUntilScream <= 0;
  if (screaming) {
    tootsUntilScream = SCREAM_EVERY[Math.floor(Math.random() * SCREAM_EVERY.length)];
  }
  const line = screaming ? null : dealToot();
  const scream = screaming ? dealScream() : null;

  const delay = TOOT_REACTION_MS + Math.random() * TOOT_SCATTER_MS;
  tootTimer = setTimeout(() => {
    tootTimer = null;
    if (line !== null) {
      say(line, 'toot');
      return;
    }
    // A scream holds the channel for its own length: nothing knows when a
    // one-shot finished, and there is no callback to wait on.
    if (!claim(PRIORITY.toot)) {
      remember(PRIORITY.toot, () => {
        if (!claim(PRIORITY.toot, true)) return;
        playSound(scream as (typeof SCREAMS)[number]);
        if (screamTimer) clearTimeout(screamTimer);
        screamTimer = setTimeout(() => {
          screamTimer = null;
          finished();
        }, SCREAM_MS);
      });
      return;
    }
    playSound(scream as (typeof SCREAMS)[number]);
    if (screamTimer) clearTimeout(screamTimer);
    screamTimer = setTimeout(() => {
      screamTimer = null;
      finished();
    }, SCREAM_MS);
  }, delay);
}

/** They worked it out. */
export function sayCaught(): void {
  say(pick(CAUGHT), 'caught');
}

/**
 * One of the group saying something about the state of things — currently the
 * local nodding off (§9). Animals talk now; Waddles still does not, because he
 * has not noticed anything and never will.
 */
export function sayAnimal(text: string): void {
  say(text, 'animal');
}

/** Leaving the room, or turning the switch off: stop talking immediately. */
export function hushVoices(): void {
  if (payoffTimer) {
    clearTimeout(payoffTimer);
    payoffTimer = null;
  }
  if (tootTimer) {
    clearTimeout(tootTimer);
    tootTimer = null;
  }
  if (screamTimer) {
    clearTimeout(screamTimer);
    screamTimer = null;
  }
  /*
   * Drop whoever was waiting *before* handing the channel back — `finished` is
   * what starts the next line, so clearing this afterwards meant leaving the
   * room kicked off the very line it was supposed to cancel.
   */
  if (queueTimer) {
    clearTimeout(queueTimer);
    queueTimer = null;
  }
  pending = null;
  Speech.stop().catch(() => {});
  stopVoiceClips();
  finished();
  // Forget when we last spoke, too. Otherwise walking straight back into a room
  // swallows its first line, because the gap between lines is still counting
  // down from the last run.
  lastSpokeAt = 0;
}
