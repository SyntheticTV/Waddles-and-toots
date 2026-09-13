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
import { duckMusic, playVoiceClip, stopVoiceClips } from './audio';
import { CAUGHT, DECOY_PAYOFF, NOTICED, PANIC } from './lines';
import { clipFor } from './voiceClips';

/** Louder, later, more urgent: a bigger number talks over a smaller one. */
const PRIORITY = {
  sniff: 1,
  blame: 2,
  /** One of the group reacting. Worth hearing over the room's muttering. */
  animal: 3,
  decoy: 3,
  panic: 4,
  caught: 5,
} as const;

type LineKind = keyof typeof PRIORITY;

/** Nothing new within this of the last line, unless it outranks it. */
const MIN_GAP_MS = 900;

/** The beat before the joke lands. §7. */
const DECOY_PAYOFF_MS = 900;

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

function finished(): void {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
  speaking = false;
  speakingPriority = 0;
  duckMusic(false);
}

/**
 * Says a line, or decides not to. Everything funnels through here so there is
 * exactly one place that knows about queueing, priority and the switches.
 */
function say(text: string, kind: LineKind, then?: () => void): void {
  const settings = getSettings();
  // Voices sit under the sound switch: turning sound off should make the game
  // quiet, not quiet-except-for-the-talking.
  if (!settings.sound || !settings.voices) return;

  const priority = PRIORITY[kind];
  const now = Date.now();

  if (speaking) {
    // Only something more urgent gets to cut in.
    if (priority <= speakingPriority) return;
    Speech.stop().catch(() => {});
    stopVoiceClips();
  } else if (now - lastSpokeAt < MIN_GAP_MS && priority < PRIORITY.panic) {
    return;
  }

  speaking = true;
  speakingPriority = priority;
  lastSpokeAt = now;
  duckMusic(true);

  // Hand the channel back even if nothing ever tells us the line ended.
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(finished, LINE_TIMEOUT_MS);

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
  Speech.stop().catch(() => {});
  stopVoiceClips();
  finished();
  // Forget when we last spoke, too. Otherwise walking straight back into a room
  // swallows its first line, because the gap between lines is still counting
  // down from the last run.
  lastSpokeAt = 0;
}
