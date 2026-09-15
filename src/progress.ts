/**
 * What the player has got through, and where it is kept.
 *
 * Same shape as `settings.ts` on purpose — a plain module-level store behind
 * `useSyncExternalStore`, saved to AsyncStorage and read synchronously by
 * anything that is not a React component. It lives outside `src/game` for the
 * same reason: it is not a rule. The simulation has no idea which room it is,
 * how many came before it, or whether anybody has been here before.
 *
 * Rooms unlock in order and stay unlocked (GAME_DESIGN.md §13). Nothing here
 * ever takes something away: losing a run costs you nothing you had already
 * earned, which for the six-year-old this is built for is the whole difference
 * between a game they come back to and one they do not.
 *
 * Keyed by level **id**, never by index, so inserting a room in the middle does
 * not hand somebody else's stars to the room that took its place.
 */

import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** What a player has managed in one room. */
export interface RoomRecord {
  /** Got everybody out. This is what unlocks the next room. */
  cleared: boolean;
  /** Got everybody out without Toots going off once. §13's second star. */
  noPoof: boolean;
  /**
   * Quickest clear, in seconds.
   *
   * Recorded but not yet shown as a star: §13 has a third star still to decide
   * and speed is the obvious candidate, so this is here to stop the answer being
   * "we have no data" when somebody picks. It costs one number per room.
   */
  bestSeconds: number | null;
}

export interface Progress {
  /** By level id. A room with no entry has never been finished. */
  rooms: Record<string, RoomRecord>;
}

const KEY = 'waddles-and-toots:progress:v1';

const EMPTY: Progress = { rooms: {} };

let current: Progress = EMPTY;
const listeners = new Set<() => void>();

export function getProgress(): Progress {
  return current;
}

/** What somebody has managed in one room, or nothing if they have not. */
export function recordFor(levelId: string): RoomRecord | undefined {
  return current.rooms[levelId];
}

/**
 * Rooms unlock in order: the first is always open, and each one after it opens
 * when the one before it is cleared.
 *
 * Takes the ordered list rather than reading it, so this stays a pure function
 * of what the caller is actually showing.
 */
export function isUnlocked(levelIds: readonly string[], index: number): boolean {
  if (index <= 0) return true;
  return current.rooms[levelIds[index - 1]]?.cleared === true;
}

/** How many rooms are open, which is also where "continue" starts looking. */
export function unlockedCount(levelIds: readonly string[]): number {
  let n = 1;
  while (n < levelIds.length && current.rooms[levelIds[n - 1]]?.cleared) n++;
  return n;
}

/**
 * Where START should drop you: the first room you have not cleared, or the last
 * one if you have cleared them all.
 *
 * Not "the furthest unlocked", which would send a player who has finished the
 * game straight back into the last room forever with no way to replay the rest
 * without going through the picker every time.
 */
export function nextUnfinished(levelIds: readonly string[]): number {
  const i = levelIds.findIndex((id) => !current.rooms[id]?.cleared);
  return i === -1 ? Math.max(0, levelIds.length - 1) : i;
}

/**
 * Save the result of a run. Called on every ending, win or lose — the house
 * rules say save on level end, always, and a lost run still has a first-visit
 * to remember.
 *
 * Nothing here is ever downgraded: a clean second run cannot take away a star
 * from a messy first one, and a slow replay cannot spoil a quick time.
 */
export function recordRun(
  levelId: string,
  result: { cleared: boolean; poofs: number; seconds: number }
): void {
  const was = current.rooms[levelId];
  const cleared = (was?.cleared ?? false) || result.cleared;
  const noPoof = (was?.noPoof ?? false) || (result.cleared && result.poofs === 0);
  const bestSeconds = result.cleared
    ? was?.bestSeconds != null
      ? Math.min(was.bestSeconds, result.seconds)
      : result.seconds
    : (was?.bestSeconds ?? null);

  if (was && was.cleared === cleared && was.noPoof === noPoof && was.bestSeconds === bestSeconds) {
    return;
  }

  current = { rooms: { ...current.rooms, [levelId]: { cleared, noPoof, bestSeconds } } };
  listeners.forEach((fn) => fn());
  // Fire and forget, like the settings: a failed write costs a star, and is not
  // worth blocking the end card over.
  AsyncStorage.setItem(KEY, JSON.stringify(current)).catch(() => {});
}

/** Called once on launch, before anything reads the store. */
export async function loadProgress(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<Progress>;
    const rooms: Record<string, RoomRecord> = {};
    for (const [id, r] of Object.entries(saved.rooms ?? {})) {
      // Anything unreadable is treated as never played rather than trusted: a
      // corrupt file must not be able to unlock the whole game or crash a launch.
      if (!r || typeof r !== 'object') continue;
      rooms[id] = {
        cleared: (r as RoomRecord).cleared === true,
        noPoof: (r as RoomRecord).noPoof === true,
        bestSeconds:
          typeof (r as RoomRecord).bestSeconds === 'number' &&
          Number.isFinite((r as RoomRecord).bestSeconds)
            ? (r as RoomRecord).bestSeconds
            : null,
      };
    }
    current = { rooms };
    listeners.forEach((fn) => fn());
  } catch {
    // Corrupt or unreadable: starting at the first room is a fine answer.
  }
}

/** For tests, and for a "start again" the player has explicitly asked for. */
export function clearProgress(): void {
  current = EMPTY;
  listeners.forEach((fn) => fn());
  AsyncStorage.removeItem(KEY).catch(() => {});
}

export function subscribeToProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribeToProgress, getProgress, getProgress);
}
