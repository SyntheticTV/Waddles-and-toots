/**
 * The four of them on the title screen, already in trouble.
 *
 * It lives with the art rather than with the home screen because it is drawing,
 * not layout — and because keeping it free of React Native means it can be
 * rendered and checked on its own.
 */

import React from 'react';
import { Group, Rect, type Transforms3d } from '@shopify/react-native-skia';

import { art } from '../theme/palette';
import { Fluffy, Sniffsalot, Toots, Waddles } from './characters';
import { Poof } from './effects';
import { Shadow } from './scenery';

/** How often Toots lets one go on the title screen. */
export const POOF_EVERY = 3.4;

/** Where each of them stands, as a fraction of the width. */
const SPOTS = [0.14, 0.38, 0.63, 0.87];
/** A little stagger, so four animals in a row read as a line and not a wall. */
const DEPTH = [0, -7, 3, -4];

export function TitleCast({
  width,
  height,
  t,
}: {
  width: number;
  height: number;
  /** Seconds since the screen appeared. */
  t: number;
}) {
  const size = height * 0.58;
  const ground = height - 30;
  const poofAge = (t % POOF_EVERY) - 0.4;
  const poofing = poofAge > 0 && poofAge < 2.2;

  return (
    <Group>
      {/* a strip of grass for them to stand on */}
      <Rect x={0} y={ground - 22} width={width} height={height - ground + 22} color={art.grass} />
      <Rect x={0} y={ground - 22} width={width} height={2.5} color={art.grassTuft} />

      {SPOTS.map((f, i) => (
        <Shadow key={i} x={width * f} y={ground + DEPTH[i]} r={size * 0.22} />
      ))}

      {poofing ? (
        <Group transform={[{ translateY: -size * 0.3 }] as Transforms3d}>
          {/* `scale` is pixels per world unit, the same as in the room */}
          <Poof
            x={width * SPOTS[1] - size * 0.44}
            y={ground - size * 0.55}
            age={poofAge}
            scale={size * 0.035}
          />
        </Group>
      ) : null}

      {/* Waddles leads, and is the only one not worried about anything */}
      <Toots
        x={width * SPOTS[1]}
        y={ground + DEPTH[1]}
        size={size}
        t={t}
        nervous={poofAge > 0 && poofAge < 1.4}
      />
      <Sniffsalot
        x={width * SPOTS[3]}
        y={ground + DEPTH[3]}
        size={size}
        t={t}
        accuracy={1}
        flip
      />
      <Fluffy x={width * SPOTS[2]} y={ground + DEPTH[2]} size={size} t={t} decoy={false} flip />
      <Waddles
        x={width * SPOTS[0]}
        y={ground + DEPTH[0]}
        size={size * 1.1}
        t={t}
        sliding={false}
      />
    </Group>
  );
}
