/**
 * The play surface. Draws one room with Skia and nothing else — no rules live
 * here, it only paints whatever `RunState` currently says.
 *
 * Placeholder art: flat shapes with heavy outlines, in the palette the design
 * bible uses. Sprites replace these later without touching the layout.
 */

import React from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import { readLocal, readNose, type RunState } from '../game/engine';
import { hazeOpacity, stageFor } from '../game/stink';
import { WORLD_WIDTH } from '../game/tuning';
import type { Prop, Vec2 } from '../game/types';
import { palette } from '../theme/palette';

interface Props {
  run: RunState;
  width: number;
  height: number;
}

const PROP_FILL: Record<Prop['kind'], string> = {
  solid: '#C9BFA6',
  blame: '#E7D6A8',
  freshAir: palette.breeze,
  bump: '#F0C9AF',
};

export function Room({ run, width, height }: Props) {
  const scale = width / WORLD_WIDTH;
  const viewHeightWorld = height / scale;

  // Keep Waddles low on screen: you are always looking up into the trouble.
  const camera = clamp(
    run.waddles.y - viewHeightWorld * 0.34,
    0,
    Math.max(0, run.level.height - viewHeightWorld)
  );

  // World y grows toward the exit, screen y grows downward, so the room is
  // flipped: the exit at y = height sits at the top of the display.
  const toScreenY = (worldY: number) => height - (worldY - camera) * scale;
  const toScreenX = (worldX: number) => worldX * scale;

  const haze = hazeOpacity(run.stink);
  const stage = stageFor(run.stink);
  const nose = readNose(run);
  const localDir = readLocal(run);

  return (
    <Canvas style={{ width, height }}>
      {/* floor */}
      <Rect x={0} y={0} width={width} height={height} color={palette.paperShade} />

      {/* the way out, at the top of the room */}
      <ExitMarker run={run} scale={scale} toScreenX={toScreenX} toScreenY={toScreenY} />

      {run.level.props.map((p) => (
        <Group key={p.id}>
          <Rect
            x={toScreenX(p.bounds.x)}
            y={toScreenY(p.bounds.y + p.bounds.height)}
            width={p.bounds.width * scale}
            height={p.bounds.height * scale}
            color={PROP_FILL[p.kind]}
          />
          <Rect
            x={toScreenX(p.bounds.x)}
            y={toScreenY(p.bounds.y + p.bounds.height)}
            width={p.bounds.width * scale}
            height={p.bounds.height * scale}
            color={palette.ink}
            style="stroke"
            strokeWidth={2}
          />
          {p.kind === 'freshAir' ? (
            <Circle
              cx={toScreenX(p.bounds.x + p.bounds.width / 2)}
              cy={toScreenY(p.bounds.y + p.bounds.height / 2)}
              r={4 * scale}
              color={palette.white}
              opacity={0.5}
            />
          ) : null}
        </Group>
      ))}

      {/* fish nuggets */}
      {run.nuggets.map((n, i) =>
        n.taken ? null : (
          <Group key={i}>
            <Circle cx={toScreenX(n.pos.x)} cy={toScreenY(n.pos.y)} r={2.6 * scale} color={palette.nugget} />
            <Circle
              cx={toScreenX(n.pos.x)}
              cy={toScreenY(n.pos.y)}
              r={2.6 * scale}
              color={palette.ink}
              style="stroke"
              strokeWidth={2}
            />
          </Group>
        )
      )}

      {/* people */}
      {run.crowd.map((p, i) => (
        <Person
          key={i}
          x={toScreenX(p.pos.x)}
          y={toScreenY(p.pos.y)}
          scale={scale}
          panicking={stage === 'panic' && run.decoyHoldMs <= 0}
          alarmed={stage === 'blame' || stage === 'panic'}
        />
      ))}

      {/* the local */}
      <LocalAnimal
        x={toScreenX(run.local.pos.x)}
        y={toScreenY(run.local.pos.y)}
        scale={scale}
        mood={run.local.mood}
        found={run.local.found}
        dir={localDir}
      />

      {/* the line: Sniffsalot, Fluffy, Toots, then Waddles on top */}
      <Animal
        x={toScreenX(run.followers[2].pos.x)}
        y={toScreenY(run.followers[2].pos.y)}
        scale={scale}
        body="#9A6A3C"
        belly="#E4C39A"
      />
      <Animal
        x={toScreenX(run.followers[1].pos.x)}
        y={toScreenY(run.followers[1].pos.y)}
        scale={scale}
        body={run.decoyHoldMs > 0 ? palette.ink : '#D98A3C'}
        belly={run.decoyHoldMs > 0 ? palette.white : '#F3C892'}
        stripe={run.decoyHoldMs > 0}
      />
      <Animal
        x={toScreenX(run.followers[0].pos.x)}
        y={toScreenY(run.followers[0].pos.y)}
        scale={scale}
        body={palette.ink}
        belly={palette.ink}
        stripe
      />
      <Waddles
        x={toScreenX(run.waddles.x)}
        y={toScreenY(run.waddles.y)}
        scale={scale}
        sliding={run.sliding}
      />

      {/* Sniffsalot's pointer */}
      {nose.dir ? (
        <Pointer
          x={toScreenX(run.followers[2].pos.x)}
          y={toScreenY(run.followers[2].pos.y)}
          dir={nose.dir}
          scale={scale}
          color={palette.sea}
          opacity={0.35 + nose.accuracy * 0.65}
        />
      ) : null}

      {/* green poofs */}
      {run.puffs.map((p, i) => (
        <Circle
          key={i}
          cx={toScreenX(p.pos.x)}
          cy={toScreenY(p.pos.y)}
          r={(3 + p.age * 7) * scale}
          color={palette.stink}
          opacity={Math.max(0, 0.55 - p.age * 0.25)}
        />
      ))}

      {/* the haze: thickest at the top, where the exit is */}
      {haze > 0.01 ? (
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[
              withAlpha(palette.stink, haze),
              withAlpha(palette.stink, haze * 0.55),
              withAlpha(palette.stink, haze * 0.12),
            ]}
            positions={[0, 0.55, 1]}
          />
        </Rect>
      ) : null}
    </Canvas>
  );
}

// ---------------------------------------------------------------- pieces

function ExitMarker({
  run,
  scale,
  toScreenX,
  toScreenY,
}: {
  run: RunState;
  scale: number;
  toScreenX: (n: number) => number;
  toScreenY: (n: number) => number;
}) {
  const e = run.level.exit;
  return (
    <Group>
      <RoundedRect
        x={toScreenX(e.x)}
        y={toScreenY(e.y + e.height)}
        width={e.width * scale}
        height={e.height * scale}
        r={3}
        color={palette.stinkWash}
      />
      <RoundedRect
        x={toScreenX(e.x)}
        y={toScreenY(e.y + e.height)}
        width={e.width * scale}
        height={e.height * scale}
        r={3}
        color={palette.stinkDeep}
        style="stroke"
        strokeWidth={3}
      />
    </Group>
  );
}

function Animal({
  x,
  y,
  scale,
  body,
  belly,
  stripe,
}: {
  x: number;
  y: number;
  scale: number;
  body: string;
  belly: string;
  stripe?: boolean;
}) {
  const r = 3.4 * scale;
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} color={body} />
      {stripe ? <Rect x={x - r * 0.25} y={y - r} width={r * 0.5} height={r * 2} color={palette.white} /> : null}
      {!stripe ? <Circle cx={x} cy={y + r * 0.25} r={r * 0.55} color={belly} /> : null}
      <Circle cx={x} cy={y} r={r} color={palette.ink} style="stroke" strokeWidth={2} />
    </Group>
  );
}

function Waddles({ x, y, scale, sliding }: { x: number; y: number; scale: number; sliding: boolean }) {
  const r = 4 * scale;
  return (
    <Group>
      {sliding ? <Circle cx={x} cy={y} r={r * 1.6} color={palette.breeze} opacity={0.45} /> : null}
      <Circle cx={x} cy={y} r={r} color={palette.ink} />
      <Circle cx={x} cy={y + r * 0.2} r={r * 0.62} color={palette.white} />
      <Circle cx={x} cy={y - r * 0.45} r={r * 0.24} color={palette.nugget} />
      <Circle cx={x} cy={y} r={r} color={palette.ink} style="stroke" strokeWidth={2.5} />
    </Group>
  );
}

function Person({
  x,
  y,
  scale,
  panicking,
  alarmed,
}: {
  x: number;
  y: number;
  scale: number;
  panicking: boolean;
  alarmed: boolean;
}) {
  const r = 3 * scale;
  const color = panicking ? palette.alarm : alarmed ? '#B98B7A' : '#9D9384';
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} color={color} />
      <Circle cx={x} cy={y} r={r} color={palette.ink} style="stroke" strokeWidth={1.5} />
      {panicking ? (
        <>
          <Circle cx={x - r} cy={y - r * 1.5} r={r * 0.3} color={palette.ink} />
          <Circle cx={x + r} cy={y - r * 1.5} r={r * 0.3} color={palette.ink} />
        </>
      ) : null}
    </Group>
  );
}

function LocalAnimal({
  x,
  y,
  scale,
  mood,
  found,
  dir,
}: {
  x: number;
  y: number;
  scale: number;
  mood: string;
  found: boolean;
  dir: Vec2 | null;
}) {
  const r = 2.6 * scale;
  const asleep = mood === 'asleep';
  const drowsy = mood === 'drowsy';
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} color={asleep ? '#B5AE9C' : '#B0743F'} opacity={found ? 1 : 0.75} />
      <Circle cx={x} cy={y} r={r} color={palette.ink} style="stroke" strokeWidth={2} />
      {/* the tell: eyelids drooping before they go */}
      {drowsy ? <Rect x={x - r * 0.7} y={y - r * 0.35} width={r * 1.4} height={r * 0.3} color={palette.ink} /> : null}
      {asleep ? <Circle cx={x + r * 1.3} cy={y - r * 1.2} r={r * 0.45} color={palette.white} /> : null}
      {dir ? <Pointer x={x} y={y} dir={dir} scale={scale} color={palette.sea} opacity={0.9} /> : null}
    </Group>
  );
}

function Pointer({
  x,
  y,
  dir,
  scale,
  color,
  opacity,
}: {
  x: number;
  y: number;
  dir: Vec2;
  scale: number;
  color: string;
  opacity: number;
}) {
  const len = 9 * scale;
  // World y is up, screen y is down.
  const tipX = x + dir.x * len;
  const tipY = y - dir.y * len;
  const path = Skia.Path.Make();
  path.moveTo(x, y);
  path.lineTo(tipX, tipY);
  return (
    <Group opacity={opacity}>
      <Path path={path} color={color} style="stroke" strokeWidth={3} strokeCap="round" />
      <Circle cx={tipX} cy={tipY} r={2 * scale} color={color} />
    </Group>
  );
}

// ----------------------------------------------------------------- utils

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
