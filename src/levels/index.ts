import type { LevelSpec } from '../game/types';
import { backyardBbq } from './backyardBbq';
import { fineRestaurant } from './fineRestaurant';
import { schoolHallway } from './schoolHallway';
import { sunriseYoga } from './sunriseYoga';
import { cornerGrocery } from './cornerGrocery';
import { sunsetBeach } from './sunsetBeach';

/**
 * Levels unlock in order (GAME_DESIGN.md §13). The launch set is five rooms;
 * the rest of the list lives in the design doc until each one is authored.
 */
export const LEVELS: LevelSpec[] = [backyardBbq, fineRestaurant, schoolHallway, sunriseYoga, sunsetBeach, cornerGrocery];

export function levelById(id: string): LevelSpec | undefined {
  return LEVELS.find((l) => l.id === id);
}
