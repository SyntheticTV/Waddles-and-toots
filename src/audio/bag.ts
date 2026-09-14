/**
 * Dealing lines fairly.
 *
 * The crowd's lists are the game's writing, and the toot reactions are seventy
 * of them, so how one gets chosen matters more than it looks. Picking at random
 * is wrong in a way players notice within a minute: over any list, straight
 * random repeats itself within a few draws often enough to read as a bug, while
 * some lines go an entire session unheard. The rarest joke should be guaranteed,
 * not lucky.
 *
 * So lines come out of a shuffled bag. Every line is dealt once before any line
 * comes round again, and the order is different each time through the bag.
 *
 * Pure, and deliberately not in `src/game/` — nothing here decides anything
 * about the game, it just decides who gets the next joke.
 */

/**
 * Makes a dealer over `list`.
 *
 * `random` is injectable so the guarantee can be tested against an adversarial
 * sequence rather than against luck.
 */
export function dealer<T>(list: readonly T[], random: () => number = Math.random): () => T {
  let bag: T[] = [];
  let last: T | null = null;

  return (): T => {
    if (bag.length === 0) {
      bag = [...list];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      /*
       * A fresh bag can otherwise open on the very line the last one closed
       * with — the one back-to-back repeat that a bag is supposed to rule out,
       * and the only place the guarantee can leak.
       */
      if (bag.length > 1 && bag[bag.length - 1] === last) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
      }
    }
    last = bag.pop() as T;
    return last;
  };
}
