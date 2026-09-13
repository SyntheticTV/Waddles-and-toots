/**
 * The shading kit — how a flat path turns into something with a body to it.
 *
 * The rule of the whole art set is a single light, high and to the **upper
 * left**. Every gradient runs from that corner, every rim light sits on that
 * side, and every shadow falls to the lower right. Keeping one light for the
 * game is most of what makes the room look like a place rather than a pile of
 * stickers.
 *
 * Cost matters: a gradient means a shader built per frame, so `Form` is for the
 * big shapes only — a body, a head, a tail, a lid. Everything smaller uses `Cel`
 * (a flat shadow shape tucked under the light edge), which is free and, at the
 * size these things are actually drawn, almost indistinguishable.
 */

import React from 'react';
import {
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';

import { palette } from '../theme/palette';
import { OUTLINE, OUTLINE_FINE, path } from './ink';

/** Where the light comes from, in character-box units. */
export const LIGHT = { x: -38, y: -104 };

/**
 * A form with volume: a two- or three-stop gradient along the light, and a
 * contour in the shape's own dark tone rather than in flat black.
 */
export function Form({
  d,
  colors,
  positions,
  from = [-40, -100],
  to = [30, 4],
  outline,
  weight = OUTLINE,
}: {
  d: string;
  /** Lit colour first, shadowed colour last. */
  colors: string[];
  positions?: number[];
  from?: [number, number];
  to?: [number, number];
  outline?: string;
  weight?: number;
}) {
  return (
    <Group>
      <Path path={path(d)}>
        <LinearGradient
          start={vec(from[0], from[1])}
          end={vec(to[0], to[1])}
          colors={colors}
          positions={positions}
        />
      </Path>
      {outline ? (
        <Path
          path={path(d)}
          color={outline}
          style="stroke"
          strokeWidth={weight}
          strokeJoin="round"
          strokeCap="round"
        />
      ) : null}
    </Group>
  );
}

/** A flat fill with a contour. For shapes too small to earn a gradient. */
export function Ink({
  d,
  fill,
  outline = palette.ink,
  weight = OUTLINE_FINE,
}: {
  d: string;
  fill: string;
  outline?: string;
  weight?: number;
}) {
  return (
    <Group>
      <Path path={path(d)} color={fill} />
      <Path
        path={path(d)}
        color={outline}
        style="stroke"
        strokeWidth={weight}
        strokeJoin="round"
        strokeCap="round"
      />
    </Group>
  );
}

/** A shape with no contour at all — markings, bellies, linings. */
export function Flat({ d, fill, opacity }: { d: string; fill: string; opacity?: number }) {
  return <Path path={path(d)} color={fill} opacity={opacity} />;
}

/**
 * Cel shading: the shadow side of a form, drawn as its own soft shape and laid
 * over the fill. Cheaper than a gradient and reads the same at play size.
 */
export function Cel({ d, fill, opacity = 0.22 }: { d: string; fill: string; opacity?: number }) {
  return <Path path={path(d)} color={fill} opacity={opacity} />;
}

export function Stroke({
  d,
  color = palette.ink,
  weight = OUTLINE_FINE,
  opacity,
}: {
  d: string;
  color?: string;
  weight?: number;
  opacity?: number;
}) {
  return (
    <Path
      path={path(d)}
      color={color}
      style="stroke"
      strokeWidth={weight}
      strokeCap="round"
      strokeJoin="round"
      opacity={opacity}
    />
  );
}

/** A soft specular bloom — wet noses, plastic, metal, water. */
export function Sheen({
  cx,
  cy,
  r,
  color = palette.white,
  strength = 0.5,
}: {
  cx: number;
  cy: number;
  r: number;
  color?: string;
  strength?: number;
}) {
  return (
    <Circle cx={cx} cy={cy} r={r} opacity={strength}>
      <RadialGradient c={vec(cx, cy)} r={r} colors={[color, `${color}00`]} positions={[0, 1]} />
    </Circle>
  );
}

/**
 * The fuzzy edge that separates an animal from a balloon: short ticks laid along
 * a silhouette, in the fur's own dark tone.
 */
export function Fur({
  strokes,
  color,
  weight = 2,
  opacity = 0.8,
}: {
  strokes: string[];
  color: string;
  weight?: number;
  opacity?: number;
}) {
  return (
    <Group opacity={opacity}>
      {strokes.map((d, i) => (
        <Path
          key={i}
          path={path(d)}
          color={color}
          style="stroke"
          strokeWidth={weight}
          strokeCap="round"
        />
      ))}
    </Group>
  );
}

/**
 * An eye with something behind it: warm sclera, an iris that is lighter at the
 * bottom where the light bounces in, a pupil, and two highlights. The upper lid
 * rides down as `lid` climbs, which is how every tired, worried or beaten
 * expression in the game is made.
 */
export function Eye({
  cx,
  cy,
  r,
  iris = '#4A3220',
  lookX = 0,
  lookY = 0,
  lid = 0,
  shut = false,
  outline = palette.ink,
}: {
  cx: number;
  cy: number;
  r: number;
  iris?: string;
  lookX?: number;
  lookY?: number;
  /** 0 = wide open, 1 = shut. */
  lid?: number;
  shut?: boolean;
  outline?: string;
}) {
  if (shut || lid >= 0.95) {
    return (
      <Stroke
        d={`M ${cx - r} ${cy - r * 0.1} q ${r} ${r * 0.95} ${r * 2} 0`}
        color={outline}
        weight={r * 0.36}
      />
    );
  }

  const px = cx + lookX;
  const py = cy + lookY;

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r} color="#FBF7ED" />
      <Circle cx={px} cy={py} r={r * 0.74}>
        <RadialGradient
          c={vec(px, py + r * 0.3)}
          r={r * 0.9}
          colors={[lighten(iris), iris]}
          positions={[0, 1]}
        />
      </Circle>
      <Circle cx={px} cy={py} r={r * 0.36} color="#0B0D0B" />
      <Circle cx={px - r * 0.26} cy={py - r * 0.3} r={r * 0.24} color={palette.white} />
      <Circle
        cx={px + r * 0.28}
        cy={py + r * 0.3}
        r={r * 0.12}
        color={palette.white}
        opacity={0.55}
      />
      <Circle cx={cx} cy={cy} r={r} color={outline} style="stroke" strokeWidth={r * 0.22} />
      {lid > 0.02 ? (
        <Group>
          <Path
            path={path(
              `M ${cx - r - 1} ${cy - r - 1} L ${cx + r + 1} ${cy - r - 1} L ${cx + r + 1} ${
                cy - r + r * 2 * lid
              } Q ${cx} ${cy - r + r * 2 * lid + r * 0.5} ${cx - r - 1} ${cy - r + r * 2 * lid} Z`
            )}
            color={outline}
          />
        </Group>
      ) : null}
    </Group>
  );
}

/** A brow — one stroke that does as much acting as the eyes do. */
export function Brow({
  d,
  color = palette.ink,
  weight = 2.6,
}: {
  d: string;
  color?: string;
  weight?: number;
}) {
  return <Stroke d={d} color={color} weight={weight} />;
}

/**
 * The contact shadow an object drops on the ground. Soft, offset away from the
 * light, and never black — grass in shadow is still grass.
 */
export function GroundShadow({
  cx,
  cy,
  rx,
  strength = 0.3,
}: {
  cx: number;
  cy: number;
  rx: number;
  strength?: number;
}) {
  return (
    <Group transform={[{ translateX: cx }, { translateY: cy }, { scaleY: 0.34 }]}>
      <Circle cx={0} cy={0} r={rx} opacity={strength}>
        <RadialGradient
          c={vec(0, 0)}
          r={rx}
          colors={['#3B4032', '#3B403200']}
          positions={[0.45, 1]}
        />
      </Circle>
    </Group>
  );
}

/** A rounded box with a light top face. Crates, coolers, lids, sheds. */
export function Panel({
  x,
  y,
  w,
  h,
  colors,
  r = 4,
  outline = palette.ink,
  weight = OUTLINE_FINE,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  colors: string[];
  r?: number;
  outline?: string;
  weight?: number;
}) {
  return (
    <Group>
      <RoundedRect x={x} y={y} width={w} height={h} r={r}>
        <LinearGradient
          start={vec(x, y)}
          end={vec(x + w * 0.3, y + h)}
          colors={colors}
        />
      </RoundedRect>
      <RoundedRect
        x={x}
        y={y}
        width={w}
        height={h}
        r={r}
        color={outline}
        style="stroke"
        strokeWidth={weight}
      />
    </Group>
  );
}

/** Nudges a hex colour toward white. Used for iris bounce and rim light. */
export function lighten(hex: string, amount = 0.38): string {
  const h = hex.replace('#', '');
  const ch = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * amount)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

/** And toward black, for contours and shadow tones. */
export function darken(hex: string, amount = 0.45): string {
  const h = hex.replace('#', '');
  const ch = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.round(v * (1 - amount))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}
