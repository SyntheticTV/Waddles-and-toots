/**
 * Every sound in the game, and how loud it sits.
 *
 * The wav files are generated — `npm run sounds` rebuilds them from
 * `tools/make-sounds.mjs`, which is the actual source. Don't hand-edit them.
 *
 * `voices` is how many copies of a sound can overlap. Two nuggets a quarter of a
 * second apart should both be heard, so nuggets get three voices; there is only
 * ever one loss sting, so it gets one.
 */

import type { GameEventKind } from '../game/engine';
import type { SceneryKind } from '../game/types';

export interface SoundSpec {
  source: number;
  /** Mixed level, 0–1. Set by ear against the poof, which is the loudest thing. */
  gain: number;
  voices: number;
  loop?: boolean;
}

export const SOUNDS = {
  /** Gurgle gurgle. The sound the game is named after. */
  poof: { source: require('../../assets/audio/poof.wav'), gain: 1, voices: 2 },
  nugget: { source: require('../../assets/audio/nugget.wav'), gain: 0.55, voices: 3 },
  decoy: { source: require('../../assets/audio/decoy.wav'), gain: 0.8, voices: 1 },
  blame: { source: require('../../assets/audio/blame.wav'), gain: 0.7, voices: 2 },
  sniff: { source: require('../../assets/audio/sniff.wav'), gain: 0.6, voices: 2 },
  panic: { source: require('../../assets/audio/panic.wav'), gain: 0.8, voices: 1 },
  escaped: { source: require('../../assets/audio/escaped.wav'), gain: 0.9, voices: 1 },
  caught: { source: require('../../assets/audio/caught.wav'), gain: 0.9, voices: 1 },
  leash: { source: require('../../assets/audio/leash.wav'), gain: 0.7, voices: 1 },
  slide: { source: require('../../assets/audio/slide.wav'), gain: 0.5, voices: 2 },
  'local-found': { source: require('../../assets/audio/local-found.wav'), gain: 0.7, voices: 1 },
  snore: { source: require('../../assets/audio/snore.wav'), gain: 0.6, voices: 1 },
  /**
   * Ruff ruff: his nose has cleared and he knows the way. In a room too thick to
   * read, this is the navigation system. §8.
   */
  bark: { source: require('../../assets/audio/bark.wav'), gain: 0.85, voices: 1 },
  /** The tell: the local yawning before it goes under. §9. */
  yawn: { source: require('../../assets/audio/yawn.wav'), gain: 0.6, voices: 1 },
  /** Woken by a bump or a poof going off next to it. */
  startle: { source: require('../../assets/audio/startle.wav'), gain: 0.7, voices: 1 },
  'fresh-air': { source: require('../../assets/audio/fresh-air.wav'), gain: 0.6, voices: 1 },
  'slide-empty': { source: require('../../assets/audio/slide-empty.wav'), gain: 0.55, voices: 1 },
  /** The last nugget is in and the way out just unlocked. */
  'gate-open': { source: require('../../assets/audio/gate-open.wav'), gain: 0.85, voices: 1 },
  /** Menus. The only sound in the game that isn't a joke. */
  'ui-tap': { source: require('../../assets/audio/ui-tap.wav'), gain: 0.45, voices: 2 },

  /** The yard, always there. */
  'bed-yard': { source: require('../../assets/audio/bed-yard.wav'), gain: 0.5, voices: 1, loop: true },
  /** Indoors: babble, cutlery, and the extractor. Always there. */
  'bed-room': { source: require('../../assets/audio/bed-room.wav'), gain: 0.5, voices: 1, loop: true },
  /** The pressure, faded up by the meter. */
  'bed-stink': { source: require('../../assets/audio/bed-stink.wav'), gain: 0.7, voices: 1, loop: true },
  /** The jingle, on its own switch in settings. Plays everywhere. */
  'music-jingle': {
    source: require('../../assets/audio/music-jingle.wav'),
    gain: 0.3,
    voices: 1,
    loop: true,
  },
} as const satisfies Record<string, SoundSpec>;

export type SoundId = keyof typeof SOUNDS;

/**
 * What the room itself sounds like. A restaurant does not have wind in the
 * hedge, and a bed that belongs to the wrong room is the kind of thing a player
 * hears immediately without being able to say why.
 *
 * Exactly one of these plays at a time; the audio service fades the others out
 * when the room changes.
 */
export const ROOM_BEDS = ['bed-yard', 'bed-room'] as const satisfies readonly SoundId[];

export const BED_FOR_SCENERY: Record<SceneryKind, (typeof ROOM_BEDS)[number]> = {
  yard: 'bed-yard',
  indoor: 'bed-room',
};

/**
 * What each thing the simulation reports sounds like. Everything else the audio
 * layer plays — the sniff, the panic, the slide, the fresh air — is edge-
 * triggered off `RunState` rather than off an event, because the engine has no
 * event for "the room just got worse".
 */
export const SOUND_FOR_EVENT: Partial<Record<GameEventKind, SoundId>> = {
  poof: 'poof',
  nugget: 'nugget',
  decoy: 'decoy',
  blame: 'blame',
  'leash-warning': 'leash',
  'slide-empty': 'slide-empty',
  escaped: 'escaped',
  caught: 'caught',
  'local-found': 'local-found',
  'local-asleep': 'snore',
  'gate-open': 'gate-open',
};
