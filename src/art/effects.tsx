/**
 * The things that appear and disappear: nuggets, poofs and pointers.
 *
 * The poof is the one piece of art the whole game is named after, so it gets the
 * most attention. It is built the way vapour actually reads — a handful of soft
 * radial blooms at different sizes and depths, with no hard edge anywhere, so it
 * looks like something in the air rather than a sticker of a cloud. It swells,
 * thins and lifts as it ages. Green clouds and nothing else, ever (§14.6).
 */

import React from 'react';
import { Circle, Group, Path, RadialGradient, vec, type Transforms3d } from '@shopify/react-native-skia';

import type { Vec2 } from '../game/types';
import { palette } from '../theme/palette';
import { OUTLINE, OUTLINE_FINE, path, withAlpha, wobble } from './ink';
import { Flat, Form, GroundShadow, Sheen, Stroke, darken, lighten } from './shading';

const NUGGET =
  'M -30 -14 C -18 -32 22 -32 32 -12 C 42 6 28 26 6 26 C -16 26 -40 6 -30 -14 Z';
const NUGGET_TAIL = 'M -26 -4 L -48 -22 L -46 14 Z';
const NUGGET_CRUMB = 'M -14 -12 q 8 -5 16 -1 M 4 8 q 9 -4 16 1 M -10 12 q 6 -4 12 -1';
const SPARKLE = 'M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z';

const ARROW = 'M 0 -9 L 52 -9 L 52 -20 L 76 0 L 52 20 L 52 9 L 0 9 Z';
const NUGGET_EDGE = 'M -7 -26 C 5 -26 8 -14 8 0 C 8 14 5 26 -7 26 C -2 18 -1 10 -1 0 C -1 -10 -2 -18 -7 -26 Z';
const STAR = 'M 0 -9 L 2.4 -2.4 L 9 0 L 2.4 2.4 L 0 9 L -2.4 2.4 L -9 0 L -2.4 -2.4 Z';
/** Where the stars of a pickup burst fly. */
const BURST = [
  [-1, -0.9],
  [0.2, -1.2],
  [1, -0.6],
  [-0.9, 0.3],
  [0.9, 0.35],
  [0, 0.9],
];

/** The blobs one poof is made of: offset, radius, and how fast each one lifts. */
const PUFFS: [number, number, number, number][] = [
  [0, -6, 34, 1],
  [-26, 4, 22, 0.8],
  [24, 2, 24, 0.85],
  [-12, -24, 20, 1.3],
  [14, -22, 18, 1.25],
  [-40, 12, 12, 0.6],
  [38, 14, 11, 0.6],
];

/**
 * A fish nugget. Coin-like, easy to spot, and bobbing just enough to catch the
 * eye from across the room (§11).
 */
export function FishNugget({
  x,
  y,
  r,
  t,
  seed,
  urgent = false,
}: {
  x: number;
  y: number;
  /** Radius in pixels — the nugget is drawn to fit it. */
  r: number;
  t: number;
  seed: number;
  /** Only a few left in the room: give this one a halo so it can be found. */
  urgent?: boolean;
}) {
  const bob = wobble(t, 2.6, r * 0.16, seed);
  const s = r / 34;
  // Turning on the spot like a coin. Every nugget spins on its own phase, so a
  // scattered handful of them shimmers instead of pulsing in lockstep.
  const spin = Math.cos(t * 2.1 + seed * 1.7);
  const edgeOn = Math.abs(spin) < 0.26;

  return (
    <Group transform={[{ translateX: x }, { translateY: y }, { scale: s }] as Transforms3d}>
      {/* it hovers, so it keeps its shadow on the ground */}
      <GroundShadow cx={4} cy={30} rx={26} strength={0.2} />

      {urgent ? (
        <Sheen
          cx={2}
          cy={0}
          r={54 + wobble(t, 3.2, 7, seed)}
          color={palette.nugget}
          strength={0.4}
        />
      ) : null}

      <Group transform={[{ translateY: bob / s }] as Transforms3d}>
        {edgeOn ? (
          <Form
            d={NUGGET_EDGE}
            colors={[lighten(palette.nugget, 0.25), '#A8620A']}
            from={[-6, -20]}
            to={[8, 20]}
            outline="#8A5306"
            weight={OUTLINE}
          />
        ) : (
          <Group transform={[{ scaleX: spin }] as Transforms3d}>
            <NuggetFace t={t} seed={seed} />
          </Group>
        )}
      </Group>
    </Group>
  );
}

/** The flat of the coin: the fish itself. */
function NuggetFace({ t, seed }: { t: number; seed: number }) {
  return (
    <Group>
        <Form
          d={NUGGET_TAIL}
          colors={[lighten(palette.nugget, 0.2), darken(palette.nugget, 0.25)]}
          from={[-46, -20]}
          to={[-26, 12]}
          outline="#8A5306"
          weight={OUTLINE}
        />
        <Form
          d={NUGGET}
          colors={[lighten(palette.nugget, 0.4), palette.nugget, '#B96F0C']}
          positions={[0, 0.45, 1]}
          from={[-22, -28]}
          to={[26, 24]}
          outline="#8A5306"
          weight={OUTLINE}
        />
        {/* breadcrumb texture, not spots */}
        <Stroke d={NUGGET_CRUMB} color="#C97F12" weight={3.4} opacity={0.75} />
        <Circle cx={-6} cy={2} r={3} color="#C97F12" opacity={0.6} />
        <Sheen cx={-8} cy={-12} r={14} strength={0.5} />
        <Group transform={[{ translateX: 24 }, { translateY: -26 }] as Transforms3d}>
          <Flat d={SPARKLE} fill={palette.white} opacity={0.55 + wobble(t, 4, 0.35, seed)} />
        </Group>
    </Group>
  );
}

/**
 * A nugget going in: a ring of stars thrown outward and a ghost of the coin
 * floating up. Short, bright, and gone — it has to read at a glance without
 * covering whatever the player is about to walk into.
 */
export function Spark({
  x,
  y,
  age,
  life,
  scale,
}: {
  x: number;
  y: number;
  /** Seconds since the nugget was picked up. */
  age: number;
  /** How long a spark lives. */
  life: number;
  /** Pixels per world unit. */
  scale: number;
}) {
  const p = Math.min(1, age / life);
  if (p >= 1) return null;
  const fade = 1 - p * p;
  const spread = (4 + p * 16) * scale;

  return (
    <Group transform={[{ translateX: x }, { translateY: y }] as Transforms3d} opacity={fade}>
      {/* the ring of air it leaves behind */}
      <Circle
        cx={0}
        cy={0}
        r={spread * 0.9}
        color={withAlpha(palette.nugget, 0.5 * fade)}
        style="stroke"
        strokeWidth={Math.max(1, 2.2 * scale * (1 - p))}
      />
      {BURST.map(([dx, dy], i) => (
        <Group
          key={i}
          transform={
            [
              { translateX: dx * spread },
              { translateY: dy * spread },
              { scale: (0.5 + (1 - p) * 0.6) * scale * 0.34 },
            ] as Transforms3d
          }
        >
          <Flat d={STAR} fill={i % 2 === 0 ? palette.nugget : palette.white} />
        </Group>
      ))}
    </Group>
  );
}

/**
 * Gurgle gurgle. One poof, ageing out: it swells, thins, and drifts up the room
 * away from where it happened.
 */
export function Poof({
  x,
  y,
  age,
  scale,
  strength = 1,
}: {
  x: number;
  y: number;
  /** Seconds since the poof went off. Puffs live about 2.2s. */
  age: number;
  /** Pixels per world unit. */
  scale: number;
  /** Multiplies the opacity — the haze reuses this cloud, much fainter. */
  strength?: number;
}) {
  const grow = (0.55 + age * 0.8) * scale * 0.11;
  const fade = Math.max(0, 0.62 - age * 0.27) * strength;
  if (fade <= 0.01) return null;

  const core = withAlpha(palette.stink, fade);
  const edge = withAlpha(palette.stink, 0);
  const deep = withAlpha(palette.stinkDeep, fade * 0.55);

  return (
    <Group transform={[{ translateX: x }, { translateY: y }, { scale: grow }] as Transforms3d}>
      {PUFFS.map(([dx, dy, r, lift], i) => {
        const cy = dy - age * 10 * lift;
        return (
          <Circle key={i} cx={dx} cy={cy} r={r}>
            <RadialGradient
              c={vec(dx, cy)}
              r={r}
              colors={[i === 0 ? deep : core, core, edge]}
              positions={[0, 0.55, 1]}
            />
          </Circle>
        );
      })}
      {/* two little curls, so it reads as a smell and not as smoke */}
      <Stroke
        d="M -18 -8 q 14 -12 0 -22"
        color={withAlpha(palette.stinkDeep, fade * 0.5)}
        weight={OUTLINE_FINE}
      />
      <Stroke
        d="M 16 -4 q 14 -12 2 -24"
        color={withAlpha(palette.stinkDeep, fade * 0.4)}
        weight={OUTLINE_FINE}
      />
    </Group>
  );
}

/**
 * What somebody is pointing at — the dog's nose, or the local's paw. A fat
 * cartoon arrow rather than a line, because at stage 3 it is the only thing the
 * player can still see through the haze.
 */
export function Pointer({
  x,
  y,
  dir,
  length,
  color,
  opacity,
}: {
  x: number;
  y: number;
  /** Unit vector in world space, where y points toward the exit. */
  dir: Vec2;
  /** Arrow length in pixels. */
  length: number;
  color: string;
  opacity: number;
}) {
  // World y is up, screen y is down.
  const angle = Math.atan2(-dir.y, dir.x);
  const s = length / 76;

  return (
    <Group
      transform={
        [{ translateX: x }, { translateY: y }, { rotate: angle }, { scale: s }] as Transforms3d
      }
      opacity={opacity}
    >
      <Group transform={[{ translateX: 3 }, { translateY: 4 }] as Transforms3d}>
        <Path path={path(ARROW)} color="#2A2E24" opacity={0.22} />
      </Group>
      <Form
        d={ARROW}
        colors={[lighten(color, 0.35), color, darken(color, 0.3)]}
        positions={[0, 0.5, 1]}
        from={[0, -20]}
        to={[60, 20]}
        outline={darken(color, 0.5)}
        weight={OUTLINE}
      />
      <Stroke d="M 6 -4 L 46 -4" color={lighten(color, 0.55)} weight={2.4} opacity={0.7} />
    </Group>
  );
}
