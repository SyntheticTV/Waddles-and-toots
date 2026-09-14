/**
 * The room itself: the ground you climb, the fences that make it a yard, and the
 * way out at the top.
 *
 * All of this is world-static — it never moves relative to the level — so it is
 * drawn once at camera zero and slid into place by a single group transform in
 * `Room`. Every scattered thing (tufts, clover, dandelions, the dapples of light)
 * comes from a hash of its index rather than from `Math.random`, so the yard is
 * the same yard every frame and every run.
 *
 * The grass is deliberately a warm sage rather than a real green: the stink is
 * the only saturated green in the game, and the haze has to read as *wrong*.
 * Tone does the work instead — mown stripes across the room, patches of light,
 * and a cooler, paler green further up, which is what makes a tall room read as
 * distance rather than as a corridor.
 */

import React from 'react';
import {
  Circle,
  Group,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  vec,
  type Transforms3d,
} from '@shopify/react-native-skia';

import { WORLD_WIDTH } from '../game/tuning';
import type { LevelSpec, Rect as WorldRect, SceneryKind } from '../game/types';
import { art, palette } from '../theme/palette';
import { OUTLINE_FINE, hash01, path, wobble } from './ink';
import { Flat, Form, GroundShadow, Panel, Sheen, darken, lighten } from './shading';

const TUFT = 'M -4 0 C -5 -5 -5 -8 -3 -11 M 0 0 C 0 -6 0 -9 1 -13 M 4 0 C 5 -5 5 -8 6 -10';
const TUFT_WIDE =
  'M -6 0 C -8 -4 -8 -7 -6 -10 M -2 0 C -2 -6 -2 -9 -1 -12 M 3 0 C 4 -5 5 -8 7 -11 M 7 0 C 9 -4 10 -6 12 -8';
const CLOVER = 'M 0 0 m -3 -3 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0';

interface GroundProps {
  level: LevelSpec;
  /** Screen size, and pixels per world unit. */
  width: number;
  height: number;
  scale: number;
}

/**
 * The yard.
 *
 * Everything here is memoised on the level and the screen size, because none of
 * it can change while a run is going — the camera slides it, it does not redraw.
 */
export const Ground = React.memo(function Ground({ level, width, height, scale }: GroundProps) {
  const kind: SceneryKind = level.scenery ?? 'yard';
  // World y grows toward the exit; screen y grows down. Camera is applied by the
  // caller, so this is the room drawn at camera zero.
  const toY = (worldY: number) => height - worldY * scale;
  const top = toY(level.height);
  const roomHeight = level.height * scale;
  // Zoomed in, the room is wider than the screen and the camera pans across it,
  // so everything horizontal is drawn to the room rather than to the viewport.
  const roomWidth = WORLD_WIDTH * scale;

  const indoors = kind === 'indoor';
  const near = indoors ? art.floor : art.grass;
  const far = indoors ? lighten(art.floor, 0.12) : lighten(art.grass, 0.14);
  const band = indoors ? lighten(art.floor, 0.06) : art.grassMown;

  // Mown stripes / floorboards, every 24 world units up the room.
  const bands: React.ReactElement[] = [];
  const bandStep = 24;
  for (let y = 0; y < level.height; y += bandStep * 2) {
    bands.push(
      <Rect
        key={`band-${y}`}
        x={0}
        y={toY(y + bandStep)}
        width={roomWidth}
        height={bandStep * scale}
        color={band}
        opacity={0.65}
      />
    );
  }

  /*
   * Indoors it is a board floor: planks across the room with staggered joins, the
   * way a floor is actually laid. Cheap to draw and it does the one job the grass
   * does outdoors — telling the eye how far away things are, so a tall room reads
   * as a room rather than a corridor.
   */
  const boards: React.ReactElement[] = [];
  if (indoors) {
    const plank = 11;
    let row = 0;
    for (let y = 0; y < level.height; y += plank) {
      boards.push(
        <Rect
          key={`seam-${y}`}
          x={0}
          y={toY(y)}
          width={roomWidth}
          height={Math.max(1, 0.5 * scale)}
          color={darken(art.floor, 0.22)}
          opacity={0.5}
        />
      );
      // the short joins, offset every other row
      const step = 34;
      for (let x = (row % 2 ? step / 2 : 0) + 6; x < WORLD_WIDTH; x += step) {
        boards.push(
          <Rect
            key={`join-${y}-${x}`}
            x={x * scale}
            y={toY(y + plank)}
            width={Math.max(1, 0.5 * scale)}
            height={plank * scale}
            color={darken(art.floor, 0.22)}
            opacity={0.4}
          />
        );
      }
      row++;
    }
  }

  // Scatter, stable from the index: tufts, the odd clover, the odd dandelion.
  const scatter: React.ReactElement[] = [];
  if (!indoors) {
    const count = Math.round(level.height / 6);
    for (let i = 0; i < count; i++) {
      const wx = 2 + hash01(i * 2.1) * (WORLD_WIDTH - 4);
      const wy = hash01(i * 5.7 + 3) * level.height;
      const roll = hash01(i * 9.3);
      const size = (0.65 + hash01(i * 3.3) * 0.7) * scale * 0.32;
      scatter.push(
        <Group
          key={`tuft-${i}`}
          transform={
            [{ translateX: wx * scale }, { translateY: toY(wy) }, { scale: size }] as Transforms3d
          }
        >
          {roll > 0.93 ? (
            <Group>
              <Path path={path(CLOVER)} color="#E8D66A" />
              <Path path={path('M 0 0 L 0 -9')} color={art.grassTuft} style="stroke" strokeWidth={2} />
            </Group>
          ) : roll > 0.84 ? (
            <Path path={path(CLOVER)} color={palette.white} opacity={0.8} />
          ) : (
            <Path
              path={path(roll > 0.5 ? TUFT : TUFT_WIDE)}
              color={roll > 0.68 ? darken(art.grassTuft, 0.18) : art.grassTuft}
              style="stroke"
              strokeWidth={2.4}
              strokeCap="round"
            />
          )}
        </Group>
      );
    }
  }

  // Sun through the trees. Big, soft, and low contrast.
  // Outdoors these are sun through the trees; indoors they are pools of lamplight.
  const dapples: React.ReactElement[] = [];
  {
    const count = Math.round(level.height / 60);
    for (let i = 0; i < count; i++) {
      const wx = 6 + hash01(i * 11.7) * (WORLD_WIDTH - 12);
      const wy = hash01(i * 4.3 + 1) * level.height;
      const r = (14 + hash01(i * 6.1) * 16) * scale;
      dapples.push(
        <Sheen
          key={`dapple-${i}`}
          cx={wx * scale}
          cy={toY(wy)}
          r={r}
          color="#FFF6D8"
          strength={0.16}
        />
      );
    }
  }

  return (
    <Group>
      <Rect x={-roomWidth} y={top - height * 2} width={roomWidth * 3} height={roomHeight + height * 4}>
        <LinearGradient
          start={vec(0, top)}
          end={vec(0, toY(0))}
          colors={[far, near]}
          positions={[0, 1]}
        />
      </Rect>
      {bands}
      {boards}
      {dapples}
      {scatter}

      {/* the patio you come in on */}
      {!indoors ? (
        <Group>
          <Rect x={0} y={toY(26)} width={roomWidth} height={26 * scale}>
            <LinearGradient
              start={vec(0, toY(26))}
              end={vec(width * 0.4, toY(0))}
              colors={[lighten(art.patio, 0.25), art.patio, darken(art.patio, 0.08)]}
              positions={[0, 0.5, 1]}
            />
          </Rect>
          {/* the grass throws a line of shade onto the paving */}
          <Rect x={0} y={toY(26)} width={roomWidth} height={2.2 * scale} color={art.grassTuft} opacity={0.28} />
          {[0, 1, 2, 3].map((i) => (
            <Rect
              key={`paver-${i}`}
              x={(i + 1) * 20 * scale}
              y={toY(26)}
              width={1.6}
              height={26 * scale}
              color={art.patioLine}
            />
          ))}
          <Rect x={0} y={toY(13)} width={roomWidth} height={1.6} color={art.patioLine} />
        </Group>
      ) : null}

      {/* the fences down both sides, so the room reads as a room */}
      {!indoors ? (
        <Group>
          <SideFence x={0} height={level.height} scale={scale} toY={toY} castRight />
          <SideFence x={(WORLD_WIDTH - 4) * scale} height={level.height} scale={scale} toY={toY} />
        </Group>
      ) : null}
    </Group>
  );
});

/**
 * A run of fence: a dark rail behind, pickets over it, and — on the left, where
 * the light comes from — a strip of shade thrown onto the grass beside it.
 */
function SideFence({
  x,
  height,
  scale,
  toY,
  castRight,
}: {
  x: number;
  height: number;
  scale: number;
  toY: (worldY: number) => number;
  castRight?: boolean;
}) {
  const pickets: React.ReactElement[] = [];
  for (let y = 0; y < height; y += 7) {
    const shade = hash01(y * 0.37);
    pickets.push(
      <RoundedRect
        key={`picket-${y}`}
        x={x + 0.4 * scale}
        y={toY(y + 6)}
        width={3.2 * scale}
        height={6 * scale}
        r={1.2 * scale}
        color={shade > 0.6 ? lighten(art.wood, 0.12) : shade > 0.3 ? art.wood : darken(art.wood, 0.1)}
      />
    );
  }
  return (
    <Group>
      <Rect x={x} y={toY(height)} width={4 * scale} height={height * scale} color={art.hedgeDark} />
      {pickets}
      {/* the rails, seen between the pickets */}
      <Rect
        x={x + 0.4 * scale}
        y={toY(height)}
        width={0.7 * scale}
        height={height * scale}
        color={darken(art.wood, 0.4)}
        opacity={0.6}
      />
      {castRight ? (
        <Rect
          x={x + 3.6 * scale}
          y={toY(height)}
          width={2.4 * scale}
          height={height * scale}
          color="#3B4032"
          opacity={0.16}
        />
      ) : null}
    </Group>
  );
}

/**
 * The way out.
 *
 * The gate is shut until every nugget in the room is in (§11), and it has to say
 * so without a word: both leaves closed across the gap with a bolt drawn across
 * them, and the daylight behind them dimmed. When the last nugget goes in the
 * leaves swing wide, the bolt is gone, sunlight spills onto the grass in front of
 * it, and the arrow starts beating.
 *
 * `openness` is 0 shut to 1 wide open, eased by the caller, so the swing is a
 * moment rather than a jump cut.
 */
export function ExitGate({
  exit,
  scale,
  toScreenX,
  toScreenY,
  t,
  openness,
  dimmed,
  facesUp = true,
}: {
  exit: WorldRect;
  scale: number;
  toScreenX: (n: number) => number;
  toScreenY: (n: number) => number;
  t: number;
  /** 0 = shut, 1 = wide open. */
  openness: number;
  /** True once the haze is thick enough that the gate is fading out. */
  dimmed: boolean;
  /**
   * Whether the way out is at the top of the room or the bottom.
   *
   * Only four things actually care: which side the daylight spills out of,
   * where the leaves are hinged, which way they lean, and which way the arrow
   * points. Everything else — posts, bolt, the wood itself — is the same object
   * either way, and is deliberately *not* mirrored, because mirroring it would
   * light it from below and break the one rule that keeps this room looking
   * like one room.
   */
  facesUp?: boolean;
}) {
  const x = toScreenX(exit.x);
  const w = exit.width * scale;
  const yTop = toScreenY(exit.y + exit.height);
  const h = exit.height * scale;
  const pulse = wobble(t, 3.2, 3);
  const open = openness > 0.02;
  /** Screen y of the edge that faces out of the room, and of the one facing in. */
  const yOut = facesUp ? yTop : yTop + h;
  const yIn = facesUp ? yTop + h : yTop;
  /** Which way is "out", in screen pixels. */
  const out = facesUp ? -1 : 1;
  const lane = 12 * scale;
  // Each leaf covers half the gap when shut, and swings back out of it.
  const swing = openness * 1.5;
  const leafW = w / 2;

  return (
    <Group>
      {/* the lane of daylight past the fence, shaded while the gate is shut */}
      <Rect
        x={x - 2 * scale}
        y={Math.min(yOut + out * lane, yIn)}
        width={w + 4 * scale}
        height={h + lane}
      >
        <LinearGradient
          start={vec(0, yOut + out * lane)}
          end={vec(0, yIn)}
          colors={
            open
              ? ['#FFFDF4', palette.paper, darken(palette.paper, 0.06)]
              : [darken(palette.paper, 0.22), darken(palette.paper, 0.3)]
          }
          positions={open ? [0, 0.6, 1] : [0, 1]}
        />
      </Rect>

      {/* sunlight spilling through, once there is a way through */}
      {open ? (
        <Group opacity={Math.min(1, openness)}>
          <Sheen cx={x + w / 2} cy={yOut} r={w * 1.15} color="#FFF3CE" strength={0.85} />
          <Sheen
            cx={x + w / 2}
            cy={yOut - out * h * 0.6}
            r={w * 0.9}
            color="#FFF0C2"
            strength={0.45}
          />
        </Group>
      ) : null}

      <Rect
        x={x - 2 * scale}
        y={Math.min(yOut + out * lane, yIn)}
        width={w + 4 * scale}
        height={h + lane}
        color={darken(art.wood, 0.45)}
        style="stroke"
        strokeWidth={OUTLINE_FINE}
      />

      {/* the two leaves, hinged on the posts at the edge facing into the room */}
      <GateLeaf x={x} y={yIn} w={leafW} h={h} scale={scale} angle={-swing} lean={-out} />
      <GateLeaf
        x={x + w}
        y={yIn}
        w={leafW}
        h={h}
        scale={scale}
        angle={swing}
        mirrored
        lean={-out}
      />

      {/* the bolt across them: the whole reason you cannot leave yet */}
      {openness < 0.35 ? (
        <Group opacity={1 - openness / 0.35}>
          <Panel
            x={x + w * 0.18}
            y={yTop + h * 0.42}
            w={w * 0.64}
            h={Math.max(3, 2.4 * scale)}
            colors={[lighten(art.metal, 0.3), art.metalDark]}
            r={2}
          />
          <Circle cx={x + w * 0.5} cy={yTop + h * 0.42 + scale} r={1.8 * scale} color={art.metalDark} />
          <Circle
            cx={x + w * 0.5}
            cy={yTop + h * 0.42 + scale}
            r={1.8 * scale}
            color={palette.ink}
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      ) : null}

      {/* gate posts */}
      <Form
        d={`M ${x - 3.2 * scale} ${yTop} L ${x - 0.2 * scale} ${yTop} L ${x - 0.2 * scale} ${
          yTop + h
        } L ${x - 3.2 * scale} ${yTop + h} Z`}
        colors={[lighten(art.woodDark, 0.2), darken(art.woodDark, 0.2)]}
        from={[x - 3.2 * scale, yTop]}
        to={[x, yTop + h]}
        outline={darken(art.wood, 0.5)}
        weight={2}
      />
      <Form
        d={`M ${x + w} ${yTop} L ${x + w + 3 * scale} ${yTop} L ${x + w + 3 * scale} ${yTop + h} L ${
          x + w
        } ${yTop + h} Z`}
        colors={[lighten(art.woodDark, 0.1), darken(art.woodDark, 0.3)]}
        from={[x + w, yTop]}
        to={[x + w + 3 * scale, yTop + h]}
        outline={darken(art.wood, 0.5)}
        weight={2}
      />

      {/* the arrow only beats once there is somewhere to go */}
      {open ? (
        <Group
          transform={
            [
              { translateX: x + w / 2 },
              { translateY: yTop + h / 2 + pulse * -out },
              { scale: (scale / 3) * Math.min(1, openness * 1.4) },
              // The signpost turns round; it is a symbol, not an object, so it
              // is the one thing here allowed to mirror.
              { scaleY: facesUp ? 1 : -1 },
            ] as Transforms3d
          }
          opacity={dimmed ? 0.6 : 1}
        >
          <Form
            d="M 0 -14 L 14 4 L 5 4 L 5 16 L -5 16 L -5 4 L -14 4 Z"
            colors={[lighten(palette.stink, 0.3), palette.stink, palette.stinkDeep]}
            positions={[0, 0.5, 1]}
            from={[-10, -14]}
            to={[10, 16]}
            outline={palette.stinkDeep}
            weight={3.4}
          />
        </Group>
      ) : null}
    </Group>
  );
}

/** One leaf of the gate, hinged at its post and swinging into the room. */
function GateLeaf({
  x,
  y,
  w,
  h,
  scale,
  angle,
  mirrored,
  lean,
}: {
  /** The hinge, at the edge of the gateway that faces into the room. */
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  angle: number;
  mirrored?: boolean;
  /** +1 for a leaf standing up the screen, -1 for one hanging down it. */
  lean?: number;
}) {
  const dir = mirrored ? -1 : 1;
  /*
   * Which way the leaf stands from its hinge. A gate at the bottom of the room
   * hangs down the screen instead of up it, and every measurement in here is
   * taken from the hinge, so one sign turns the whole thing round.
   */
  const up = (lean ?? 1) >= 0 ? 1 : -1;
  /** Gradient ends, always in screen order, so the wood is lit from above. */
  const gTop = Math.min(0, -h * up);
  const gBottom = Math.max(0, -h * up);
  return (
    <Group
      transform={
        [
          { translateX: x },
          { translateY: y },
          { rotate: angle },
          { scaleX: dir },
        ] as Transforms3d
      }
    >
      <Form
        d={`M 0 ${-h * up} L ${w} ${-h * up} L ${w} 0 L 0 0 Z`}
        colors={[lighten(art.wood, 0.2), art.wood, darken(art.wood, 0.3)]}
        positions={[0, 0.5, 1]}
        from={[0, gTop]}
        to={[w, gBottom]}
        outline={darken(art.wood, 0.45)}
        weight={2.4}
      />
      {/* two rails and a strap on the hinge side: a gate, not a crate */}
      <Flat
        d={`M ${1.5 * scale} ${-h * 0.74 * up} L ${w - 1.5 * scale} ${-h * 0.74 * up} L ${w - 1.5 * scale} ${-h * 0.6 * up} L ${1.5 * scale} ${-h * 0.6 * up} Z`}
        fill={darken(art.wood, 0.3)}
      />
      <Flat
        d={`M ${1.5 * scale} ${-h * 0.38 * up} L ${w - 1.5 * scale} ${-h * 0.38 * up} L ${w - 1.5 * scale} ${-h * 0.24 * up} L ${1.5 * scale} ${-h * 0.24 * up} Z`}
        fill={darken(art.wood, 0.3)}
      />
      {[0.3, 0.55, 0.8].map((f) => (
        <Rect
          key={f}
          x={w * f}
          y={gTop}
          width={Math.max(1, 0.5 * scale)}
          height={h}
          color={darken(art.wood, 0.34)}
          opacity={0.7}
        />
      ))}
      <Panel
        x={0.6 * scale}
        y={up > 0 ? -h * 0.82 : h * 0.16}
        w={Math.max(3, 2.2 * scale)}
        h={h * 0.66}
        colors={[lighten(art.metalDark, 0.35), darken(art.metalDark, 0.15)]}
        r={1.5}
        weight={1.6}
      />
    </Group>
  );
}

/** A soft contact shadow so a character sits on the ground instead of floating. */
export function Shadow({ x, y, r }: { x: number; y: number; r: number }) {
  return <GroundShadow cx={x + r * 0.16} cy={y} rx={r} strength={0.26} />;
}

/**
 * A quiet darkening at the very edges of the screen. It does nothing except make
 * the middle of the room, where the player is, feel like the lit part.
 */
export function Vignette({ width, height }: { width: number; height: number }) {
  return (
    <Group opacity={0.5}>
      <Rect x={0} y={0} width={width} height={height * 0.12}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height * 0.12)}
          colors={['#2A2E2433', '#2A2E2400']}
        />
      </Rect>
      <Rect x={0} y={0} width={width * 0.1} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width * 0.1, 0)}
          colors={['#2A2E242E', '#2A2E2400']}
        />
      </Rect>
      <Rect x={width * 0.9} y={0} width={width * 0.1} height={height}>
        <LinearGradient
          start={vec(width * 0.9, 0)}
          end={vec(width, 0)}
          colors={['#2A2E2400', '#2A2E242E']}
        />
      </Rect>
    </Group>
  );
}
