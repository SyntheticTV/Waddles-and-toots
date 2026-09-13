/**
 * The drawing kit every piece of art in the game is made from.
 *
 * The house style (GAME_DESIGN.md §15) is flat vector shapes with a heavy ink
 * outline. Nothing here knows any rules — it is pencils, not play.
 *
 * Characters are authored in a 100-unit-tall box with the origin **at their
 * feet**: x runs -50..50, y runs -100 (top of the head) to 0 (the ground). That
 * way a character can be dropped at a world position and scaled to any size
 * without re-drawing, and the same paths serve a phone and an iPad.
 */

import { Skia, type SkPath, type Transforms3d } from '@shopify/react-native-skia';

/**
 * SVG path strings are the nicest way to author curves by hand, but parsing one
 * every frame for every animal is not. Paths are static, so cache them forever
 * the first time they are asked for.
 */
const pathCache = new Map<string, SkPath>();

export function path(d: string): SkPath {
  let p = pathCache.get(d);
  if (!p) {
    p = Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
    pathCache.set(d, p);
  }
  return p;
}

/** Outline weight in character-box units. Heavy, like a marker. */
export const OUTLINE = 5;
/** For small details — ear insides, whiskers, stripes. */
export const OUTLINE_FINE = 3;

/**
 * Places a character: feet at (x, y) on screen, `size` pixels tall, optionally
 * mirrored (so they face the way they walk) and leaning (the belly slide).
 */
export function stand(
  x: number,
  y: number,
  size: number,
  flip = false,
  lean = 0
): Transforms3d {
  const t: Transforms3d = [{ translateX: x }, { translateY: y }];
  if (lean !== 0) t.push({ rotate: lean });
  t.push({ scale: size / 100 });
  if (flip) t.push({ scaleX: -1 });
  return t;
}

/** A gentle sine, for breathing, bobbing, swaying tails and waving arms. */
export function wobble(t: number, speed: number, amp: number, phase = 0): number {
  return Math.sin(t * speed + phase) * amp;
}

/**
 * Everybody blinks, nobody blinks together. Returns true for the ~90ms a given
 * character has its eyes shut.
 */
export function blinking(t: number, seed: number): boolean {
  const cycle = 2.6 + (seed % 7) * 0.31;
  return (t + seed * 0.77) % cycle < 0.09;
}

/** Stable 0–1 noise from an integer, so scatter is the same every frame. */
export function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Pick from a list with a stable index — shirt colours, hair, skin tones. */
export function pick<T>(list: readonly T[], n: number): T {
  return list[Math.floor(hash01(n) * list.length) % list.length];
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** `#RRGGBB` plus an alpha, for haze and fading puffs. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
