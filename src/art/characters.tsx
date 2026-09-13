/**
 * The cast.
 *
 * Everyone is authored in the 100-unit character box described in `ink.ts` —
 * feet at the origin, head at y = -100 — and everyone faces the camera, which is
 * how a six-year-old reads a face fastest. Turning left or right mirrors the
 * whole character rather than re-drawing it.
 *
 * Each one is built in layers, back to front: the silhouette as a shaded form,
 * then markings, then fur along the edges, then the face. The light is always
 * upper-left (see `shading.tsx`), so every animal is lit on the same side as
 * every prop and they read as being in the same room.
 *
 * Nothing in here decides anything. Every expression is a prop handed down from
 * `RunState`, so the art can never disagree with the simulation.
 */

import React from 'react';
import { Circle, Group, Path, type Transforms3d } from '@shopify/react-native-skia';

import type { Vec2 } from '../game/types';
import { art, coat, palette } from '../theme/palette';
import { OUTLINE, OUTLINE_FINE, blinking, clamp, hash01, path, stand, wobble } from './ink';
import { Brow, Cel, Eye, Flat, Form, Fur, Ink, Sheen, Stroke, darken, lighten } from './shading';

interface Placed {
  x: number;
  y: number;
  /** Height in pixels. */
  size: number;
  /** Seconds since the run started — every idle animation hangs off this. */
  t: number;
  flip?: boolean;
  /** Actually going somewhere: the feet step instead of standing there. */
  moving?: boolean;
}

/**
 * One leg of a walk cycle. `leg` is 0 or 1 — one forward while the other is
 * back, each lifting as it swings through. Standing still puts both back on the
 * ground, so nobody moonwalks on the spot.
 */
function stride(t: number, moving: boolean, leg: 0 | 1, rate = 11, reach = 3.4) {
  if (!moving) return { translateX: 0, translateY: 0 };
  const a = t * rate + leg * Math.PI;
  return {
    translateX: Math.sin(a) * reach,
    // Only the forward half of the swing lifts off the ground.
    translateY: -Math.max(0, Math.cos(a)) * reach * 0.55,
  };
}

/** Feet, walking. */
function Feet({
  t,
  moving,
  left,
  right,
  fill,
  outline,
  weight = 2.2,
  rate = 11,
  reach = 3.4,
}: {
  t: number;
  moving: boolean;
  left: string;
  right: string;
  fill: string;
  outline: string;
  weight?: number;
  rate?: number;
  reach?: number;
}) {
  const a = stride(t, moving, 0, rate, reach);
  const b = stride(t, moving, 1, rate, reach);
  return (
    <Group>
      <Group transform={[a] as Transforms3d}>
        <Ink d={left} fill={fill} outline={outline} weight={weight} />
      </Group>
      <Group transform={[b] as Transforms3d}>
        <Ink d={right} fill={fill} outline={outline} weight={weight} />
      </Group>
    </Group>
  );
}

/** Still pointing at the ceiling. §9. */
function SnoreBubble({ x, y, t }: { x: number; y: number; t: number }) {
  const r = 9 + wobble(t, 2.2, 4);
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} color={palette.white} opacity={0.92} />
      <Circle cx={x} cy={y} r={r} color={palette.inkSoft} style="stroke" strokeWidth={2} />
      <Sheen cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.5} strength={0.8} />
      <Circle cx={x - r * 1.15} cy={y + r * 1.2} r={r * 0.3} color={palette.white} opacity={0.9} />
    </Group>
  );
}

// ----------------------------------------------------------------- Waddles

const W_BODY =
  'M 0 -99 C 25 -99 40 -78 41 -52 C 42 -24 27 -4 0 -4 C -27 -4 -42 -24 -41 -52 C -40 -78 -25 -99 0 -99 Z';
const W_BIB =
  'M 0 -64 C 16 -64 27 -50 28 -34 C 29 -17 16 -7 0 -7 C -16 -7 -29 -17 -28 -34 C -27 -50 -16 -64 0 -64 Z';
const W_BIB_SHADE = 'M 20 -50 C 27 -42 28 -24 20 -12 C 12 -6 2 -6 0 -7 C 16 -14 24 -32 20 -50 Z';
const W_PATCH_L =
  'M -20 -83 C -10 -85 -4 -78 -5 -70 C -6 -62 -13 -59 -19 -63 C -26 -67 -26 -80 -20 -83 Z';
const W_PATCH_R =
  'M 20 -83 C 10 -85 4 -78 5 -70 C 6 -62 13 -59 19 -63 C 26 -67 26 -80 20 -83 Z';
const W_WING_L =
  'M -32 -74 C -46 -66 -53 -42 -47 -21 C -43 -12 -36 -14 -35 -23 C -34 -42 -32 -60 -30 -70 Z';
const W_WING_R =
  'M 32 -74 C 46 -66 53 -42 47 -21 C 43 -12 36 -14 35 -23 C 34 -42 32 -60 30 -70 Z';
const W_FOOT_L = 'M -17 -9 C -28 -9 -37 -4 -37 1 C -37 3 -33 4 -27 4 L -8 4 C -3 4 -2 -2 -6 -6 Z';
const W_FOOT_R = 'M 17 -9 C 28 -9 37 -4 37 1 C 37 3 33 4 27 4 L 8 4 C 3 4 2 -2 6 -6 Z';
const W_BEAK =
  'M 0 -67 C 10 -67 16 -62 16 -56 C 16 -49 9 -44 0 -44 C -9 -44 -16 -49 -16 -56 C -16 -62 -10 -67 0 -67 Z';
const W_BEAK_TIP =
  'M 0 -49 C 7 -49 12 -52 14 -55 C 13 -47 8 -44 0 -44 C -8 -44 -13 -47 -14 -55 C -12 -52 -7 -49 0 -49 Z';
const W_CREST = 'M -8 -95 C -13 -105 -6 -113 2 -109 C 8 -106 8 -99 6 -94 Z';

const W_FUR = [
  'M -40 -60 l -5 -3',
  'M -39 -48 l -6 -2',
  'M -36 -36 l -6 -1',
  'M 40 -60 l 5 -3',
  'M 39 -48 l 6 -2',
  'M 36 -36 l 6 -1',
];

/**
 * Waddles the penguin. Delighted, oblivious, and looking slightly up and away
 * from whatever is going on behind him — which is the entire joke (§14.3).
 */
export function Waddles({
  x,
  y,
  size,
  t,
  flip,
  moving = false,
  sliding,
}: Placed & { sliding: boolean }) {
  // Sliding is a belly-first lean; waddling is a side-to-side rock in time with
  // the feet, which is the entire reason he is called Waddles.
  const lean = sliding ? (flip ? -0.34 : 0.34) : 0;
  const walking = moving && !sliding;
  const rock = sliding ? 0 : wobble(t, walking ? 9 : 3, walking ? 0.075 : 0.03);
  const bob = sliding ? 4 : wobble(t, walking ? 18 : 6, walking ? 2.2 : 1.4);
  const shut = blinking(t, 3);

  return (
    <Group transform={stand(x, y, size, flip, lean)}>
      <Group transform={[{ rotate: rock }, { translateY: bob }] as Transforms3d}>
        {sliding ? (
          <Group opacity={0.8}>
            <Stroke d="M -46 -62 C -58 -62 -68 -60 -78 -57" color={palette.breeze} weight={5} />
            <Stroke d="M -48 -46 C -62 -45 -72 -42 -84 -38" color={palette.breeze} weight={5} />
            <Stroke d="M -44 -30 C -54 -28 -62 -25 -70 -21" color={palette.breeze} weight={5} />
          </Group>
        ) : null}

        <Feet
          t={t}
          moving={walking}
          left={W_FOOT_L}
          right={W_FOOT_R}
          fill={palette.nugget}
          outline="#8A5306"
          weight={OUTLINE_FINE}
          rate={9}
          reach={5}
        />

        <Form
          d={W_BODY}
          colors={[coat.penguin.lit, coat.penguin.mid, coat.penguin.deep]}
          positions={[0, 0.45, 1]}
          from={[-34, -96]}
          to={[34, 0]}
          outline={coat.penguin.line}
          weight={OUTLINE}
        />

        <Form
          d={W_BIB}
          colors={[coat.bib.lit, coat.bib.mid, coat.bib.deep]}
          from={[-22, -72]}
          to={[26, -6]}
        />
        <Cel d={W_BIB_SHADE} fill="#A99878" opacity={0.35} />

        <Form
          d={W_WING_L}
          colors={[coat.penguin.lit, coat.penguin.deep]}
          from={[-46, -70]}
          to={[-32, -20]}
          outline={coat.penguin.line}
          weight={OUTLINE_FINE}
        />
        <Form
          d={W_WING_R}
          colors={[coat.penguin.mid, coat.penguin.deep]}
          from={[36, -70]}
          to={[50, -20]}
          outline={coat.penguin.line}
          weight={OUTLINE_FINE}
        />

        <Fur strokes={W_FUR} color={coat.penguin.lit} weight={2.2} opacity={0.55} />
        <Ink d={W_CREST} fill={coat.penguin.mid} outline={coat.penguin.line} weight={2.4} />

        {/* white eye patches, the way a gentoo wears them */}
        <Flat d={W_PATCH_L} fill={coat.bib.lit} />
        <Flat d={W_PATCH_R} fill={coat.bib.mid} />

        <Eye
          cx={-14}
          cy={-71}
          r={8.5}
          iris="#3C2A1A"
          lookX={-1.6}
          lookY={-2.4}
          shut={shut}
          outline={coat.penguin.line}
        />
        <Eye
          cx={14}
          cy={-71}
          r={8.5}
          iris="#3C2A1A"
          lookX={-1.6}
          lookY={-2.4}
          shut={shut}
          outline={coat.penguin.line}
        />

        <Form
          d={W_BEAK}
          colors={[lighten(palette.nugget, 0.34), palette.nugget, '#BE7108']}
          from={[-12, -66]}
          to={[10, -44]}
          outline="#8A5306"
          weight={OUTLINE_FINE}
        />
        <Flat d={W_BEAK_TIP} fill="#9C5C08" opacity={0.55} />
        <Stroke d="M -10 -55 Q 0 -52 10 -55" color="#8A5306" weight={1.8} />
        <Sheen cx={-6} cy={-61} r={5} strength={0.45} />
      </Group>
    </Group>
  );
}

// ------------------------------------------------------------------- Toots

const T_BODY =
  'M 0 -48 C 20 -48 31 -31 31 -17 C 31 -5 18 1 0 1 C -18 1 -31 -5 -31 -17 C -31 -31 -20 -48 0 -48 Z';
const T_HEAD =
  'M 0 -86 C 14 -86 23 -75 23 -63 C 23 -56 20 -50 15 -47 C 12 -39 7 -35 0 -35 C -7 -35 -12 -39 -15 -47 C -20 -50 -23 -56 -23 -63 C -23 -75 -14 -86 0 -86 Z';
const T_MUZZLE =
  'M 0 -53 C 7 -53 12 -48 12 -43 C 12 -38 7 -35 0 -35 C -7 -35 -12 -38 -12 -43 C -12 -48 -7 -53 0 -53 Z';
const T_NOSE =
  'M 0 -50 C 4 -50 6 -47 6 -45 C 6 -43 3 -42 0 -42 C -3 -42 -6 -43 -6 -45 C -6 -47 -4 -50 0 -50 Z';
const T_STRIPE_L = 'M -10 -74 C -13 -56 -14 -26 -13 0 L -5 0 C -6 -26 -6 -56 -4 -74 Z';
const T_STRIPE_R = 'M 10 -74 C 13 -56 14 -26 13 0 L 5 0 C 6 -26 6 -56 4 -74 Z';
const T_BLAZE = 'M -4 -85 L 4 -85 C 5 -78 5 -72 4 -68 L -4 -68 C -5 -72 -5 -78 -4 -85 Z';
const T_FOOT_L = 'M -15 -5 C -22 -5 -25 0 -18 2 L -6 2 L -6 -5 Z';
const T_FOOT_R = 'M 15 -5 C 22 -5 25 0 18 2 L 6 2 L 6 -5 Z';

const T_TAIL_BASE = 'M -10 -24 C -34 -30 -52 -46 -48 -66 C -45 -80 -33 -84 -30 -72';
const T_TAIL_INNER = 'M -13 -28 C -33 -34 -46 -48 -43 -64';
const T_TAIL_STRIPE = 'M -17 -32 C -34 -38 -45 -50 -42 -63';
const T_TAIL_FUR = [
  'M -46 -70 l -7 -4',
  'M -50 -58 l -8 -1',
  'M -48 -44 l -8 2',
  'M -38 -32 l -5 6',
  'M -30 -74 l -2 -8',
];

/**
 * Toots the skunk. The tail is the silhouette — you should be able to find him
 * in a crowded room at a glance, because knowing where he is *is* the game, and
 * more so now that one person touching him ends the round (§4).
 */
export function Toots({
  x,
  y,
  size,
  t,
  flip,
  moving = false,
  nervous,
}: Placed & { nervous: boolean }) {
  const sway = wobble(t, 2.4, 0.08);
  const bob = wobble(t, moving ? 16 : 9, moving ? 1.9 : 1.2, 1.1);
  const shut = blinking(t, 11);

  return (
    <Group transform={stand(x, y, size, flip)}>
      <Group transform={[{ translateY: bob }] as Transforms3d}>
        {/* the tail: layered strokes rather than one shape, so it reads as fur */}
        <Group
          transform={[{ translateY: -26 }, { rotate: sway }, { translateY: 26 }] as Transforms3d}
        >
          <Path
            path={path(T_TAIL_BASE)}
            color={coat.skunk.deep}
            style="stroke"
            strokeWidth={27}
            strokeCap="round"
          />
          <Path
            path={path(T_TAIL_INNER)}
            color={coat.skunk.lit}
            style="stroke"
            strokeWidth={13}
            strokeCap="round"
            opacity={0.5}
          />
          <Path
            path={path(T_TAIL_STRIPE)}
            color={coat.bib.mid}
            style="stroke"
            strokeWidth={8}
            strokeCap="round"
          />
          <Fur strokes={T_TAIL_FUR} color={coat.skunk.lit} weight={2.4} opacity={0.7} />
        </Group>

        <Feet
          t={t}
          moving={moving}
          left={T_FOOT_L}
          right={T_FOOT_R}
          fill={coat.skunk.mid}
          outline={coat.skunk.line}
        />

        <Form
          d={T_BODY}
          colors={[coat.skunk.lit, coat.skunk.mid, coat.skunk.deep]}
          positions={[0, 0.5, 1]}
          from={[-26, -46]}
          to={[26, 2]}
          outline={coat.skunk.line}
          weight={OUTLINE}
        />
        <Flat d={T_STRIPE_L} fill={coat.bib.lit} />
        <Flat d={T_STRIPE_R} fill={coat.bib.deep} />

        {/* ears */}
        <Circle cx={-14} cy={-80} r={7} color={coat.skunk.mid} />
        <Circle cx={14} cy={-80} r={7} color={coat.skunk.mid} />
        <Circle cx={-14} cy={-80} r={7} color={coat.skunk.line} style="stroke" strokeWidth={2.2} />
        <Circle cx={14} cy={-80} r={7} color={coat.skunk.line} style="stroke" strokeWidth={2.2} />
        <Circle cx={-14} cy={-79} r={3.2} color={coat.innerEar} opacity={0.8} />
        <Circle cx={14} cy={-79} r={3.2} color={coat.innerEar} opacity={0.8} />

        <Form
          d={T_HEAD}
          colors={[coat.skunk.lit, coat.skunk.mid, coat.skunk.deep]}
          positions={[0, 0.5, 1]}
          from={[-20, -84]}
          to={[20, -36]}
          outline={coat.skunk.line}
          weight={OUTLINE}
        />
        <Flat d={T_BLAZE} fill={coat.bib.lit} />

        <Eye
          cx={-10}
          cy={-64}
          r={6.2}
          iris="#2E2419"
          lookY={nervous ? -1.4 : 0.4}
          shut={shut}
          outline={coat.skunk.line}
        />
        <Eye
          cx={10}
          cy={-64}
          r={6.2}
          iris="#2E2419"
          lookY={nervous ? -1.4 : 0.4}
          shut={shut}
          outline={coat.skunk.line}
        />
        {nervous ? (
          <Group>
            <Brow d="M -17 -74 L -5 -71" color={coat.skunk.lit} weight={2.4} />
            <Brow d="M 17 -74 L 5 -71" color={coat.skunk.lit} weight={2.4} />
          </Group>
        ) : null}

        <Form
          d={T_MUZZLE}
          colors={[coat.bib.lit, coat.bib.deep]}
          from={[-8, -52]}
          to={[8, -35]}
          outline={coat.skunk.line}
          weight={2}
        />
        <Form
          d={T_NOSE}
          colors={[coat.nose.lit, coat.nose.deep]}
          from={[-4, -50]}
          to={[4, -42]}
        />
        <Sheen cx={-2} cy={-48} r={2.4} strength={0.7} />
        {/* an apologetic little mouth once the room is closing in */}
        <Stroke
          d={nervous ? 'M -5 -39 q 5 -3 10 0' : 'M -5 -40 q 5 4 10 0'}
          color={coat.skunk.line}
          weight={2}
        />
        <Stroke d="M -11 -45 L -22 -47" color={coat.skunk.lit} weight={1.4} opacity={0.7} />
        <Stroke d="M 11 -45 L 22 -47" color={coat.skunk.lit} weight={1.4} opacity={0.7} />
      </Group>
    </Group>
  );
}

// ------------------------------------------------------------------ Fluffy

const F_BODY =
  'M 0 -50 C 18 -50 27 -33 27 -18 C 27 -5 15 1 0 1 C -15 1 -27 -5 -27 -18 C -27 -33 -18 -50 0 -50 Z';
const F_RUFF =
  'M 0 -38 C 12 -38 18 -26 18 -16 C 18 -6 10 -2 0 -2 C -10 -2 -18 -6 -18 -16 C -18 -26 -12 -38 0 -38 Z';
const F_HEAD =
  'M 0 -86 C 14 -86 23 -76 23 -64 C 23 -52 14 -44 0 -44 C -14 -44 -23 -52 -23 -64 C -23 -76 -14 -86 0 -86 Z';
const F_EAR_L = 'M -21 -76 C -25 -90 -22 -99 -17 -98 C -12 -97 -6 -88 -3 -80 Z';
const F_EAR_R = 'M 21 -76 C 25 -90 22 -99 17 -98 C 12 -97 6 -88 3 -80 Z';
const F_EAR_IN_L = 'M -19 -79 C -21 -88 -19 -93 -16 -92 C -13 -91 -10 -86 -8 -82 Z';
const F_EAR_IN_R = 'M 19 -79 C 21 -88 19 -93 16 -92 C 13 -91 10 -86 8 -82 Z';
const F_CHEEK_L =
  'M -8 -55 C -2 -55 1 -51 1 -48 C 1 -45 -3 -43 -8 -43 C -13 -43 -16 -45 -16 -48 C -16 -51 -13 -55 -8 -55 Z';
const F_CHEEK_R =
  'M 8 -55 C 2 -55 -1 -51 -1 -48 C -1 -45 3 -43 8 -43 C 13 -43 16 -45 16 -48 C 16 -51 13 -55 8 -55 Z';
const F_NOSE =
  'M 0 -58 C 4 -58 6 -56 6 -54 C 6 -51 3 -49 0 -49 C -3 -49 -6 -51 -6 -54 C -6 -56 -4 -58 0 -58 Z';
const F_EYE_L = 'M -19 -66 C -14 -73 -6 -73 -2 -66 C -6 -60 -14 -60 -19 -66 Z';
const F_EYE_R = 'M 19 -66 C 14 -73 6 -73 2 -66 C 6 -60 14 -60 19 -66 Z';
const F_DECOY_STRIPE_L = 'M -9 -48 C -11 -32 -11 -14 -10 0 L -3 0 C -4 -14 -4 -32 -3 -48 Z';
const F_DECOY_STRIPE_R = 'M 9 -48 C 11 -32 11 -14 10 0 L 3 0 C 4 -14 4 -32 3 -48 Z';
const F_DECOY_BLAZE = 'M -4 -85 L 4 -85 C 5 -74 5 -62 4 -56 L -4 -56 C -5 -62 -5 -74 -4 -85 Z';
const F_DECOY_TAIL = 'M 34 -28 C 46 -36 50 -54 42 -66';
const F_FOOT_L = 'M -14 -5 C -21 -5 -24 0 -17 2 L -5 2 L -5 -5 Z';
const F_FOOT_R = 'M 14 -5 C 21 -5 24 0 17 2 L 5 2 L 5 -5 Z';
const F_TAIL = 'M 22 -20 C 48 -26 57 -54 42 -70 C 35 -77 26 -71 28 -62';

/**
 * Fluffy the cat: white, smug, and completely unmarked — the shading and the
 * ruff carry him rather than any pattern, because grey stripes on a white cat
 * read as dirt.
 *
 * In decoy mode he has put the white stripes on and is waiting to be caught on
 * purpose (§7), so he goes black and white and looks *extremely* pleased with
 * himself. White to black is the biggest change any character makes, which is
 * exactly right for the one move the player spends.
 */
export function Fluffy({
  x,
  y,
  size,
  t,
  flip,
  moving = false,
  decoy,
}: Placed & { decoy: boolean }) {
  const c = decoy ? coat.skunk : coat.cat;
  const belly = decoy ? coat.bib : coat.catBelly;
  const line = decoy ? coat.skunk.line : coat.cat.line;
  const tailSway = wobble(t, 3.1, 0.13);
  const bob = wobble(t, moving ? 16 : 9, moving ? 1.9 : 1.2, 2.2);
  const shut = blinking(t, 5);

  return (
    <Group transform={stand(x, y, size, flip)}>
      <Group transform={[{ translateY: bob }] as Transforms3d}>
        <Group
          transform={[{ translateY: -20 }, { rotate: tailSway }, { translateY: 20 }] as Transforms3d}
        >
          <Path
            path={path(F_TAIL)}
            color={line}
            style="stroke"
            strokeWidth={19 + OUTLINE_FINE}
            strokeCap="round"
          />
          <Path path={path(F_TAIL)} color={c.mid} style="stroke" strokeWidth={19} strokeCap="round" />
          <Path
            path={path(F_TAIL)}
            color={c.lit}
            style="stroke"
            strokeWidth={8}
            strokeCap="round"
            opacity={0.45}
          />
          {decoy ? (
            <Path
              path={path(F_DECOY_TAIL)}
              color={coat.bib.mid}
              style="stroke"
              strokeWidth={7}
              strokeCap="round"
            />
          ) : null}
        </Group>

        <Feet t={t} moving={moving} left={F_FOOT_L} right={F_FOOT_R} fill={c.mid} outline={line} />

        <Form
          d={F_BODY}
          colors={[c.lit, c.mid, c.deep]}
          positions={[0, 0.5, 1]}
          from={[-24, -48]}
          to={[24, 2]}
          outline={line}
          weight={OUTLINE}
        />
        {decoy ? null : <Flat d={F_RUFF} fill={belly.mid} opacity={0.9} />}

        {decoy ? (
          <Group>
            <Flat d={F_DECOY_STRIPE_L} fill={coat.bib.lit} />
            <Flat d={F_DECOY_STRIPE_R} fill={coat.bib.deep} />
          </Group>
        ) : null}

        <Form
          d={F_EAR_L}
          colors={[c.lit, c.deep]}
          from={[-22, -96]}
          to={[-6, -76]}
          outline={line}
          weight={2.4}
        />
        <Form
          d={F_EAR_R}
          colors={[c.mid, c.deep]}
          from={[22, -96]}
          to={[6, -76]}
          outline={line}
          weight={2.4}
        />
        <Flat d={F_EAR_IN_L} fill={coat.innerEar} opacity={0.85} />
        <Flat d={F_EAR_IN_R} fill={coat.innerEar} opacity={0.7} />

        <Form
          d={F_HEAD}
          colors={[c.lit, c.mid, c.deep]}
          positions={[0, 0.5, 1]}
          from={[-20, -84]}
          to={[20, -44]}
          outline={line}
          weight={OUTLINE}
        />
        {decoy ? <Flat d={F_DECOY_BLAZE} fill={coat.bib.lit} /> : null}

        <Flat d={F_CHEEK_L} fill={belly.lit} />
        <Flat d={F_CHEEK_R} fill={belly.mid} />

        {shut ? (
          <Group>
            <Stroke d="M -18 -65 q 7 5 14 0" color={line} weight={2.6} />
            <Stroke d="M 4 -65 q 7 5 14 0" color={line} weight={2.6} />
          </Group>
        ) : (
          <Group>
            {/* almond eyes with a slit pupil — smug, and he knows it */}
            <Ink d={F_EYE_L} fill="#F3EEE0" outline={line} weight={2.2} />
            <Ink d={F_EYE_R} fill="#F3EEE0" outline={line} weight={2.2} />
            <Circle cx={-10} cy={-66} r={4} color="#8FB556" />
            <Circle cx={10} cy={-66} r={4} color="#7FA449" />
            <Stroke d="M -10 -70 L -10 -62" color="#12180F" weight={2.6} />
            <Stroke d="M 10 -70 L 10 -62" color="#12180F" weight={2.6} />
            <Circle cx={-11.6} cy={-68} r={1.4} color={palette.white} />
            <Circle cx={8.4} cy={-68} r={1.4} color={palette.white} />
          </Group>
        )}

        <Form
          d={F_NOSE}
          colors={[lighten(coat.innerEar, 0.25), coat.innerEar]}
          from={[-4, -58]}
          to={[4, -49]}
          outline={line}
          weight={1.6}
        />
        <Stroke d="M 0 -49 L 0 -45" color={line} weight={1.8} />
        <Stroke d="M -7 -45 q 7 5 7 0 q 0 5 7 0" color={line} weight={2} />
        <Group opacity={0.75}>
          <Stroke d="M -14 -50 L -30 -54" color={belly.lit} weight={1.6} />
          <Stroke d="M -14 -47 L -31 -45" color={belly.lit} weight={1.6} />
          <Stroke d="M 14 -50 L 30 -54" color={belly.lit} weight={1.6} />
          <Stroke d="M 14 -47 L 31 -45" color={belly.lit} weight={1.6} />
        </Group>
        <Circle cx={-11} cy={-51} r={1} color={line} />
        <Circle cx={11} cy={-51} r={1} color={line} />
      </Group>
    </Group>
  );
}

// --------------------------------------------------------------- Sniffsalot

const S_BODY =
  'M 0 -50 C 21 -50 30 -33 30 -18 C 30 -5 17 1 0 1 C -17 1 -30 -5 -30 -18 C -30 -33 -21 -50 0 -50 Z';
const S_SADDLE =
  'M -26 -36 C -18 -48 18 -48 26 -36 C 28 -28 27 -22 25 -18 C 12 -24 -12 -24 -25 -18 C -27 -22 -28 -28 -26 -36 Z';
const S_CHEST =
  'M 0 -33 C 11 -33 17 -21 17 -12 C 17 -4 9 -1 0 -1 C -9 -1 -17 -4 -17 -12 C -17 -21 -11 -33 0 -33 Z';
const S_HEAD =
  'M 0 -88 C 15 -88 24 -77 24 -65 C 24 -53 15 -45 0 -45 C -15 -45 -24 -53 -24 -65 C -24 -77 -15 -88 0 -88 Z';
const S_EAR_L = 'M -19 -78 C -32 -75 -37 -54 -31 -40 C -25 -33 -19 -46 -18 -64 Z';
const S_EAR_R = 'M 19 -78 C 32 -75 37 -54 31 -40 C 25 -33 19 -46 18 -64 Z';
const S_MUZZLE =
  'M 0 -58 C 13 -58 20 -50 20 -43 C 20 -35 11 -30 0 -30 C -11 -30 -20 -35 -20 -43 C -20 -50 -13 -58 0 -58 Z';
const S_BLAZE = 'M -4 -86 L 4 -86 C 6 -74 7 -62 6 -54 L -6 -54 C -7 -62 -6 -74 -4 -86 Z';
const S_NOSE =
  'M 0 -48 C 7 -48 11 -44 11 -40 C 11 -36 6 -34 0 -34 C -6 -34 -11 -36 -11 -40 C -11 -44 -7 -48 0 -48 Z';
const S_FOOT_L = 'M -15 -5 C -22 -5 -25 0 -18 2 L -6 2 L -6 -5 Z';
const S_FOOT_R = 'M 15 -5 C 22 -5 25 0 18 2 L 6 2 L 6 -5 Z';
const S_TAIL = 'M 24 -28 C 42 -34 49 -54 41 -68';

/*
 * The same head seen from the side.
 *
 * Sliding a front-on face sideways only goes so far: past about halfway the
 * muzzle comes away from the skull and it stops looking like a dog. So there are
 * two drawings, and he cross-fades between them. Everything here faces right and
 * is mirrored for the other side.
 */
const P_SKULL =
  'M -6 -90 C 8 -90 19 -81 20 -68 C 21 -55 12 -45 -3 -45 C -18 -45 -26 -56 -26 -69 C -26 -81 -19 -90 -6 -90 Z';
const P_SNOUT =
  'M 10 -67 C 22 -67 31 -62 32 -55 C 33 -48 27 -44 18 -44 C 9 -44 3 -48 2 -55 C 2 -62 5 -67 10 -67 Z';
const P_NOSE =
  'M 25 -61 C 32 -61 36 -58 36 -54 C 36 -49 32 -47 27 -47 C 22 -47 19 -50 19 -54 C 19 -58 21 -61 25 -61 Z';
/** The near ear, hanging in front of his head — which is where it is, side on. */
const P_EAR = 'M -8 -79 C -26 -77 -33 -54 -24 -40 C -15 -36 -9 -52 -8 -66 Z';
/** The far ear, just showing over the top of his head. */
const P_EAR_FAR = 'M 2 -84 C 12 -82 15 -70 11 -62 C 7 -60 3 -70 2 -78 Z';
const P_MOUTH = 'M 9 -46 C 14 -43 21 -43 25 -46';

/**
 * Mr. Sniffsalot, tricolour like a beagle.
 *
 * **He is the compass, so he points with his face, not with a floating arrow.**
 * Given a direction he turns to face it, lifts his muzzle along it and throws
 * sniff marks that way — nose in the air when the way out is straight up the
 * room. Because the direction he is handed already drifts and wobbles as the
 * meter climbs (§8), his nose wanders with it: the failing compass is something
 * the dog *does*, rather than something drawn next to him.
 *
 * The rest of him is the same instrument: ears keen and tail going while the
 * room is clean; ears flat, brows up and eyes screwed shut once it isn't.
 */
export function Sniffsalot({
  x,
  y,
  size,
  t,
  flip,
  moving = false,
  accuracy,
  point,
}: Placed & {
  accuracy: number;
  /** Unit vector in world space (y toward the exit), or null when he has given up. */
  point?: Vec2 | null;
}) {
  const working = accuracy > 0.55;
  const struggling = accuracy > 0.05 && !working;
  const done = accuracy <= 0.05;

  /*
   * How a front-facing head looks left and right.
   *
   * Not by rotating — spin a front-on head and you get an upside-down dog — and
   * not by mirroring the whole animal, which turns his body too. The face slides
   * across the skull instead, with the **muzzle leading the eyes**: that
   * difference in travel is what sells a turn in two dimensions, because the nose
   * is the part that sticks out furthest and so swings furthest. The face also
   * narrows a little at the extremes, the way a real one foreshortens.
   *
   * Up and down is the muzzle lifting, so pointing at the exit — straight up the
   * room, and the direction he points most often — puts his nose in the air.
   */
  const screenX = point ? point.x : 0;
  // World y grows toward the exit; screen y grows down.
  const screenY = point ? -point.y : 0;
  const pointing = point !== null && point !== undefined && !done;
  // His body keeps facing the way he is walking; only his head turns.
  const turn = pointing ? clamp(screenX, -1, 1) * (flip ? -1 : 1) : 0;
  /** How side-on the direction is: 0 straight at you, 1 flat to the side. */
  const sideness = Math.abs(turn);
  /*
   * Two drawings, and he is in one or the other — never half in each.
   *
   * Fading between two different heads gives a double exposure, not a turn; this
   * is the one place where limited animation is right and blending is wrong. So
   * it snaps, the way a hand-drawn head turn snaps between keys, and the snap
   * lands while the head is already moving. Front-on covers everything up to
   * about halfway round, which is plenty for "somewhere ahead"; past that he is
   * simply drawn from the side.
   */
  const asProfile = sideness > 0.55 ? 1 : 0;
  // Front-on reaches as far as it can before handing over, so the switch is a
  // small step rather than a jump.
  const faceX = turn * 14;
  const faceLift = pointing ? screenY * 5 : 0;
  /*
   * Squeezing the face is the *only* thing that sells the turn while he is still
   * front-on, so it does the work alone: both eyes stay, fully drawn, right up
   * until the profile takes over and there is genuinely only one to see.
   *
   * Fading the far eye out early looked correct in isolation and was wrong in
   * play — it left a band where he was barely turned and visibly one-eyed.
   */
  const foreshorten = 1 - sideness * 0.42;
  const look = turn * 2.4;
  // In profile the snout does the aiming, so the whole head can simply rotate to
  // put the nose where it needs to be — nose up for the exit, down for a nugget.
  const snoutTilt = pointing ? clamp(Math.atan2(screenY, Math.max(0.4, sideness)), -0.6, 0.55) : 0;

  const wag = wobble(t, working ? 11 : 3, working ? 0.32 : 0.1);
  const bob = done ? 0 : wobble(t, moving ? 16 : 9, moving ? 1.9 : 1.2, 0.4);
  // He sinks onto his haunches once he has given up.
  const sit = done ? 8 : 0;
  const shut = done || blinking(t, 7);
  const lid = struggling ? 0.3 : 0;

  return (
    <Group transform={stand(x, y, size, flip)}>
      <Group transform={[{ translateY: bob + sit }] as Transforms3d}>
        <Group
          transform={[{ translateY: -28 }, { rotate: wag }, { translateY: 28 }] as Transforms3d}
        >
          <Path
            path={path(S_TAIL)}
            color={coat.dog.line}
            style="stroke"
            strokeWidth={15 + OUTLINE_FINE}
            strokeCap="round"
          />
          <Path
            path={path(S_TAIL)}
            color={coat.dog.mid}
            style="stroke"
            strokeWidth={15}
            strokeCap="round"
          />
          <Circle cx={41} cy={-67} r={6} color={coat.white.lit} />
        </Group>

        <Feet
          t={t}
          moving={moving && !done}
          left={S_FOOT_L}
          right={S_FOOT_R}
          fill={coat.white.mid}
          outline={coat.dog.line}
        />

        <Form
          d={S_BODY}
          colors={[coat.dog.lit, coat.dog.mid, coat.dog.deep]}
          positions={[0, 0.5, 1]}
          from={[-26, -48]}
          to={[26, 2]}
          outline={coat.dog.line}
          weight={OUTLINE}
        />
        <Form
          d={S_SADDLE}
          colors={[coat.saddle.lit, coat.saddle.deep]}
          from={[-24, -46]}
          to={[24, -16]}
        />
        <Form
          d={S_CHEST}
          colors={[coat.white.lit, coat.white.deep]}
          from={[-14, -32]}
          to={[14, 0]}
        />

        {/* the ears hang lower the worse the nose gets */}
        {/*
          Ears travel a little with the head and the far one tucks in behind it,
          so turning does not leave both of them stuck out like handles.
        */}
        <Group
          opacity={1 - asProfile}
          transform={
            [{ translateY: struggling ? 3 : 0 }, { scaleY: done ? 1.18 : 1 }] as Transforms3d
          }
        >
          <Group
            transform={
              [
                { translateX: faceX * 0.3 },
                { scaleX: turn > 0 ? 1 - sideness * 0.55 : 1 },
              ] as Transforms3d
            }
          >
            <Form
              d={S_EAR_L}
              colors={[coat.saddle.lit, coat.saddle.deep]}
              from={[-34, -76]}
              to={[-18, -38]}
              outline={coat.dog.line}
              weight={2.6}
            />
          </Group>
          <Group
            transform={
              [
                { translateX: faceX * 0.3 },
                { scaleX: turn < 0 ? 1 - sideness * 0.55 : 1 },
              ] as Transforms3d
            }
          >
            <Form
              d={S_EAR_R}
              colors={[coat.saddle.mid, coat.saddle.deep]}
              from={[34, -76]}
              to={[18, -38]}
              outline={coat.dog.line}
              weight={2.6}
            />
          </Group>
        </Group>

        {/* front-on, for anything close to straight ahead */}
        <Group opacity={1 - asProfile}>
          <Form
            d={S_HEAD}
            colors={[coat.dog.lit, coat.dog.mid, coat.dog.deep]}
            positions={[0, 0.5, 1]}
            from={[-20, -86]}
            to={[20, -46]}
            outline={coat.dog.line}
            weight={OUTLINE}
          />

          <Group
            transform={
              [
                { translateX: faceX },
                { translateY: faceLift },
                { translateY: -66 },
                { scaleX: foreshorten },
                { translateY: 66 },
              ] as Transforms3d
            }
          >
            <Flat d={S_BLAZE} fill={coat.white.lit} />

            <Eye
              cx={-11}
              cy={-67}
              r={6.6}
              iris="#5A3C1E"
              lookX={look}
              lookY={working ? -2 : 1}
              lid={lid}
              shut={shut}
              outline={coat.dog.line}
            />
            <Eye
              cx={11}
              cy={-67}
              r={6.6}
              iris="#5A3C1E"
              lookX={look}
              lookY={working ? -2 : 1}
              lid={lid}
              shut={shut}
              outline={coat.dog.line}
            />
            <Brow
              d={working ? 'M -18 -77 L -6 -78' : 'M -18 -79 L -6 -75'}
              color={coat.saddle.mid}
              weight={2.8}
            />
            <Brow
              d={working ? 'M 18 -77 L 6 -78' : 'M 18 -79 L 6 -75'}
              color={coat.saddle.mid}
              weight={2.8}
            />

            <Group transform={[{ translateX: faceX * 0.5 }] as Transforms3d}>
              <Form
                d={S_MUZZLE}
                colors={[coat.white.lit, coat.white.deep]}
                from={[-16, -56]}
                to={[16, -30]}
                outline={coat.dog.line}
                weight={2.6}
              />
              <Form
                d={S_NOSE}
                colors={[coat.nose.lit, coat.nose.deep]}
                from={[-8, -48]}
                to={[8, -34]}
                outline={coat.nose.deep}
                weight={1.6}
              />
              <Sheen cx={-3.5} cy={-44} r={3.6} strength={0.75} />
              <Stroke d="M 0 -36 L 0 -32" color={coat.dog.line} weight={1.8} />
              <Stroke d="M -6 -32 q 6 4 6 0 q 0 4 6 0" color={coat.dog.line} weight={1.8} />
            </Group>
          </Group>
        </Group>

        {/* and side-on, once he has properly turned to look at something */}
        {asProfile > 0.01 ? (
          <Group opacity={asProfile}>
            <Group
              transform={
                [
                  { scaleX: turn < 0 ? -1 : 1 },
                  { translateY: -68 },
                  { rotate: snoutTilt },
                  { translateY: 68 },
                ] as Transforms3d
              }
            >
              <Form
                d={P_EAR_FAR}
                colors={[coat.saddle.mid, coat.saddle.deep]}
                from={[2, -84]}
                to={[14, -62]}
                outline={coat.dog.line}
                weight={2.2}
              />
              <Form
                d={P_SNOUT}
                colors={[coat.white.lit, coat.white.deep]}
                from={[4, -66]}
                to={[32, -44]}
                outline={coat.dog.line}
                weight={2.6}
              />
              <Form
                d={P_SKULL}
                colors={[coat.dog.lit, coat.dog.mid, coat.dog.deep]}
                positions={[0, 0.5, 1]}
                from={[-24, -88]}
                to={[18, -46]}
                outline={coat.dog.line}
                weight={OUTLINE}
              />
              <Form
                d={P_NOSE}
                colors={[coat.nose.lit, coat.nose.deep]}
                from={[21, -60]}
                to={[35, -48]}
                outline={coat.nose.deep}
                weight={1.6}
              />
              <Sheen cx={25} cy={-57} r={3.2} strength={0.75} />
              <Stroke d={P_MOUTH} color={coat.dog.line} weight={1.8} />
              <Eye
                cx={4}
                cy={-70}
                r={6}
                iris="#5A3C1E"
                lookX={2.2}
                lookY={working ? -1.5 : 1}
                lid={lid}
                shut={shut}
                outline={coat.dog.line}
              />
              <Brow
                d={working ? 'M -4 -80 L 8 -80' : 'M -4 -82 L 8 -78'}
                color={coat.saddle.mid}
                weight={2.8}
              />
              {/* the near ear hangs in front of his head, because it is nearer */}
              <Form
                d={P_EAR}
                colors={[coat.saddle.lit, coat.saddle.deep]}
                from={[-30, -78]}
                to={[-10, -40]}
                outline={coat.dog.line}
                weight={2.6}
              />
            </Group>
          </Group>
        ) : null}

        {done ? (
          <Group>
            <Stroke d="M -31 -52 L -42 -58" color={palette.stinkDeep} weight={3} />
            <Stroke d="M 31 -52 L 42 -58" color={palette.stinkDeep} weight={3} />
          </Group>
        ) : null}
      </Group>
    </Group>
  );
}

// ----------------------------------------------------------------- the local

const L_BODY =
  'M 0 -44 C 16 -44 23 -29 23 -16 C 23 -5 13 1 0 1 C -13 1 -23 -5 -23 -16 C -23 -29 -16 -44 0 -44 Z';
const L_BELLY =
  'M 0 -31 C 9 -31 14 -20 14 -12 C 14 -4 8 -1 0 -1 C -8 -1 -14 -4 -14 -12 C -14 -20 -9 -31 0 -31 Z';
const L_HEAD =
  'M 0 -80 C 12 -80 20 -71 20 -60 C 20 -49 12 -42 0 -42 C -12 -42 -20 -49 -20 -60 C -20 -71 -12 -80 0 -80 Z';
const L_EAR_L = 'M -13 -72 C -18 -86 -13 -93 -8 -84 C -6 -80 -5 -77 -5 -75 Z';
const L_EAR_R = 'M 13 -72 C 18 -86 13 -93 8 -84 C 6 -80 5 -77 5 -75 Z';
const L_MUZZLE =
  'M 0 -56 C 8 -56 12 -51 12 -47 C 12 -43 7 -40 0 -40 C -7 -40 -12 -43 -12 -47 C -12 -51 -8 -56 0 -56 Z';
const L_TEETH = 'M -4 -42 L 4 -42 L 3 -35 L -3 -35 Z';
const L_YAWN = 'M -5 -44 C 0 -46 5 -44 5 -38 C 5 -33 -5 -33 -5 -38 Z';
const L_ACORN = 'M -8 -26 C -8 -33 8 -33 8 -26 C 8 -19 -8 -19 -8 -26 Z';
const L_ACORN_CAP = 'M -8 -27 C -8 -33 8 -33 8 -27 Z';
const L_TAIL = 'M -6 -16 C -28 -20 -40 -44 -28 -60 C -22 -68 -12 -66 -12 -57';
const L_TAIL_INNER = 'M -9 -20 C -26 -25 -35 -44 -26 -56';
const L_TAIL_FUR = [
  'M -38 -50 l -7 -3',
  'M -35 -36 l -7 0',
  'M -30 -62 l -4 -7',
  'M -20 -24 l -4 5',
];

/**
 * Fur for each room's local (§9). Only the squirrel has its own silhouette so
 * far; the rest borrow it in different colours, which is honest placeholder art
 * until their rooms exist. A new species is one entry here, plus its own paths
 * above if it needs a different shape.
 */
const FUR: Record<string, { lit: string; mid: string; deep: string; line: string }> = {
  squirrel: coat.squirrel,
  mouse: { lit: '#C8BFB3', mid: '#AAA095', deep: '#877D72', line: '#4F4841' },
  hamster: { lit: '#E4BC78', mid: '#CDA057', deep: '#A87F3C', line: '#5F4620' },
  dalmatian: { lit: '#FBF6EA', mid: '#EDE6D6', deep: '#CFC6B2', line: '#3A3A3A' },
  goat: { lit: '#EEE6D3', mid: '#DCD2BA', deep: '#BCB098', line: '#5A5243' },
};

/**
 * The animal who lives here. The mood the engine hands down does all the acting:
 * `drowsy` is the tell a sharp-eyed kid gets to spot a second early, and `asleep`
 * is the punchline.
 */
export function Local({
  x,
  y,
  size,
  t,
  flip,
  species,
  mood,
  found,
}: Placed & { species: string; mood: string; found: boolean }) {
  const fur = FUR[species] ?? FUR.squirrel;
  const asleep = mood === 'asleep';
  const drowsy = mood === 'drowsy';
  const startled = mood === 'startled';

  // The tell: a slow sway, then the head goes down.
  const sway = drowsy
    ? wobble(t, 1.6, 0.11)
    : startled
      ? wobble(t, 22, 0.07)
      : wobble(t, 2.6, 0.035);
  const bob = asleep ? 0 : wobble(t, 8, 1.3, 0.9);
  const slump = asleep ? 10 : drowsy ? 4 : 0;
  const shut = asleep || blinking(t, 13);
  const lid = drowsy ? 0.62 : 0;

  return (
    <Group transform={stand(x, y, size, flip)} opacity={found ? 1 : 0.85}>
      <Group transform={[{ rotate: sway }, { translateY: bob + slump }] as Transforms3d}>
        <Group
          transform={
            [{ translateY: -20 }, { rotate: asleep ? 0.2 : 0 }, { translateY: 20 }] as Transforms3d
          }
        >
          <Path
            path={path(L_TAIL)}
            color={fur.line}
            style="stroke"
            strokeWidth={20 + OUTLINE_FINE}
            strokeCap="round"
          />
          <Path
            path={path(L_TAIL)}
            color={fur.mid}
            style="stroke"
            strokeWidth={20}
            strokeCap="round"
          />
          <Path
            path={path(L_TAIL_INNER)}
            color={fur.lit}
            style="stroke"
            strokeWidth={8}
            strokeCap="round"
            opacity={0.65}
          />
          <Fur strokes={L_TAIL_FUR} color={fur.deep} weight={2.2} opacity={0.75} />
        </Group>

        <Form
          d={L_BODY}
          colors={[fur.lit, fur.mid, fur.deep]}
          positions={[0, 0.5, 1]}
          from={[-20, -42]}
          to={[20, 2]}
          outline={fur.line}
          weight={OUTLINE_FINE}
        />
        <Form
          d={L_BELLY}
          colors={[coat.white.lit, coat.white.deep]}
          from={[-12, -30]}
          to={[12, 0]}
        />
        <Ink d={L_ACORN} fill="#B98A52" outline="#63421C" weight={1.8} />
        <Flat d={L_ACORN_CAP} fill="#6E4A22" />

        <Ink d={L_EAR_L} fill={fur.lit} outline={fur.line} weight={2.2} />
        <Ink d={L_EAR_R} fill={fur.mid} outline={fur.line} weight={2.2} />

        <Form
          d={L_HEAD}
          colors={[fur.lit, fur.mid, fur.deep]}
          positions={[0, 0.5, 1]}
          from={[-18, -78]}
          to={[18, -44]}
          outline={fur.line}
          weight={OUTLINE_FINE}
        />

        <Eye
          cx={-8}
          cy={-62}
          r={5.8}
          iris="#2A1E14"
          lookY={startled ? -1.4 : 0}
          lid={lid}
          shut={shut}
          outline={fur.line}
        />
        <Eye
          cx={8}
          cy={-62}
          r={5.8}
          iris="#2A1E14"
          lookY={startled ? -1.4 : 0}
          lid={lid}
          shut={shut}
          outline={fur.line}
        />

        <Form
          d={L_MUZZLE}
          colors={[coat.white.lit, coat.white.deep]}
          from={[-10, -55]}
          to={[10, -40]}
          outline={fur.line}
          weight={2}
        />
        <Flat d={L_TEETH} fill={palette.white} />
        <Stroke d="M 0 -42 L 0 -36" color={fur.line} weight={1.4} />
        <Circle cx={0} cy={-52} r={2.8} color={coat.nose.mid} />
        <Sheen cx={-1} cy={-53} r={1.6} strength={0.7} />

        {/* one yawn before the real one */}
        {drowsy ? (
          <Group>
            <Ink d={L_YAWN} fill="#4A2B2B" outline={fur.line} weight={1.6} />
            <Stroke d="M 20 -74 q 7 -5 11 -12" color={palette.inkSoft} weight={2.2} />
          </Group>
        ) : null}
        {asleep ? <SnoreBubble x={30} y={-84} t={t} /> : null}
        {startled ? (
          <Group>
            <Stroke d="M 0 -96 L 0 -84" color={palette.alarm} weight={5} />
            <Circle cx={0} cy={-78} r={2.6} color={palette.alarm} />
          </Group>
        ) : null}
      </Group>
    </Group>
  );
}

// ----------------------------------------------------------------- the crowd

const P_HEAD =
  'M 0 -96 C 9 -96 15 -89 15 -79 C 15 -69 9 -63 0 -63 C -9 -63 -15 -69 -15 -79 C -15 -89 -9 -96 0 -96 Z';
const P_TORSO = 'M -17 -64 C -17 -71 17 -71 17 -64 L 21 -30 C 7 -25 -7 -25 -21 -30 Z';
const P_COLLAR = 'M -8 -68 L 0 -60 L 8 -68 C 5 -70 -5 -70 -8 -68 Z';
const P_SKIRT = 'M -21 -34 L 21 -34 L 27 -8 L -27 -8 Z';
const P_SHOE_L = 'M -16 -6 C -17 -1 -16 1 -12 1 L -5 1 L -4 -6 Z';
const P_SHOE_R = 'M 16 -6 C 17 -1 16 1 12 1 L 5 1 L 4 -6 Z';
const P_HAIR_SHORT = 'M -16 -78 C -17 -95 17 -95 16 -78 C 12 -86 -12 -86 -16 -78 Z';
const P_HAIR_LONG =
  'M -16 -78 C -18 -96 18 -96 16 -78 C 21 -70 20 -56 18 -48 C 16 -56 17 -70 13 -76 C 6 -84 -6 -84 -13 -76 C -17 -70 -16 -56 -18 -48 C -20 -56 -21 -70 -16 -78 Z';
const P_HAIR_BUN =
  'M -16 -78 C -17 -95 17 -95 16 -78 C 12 -86 -12 -86 -16 -78 Z M 0 -99 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0';
const P_CAP = 'M -17 -80 C -18 -96 18 -96 17 -80 L 24 -78 C 24 -74 -20 -74 -17 -80 Z';
const P_ARM_DOWN_L = 'M -17 -60 C -26 -52 -28 -43 -26 -34';
const P_ARM_DOWN_R = 'M 17 -60 C 26 -52 28 -43 26 -34';
const P_ARM_UP_L = 'M -17 -62 C -29 -72 -33 -86 -29 -97';
const P_ARM_UP_R = 'M 17 -62 C 29 -72 33 -86 29 -97';
const P_ARM_POINT = 'M 17 -60 C 29 -62 41 -66 51 -70';
const P_LEG_L = 'M -8 -28 L -9 -4';
const P_LEG_R = 'M 8 -28 L 9 -4';
const P_MOUTH_O = 'M -4 -74 C 0 -76 4 -74 4 -70 C 4 -66 -4 -66 -4 -70 Z';

const HAIR_STYLES = [P_HAIR_SHORT, P_HAIR_LONG, P_HAIR_BUN, P_CAP, P_HAIR_SHORT];

/**
 * One of the people. They are the only ones in the game who talk (§14.2), so
 * they carry the reaction: a wrinkled nose, then an accusing finger, then hands
 * in the air and watering eyes. Never anything grosser than that.
 *
 * Everything personal about them — build, skin, shirt, hair — comes from `seed`,
 * so a crowd of nine reads as nine people rather than nine copies of one.
 */
export function Person({
  x,
  y,
  size,
  t,
  seed,
  stage,
  pointDir,
}: Omit<Placed, 'flip'> & { seed: number; stage: string; pointDir: number }) {
  const panicking = stage === 'panic';
  const blaming = stage === 'blame';
  const sniffing = stage === 'sniff';

  const shirt = art.shirt[seed % art.shirt.length];
  const skin = art.skin[(seed * 2 + 1) % art.skin.length];
  const hair = art.hair[(seed * 3 + 1) % art.hair.length];
  const shirtLine = darken(shirt, 0.45);
  const skinLine = darken(skin, 0.45);
  const hairStyle = HAIR_STYLES[seed % HAIR_STYLES.length];
  const skirt = hash01(seed * 7.3) > 0.6;
  // A little variation in build, so nobody is a clone of the person beside them.
  const build = 0.92 + hash01(seed * 4.1) * 0.18;

  const speed = panicking ? 13 : 2.2;
  const bob = wobble(t, speed, panicking ? 4 : 1.3, seed);
  const legA = stride(t + seed, true, 0, panicking ? 15 : 2.4, panicking ? 5 : 2);
  const legB = stride(t + seed, true, 1, panicking ? 15 : 2.4, panicking ? 5 : 2);
  const lean = panicking ? wobble(t, speed * 0.7, 0.11, seed) : wobble(t, 1.3, 0.028, seed);
  // Eyes go toward whatever they have decided to blame.
  const look = blaming || sniffing ? Math.sign(pointDir) * 2 : 0;
  const flip = pointDir < 0;

  return (
    <Group transform={stand(x, y, size, flip)}>
      <Group
        transform={
          [
            { rotate: lean },
            { translateY: bob },
            { scaleX: build },
            { scaleY: build },
          ] as Transforms3d
        }
      >
        {/* people are always milling, and running once it all goes wrong */}
        <Group transform={[legA] as Transforms3d}>
          <Stroke d={P_LEG_L} color={skinLine} weight={6.5} />
          <Stroke d={P_LEG_L} color={skin} weight={5} />
          <Ink d={P_SHOE_L} fill="#3B3128" outline="#221C16" weight={1.6} />
        </Group>
        <Group transform={[legB] as Transforms3d}>
          <Stroke d={P_LEG_R} color={skinLine} weight={6.5} />
          <Stroke d={P_LEG_R} color={skin} weight={5} />
          <Ink d={P_SHOE_R} fill="#3B3128" outline="#221C16" weight={1.6} />
        </Group>

        {panicking ? (
          <Group>
            <Stroke d={P_ARM_UP_L} color={skin} weight={7} />
            <Stroke d={P_ARM_UP_R} color={skin} weight={7} />
            <Circle cx={-29} cy={-99} r={4.6} color={skin} />
            <Circle cx={29} cy={-99} r={4.6} color={skin} />
          </Group>
        ) : blaming ? (
          <Group>
            <Stroke d={P_ARM_DOWN_L} color={skin} weight={7} />
            <Stroke d={P_ARM_POINT} color={skin} weight={7} />
            <Circle cx={51} cy={-70} r={4.2} color={skin} />
          </Group>
        ) : (
          <Group>
            <Stroke d={P_ARM_DOWN_L} color={skin} weight={7} />
            <Stroke d={P_ARM_DOWN_R} color={skin} weight={7} />
            <Circle cx={-26} cy={-33} r={4.2} color={skin} />
            <Circle cx={26} cy={-33} r={4.2} color={skin} />
          </Group>
        )}

        {skirt ? (
          <Form
            d={P_SKIRT}
            colors={[lighten(shirt, 0.16), shirt, darken(shirt, 0.22)]}
            from={[-22, -34]}
            to={[22, -8]}
            outline={shirtLine}
            weight={2.4}
          />
        ) : null}
        <Form
          d={P_TORSO}
          colors={[lighten(shirt, 0.2), shirt, darken(shirt, 0.24)]}
          positions={[0, 0.45, 1]}
          from={[-18, -68]}
          to={[20, -26]}
          outline={shirtLine}
          weight={2.6}
        />
        <Flat d={P_COLLAR} fill={darken(shirt, 0.3)} opacity={0.7} />
        <Stroke
          d="M 10 -58 C 13 -48 14 -38 13 -30"
          color={darken(shirt, 0.3)}
          weight={1.6}
          opacity={0.5}
        />

        {/* neck */}
        <Stroke d="M 0 -70 L 0 -62" color={darken(skin, 0.25)} weight={9} />

        <Form
          d={P_HEAD}
          colors={[lighten(skin, 0.18), skin, darken(skin, 0.2)]}
          positions={[0, 0.5, 1]}
          from={[-12, -94]}
          to={[12, -64]}
          outline={skinLine}
          weight={2.4}
        />
        <Ink d={hairStyle} fill={hair} outline={darken(hair, 0.4)} weight={2} />

        {panicking ? (
          <Group>
            {/* watering eyes and an open mouth. That is the whole vocabulary. */}
            <Circle cx={-6} cy={-82} r={4.6} color="#FBF7ED" />
            <Circle cx={6} cy={-82} r={4.6} color="#FBF7ED" />
            <Circle cx={-6} cy={-82} r={2.3} color="#22180F" />
            <Circle cx={6} cy={-82} r={2.3} color="#22180F" />
            <Brow d="M -11 -89 L -2 -87" color={darken(hair, 0.2)} weight={2.2} />
            <Brow d="M 11 -89 L 2 -87" color={darken(hair, 0.2)} weight={2.2} />
            <Circle cx={-11} cy={-74 + wobble(t, 6, 3, seed)} r={2.4} color={palette.breeze} />
            <Circle cx={11} cy={-74 + wobble(t, 6, 3, seed + 2)} r={2.4} color={palette.breeze} />
            <Ink d={P_MOUTH_O} fill="#5B3130" outline={skinLine} weight={1.6} />
          </Group>
        ) : (
          <Group>
            <Circle cx={-6 + look} cy={-82} r={2.2} color="#22180F" />
            <Circle cx={6 + look} cy={-82} r={2.2} color="#22180F" />
            <Brow
              d={blaming ? 'M -11 -88 L -2 -89' : 'M -11 -89 L -2 -88'}
              color={darken(hair, 0.2)}
              weight={2}
            />
            <Brow
              d={blaming ? 'M 11 -88 L 2 -89' : 'M 11 -89 L 2 -88'}
              color={darken(hair, 0.2)}
              weight={2}
            />
            <Stroke d="M 0 -80 L 1 -76" color={darken(skin, 0.3)} weight={1.6} />
            {blaming ? <Stroke d="M -5 -72 q 5 -4 10 0" color={skinLine} weight={2} /> : null}
            {sniffing ? <Stroke d="M -4 -72 L 4 -72" color={skinLine} weight={2} /> : null}
            {!blaming && !sniffing ? (
              <Stroke d="M -4 -73 q 4 3 8 0" color={skinLine} weight={1.8} />
            ) : null}
            {/* the nose wrinkle */}
            {sniffing || blaming ? (
              <Stroke d="M -6 -77 q 4 -3 7 0" color={skinLine} weight={1.6} />
            ) : null}
          </Group>
        )}
      </Group>
    </Group>
  );
}
