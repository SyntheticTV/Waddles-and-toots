import type { LevelSpec } from '../game/types';
import { backyardBbq } from './backyardBbq';

/**
 * Levels unlock in order (GAME_DESIGN.md §13). The launch set is five rooms;
 * the rest of the list lives in the design doc until each one is authored.
 */
export const LEVELS: LevelSpec[] = [backyardBbq];

export function levelById(id: string): LevelSpec | undefined {
  return LEVELS.find((l) => l.id === id);
}
