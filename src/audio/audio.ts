/**
 * The game's ears, as a service rather than a hook.
 *
 * It is a service because the music has to keep playing across the home screen,
 * the settings panel and the room, and none of those outlive each other. The app
 * starts it once; screens call into it.
 *
 * Three jobs:
 *
 * - `playSound` fires a one-shot from a small pool of voices, so two nuggets a
 *   quarter of a second apart are both heard.
 * - `followRun` is called once a frame with the run. It fades the pressure bed up
 *   as the meter climbs and catches the moments the engine has no event for —
 *   the room turning, a slide starting, a lungful of fresh air.
 * - The jingle loops underneath all of it, on its own switch.
 *
 * Nothing here decides anything about the game. It reads `RunState` and makes
 * noise, the same contract the art has.
 */

import { useEffect } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { RunState } from '../game/engine';
import { stageFor } from '../game/stink';
import { STINK_MAX } from '../game/tuning';
import type { SceneryKind } from '../game/types';
import { getSettings, subscribeToSettings } from '../settings';
import { BED_FOR_SCENERY, ROOM_BEDS, SOUNDS, type SoundId } from './library';
import { hushVoices, sayNoticed, sayPanic } from './voices';

/** Below this the room is clean enough that the pressure bed stays silent. */
const BED_FLOOR = 12;

/**
 * How near you have to be to hear the local at all, in world units, and how
 * often a sleeping one snores.
 *
 * The local is a thing you go and find (§9), so it should be *audible* before it
 * is interesting: the snoring gets louder as you close on it, which turns a
 * sleeping Snoozalot into something you can hunt by ear.
 */
const LOCAL_EARSHOT = 46;
const SNORE_EVERY = 3.1;
/** Native volume calls are not free — only push a change this big or bigger. */
const VOLUME_EPSILON = 0.04;

/**
 * How far the jingle drops while somebody is talking.
 *
 * It has to be a long way down. The crowd's lines are the game — the joke, and
 * on a bad-smelling day the only thing telling you what the room thinks — and a
 * tune sitting a few dB under a recorded voice is exactly the mix where the
 * words stop being words. Losing the music for two seconds costs nothing;
 * losing a punchline costs the round.
 */
const DUCK = 0.25;

interface Voices {
  players: AudioPlayer[];
  next: number;
}

interface Bank {
  voices: Map<SoundId, Voices>;
  level: Map<SoundId, number>;
  was: { stage: string; sliding: boolean; freshAir: boolean; outcome: string; localMood: string };
  inGame: boolean;
  /** Which room bed belongs to the level being played. */
  bed: (typeof ROOM_BEDS)[number];
  /** When the sleeping local last snored, on the run's own clock. */
  lastSnoreAt: number;
}

let bank: Bank | null = null;
/** The tune steps back while somebody is talking. */
let ducked = false;

/**
 * Two players kept aside for recorded crowd lines, swapping their source as
 * needed. Two rather than one so the next line can be loading while the current
 * one finishes, and not seventeen, because only one person talks at a time.
 */
let voicePlayers: AudioPlayer[] = [];
let voiceNext = 0;
/**
 * The listener waiting on each voice player, so it can be taken off again.
 *
 * A clip that gets interrupted must have its listener removed: otherwise it sits
 * there for the rest of the session and fires against a line that finished long
 * ago, and the players are pooled so it fires on somebody else's clip.
 */
let voiceSubs: Array<{ remove: () => void } | null> = [];

function voicesOf(id: SoundId): Voices | undefined {
  return bank?.voices.get(id);
}

function firstVoice(id: SoundId): AudioPlayer | undefined {
  return voicesOf(id)?.players[0];
}

/** Sets a looping player's volume, skipping the native call when it barely moved. */
function setLevel(id: SoundId, target: number): void {
  if (!bank) return;
  const player = firstVoice(id);
  if (!player) return;
  const now = bank.level.get(id) ?? -1;
  if (Math.abs(target - now) < VOLUME_EPSILON) return;
  bank.level.set(id, target);
  try {
    player.volume = target;
  } catch {
    // The player can be torn down between frames on a fast unmount.
  }
}

// ------------------------------------------------------------- lifecycle

export function startAudio(): void {
  if (bank) return;

  // Sound effects should sit alongside whatever else is playing, and the
  // hardware silent switch should silence the game — on a game for small
  // children that switch is the mute a parent reaches for first.
  setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => {});

  const voices = new Map<SoundId, Voices>();
  (Object.keys(SOUNDS) as SoundId[]).forEach((id) => {
    const spec = SOUNDS[id];
    const players: AudioPlayer[] = [];
    for (let i = 0; i < spec.voices; i++) {
      const player = createAudioPlayer(spec.source);
      player.volume = spec.gain;
      players.push(player);
    }
    voices.set(id, { players, next: 0 });
  });

  // A short line needs its completion noticed promptly, or the voice channel
  // stays busy after the room has stopped talking. The default is half a second,
  // which is most of a line like "Got him!".
  voicePlayers = [
    createAudioPlayer(null, { updateInterval: 100 }),
    createAudioPlayer(null, { updateInterval: 100 }),
  ];
  voiceSubs = [null, null];
  voiceNext = 0;

  bank = {
    voices,
    level: new Map(),
    was: { stage: 'calm', sliding: false, freshAir: false, outcome: 'playing', localMood: 'waiting' },
    inGame: false,
    bed: 'bed-yard',
    lastSnoreAt: -99,
  };

  // Everything that loops starts now and never stops; only volume moves.
  ([...ROOM_BEDS, 'bed-stink', 'music-jingle'] as const).forEach((id) => {
    const player = firstVoice(id);
    if (!player) return;
    player.loop = true;
    player.volume = 0;
    bank?.level.set(id, 0);
    try {
      player.play();
    } catch {
      // nothing to do; the next settings pass will try again
    }
  });

  applyAudioSettings();
}

export function stopAudio(): void {
  const dying = bank;
  bank = null;
  voicePlayers.forEach((p, i) => {
    try {
      voiceSubs[i]?.remove();
      p.remove();
    } catch {
      // already gone
    }
  });
  voicePlayers = [];
  voiceSubs = [];
  if (!dying) return;
  dying.voices.forEach(({ players }) => {
    players.forEach((p) => {
      try {
        p.remove();
      } catch {
        // already gone
      }
    });
  });
}

/** Re-reads the settings store and pushes it at the players. */
export function applyAudioSettings(): void {
  if (!bank) return;
  const { sound, music } = getSettings();

  setLevel('music-jingle', music ? SOUNDS['music-jingle'].gain * (ducked ? DUCK : 1) : 0);
  if (!sound) {
    ROOM_BEDS.forEach((id) => setLevel(id, 0));
    setLevel('bed-stink', 0);
  } else if (bank.inGame) {
    setRoomBed(bank.bed);
  }
}

/**
 * Plays a recorded crowd line, and calls back when it has finished.
 *
 * Returns false if it could not — no player, or the clip would not load — so the
 * voice layer can fall back to the device's own speech rather than the room
 * going quiet.
 */
export function playVoiceClip(source: number, onFinished: () => void): boolean {
  if (voicePlayers.length === 0) return false;
  const slot = voiceNext;
  const player = voicePlayers[slot];
  voiceNext = (voiceNext + 1) % voicePlayers.length;

  try {
    // Whatever this player was doing before, nobody is waiting on it now.
    voiceSubs[slot]?.remove();
    voiceSubs[slot] = null;

    let settled = false;
    let started = false;
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (settled) return;
      if (status.playing) started = true;
      /*
       * `didJustFinish` is the documented signal, but it is a single flag on a
       * polled status and it only has to be missed once to leave the channel
       * busy for the rest of the game. So a clip that was playing and has since
       * stopped counts as finished too — whichever arrives first.
       */
      const stopped = started && !status.playing && !status.isBuffering;
      if (!status.didJustFinish && !stopped) return;
      settled = true;
      subscription.remove();
      if (voiceSubs[slot] === subscription) voiceSubs[slot] = null;
      onFinished();
    });
    voiceSubs[slot] = subscription;

    player.replace(source);
    player.volume = 1;
    player.play();
    return true;
  } catch {
    voiceSubs[slot]?.remove();
    voiceSubs[slot] = null;
    return false;
  }
}

/** Cuts off whatever is being said, and stops waiting for it. */
export function stopVoiceClips(): void {
  voicePlayers.forEach((p, i) => {
    try {
      voiceSubs[i]?.remove();
      voiceSubs[i] = null;
      p.pause();
    } catch {
      // already gone
    }
  });
}

/**
 * Raises one room bed and silences the rest, so a room only ever sounds like
 * itself.
 */
function setRoomBed(id: (typeof ROOM_BEDS)[number], loudness = 1): void {
  ROOM_BEDS.forEach((other) => {
    setLevel(other, other === id ? SOUNDS[id].gain * loudness : 0);
  });
}

/**
 * Pulls the jingle down under a spoken line and puts it back afterwards. Called
 * by the voice layer, which is the only thing that talks.
 */
export function duckMusic(on: boolean): void {
  if (ducked === on) return;
  ducked = on;
  applyAudioSettings();
}

/**
 * The room beds belong to a run, not to the app. Entering also forgets what the
 * last run sounded like, so a retry announces its first sniff again.
 */
export function enterGame(scenery: SceneryKind = 'yard'): void {
  if (!bank) return;
  bank.inGame = true;
  bank.bed = BED_FOR_SCENERY[scenery];
  bank.was = {
    stage: 'calm',
    sliding: false,
    freshAir: false,
    outcome: 'playing',
    localMood: 'waiting',
  };
  bank.lastSnoreAt = -99;
  applyAudioSettings();
}

export function leaveGame(): void {
  hushVoices();
  if (!bank) return;
  bank.inGame = false;
  ROOM_BEDS.forEach((id) => setLevel(id, 0));
  setLevel('bed-stink', 0);
}

// ---------------------------------------------------------------- playing

export function playSound(id: SoundId, loudness = 1): void {
  if (!bank || !getSettings().sound) return;
  const pool = voicesOf(id);
  if (!pool || pool.players.length === 0) return;

  const player = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  try {
    player.volume = SOUNDS[id].gain * Math.max(0, Math.min(1, loudness));
    // Rewind first: a player that has already finished will not restart on its
    // own, and a voice stolen mid-sound should start over.
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // A player can be torn down between frames on a fast unmount.
  }
}

/** Call once a frame with the current run. */
export function followRun(run: RunState): void {
  if (!bank) return;

  const stage = stageFor(run.stink);
  const over = run.outcome !== 'playing';
  const audible = getSettings().sound && bank.inGame;

  // The pressure bed climbs with the meter and drops out when it is over.
  const pressure = over
    ? 0
    : Math.max(0, Math.min(1, (run.stink - BED_FLOOR) / (STINK_MAX - BED_FLOOR)));
  setLevel('bed-stink', audible ? SOUNDS['bed-stink'].gain * pressure * pressure : 0);

  // The room's own bed follows the level, not the app: a restaurant has no wind
  // in it. Read every frame rather than latched at `enterGame`, because the
  // screen brackets the whole session and the level under it can change.
  bank.bed = BED_FOR_SCENERY[run.level.scenery ?? 'yard'];
  if (audible) setRoomBed(bank.bed, over ? 0.4 : 1);
  else ROOM_BEDS.forEach((id) => setLevel(id, 0));

  // The room turning. Each stage announces itself once, on the way up — with a
  // sound, and with somebody actually saying it.
  if (stage !== bank.was.stage) {
    if (stage === 'sniff' && bank.was.stage === 'calm') {
      playSound('sniff');
      sayNoticed();
    }
    if (stage === 'panic') {
      playSound('panic');
      sayPanic();
    }
    bank.was.stage = stage;
  }

  if (run.sliding && !bank.was.sliding) playSound('slide');
  bank.was.sliding = run.sliding;

  /*
   * Into fresh air: the shimmer, and then Sniffsalot barking because his nose has
   * come back (§8). The bark is the point — it is the one unambiguous "I know
   * where we are going" in a room nobody can see across.
   */
  const freshAir = run.freshAirLock > 0;
  if (freshAir && !bank.was.freshAir) {
    playSound('fresh-air');
    playSound('bark');
  }
  bank.was.freshAir = freshAir;

  followLocal(run);

  // A retry rebuilds the run in place, so reset what we remember about it.
  if (run.outcome === 'playing' && bank.was.outcome !== 'playing') {
    bank.was.stage = 'calm';
    bank.was.sliding = false;
    bank.was.freshAir = false;
  }
  bank.was.outcome = run.outcome;
}

/**
 * The animal who lives here, heard rather than seen.
 *
 * Everything it does has a noise now: the yawn that gives a Snoozalot away a
 * second before it goes (§9), the snoring while it is under, and the snort when
 * something wakes it. All of it fades with distance, so walking toward a snore
 * is a way of finding the thing — and none of it is speech, because the animals
 * never speak (§14.2).
 */
function followLocal(run: RunState): void {
  if (!bank) return;

  const dx = run.local.pos.x - run.waddles.x;
  const dy = run.local.pos.y - run.waddles.y;
  const distance = Math.hypot(dx, dy);
  if (distance > LOCAL_EARSHOT) {
    bank.was.localMood = run.local.mood;
    return;
  }

  // Right on top of it is full volume; the edge of earshot is silence.
  const nearness = 1 - distance / LOCAL_EARSHOT;
  const loudness = nearness * nearness;

  if (run.local.mood !== bank.was.localMood) {
    if (run.local.mood === 'drowsy') playSound('yawn', loudness);
    if (run.local.mood === 'startled') playSound('startle', loudness);
    if (run.local.mood === 'asleep') bank.lastSnoreAt = run.elapsed - SNORE_EVERY;
    bank.was.localMood = run.local.mood;
  }

  if (run.local.mood === 'asleep' && run.elapsed - bank.lastSnoreAt >= SNORE_EVERY) {
    bank.lastSnoreAt = run.elapsed;
    playSound('snore', loudness);
  }
}

// ------------------------------------------------------------------ hook

/** Mounted once, by the app. Starts the service and follows the settings. */
export function useAudioService(): void {
  useEffect(() => {
    startAudio();
    const unsubscribe = subscribeToSettings(() => {
      applyAudioSettings();
      // Turning the talking off should stop the sentence that is already out,
      // not wait politely for it to finish.
      const { sound, voices } = getSettings();
      if (!sound || !voices) hushVoices();
    });
    return () => {
      unsubscribe();
      stopAudio();
    };
  }, []);
}
