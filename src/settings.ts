/**
 * What the player has chosen, and where it is kept.
 *
 * Deliberately tiny: two switches, remembered between sessions. It lives outside
 * `src/game` because it is not a rule — the simulation neither knows nor cares
 * whether the sound is on.
 *
 * This is a plain module-level store rather than a context, because the audio
 * service is not a React component and still needs to read it. React reads it
 * through `useSettings`, everything else through `getSettings`.
 */

import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  /** Poofs, gurgles, the crowd — everything except the tune. */
  sound: boolean;
  /** The jingle under the game. */
  music: boolean;
  /**
   * The people saying what they think it is, out loud. Sits under `sound`:
   * turning the sound off should make the game quiet, not quiet-except-for-the-
   * talking.
   */
  voices: boolean;
}

const KEY = 'waddles-and-toots:settings:v1';

const DEFAULTS: Settings = { sound: true, music: true, voices: true };

let current: Settings = DEFAULTS;
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return current;
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  if (current[key] === value) return;
  current = { ...current, [key]: value };
  listeners.forEach((fn) => fn());
  // Fire and forget: a failed write costs the player their preference next
  // launch, which is not worth blocking a button tap over.
  AsyncStorage.setItem(KEY, JSON.stringify(current)).catch(() => {});
}

export function toggleSetting(key: keyof Settings): void {
  setSetting(key, !current[key]);
}

/** Called once on launch, before anything reads the store. */
export async function loadSettings(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<Settings>;
    current = {
      sound: typeof saved.sound === 'boolean' ? saved.sound : DEFAULTS.sound,
      music: typeof saved.music === 'boolean' ? saved.music : DEFAULTS.music,
      voices: typeof saved.voices === 'boolean' ? saved.voices : DEFAULTS.voices,
    };
    listeners.forEach((fn) => fn());
  } catch {
    // Corrupt or unreadable: the defaults are a perfectly good answer.
  }
}

export function subscribeToSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeToSettings, getSettings, getSettings);
}
