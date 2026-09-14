import type { LevelSpec } from '../game/types';
import { backyardBbq } from './backyardBbq';
import { fineRestaurant } from './fineRestaurant';
import { schoolHallway } from './schoolHallway';

/**
 * Levels unlock in order (GAME_DESIGN.md §13). The launch set is five rooms;
 * the rest of the list lives in the design doc until each one is authored.
 */
export const LEVELS: LevelSpec[] = [backyardBbq, fineRestaurant, schoolHallway];

export function levelById(id: string): LevelSpec | undefined {
  return LEVELS.find((l) => l.id === id);
}
