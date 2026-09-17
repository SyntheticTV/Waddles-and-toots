/**
 * Everything in the room that isn't alive.
 *
 * A prop's `bounds` is its footprint in world units — the engine's business. The
 * art is authored in a normalized box with the same proportions, drawn from the
 * top-left down, and scaled onto that footprint with its **bottom edges aligned**
 * so an object can stand up out of its own floor space the way a grill or a shed
 * does. Each one drops a soft shadow on that footprint, away from the light, so
 * it sits on the grass instead of floating over it.
 *
 * Blame props matter most: kids should be able to spot the potato salad before
 * the crowd does (§5), so every one of them is drawn as the actual thing rather
 * than a labelled box.
 */

import React from 'react';
import { Circle, Group, Path, Rect, type Transforms3d } from '@shopify/react-native-skia';

import type { Prop, PropKind } from '../game/types';
import { art, palette } from '../theme/palette';
import { OUTLINE_FINE, path, wobble } from './ink';
import {
  Flat,
  Form,
  Fur,
  GroundShadow,
  Ink,
  Panel,
  Sheen,
  Stroke,
  darken,
  lighten,
} from './shading';

interface ArtProps {
  /** Seconds since the run started. */
  t: number;
}

interface Entry {
  /** The box this drawing was authored in. Match the level's footprint ratio. */
  w: number;
  h: number;
  Art: (p: ArtProps) => React.ReactElement;
}

// ------------------------------------------------------------------ pieces

/** Wavy "this is the one, surely" lines rising off a blame prop. */
function Whiff({ x, y, t, phase = 0 }: { x: number; y: number; t: number; phase?: number }) {
  const lift = wobble(t, 2.2, 4, phase);
  return (
    <Group transform={[{ translateX: x }, { translateY: y + lift }] as Transforms3d} opacity={0.7}>
      <Stroke d="M 0 0 q 5 -6 0 -12 q -5 -6 0 -12" color={palette.stinkDeep} weight={3} />
    </Group>
  );
}

/** Grain for anything wooden. */
function Grain({ lines, color }: { lines: string[]; color: string }) {
  return <Fur strokes={lines} color={color} weight={1.8} opacity={0.45} />;
}

// ----------------------------------------------------------- the BBQ props

/** Potato salad. It has been out here a while. (24 x 12 world units.) */
const PotatoSalad = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 6 26 C 6 12 94 12 94 26 C 94 42 78 50 50 50 C 22 50 6 42 6 26 Z"
      colors={[palette.white, palette.paper, '#CFC5AE']}
      positions={[0, 0.5, 1]}
      from={[14, 14]}
      to={[80, 50]}
      outline="#7E7460"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 14 24 C 18 8 34 2 50 4 C 68 6 82 12 86 24 C 70 32 30 32 14 24 Z"
      colors={[lighten(art.salad, 0.2), art.salad, darken(art.salad, 0.25)]}
      positions={[0, 0.5, 1]}
      from={[22, 4]}
      to={[78, 30]}
      outline="#A98F45"
      weight={2}
    />
    <Circle cx={36} cy={17} r={4} color={art.saladBit} />
    <Circle cx={54} cy={13} r={3.4} color={lighten(art.saladBit, 0.2)} />
    <Circle cx={68} cy={19} r={4} color={art.saladBit} />
    <Circle cx={46} cy={22} r={2.6} color="#9BAF63" />
    <Sheen cx={30} cy={30} r={16} strength={0.45} />
    <Stroke d="M 70 22 L 92 -10" color={art.metal} weight={5} />
    <Ink d="M 88 -14 C 96 -14 100 -8 96 -3 C 92 1 84 0 84 -7 Z" fill={art.metal} outline={art.metalDark} weight={2} />
    {/* one fly, doing laps */}
    <Circle cx={26 + wobble(t, 3.4, 16)} cy={-8 + wobble(t, 4.7, 7)} r={2.4} color={palette.ink} />
  </Group>
);

/** The grill. Something in it has gone WRONG. (20 x 16.) */
const Grill = ({ t }: ArtProps) => (
  <Group>
    <Stroke d="M 26 44 L 16 78" color={art.metalDark} weight={5} />
    <Stroke d="M 74 44 L 84 78" color={art.metalDark} weight={5} />
    <Stroke d="M 50 46 L 50 74" color={art.metalDark} weight={5} />
    <Circle cx={84} cy={76} r={7} color={art.metalDark} />
    <Circle cx={84} cy={76} r={7} color={palette.ink} style="stroke" strokeWidth={2.2} />
    <Circle cx={82} cy={74} r={2.4} color={art.metal} />

    {/* open lid, tipped back */}
    <Form
      d="M 12 22 C 12 -12 88 -12 88 22 Z"
      colors={[lighten(art.charcoal, 0.35), art.charcoal, darken(art.charcoal, 0.4)]}
      positions={[0, 0.45, 1]}
      from={[20, -10]}
      to={[80, 22]}
      outline="#2A2824"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 26 6 C 36 -6 60 -7 72 2" color={lighten(art.charcoal, 0.5)} weight={3} opacity={0.6} />

    <Form
      d="M 8 24 L 92 24 C 92 48 76 60 50 60 C 24 60 8 48 8 24 Z"
      colors={[lighten(art.metalDark, 0.3), art.metalDark, darken(art.metalDark, 0.35)]}
      positions={[0, 0.5, 1]}
      from={[16, 24]}
      to={[80, 60]}
      outline="#3E4347"
      weight={OUTLINE_FINE}
    />
    <Rect x={18} y={26} width={64} height={5} color={art.metal} />
    <Stroke d="M 20 34 L 80 34" color={darken(art.metalDark, 0.3)} weight={2} opacity={0.5} />
    <Circle cx={36} cy={42} r={5} color={palette.alarm} />
    <Circle cx={58} cy={45} r={4} color="#E8712E" />
    <Sheen cx={36} cy={42} r={9} color={palette.alarm} strength={0.5} />
    <Whiff x={34} y={18} t={t} />
    <Whiff x={62} y={16} t={t} phase={1.4} />
  </Group>
);

/** Dave. DAVE. (14 x 9.) */
const UnclesShoes = ({ t }: ArtProps) => (
  <Group>
    {/* kicked off, side on, still warm */}
    <Ink
      d="M 2 48 C 2 56 8 59 18 59 L 42 59 C 48 59 50 54 48 48 Z"
      fill="#4B3218"
      outline="#2E1E0E"
      weight={2}
    />
    <Form
      d="M 8 48 C 6 36 12 24 24 24 C 33 24 38 31 40 38 C 42 44 46 44 48 48 Z"
      colors={[lighten(art.wood, 0.22), art.wood, darken(art.wood, 0.32)]}
      positions={[0, 0.5, 1]}
      from={[10, 24]}
      to={[46, 48]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 13 30 C 18 26 28 26 33 31" color="#4F3416" weight={2.4} />
    <Stroke d="M 17 38 L 28 34" color="#4F3416" weight={2.2} />
    <Stroke d="M 18 44 L 31 40" color="#4F3416" weight={2.2} />

    <Ink
      d="M 98 44 C 98 52 92 55 82 55 L 58 55 C 52 55 50 50 52 44 Z"
      fill="#4B3218"
      outline="#2E1E0E"
      weight={2}
    />
    <Form
      d="M 92 44 C 94 32 88 20 76 20 C 67 20 62 27 60 34 C 58 40 54 40 52 44 Z"
      colors={[art.wood, darken(art.wood, 0.38)]}
      from={[54, 20]}
      to={[92, 44]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 87 26 C 82 22 72 22 67 27" color="#4F3416" weight={2.4} />
    <Stroke d="M 83 34 L 72 30" color="#4F3416" weight={2.2} />
    <Stroke d="M 82 40 L 69 36" color="#4F3416" weight={2.2} />
    <Whiff x={30} y={18} t={t} />
    <Whiff x={76} y={14} t={t} phase={2.1} />
  </Group>
);

/** Who put FISH in the trash? (16 x 16.) */
const TrashCan = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 18 26 L 82 26 L 76 96 L 24 96 Z"
      colors={[lighten(art.metal, 0.25), art.metal, darken(art.metal, 0.3)]}
      positions={[0, 0.4, 1]}
      from={[20, 30]}
      to={[78, 90]}
      outline="#5E6367"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 34 34 L 31 88" color={art.metalDark} weight={4} opacity={0.7} />
    <Stroke d="M 50 34 L 50 88" color={art.metalDark} weight={4} opacity={0.5} />
    <Stroke d="M 66 34 L 69 88" color={art.metalDark} weight={4} opacity={0.7} />
    <Stroke d="M 26 32 L 24 88" color={lighten(art.metal, 0.5)} weight={3} opacity={0.6} />

    {/* lid, never quite back on straight */}
    <Group transform={[{ translateX: 6 }, { rotate: -0.2 }] as Transforms3d}>
      <Form
        d="M 10 18 L 88 18 L 84 30 L 14 30 Z"
        colors={[lighten(art.metalDark, 0.3), darken(art.metalDark, 0.2)]}
        from={[14, 18]}
        to={[84, 30]}
        outline="#3E4347"
        weight={OUTLINE_FINE}
      />
      <Circle cx={49} cy={14} r={6} color={art.metal} />
      <Circle cx={49} cy={14} r={6} color="#3E4347" style="stroke" strokeWidth={2} />
    </Group>

    {/* a tail, sticking out */}
    <Form
      d="M 66 24 L 92 8 L 88 26 L 98 20 L 90 34 Z"
      colors={[lighten(art.metalDark, 0.4), art.metalDark]}
      from={[70, 8]}
      to={[96, 34]}
      outline="#3E4347"
      weight={2}
    />
    <Whiff x={40} y={14} t={t} />
  </Group>
);

/** That pool water has been out here since MAY. (26 x 18.) */
const KiddiePool = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 4 36 C 4 14 96 14 96 36 C 96 58 4 58 4 36 Z"
      colors={[lighten(art.plastic, 0.22), art.plastic, darken(art.plastic, 0.28)]}
      positions={[0, 0.45, 1]}
      from={[10, 16]}
      to={[90, 58]}
      outline="#A96F7E"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 16 36 C 16 22 84 22 84 36 C 84 50 16 50 16 36 Z"
      colors={[darken(art.poolWater, 0.12), art.poolWater, '#9FB79F']}
      positions={[0, 0.5, 1]}
      from={[20, 24]}
      to={[80, 50]}
    />
    <Stroke d="M 26 34 q 8 -4 16 0 q 8 4 16 0" color={palette.white} weight={3} opacity={0.7} />
    <Stroke d="M 30 42 q 10 -3 20 0" color={palette.white} weight={2} opacity={0.4} />
    <Sheen cx={34} cy={30} r={14} strength={0.4} />
    {/* the duck has seen things */}
    <Group transform={[{ translateX: wobble(t, 1.1, 4) }] as Transforms3d}>
      <Form
        d="M 56 40 C 56 30 74 30 74 40 C 74 46 56 46 56 40 Z"
        colors={[palette.white, '#DED4BE']}
        from={[58, 30]}
        to={[74, 46]}
        outline="#9A9179"
        weight={2}
      />
      <Circle cx={74} cy={32} r={5} color={palette.white} />
      <Circle cx={74} cy={32} r={5} color="#9A9179" style="stroke" strokeWidth={2} />
      <Path path={path('M 78 32 L 86 34 L 78 36 Z')} color={palette.nugget} />
      <Circle cx={75} cy={30} r={1.4} color={palette.ink} />
    </Group>
    <Whiff x={30} y={22} t={t} phase={0.8} />
  </Group>
);

/** The sprinkler. Six seconds of a perfect nose. (16 x 16.) */
const Sprinkler = ({ t }: ArtProps) => {
  const swing = wobble(t, 1.7, 0.25);
  return (
    <Group>
      <Form
        d="M 38 62 L 62 62 L 66 92 L 34 92 Z"
        colors={[lighten(art.metalDark, 0.3), darken(art.metalDark, 0.2)]}
        from={[38, 62]}
        to={[66, 92]}
        outline="#3E4347"
        weight={OUTLINE_FINE}
      />
      <Group transform={[{ translateX: 50 }, { translateY: 62 }, { rotate: swing }] as Transforms3d}>
        <Stroke d="M -30 -2 L 30 -2" color={art.metal} weight={7} />
        <Stroke d="M -30 -4 L 30 -4" color={lighten(art.metal, 0.5)} weight={2} opacity={0.7} />
        <Group opacity={0.85}>
          <Stroke d="M -24 -6 q 10 -34 -6 -46" color={palette.breeze} weight={4} />
          <Stroke d="M -6 -8 q 8 -40 -2 -52" color={palette.breeze} weight={4} />
          <Stroke d="M 14 -8 q 6 -38 20 -46" color={palette.breeze} weight={4} />
          <Stroke d="M -20 -10 q 8 -28 -4 -38" color={palette.white} weight={1.6} />
        </Group>
        <Circle cx={-32} cy={-50} r={3} color={palette.breeze} />
        <Circle cx={-6} cy={-62} r={3.4} color={palette.breeze} />
        <Circle cx={36} cy={-52} r={3} color={palette.breeze} />
      </Group>
    </Group>
  );
};

/** The gap in the hedge, where the breeze comes through. (12 x 20.) */
const HedgeGap = ({ t }: ArtProps) => {
  const drift = wobble(t, 1.3, 6);
  return (
    <Group>
      <Form
        d="M 4 22 C 4 8 18 0 30 6 C 40 -6 62 -6 70 6 C 84 0 98 10 96 24 C 100 40 98 56 92 66 C 70 76 30 76 8 66 C 2 54 0 38 4 22 Z"
        colors={[lighten(art.hedge, 0.2), art.hedge, art.hedgeDark]}
        positions={[0, 0.45, 1]}
        from={[10, 0]}
        to={[90, 70]}
        outline="#5F7444"
        weight={OUTLINE_FINE}
      />
      <Circle cx={26} cy={30} r={10} color={art.hedgeDark} opacity={0.7} />
      <Circle cx={64} cy={22} r={9} color={art.hedgeDark} opacity={0.6} />
      <Circle cx={48} cy={52} r={10} color={art.hedgeDark} opacity={0.75} />
      <Circle cx={20} cy={16} r={7} color={lighten(art.hedge, 0.3)} opacity={0.7} />
      <Circle cx={54} cy={12} r={6} color={lighten(art.hedge, 0.3)} opacity={0.6} />

      {/* the gap the breeze comes through */}
      <Form
        d="M 4 116 C 2 102 16 94 28 100 C 38 88 60 88 70 100 C 84 94 98 104 96 118 C 100 138 98 154 92 164 C 70 174 30 174 8 164 C 2 150 0 132 4 116 Z"
        colors={[lighten(art.hedge, 0.16), art.hedge, art.hedgeDark]}
        positions={[0, 0.45, 1]}
        from={[10, 92]}
        to={[90, 168]}
        outline="#5F7444"
        weight={OUTLINE_FINE}
      />
      <Circle cx={30} cy={126} r={10} color={art.hedgeDark} opacity={0.7} />
      <Circle cx={68} cy={142} r={9} color={art.hedgeDark} opacity={0.6} />
      <Circle cx={46} cy={156} r={8} color={art.hedgeDark} opacity={0.7} />
      <Circle cx={26} cy={106} r={6} color={lighten(art.hedge, 0.3)} opacity={0.7} />

      <Group transform={[{ translateX: drift }] as Transforms3d}>
        <Stroke d="M 2 78 q 26 -10 52 0 q 14 6 30 -4" color={palette.breeze} weight={6} />
        <Stroke d="M 10 90 q 24 -8 46 0" color={palette.breeze} weight={5} />
        <Circle cx={88} cy={84} r={4} color={palette.breeze} />
      </Group>
    </Group>
  );
};

/** A folding chair, exactly where nobody expected it. (12 x 10.) */
const LawnChair = () => (
  <Group>
    {/* the back, tipped away from you */}
    <Form
      d="M 20 -28 L 80 -28 L 86 22 L 14 22 Z"
      colors={[lighten(palette.sea, 0.28), palette.sea, darken(palette.sea, 0.25)]}
      positions={[0, 0.5, 1]}
      from={[20, -28]}
      to={[86, 22]}
      outline="#1A4557"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 38 -26 L 36 20" color={palette.white} weight={5} opacity={0.85} />
    <Stroke d="M 58 -26 L 60 20" color={palette.white} weight={5} opacity={0.85} />
    <Stroke d="M 20 -28 L 20 -40" color={art.metalDark} weight={5} />
    <Stroke d="M 80 -28 L 80 -40" color={art.metalDark} weight={5} />
    {/* the seat */}
    <Form
      d="M 8 24 L 92 24 L 96 58 L 4 58 Z"
      colors={[lighten(palette.sea, 0.34), palette.sea, darken(palette.sea, 0.2)]}
      positions={[0, 0.5, 1]}
      from={[8, 24]}
      to={[96, 58]}
      outline="#1A4557"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 34 26 L 32 56" color={palette.white} weight={5} opacity={0.85} />
    <Stroke d="M 62 26 L 64 56" color={palette.white} weight={5} opacity={0.85} />
    <Stroke d="M 12 56 L 8 86" color={art.metalDark} weight={5} />
    <Stroke d="M 88 56 L 92 86" color={art.metalDark} weight={5} />
  </Group>
);

/** Wickets and a mallet, left out mid-game. (14 x 8.) */
const CroquetSet = () => (
  <Group>
    <Stroke d="M 10 52 L 10 26 q 12 -14 24 0 L 34 52" color={art.metalDark} weight={5} />
    <Stroke d="M 54 52 L 54 32 q 10 -12 20 0 L 74 52" color={art.metalDark} weight={5} />
    <Stroke d="M 78 50 L 96 16" color={art.wood} weight={5} />
    <Panel x={84} y={4} w={18} h={14} colors={[lighten(art.woodDark, 0.25), art.woodDark]} r={3} />
    <Circle cx={24} cy={46} r={7} color={palette.alarm} />
    <Circle cx={24} cy={46} r={7} color={darken(palette.alarm, 0.4)} style="stroke" strokeWidth={2.2} />
    <Sheen cx={22} cy={44} r={4} strength={0.6} />
    <Circle cx={62} cy={48} r={7} color={palette.sea} />
    <Circle cx={62} cy={48} r={7} color={darken(palette.sea, 0.4)} style="stroke" strokeWidth={2.2} />
    <Sheen cx={60} cy={46} r={4} strength={0.6} />
  </Group>
);

/** Wind chimes. One nudge and Toots is airborne. (8 x 8.) */
const WindChime = ({ t }: ArtProps) => {
  const swing = wobble(t, 2.6, 0.16);
  return (
    <Group transform={[{ translateX: 50 }, { translateY: 8 }, { rotate: swing }] as Transforms3d}>
      <Stroke d="M 0 -8 L 0 6" color={art.woodDark} weight={4} />
      <Panel
        x={-26}
        y={4}
        w={52}
        h={13}
        colors={[lighten(art.wood, 0.2), darken(art.wood, 0.2)]}
        r={4}
      />
      <Stroke d="M -16 16 L -16 60" color={art.metal} weight={5} />
      <Stroke d="M 0 16 L 0 74" color={art.metal} weight={5} />
      <Stroke d="M 16 16 L 16 54" color={art.metal} weight={5} />
      <Stroke d="M -17 18 L -17 56" color={lighten(art.metal, 0.6)} weight={1.6} />
      <Stroke d="M -1 18 L -1 70" color={lighten(art.metal, 0.6)} weight={1.6} />
      <Circle cx={0} cy={82} r={7} color={art.wood} />
      <Circle cx={0} cy={82} r={7} color={art.woodDark} style="stroke" strokeWidth={2.2} />
    </Group>
  );
};

/** The dog's water bowl. A trip hazard with a skunk behind you. (9 x 7.) */
const WaterBowl = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 10 30 C 10 16 90 16 90 30 C 90 56 74 72 50 72 C 26 72 10 56 10 30 Z"
      colors={[lighten(art.plastic, 0.2), art.plastic, darken(art.plastic, 0.3)]}
      positions={[0, 0.45, 1]}
      from={[14, 18]}
      to={[86, 72]}
      outline="#A96F7E"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 22 32 C 22 24 78 24 78 32 C 78 44 66 52 50 52 C 34 52 22 44 22 32 Z"
      colors={[lighten(palette.breeze, 0.2), palette.breeze, '#6FA9BE']}
      positions={[0, 0.5, 1]}
      from={[26, 24]}
      to={[74, 52]}
    />
    <Stroke d="M 32 32 q 9 -4 18 0 q 9 4 18 0" color={palette.white} weight={3} opacity={0.8} />
    <Circle cx={40 + wobble(t, 1.8, 4)} cy={34} r={2.6} color={palette.white} />
    <Sheen cx={34} cy={30} r={9} strength={0.5} />
  </Group>
);

const TABLE_GRAIN = ['M 14 26 L 88 26', 'M 14 40 L 88 40', 'M 14 54 L 88 54'];

/** Where the food is. Solid — you go round it. (28 x 22.) */
const PicnicTable = () => (
  <Group>
    <Panel
      x={2}
      y={4}
      w={96}
      h={14}
      colors={[lighten(art.wood, 0.2), darken(art.wood, 0.22)]}
      r={4}
    />
    <Panel
      x={2}
      y={62}
      w={96}
      h={14}
      colors={[art.wood, darken(art.wood, 0.32)]}
      r={4}
    />
    <Form
      d="M 8 20 L 92 20 L 92 60 L 8 60 Z"
      colors={[lighten(art.wood, 0.24), art.wood, darken(art.wood, 0.18)]}
      positions={[0, 0.5, 1]}
      from={[8, 20]}
      to={[92, 60]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    <Grain lines={TABLE_GRAIN} color="#8A5C2A" />
    {/* the checked cloth */}
    <Flat d="M 8 24 L 92 24 L 92 56 L 8 56 Z" fill={palette.alarm} opacity={0.8} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Group key={i}>
        <Rect x={10 + i * 14} y={24} width={7} height={7} color={palette.paper} opacity={0.85} />
        <Rect x={17 + i * 14} y={31} width={7} height={7} color={palette.paper} opacity={0.85} />
        <Rect x={10 + i * 14} y={38} width={7} height={7} color={palette.paper} opacity={0.85} />
        <Rect x={17 + i * 14} y={45} width={7} height={7} color={palette.paper} opacity={0.85} />
      </Group>
    ))}
    <Circle cx={30} cy={40} r={9} color={palette.paper} />
    <Circle cx={30} cy={40} r={9} color="#9A9179" style="stroke" strokeWidth={2} />
    <Circle cx={62} cy={38} r={9} color={palette.white} />
    <Circle cx={62} cy={38} r={9} color="#9A9179" style="stroke" strokeWidth={2} />
    <Panel
      x={76}
      y={24}
      w={16}
      h={22}
      colors={[lighten(palette.breeze, 0.3), darken(palette.breeze, 0.15)]}
      r={3}
    />
    <Sheen cx={20} cy={28} r={22} strength={0.3} />
  </Group>
);

/** The cooler. Solid. (14 x 11.) */
const Cooler = () => (
  <Group>
    <Panel
      x={6}
      y={26}
      w={88}
      h={48}
      colors={[lighten(palette.sea, 0.18), palette.sea, darken(palette.sea, 0.3)]}
      r={6}
    />
    <Panel
      x={2}
      y={10}
      w={96}
      h={20}
      colors={[lighten(palette.breeze, 0.3), palette.breeze, darken(palette.breeze, 0.2)]}
      r={6}
    />
    <Stroke d="M 34 20 q 16 -12 32 0" color="#1A4557" weight={4} />
    <Sheen cx={24} cy={20} r={16} strength={0.5} />
    <Circle cx={26} cy={52} r={4} color={palette.white} opacity={0.5} />
    <Circle cx={70} cy={58} r={3} color={palette.white} opacity={0.45} />
  </Group>
);

const SHED_GRAIN = ['M 14 44 L 14 108', 'M 46 40 L 46 108', 'M 82 44 L 82 108'];

/** The shed, in the corner by the gate. Solid. (26 x 30.) */
const Shed = () => (
  <Group>
    <Form
      d="M 2 34 L 50 2 L 98 34 Z"
      colors={[lighten(art.woodDark, 0.24), art.woodDark, darken(art.woodDark, 0.3)]}
      positions={[0, 0.5, 1]}
      from={[10, 2]}
      to={[92, 34]}
      outline="#4E3113"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 8 34 L 92 34 L 92 112 L 8 112 Z"
      colors={[lighten(art.wood, 0.2), art.wood, darken(art.wood, 0.3)]}
      positions={[0, 0.45, 1]}
      from={[8, 34]}
      to={[92, 112]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    <Grain lines={SHED_GRAIN} color="#8A5C2A" />
    <Panel
      x={38}
      y={58}
      w={30}
      h={54}
      colors={[darken(art.wood, 0.2), darken(art.wood, 0.45)]}
      r={3}
    />
    <Circle cx={62} cy={86} r={4} color={art.metal} />
    <Panel
      x={14}
      y={42}
      w={16}
      h={14}
      colors={[lighten(palette.breeze, 0.35), darken(palette.breeze, 0.1)]}
      r={2}
    />
    <Sheen cx={20} cy={46} r={9} strength={0.55} />
  </Group>
);

// ------------------------------------------------------ the restaurant
//
// Everything in room two is something a kitchen would rather blame than admit
// to. They are drawn as the actual thing, for the same reason the potato salad
// is: a child should spot the cheese cart before the waiter does (§5).

/** Boiled to death, and audible about it. (20 x 16.) */
const CabbagePot = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 14 34 L 86 34 L 78 92 L 22 92 Z"
      colors={[lighten(art.metal, 0.3), art.metal, darken(art.metal, 0.3)]}
      positions={[0, 0.45, 1]}
      from={[18, 36]}
      to={[80, 90]}
      outline="#5E6367"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 8 44 L 20 44" color={art.metalDark} weight={5} />
    <Stroke d="M 92 44 L 80 44" color={art.metalDark} weight={5} />
    {/* the lid is off, which was a mistake */}
    <Form
      d="M 10 30 C 10 18 90 18 90 30 C 90 38 10 38 10 30 Z"
      colors={[lighten('#93A86A', 0.25), '#93A86A', '#6E8449']}
      positions={[0, 0.5, 1]}
      from={[16, 20]}
      to={[84, 38]}
      outline="#4F6033"
      weight={2}
    />
    <Circle cx={34} cy={27} r={6} color="#A9BC80" />
    <Circle cx={58} cy={25} r={7} color="#B7C790" />
    <Circle cx={72} cy={29} r={5} color="#A9BC80" />
    <Whiff x={30} y={16} t={t} />
    <Whiff x={62} y={12} t={t} phase={1.6} />
  </Group>
);

/** Wheeled out with enormous pride. (24 x 18.) */
const CheeseCart = ({ t }: ArtProps) => (
  <Group>
    <Stroke d="M 16 62 L 14 88" color={art.woodDark} weight={5} />
    <Stroke d="M 84 62 L 86 88" color={art.woodDark} weight={5} />
    <Circle cx={14} cy={90} r={6} color={art.metalDark} />
    <Circle cx={86} cy={90} r={6} color={art.metalDark} />
    <Panel
      x={8}
      y={52}
      w={84}
      h={12}
      colors={[lighten(art.woodDark, 0.25), darken(art.woodDark, 0.2)]}
      r={3}
    />
    {/* the board, and the collection */}
    <Panel
      x={12}
      y={40}
      w={76}
      h={10}
      colors={[lighten(art.wood, 0.3), darken(art.wood, 0.15)]}
      r={2}
    />
    <Ink
      d="M 18 40 L 34 12 L 50 40 Z"
      fill="#F0D678"
      outline="#A98F45"
      weight={2}
    />
    <Circle cx={30} cy={30} r={3} color="#D9BC58" />
    <Ink d="M 54 40 L 54 20 L 76 20 L 76 40 Z" fill="#F6E3A4" outline="#A98F45" weight={2} />
    <Circle cx={62} cy={30} r={3.4} color="#E2C86A" />
    <Circle cx={70} cy={33} r={2.6} color="#E2C86A" />
    <Ink d="M 78 40 C 78 30 90 30 90 40 Z" fill="#E8CF8C" outline="#A98F45" weight={2} />
    <Whiff x={36} y={10} t={t} />
    <Whiff x={68} y={14} t={t} phase={2.2} />
  </Group>
);

/** Somebody is having a hard time. (22 x 12.) */
const OnionBoard = ({ t }: ArtProps) => (
  <Group>
    <Panel
      x={4}
      y={40}
      w={92}
      h={16}
      colors={[lighten(art.wood, 0.2), darken(art.wood, 0.28)]}
      r={4}
    />
    {/* halves, cut side up */}
    <Ink
      d="M 14 40 C 14 22 42 22 42 40 Z"
      fill="#F3EAF2"
      outline="#9A8AA0"
      weight={2}
    />
    <Stroke d="M 22 40 C 22 30 34 30 34 40" color="#C9B8CE" weight={2} />
    <Ink d="M 50 40 C 50 24 74 24 74 40 Z" fill="#EDE2EC" outline="#9A8AA0" weight={2} />
    <Stroke d="M 57 40 C 57 31 67 31 67 40" color="#C9B8CE" weight={2} />
    {/* the knife, abandoned */}
    <Stroke d="M 76 34 L 96 26" color={art.metal} weight={5} />
    <Stroke d="M 60 18 L 66 10" color={palette.breeze} weight={3} />
    <Whiff x={40} y={20} t={t} />
    <Whiff x={80} y={16} t={t} phase={1.1} />
  </Group>
);

/** Four hundred dollars, under glass, and still the problem. (16 x 12.) */
const TrufflePlate = ({ t }: ArtProps) => (
  <Group>
    <Ink
      d="M 6 62 C 6 50 94 50 94 62 C 94 72 6 72 6 62 Z"
      fill={palette.white}
      outline="#9A9179"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 30 54 C 30 40 70 40 70 54 C 70 60 30 60 30 54 Z"
      colors={['#5E4A38', '#37291E']}
      from={[34, 42]}
      to={[66, 58]}
      outline="#241a12"
      weight={2}
    />
    <Circle cx={44} cy={48} r={2.4} color="#6E5842" />
    <Circle cx={56} cy={50} r={2} color="#6E5842" />
    {/* the cloche, lifted with ceremony */}
    <Group transform={[{ translateY: -6 }] as Transforms3d} opacity={0.55}>
      <Stroke d="M 18 40 C 18 12 82 12 82 40" color={art.metal} weight={4} />
      <Circle cx={50} cy={10} r={4} color={art.metal} />
    </Group>
    <Whiff x={50} y={36} t={t} />
  </Group>
);

/** It is always the fish special. (18 x 12.) */
const FishPlate = ({ t }: ArtProps) => (
  <Group>
    <Ink
      d="M 4 58 C 4 44 96 44 96 58 C 96 70 4 70 4 58 Z"
      fill={palette.white}
      outline="#9A9179"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 24 52 C 32 38 66 38 74 52 C 66 62 32 62 24 52 Z"
      colors={[lighten('#C9B89A', 0.2), '#A8916E']}
      from={[28, 40]}
      to={[70, 60]}
      outline="#7A6647"
      weight={2}
    />
    <Path path={path('M 74 52 L 90 42 L 90 62 Z')} color="#A8916E" />
    <Circle cx={36} cy={49} r={2} color="#6E5C42" />
    <Stroke d="M 44 46 L 62 46" color="#8A7355" weight={2} />
    <Stroke d="M 44 54 L 62 54" color="#8A7355" weight={2} />
    <Whiff x={40} y={36} t={t} />
    <Whiff x={68} y={32} t={t} phase={1.9} />
  </Group>
);

/** Nobody has taken this out since Tuesday. (16 x 20.) */
const KitchenBin = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 16 26 L 84 26 L 76 118 L 24 118 Z"
      colors={[lighten(art.metal, 0.3), art.metal, darken(art.metal, 0.34)]}
      positions={[0, 0.4, 1]}
      from={[20, 30]}
      to={[78, 112]}
      outline="#5E6367"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 22 46 L 78 46" color={art.metalDark} weight={4} opacity={0.6} />
    {/* the lid, propped open by what is inside */}
    <Group transform={[{ translateX: 4 }, { rotate: -0.26 }] as Transforms3d}>
      <Ink d="M 8 16 L 90 16 L 86 28 L 12 28 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    </Group>
    <Ink d="M 56 22 L 78 6 L 74 24 L 86 18 L 76 32 Z" fill="#9AA98A" outline="#5F7444" weight={2} />
    <Whiff x={34} y={12} t={t} />
    <Whiff x={62} y={6} t={t} phase={1.4} />
  </Group>
);

/** A table with a cloth on it. Several of these make the room. (24 x 18.) */
const DiningTable = () => (
  <Group>
    <Stroke d="M 26 62 L 22 86" color={art.woodDark} weight={5} />
    <Stroke d="M 74 62 L 78 86" color={art.woodDark} weight={5} />
    <Form
      d="M 4 30 C 4 18 96 18 96 30 C 96 48 88 62 50 62 C 12 62 4 48 4 30 Z"
      colors={[palette.white, '#F2EDE0', '#D8D0BE']}
      positions={[0, 0.5, 1]}
      from={[12, 20]}
      to={[88, 62]}
      outline="#9A9179"
      weight={OUTLINE_FINE}
    />
    <Circle cx={34} cy={36} r={8} color={palette.paper} />
    <Circle cx={34} cy={36} r={8} color="#9A9179" style="stroke" strokeWidth={2} />
    <Circle cx={66} cy={34} r={8} color={palette.paper} />
    <Circle cx={66} cy={34} r={8} color="#9A9179" style="stroke" strokeWidth={2} />
    {/* a candle, because it is that sort of place */}
    <Stroke d="M 50 42 L 50 26" color={palette.paper} weight={5} />
    <Circle cx={50} cy={22} r={4} color={palette.nugget} />
    <Sheen cx={50} cy={22} r={8} color={palette.nugget} strength={0.6} />
  </Group>
);

/** The extractor hood: the only honest air in the building. (18 x 14.) */
const Extractor = ({ t }: ArtProps) => {
  const pull = wobble(t, 2.1, 5);
  return (
    <Group>
      <Form
        d="M 6 18 L 94 18 L 78 54 L 22 54 Z"
        colors={[lighten(art.metal, 0.35), art.metal, darken(art.metal, 0.3)]}
        positions={[0, 0.45, 1]}
        from={[12, 20]}
        to={[86, 54]}
        outline="#5E6367"
        weight={OUTLINE_FINE}
      />
      <Stroke d="M 16 26 L 84 26" color={lighten(art.metal, 0.5)} weight={3} opacity={0.7} />
      <Group transform={[{ translateY: pull }] as Transforms3d} opacity={0.85}>
        <Stroke d="M 30 80 q 10 -14 0 -24" color={palette.breeze} weight={4} />
        <Stroke d="M 50 86 q 10 -16 0 -28" color={palette.breeze} weight={4} />
        <Stroke d="M 70 80 q 10 -14 0 -24" color={palette.breeze} weight={4} />
      </Group>
      <Circle cx={50} cy={92} r={3} color={palette.breeze} />
    </Group>
  );
};

/** Clean plates, stacked precariously. (10 x 12.) */
const PlateStack = () => (
  <Group>
    {[0, 1, 2, 3, 4].map((i) => (
      <Group key={i}>
        <Ink
          d={`M 8 ${86 - i * 15} C 8 ${76 - i * 15} 92 ${76 - i * 15} 92 ${86 - i * 15} C 92 ${94 - i * 15} 8 ${94 - i * 15} 8 ${86 - i * 15} Z`}
          fill={i % 2 ? palette.paper : palette.white}
          outline="#9A9179"
          weight={2}
        />
      </Group>
    ))}
  </Group>
);

/** A mop in a bucket. Wet floor, wet skunk. (11 x 10.) */
const MopBucket = () => (
  <Group>
    <Stroke d="M 66 62 L 82 4" color={art.woodDark} weight={5} />
    <Ink d="M 54 60 C 54 42 78 42 78 60 Z" fill="#C9C0AE" outline="#8A8272" weight={2} />
    <Form
      d="M 10 52 L 70 52 L 62 96 L 18 96 Z"
      colors={[lighten(palette.sea, 0.3), palette.sea, darken(palette.sea, 0.3)]}
      positions={[0, 0.45, 1]}
      from={[14, 54]}
      to={[66, 94]}
      outline="#1A4557"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 18 62 q 22 -6 44 0" color={palette.breeze} weight={4} />
  </Group>
);

/** Wine, racked and ready to be knocked over. (10 x 16.) */
const WineRack = () => (
  <Group>
    <Panel
      x={8}
      y={10}
      w={84}
      h={104}
      colors={[lighten(art.woodDark, 0.2), darken(art.woodDark, 0.3)]}
      r={4}
    />
    {[0, 1, 2].map((i) => (
      <Group key={i}>
        <Circle cx={32} cy={30 + i * 32} r={11} color="#3E2230" />
        <Circle cx={32} cy={30 + i * 32} r={11} color="#20111A" style="stroke" strokeWidth={2} />
        <Circle cx={68} cy={30 + i * 32} r={11} color="#2C3A22" />
        <Circle cx={68} cy={30 + i * 32} r={11} color="#161E11" style="stroke" strokeWidth={2} />
      </Group>
    ))}
  </Group>
);

// --------------------------------------------------------- false ways out
//
// These have to be *convincing*. A door the player can tell is fake at a glance
// is not a puzzle, it is decoration — so these are drawn with the same wood, the
// same hinges and the same care as the real gate, and the only honest way to
// tell them apart is to ask the local (§10).
//
// What they must never have is the real gate's tell: the daylight behind it and
// the beating green arrow. That pairing is the contract with the player — arrow
// means out — and nothing else in the game may borrow it.

/** A garden door in the fence. Looks exactly like the way out. Isn't. (16 x 20.) */
const FalseDoor = () => (
  <Group>
    <Form
      d="M 6 6 L 94 6 L 94 122 L 6 122 Z"
      colors={[lighten(art.wood, 0.18), art.wood, darken(art.wood, 0.3)]}
      positions={[0, 0.5, 1]}
      from={[6, 6]}
      to={[94, 122]}
      outline={darken(art.wood, 0.45)}
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 32 10 L 32 118" color={darken(art.wood, 0.34)} weight={3} opacity={0.7} />
    <Stroke d="M 62 10 L 62 118" color={darken(art.wood, 0.34)} weight={3} opacity={0.7} />
    <Panel
      x={10}
      y={26}
      w={80}
      h={11}
      colors={[lighten(art.wood, 0.2), darken(art.wood, 0.2)]}
      r={2}
      weight={2}
    />
    <Panel
      x={10}
      y={86}
      w={80}
      h={11}
      colors={[art.wood, darken(art.wood, 0.28)]}
      r={2}
      weight={2}
    />
    {/* a handle, because a door has one */}
    <Circle cx={78} cy={64} r={5} color={art.metal} />
    <Circle cx={78} cy={64} r={5} color={art.metalDark} style="stroke" strokeWidth={2} />
  </Group>
);

/** A window onto somebody's kitchen. No way through. (14 x 12.) */
const FalseWindow = () => (
  <Group>
    <Form
      d="M 4 8 L 96 8 L 96 78 L 4 78 Z"
      colors={[lighten(art.woodDark, 0.22), darken(art.woodDark, 0.18)]}
      from={[4, 8]}
      to={[96, 78]}
      outline={darken(art.wood, 0.5)}
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 12 16 L 88 16 L 88 70 L 12 70 Z"
      colors={[lighten(palette.breeze, 0.4), palette.breeze, darken(palette.breeze, 0.2)]}
      positions={[0, 0.45, 1]}
      from={[12, 16]}
      to={[88, 70]}
    />
    {/* the giveaway, for anybody actually looking: there is a room behind it */}
    <Stroke d="M 50 16 L 50 70" color={darken(art.woodDark, 0.2)} weight={4} />
    <Stroke d="M 12 43 L 88 43" color={darken(art.woodDark, 0.2)} weight={4} />
    <Stroke d="M 20 62 L 40 24" color={palette.white} weight={5} opacity={0.5} />
    <Stroke d="M 58 62 L 78 24" color={palette.white} weight={4} opacity={0.35} />
  </Group>
);

/** A hatch, a cupboard, a cellar door — the generic dud. */
const FalseHatch = () => (
  <Group>
    <Form
      d="M 6 18 L 94 18 L 88 96 L 12 96 Z"
      colors={[lighten(art.woodDark, 0.2), art.woodDark, darken(art.woodDark, 0.3)]}
      positions={[0, 0.5, 1]}
      from={[6, 18]}
      to={[94, 96]}
      outline={darken(art.wood, 0.5)}
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 20 34 L 80 34" color={darken(art.woodDark, 0.35)} weight={4} />
    <Stroke d="M 22 76 L 78 76" color={darken(art.woodDark, 0.35)} weight={4} />
    <Circle cx={50} cy={58} r={7} color={art.metalDark} />
    <Circle cx={50} cy={58} r={7} color={palette.ink} style="stroke" strokeWidth={2.2} />
  </Group>
);

// ------------------------------------------------------- generic fallbacks

const GenericBlame = ({ t }: ArtProps) => (
  <Group>
    <Panel x={10} y={30} w={80} h={62} colors={[lighten(art.wood, 0.2), darken(art.wood, 0.3)]} />
    <Stroke d="M 10 52 L 90 52" color="#8A5C2A" weight={4} opacity={0.6} />
    <Whiff x={40} y={26} t={t} />
    <Whiff x={66} y={22} t={t} phase={1.7} />
  </Group>
);

const GenericFreshAir = ({ t }: ArtProps) => {
  const drift = wobble(t, 1.4, 7);
  return (
    <Group>
      <Panel
        x={8}
        y={10}
        w={84}
        h={80}
        colors={[lighten(palette.breeze, 0.3), darken(palette.breeze, 0.12)]}
      />
      <Stroke d="M 16 34 L 84 34" color={palette.white} weight={5} opacity={0.8} />
      <Stroke d="M 16 54 L 84 54" color={palette.white} weight={5} opacity={0.8} />
      <Stroke d="M 16 74 L 84 74" color={palette.white} weight={5} opacity={0.8} />
      <Group transform={[{ translateX: drift }] as Transforms3d} opacity={0.9}>
        <Stroke d="M 20 100 q 26 -10 52 0" color={palette.sea} weight={4} />
      </Group>
    </Group>
  );
};

const GenericBump = () => (
  <Group>
    <Panel x={12} y={44} w={76} h={48} colors={[lighten(art.metal, 0.2), darken(art.metal, 0.25)]} />
    <Group transform={[{ translateX: 50 }, { translateY: 44 }, { rotate: 0.12 }] as Transforms3d}>
      <Panel
        x={-30}
        y={-40}
        w={60}
        h={40}
        colors={[lighten(art.metalDark, 0.3), darken(art.metalDark, 0.2)]}
        r={3}
      />
    </Group>
    <Stroke d="M 96 30 L 108 22" color={palette.alarm} weight={4} />
    <Stroke d="M 96 42 L 110 40" color={palette.alarm} weight={4} />
  </Group>
);

const GenericSolid = () => (
  <Group>
    <Panel x={8} y={20} w={84} h={72} colors={[lighten(art.wood, 0.2), darken(art.wood, 0.3)]} />
    <Stroke d="M 8 44 L 92 44" color="#8A5C2A" weight={4} opacity={0.6} />
    <Stroke d="M 8 68 L 92 68" color="#8A5C2A" weight={4} opacity={0.6} />
  </Group>
);

// -------------------------------------------------------------- the shelf

/** Keyed by prop id, so a level gets its own things drawn as themselves. */
// ------------------------------------------------------------- the school
//
// A hallway is mostly lockers, so the lockers have to carry it: one bank drawing
// used five times along the walls, and a taller single stack for the one the
// crowd blames. Everything else in here is a thing a school corridor has and a
// living room does not — that is the whole job of level three's props.

/** School locker green-blue. Not in the palette because nothing else is a locker. */
const LOCKER = '#5E8C8A';
/** A school-issue navy, for bags and machines. `art.shirt` is the crowd's set, not a colour. */
const SCHOOL_BLUE = '#6E8FB5';
const LOCKER_TRIM = '#3A5E5E';

/** The vents and the handle, drawn on a door `w` wide starting at `x`. */
function LockerDoor({ x, w, h, y = 0 }: { x: number; w: number; h: number; y?: number }) {
  const slot = w * 0.52;
  return (
    <Group>
      <Panel
        x={x}
        y={y}
        w={w}
        h={h}
        colors={[lighten(LOCKER, 0.22), darken(LOCKER, 0.18)]}
        r={1.5}
        outline={LOCKER_TRIM}
      />
      {/* the vent slots at the top, which is the one detail that says "locker" */}
      {[0, 1, 2].map((i) => (
        <Rect
          key={i}
          x={x + (w - slot) / 2}
          y={y + h * 0.14 + i * h * 0.1}
          width={slot}
          height={Math.max(1, h * 0.045)}
          color={LOCKER_TRIM}
          opacity={0.75}
        />
      ))}
      <Circle cx={x + w * 0.78} cy={y + h * 0.56} r={Math.max(1.2, w * 0.07)} color={art.metalDark} />
    </Group>
  );
}

/** A run of lockers against a wall. Wide and shallow — you walk past, not into. */
const LockerBank = () => (
  <Group>
    {/* the sloped top, so it reads as a solid object rather than a painted line */}
    <Ink d="M 2 4 L 98 4 L 94 12 L 6 12 Z" fill={lighten(LOCKER, 0.3)} outline={LOCKER_TRIM} weight={OUTLINE_FINE} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <LockerDoor key={i} x={6 + i * 14.8} y={12} w={13.4} h={18} />
    ))}
    <Stroke d="M 4 30 L 96 30" color={LOCKER_TRIM} weight={2.5} opacity={0.8} />
    <Sheen cx={22} cy={14} r={28} strength={0.24} />
  </Group>
);

/** The one they blame: a stack of lockers with something living in the bottom. */
const LockerRow = ({ t }: ArtProps) => (
  <Group>
    <Ink d="M 4 6 L 96 6 L 92 14 L 8 14 Z" fill={lighten(LOCKER, 0.3)} outline={LOCKER_TRIM} weight={OUTLINE_FINE} />
    <LockerDoor x={8} y={14} w={38} h={52} />
    <LockerDoor x={54} y={14} w={38} h={52} />
    {/* one of them is not quite shut, which is where it is coming from */}
    <Ink
      d="M 54 14 L 74 20 L 74 66 L 54 66 Z"
      fill={darken(LOCKER, 0.36)}
      outline={LOCKER_TRIM}
      weight={OUTLINE_FINE}
    />
    <Flat d="M 58 44 L 72 42 L 71 64 L 59 64 Z" fill={art.woodDark} opacity={0.9} />
    <Whiff x={64} y={16} t={t} />
    <Whiff x={78} y={12} t={t} phase={1.7} />
    <Sheen cx={20} cy={18} r={26} strength={0.24} />
  </Group>
);

/** A gym bag that has been in there since the start of term. */
const GymBag = ({ t }: ArtProps) => (
  <Group>
    {/* The handles, standing clear of the bag with daylight under them. This is
        the detail that says "bag": the first attempt tucked them against the
        body and the whole thing read as a boot. */}
    <Stroke d="M 34 40 q 4 -20 14 -20 q 10 0 14 20" color={darken(SCHOOL_BLUE, 0.5)} weight={4} />
    {/* a long, flat-topped cylinder, sagging a little in the middle */}
    <Form
      d="M 8 42 q 0 -6 8 -7 q 34 -4 68 0 q 8 1 8 7 l 0 14 q 0 7 -8 8 q -34 4 -68 0 q -8 -1 -8 -8 Z"
      colors={[lighten(SCHOOL_BLUE, 0.26), SCHOOL_BLUE, darken(SCHOOL_BLUE, 0.34)]}
      positions={[0, 0.42, 1]}
      from={[10, 36]}
      to={[86, 64]}
      outline="#3B4A66"
      weight={OUTLINE_FINE}
    />
    {/* the squared-off end, which is most of what says "duffel" */}
    <Ink
      d="M 78 36 q 10 1 10 7 l 0 14 q 0 7 -10 8 Z"
      fill={darken(SCHOOL_BLUE, 0.26)}
      outline="#3B4A66"
      weight={2}
    />
    {/* the zip, straight along the top */}
    <Stroke d="M 12 43 q 32 -4 64 -1" color={lighten(SCHOOL_BLUE, 0.45)} weight={2.5} opacity={0.85} />
    {/* a sock, escaping */}
    <Ink d="M 22 42 q 6 -13 16 -6 q -3 9 -11 10 Z" fill={art.cream} outline="#A89C82" weight={2} />
    <Whiff x={16} y={34} t={t} />
    <Whiff x={66} y={30} t={t} phase={1.2} />
  </Group>
);

/** The cafeteria: double doors, portholes, and whatever today is. */
const CafeteriaDoors = ({ t }: ArtProps) => (
  <Group>
    <Panel x={4} y={8} w={92} h={60} colors={[darken(art.wood, 0.1), darken(art.wood, 0.42)]} r={2} />
    <Panel x={8} y={12} w={40} h={54} colors={[lighten(art.metal, 0.22), darken(art.metal, 0.2)]} r={2} />
    <Panel x={52} y={12} w={40} h={54} colors={[lighten(art.metal, 0.16), darken(art.metal, 0.26)]} r={2} />
    <Circle cx={28} cy={30} r={11} color={palette.breeze} />
    <Circle cx={28} cy={30} r={11} color={art.metalDark} style="stroke" strokeWidth={2.5} />
    <Circle cx={72} cy={30} r={11} color={darken(palette.breeze, 0.12)} />
    <Circle cx={72} cy={30} r={11} color={art.metalDark} style="stroke" strokeWidth={2.5} />
    {/* push bars */}
    <Stroke d="M 12 48 L 44 48" color={art.metalDark} weight={4} />
    <Stroke d="M 56 48 L 88 48" color={art.metalDark} weight={4} />
    <Whiff x={34} y={10} t={t} />
    <Whiff x={64} y={6} t={t} phase={1.5} />
    <Sheen cx={22} cy={18} r={30} strength={0.22} />
  </Group>
);

/** Science: a fume hood going quietly wrong behind glass. */
const ScienceLab = ({ t }: ArtProps) => (
  <Group>
    <Panel x={6} y={10} w={88} h={62} colors={[lighten(art.metal, 0.2), darken(art.metal, 0.3)]} r={3} />
    <Panel x={12} y={16} w={76} h={38} colors={[palette.breeze, darken(palette.breeze, 0.26)]} r={2} />
    {/* two flasks, one of which is the problem */}
    <Ink d="M 28 30 L 34 30 L 34 38 L 42 50 L 20 50 L 28 38 Z" fill={palette.white} outline="#7E8894" weight={2} />
    <Flat d="M 24 44 L 38 44 L 42 50 L 20 50 Z" fill={palette.stink} opacity={0.85} />
    <Ink d="M 58 32 L 64 32 L 64 40 L 71 50 L 51 50 L 58 40 Z" fill={palette.white} outline="#7E8894" weight={2} />
    <Flat d="M 54 45 L 68 45 L 71 50 L 51 50 Z" fill={palette.alarm} opacity={0.7} />
    <Circle cx={31} cy={40} r={2.6} color={palette.stinkDeep} opacity={0.75} />
    <Circle cx={34} cy={34} r={1.8} color={palette.stinkDeep} opacity={0.6} />
    <Stroke d="M 14 58 L 86 58" color={art.metalDark} weight={3} />
    <Whiff x={30} y={14} t={t} />
    <Whiff x={62} y={10} t={t} phase={1.9} />
  </Group>
);

/** A milk that has been in a desk since September. */
const MilkCarton = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 14 30 L 86 30 L 86 80 L 14 80 Z"
      colors={[palette.white, palette.paper, darken(palette.paper, 0.26)]}
      positions={[0, 0.5, 1]}
      from={[14, 30]}
      to={[86, 80]}
      outline="#9A9179"
      weight={OUTLINE_FINE}
    />
    {/* the folded top, opened once and never again */}
    <Ink d="M 14 30 L 50 6 L 86 30 Z" fill={palette.paper} outline="#9A9179" weight={2} />
    <Stroke d="M 50 6 L 50 30" color="#9A9179" weight={2} opacity={0.7} />
    <Flat d="M 24 42 L 76 42 L 76 62 L 24 62 Z" fill={palette.breeze} opacity={0.8} />
    {/* it has gone a colour */}
    <Flat d="M 18 66 L 82 66 L 82 78 L 18 78 Z" fill={palette.stink} opacity={0.55} />
    <Whiff x={72} y={20} t={t} />
  </Group>
);

/** The lost and found, which at this point is mostly an ecosystem. */
const LostAndFound = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 10 32 L 90 32 L 84 62 L 16 62 Z"
      colors={[lighten(art.wood, 0.2), art.wood, darken(art.wood, 0.34)]}
      positions={[0, 0.5, 1]}
      from={[12, 32]}
      to={[86, 62]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    {/* things coming out of it */}
    <Ink d="M 20 32 q 6 -18 20 -12 q -2 10 -8 12 Z" fill={palette.alarm} outline="#8E3A2E" weight={2} />
    <Ink d="M 44 32 q 4 -14 18 -10 q 0 8 -8 10 Z" fill={SCHOOL_BLUE} outline="#3B4A66" weight={2} />
    <Ink d="M 66 32 q 8 -12 18 -4 q -4 6 -10 4 Z" fill={art.cream} outline="#A89C82" weight={2} />
    <Stroke d="M 14 44 L 86 44" color={darken(art.wood, 0.4)} weight={2} opacity={0.6} />
    <Whiff x={34} y={14} t={t} />
    <Whiff x={62} y={10} t={t} phase={1.3} />
  </Group>
);

/** Kevin's locker. Everybody knows. */
const KevinsLocker = ({ t }: ArtProps) => (
  <Group>
    <Panel x={10} y={10} w={80} h={124} colors={[darken(LOCKER, 0.1), darken(LOCKER, 0.4)]} r={2} />
    {/* the door, hanging open, with the contents making a break for it */}
    <Ink
      d="M 10 10 L 52 22 L 52 128 L 10 134 Z"
      fill={darken(LOCKER, 0.45)}
      outline={LOCKER_TRIM}
      weight={OUTLINE_FINE}
    />
    <Ink
      d="M 54 40 q 26 -10 34 10 q -6 22 -20 24 q -16 -4 -14 -34 Z"
      fill={SCHOOL_BLUE}
      outline="#3B4A66"
      weight={2}
    />
    <Ink d="M 56 92 q 22 -8 30 6 q -8 16 -22 14 q -10 -6 -8 -20 Z" fill={art.cream} outline="#A89C82" weight={2} />
    {/* a name sticker, peeling */}
    <Ink d="M 58 20 L 86 24 L 86 34 L 58 30 Z" fill={palette.paper} outline="#9A9179" weight={2} />
    <Whiff x={62} y={16} t={t} />
    <Whiff x={78} y={10} t={t} phase={1.1} />
    <Whiff x={70} y={4} t={t} phase={2.3} />
  </Group>
);

/** Backpacks, dumped where they will trip somebody. */
const BackpackPile = () => (
  <Group>
    {/* Each one is a body, a flap over the top of it and a grab loop. The loop
        is small and does most of the work: without it a backpack is a bean. */}
    <Stroke d="M 20 24 q 8 -10 16 0" color="#3B4A66" weight={3.5} />
    <Ink
      d="M 8 46 q 0 -24 20 -24 q 20 0 20 24 l 0 18 q 0 6 -20 6 q -20 0 -20 -6 Z"
      fill={SCHOOL_BLUE}
      outline="#3B4A66"
      weight={OUTLINE_FINE}
    />
    <Ink
      d="M 8 44 q 0 -22 20 -22 q 20 0 20 22 q -20 9 -40 0 Z"
      fill={darken(SCHOOL_BLUE, 0.24)}
      outline="#3B4A66"
      weight={2}
    />
    <Rect x={24} y={48} width={8} height={12} color={darken(SCHOOL_BLUE, 0.38)} />
    <Stroke d="M 62 30 q 8 -10 16 0" color="#8E3A2E" weight={3.5} />
    <Ink
      d="M 50 52 q 0 -24 20 -24 q 20 0 20 24 l 0 14 q 0 6 -20 6 q -20 0 -20 -6 Z"
      fill={palette.alarm}
      outline="#8E3A2E"
      weight={OUTLINE_FINE}
    />
    <Ink
      d="M 50 50 q 0 -22 20 -22 q 20 0 20 22 q -20 9 -40 0 Z"
      fill={darken(palette.alarm, 0.26)}
      outline="#8E3A2E"
      weight={2}
    />
    <Rect x={66} y={54} width={8} height={10} color={darken(palette.alarm, 0.4)} />
    <Sheen cx={22} cy={30} r={22} strength={0.26} />
  </Group>
);

/** A fire extinguisher on a bracket, at exactly skunk height. */
const FireExtinguisher = () => (
  <Group>
    <Form
      d="M 24 44 q 26 -10 52 0 L 76 150 q -26 8 -52 0 Z"
      colors={[lighten(palette.alarm, 0.22), palette.alarm, darken(palette.alarm, 0.34)]}
      positions={[0, 0.42, 1]}
      from={[26, 44]}
      to={[74, 148]}
      outline="#7E2A20"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 38 16 L 62 16 L 62 46 L 38 46 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    <Ink d="M 30 8 L 78 8 L 78 20 L 30 20 Z" fill={art.metal} outline="#5E6367" weight={2} />
    <Stroke d="M 26 96 L 74 96" color="#7E2A20" weight={3} opacity={0.7} />
    <Sheen cx={38} cy={60} r={20} strength={0.3} />
  </Group>
);

/** One locker door left swinging into the corridor. */
const OpenLocker = () => (
  <Group>
    {/* The dark inside, on the right. Nearly black, because an open locker is
        mostly a hole — and a hole is what tells you it is open. */}
    <Panel x={56} y={10} w={42} h={144} colors={[darken(LOCKER, 0.6), darken(LOCKER, 0.82)]} r={2} />
    {/* a shelf in there, so the hole has some depth to it */}
    <Stroke d="M 58 56 L 96 56" color={darken(LOCKER, 0.34)} weight={3.5} />
    {/* the door, swung right out into the corridor, wider at the bottom */}
    <Ink
      d="M 56 10 L 6 26 L 4 146 L 56 154 Z"
      fill={lighten(LOCKER, 0.3)}
      outline={LOCKER_TRIM}
      weight={OUTLINE_FINE}
    />
    {[0, 1, 2].map((i) => (
      <Rect key={i} x={14} y={42 + i * 13} width={32} height={5} color={LOCKER_TRIM} opacity={0.8} />
    ))}
    <Circle cx={18} cy={104} r={4.5} color={art.metalDark} />
    <Sheen cx={26} cy={40} r={30} strength={0.26} />
  </Group>
);

/** The trophy case. Nothing in it is from this decade. */
const TrophyCase = () => (
  <Group>
    <Ink d="M 2 2 L 98 2 L 95 10 L 5 10 Z" fill={darken(art.wood, 0.2)} outline="#5A3A1A" weight={OUTLINE_FINE} />
    <Panel x={4} y={10} w={92} h={16} colors={[palette.breeze, darken(palette.breeze, 0.3)]} r={1} />
    {[14, 38, 62, 82].map((x, i) => (
      <Group key={i}>
        <Ink
          d={`M ${x} 22 l 5 0 l -1 -6 l 3 -4 l -9 0 l 3 4 Z`}
          fill={palette.nugget}
          outline="#9A7A18"
          weight={1.5}
        />
      </Group>
    ))}
    <Stroke d="M 4 26 L 96 26" color={darken(art.wood, 0.42)} weight={2.5} />
    <Sheen cx={20} cy={12} r={24} strength={0.3} />
  </Group>
);

/** A cast-iron radiator, painted over about nine times. */
const Radiator = () => (
  <Group>
    <Ink d="M 4 6 L 96 6 L 93 12 L 7 12 Z" fill={lighten(palette.paper, 0.1)} outline="#9A9179" weight={OUTLINE_FINE} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <Panel
        key={i}
        x={6 + i * 11.4}
        y={12}
        w={8}
        h={22}
        colors={[palette.paper, darken(palette.paper, 0.3)]}
        r={3}
        outline="#9A9179"
      />
    ))}
    <Stroke d="M 4 34 L 96 34" color="#9A9179" weight={2.5} opacity={0.8} />
  </Group>
);

/** Vending machines, humming. The only light in the hallway that is on. */
const VendingMachines = () => (
  <Group>
    <Panel x={4} y={4} w={44} h={50} colors={[darken(SCHOOL_BLUE, 0.1), darken(SCHOOL_BLUE, 0.45)]} r={2} />
    <Panel x={52} y={4} w={44} h={50} colors={[darken(palette.alarm, 0.16), darken(palette.alarm, 0.5)]} r={2} />
    {/* the lit fronts, and the rows of things nobody has bought */}
    <Panel x={8} y={9} w={30} h={30} colors={[lighten(palette.breeze, 0.3), palette.breeze]} r={1} />
    <Panel x={56} y={9} w={30} h={30} colors={[lighten(palette.breeze, 0.2), darken(palette.breeze, 0.1)]} r={1} />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <Rect
          key={`${r}-${c}`}
          x={11 + c * 9.5}
          y={12 + r * 9}
          width={6}
          height={6}
          color={[palette.nugget, art.woodDark, art.cream][r]}
          opacity={0.9}
        />
      ))
    )}
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <Rect
          key={`b-${r}-${c}`}
          x={59 + c * 9.5}
          y={12 + r * 9}
          width={6}
          height={6}
          color={[palette.alarm, palette.breeze, palette.nugget][r]}
          opacity={0.85}
        />
      ))
    )}
    <Rect x={10} y={42} width={26} height={7} color={palette.ink} opacity={0.55} />
    <Rect x={58} y={42} width={26} height={7} color={palette.ink} opacity={0.55} />
    <Sheen cx={18} cy={14} r={26} strength={0.3} />
  </Group>
);

/** An air conditioning vent. The other place in the building with air in it. */
const AcVent = ({ t }: ArtProps) => (
  <Group>
    <Panel
      x={8}
      y={26}
      w={84}
      h={72}
      colors={[lighten(art.metal, 0.28), darken(art.metal, 0.24)]}
      r={3}
      outline="#5E6367"
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <Ink
        key={i}
        d={`M 16 ${34 + i * 13} L 84 ${34 + i * 13} L 84 ${41 + i * 13} L 16 ${41 + i * 13} Z`}
        fill={darken(art.metal, 0.34)}
        outline="#4E5357"
        weight={1.5}
      />
    ))}
    {/* the one good breath in this half of the hallway */}
    <Stroke d="M 22 20 q 14 -12 28 -2 q 12 8 26 -4" color={palette.breeze} weight={4} opacity={0.75} />
    <Stroke
      d="M 26 10 q 14 -10 28 0 q 12 8 24 -4"
      color={palette.breeze}
      weight={3}
      opacity={0.5 + 0.25 * Math.sin(t * 2.1)}
    />
    <Sheen cx={26} cy={34} r={26} strength={0.26} />
  </Group>
);

// --------------------------------------------------------------- the studio
//
// A yoga room is mostly floor, so the mats have to do the work of telling you
// where you can and cannot walk. They are drawn rolled *out* — a flat rectangle
// with rounded ends and a strip of grip down the middle — because a rolled-up
// mat reads as a log at this size and a room full of logs is a woodpile.

const MAT = '#7E8FC4';
const MAT_WARM = '#C98FA8';

/** A mat, rolled out and waiting for somebody to breathe deeply on it. */
const YogaMat = () => (
  <Group>
    <Panel
      x={3}
      y={8}
      w={94}
      h={52}
      colors={[lighten(MAT, 0.26), darken(MAT, 0.24)]}
      r={9}
      outline="#4A5580"
    />
    {/* the grip pattern, which is the only thing that says "mat" and not "rug" */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Rect
        key={i}
        x={12 + i * 13.5}
        y={20}
        width={7}
        height={28}
        color={darken(MAT, 0.16)}
        opacity={0.55}
      />
    ))}
    <Sheen cx={22} cy={18} r={26} strength={0.24} />
  </Group>
);

/** Barbara's mat. Barbara always brings her own mat. */
const BarbarasMat = ({ t }: ArtProps) => (
  <Group>
    <Panel
      x={3}
      y={10}
      w={94}
      h={44}
      colors={[lighten(MAT_WARM, 0.24), darken(MAT_WARM, 0.3)]}
      r={8}
      outline="#8A5266"
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <Rect key={i} x={14 + i * 15} y={20} width={8} height={24} color={darken(MAT_WARM, 0.2)} opacity={0.5} />
    ))}
    {/* a name written on it in marker, because of course there is */}
    <Stroke d="M 20 50 l 5 -10 l 5 10 M 22 46 l 6 0" color="#7A4254" weight={2.5} opacity={0.8} />
    <Whiff x={46} y={10} t={t} />
    <Whiff x={68} y={6} t={t} phase={1.4} />
  </Group>
);

/** The hot yoga room. Nobody has opened that door since Tuesday. */
const HotYogaDoor = ({ t }: ArtProps) => (
  <Group>
    <Panel x={4} y={8} w={92} h={60} colors={[darken(art.wood, 0.12), darken(art.wood, 0.44)]} r={2} />
    <Panel x={10} y={13} w={80} h={50} colors={[darken(palette.alarm, 0.24), darken(palette.alarm, 0.52)]} r={2} />
    {/* the little window, fogged right over */}
    <Panel x={30} y={20} w={40} h={20} colors={[lighten(palette.paper, 0.05), darken(palette.paper, 0.18)]} r={2} />
    <Stroke d="M 34 30 q 8 -5 16 0 q 8 5 16 0" color={palette.white} weight={3} opacity={0.75} />
    <Stroke d="M 34 36 q 8 -5 16 0 q 8 5 16 0" color={palette.white} weight={2.5} opacity={0.5} />
    <Stroke d="M 16 52 L 84 52" color={art.metalDark} weight={4} />
    <Whiff x={30} y={8} t={t} />
    <Whiff x={62} y={4} t={t} phase={1.6} />
    <Sheen cx={20} cy={16} r={26} strength={0.2} />
  </Group>
);

/** The diffuser, doing its absolute best. */
const Diffuser = ({ t }: ArtProps) => (
  <Group>
    {/* A wide ceramic base with a proper opening in the top. The first attempt
        was a rounded blob with a stem on it and read, unmistakably, as an
        apple. */}
    <Form
      d="M 16 62 q 34 -10 68 0 q 4 18 -8 28 q -26 6 -52 0 q -12 -10 -8 -28 Z"
      colors={[palette.white, lighten(palette.breeze, 0.18), darken(palette.breeze, 0.3)]}
      positions={[0, 0.4, 1]}
      from={[18, 58]}
      to={[82, 92]}
      outline="#7E8894"
      weight={OUTLINE_FINE}
    />
    {/* the neck, and the hole the mist comes out of */}
    <Ink d="M 34 48 L 66 48 L 62 64 L 38 64 Z" fill={lighten(palette.breeze, 0.3)} outline="#7E8894" weight={2} />
    <Ink d="M 38 44 q 12 -5 24 0 q -12 5 -24 0 Z" fill={darken(palette.breeze, 0.35)} outline="#7E8894" weight={2} />
    {/* its one hopeful puff of mist */}
    <Stroke d="M 44 40 q -10 -12 0 -20" color={palette.white} weight={5} opacity={0.8} />
    <Stroke d="M 56 40 q 10 -14 2 -24" color={palette.white} weight={4} opacity={0.6} />
    {/* and what it is up against */}
    <Whiff x={22} y={40} t={t} />
    <Whiff x={78} y={34} t={t} phase={1.9} />
    <Sheen cx={32} cy={68} r={20} strength={0.3} />
  </Group>
);

/** A stack of mats that has reached enlightenment. */
const MatPile = ({ t }: ArtProps) => (
  <Group>
    {[0, 1, 2, 3].map((i) => (
      <Panel
        key={i}
        x={8 + i * 2}
        y={26 + i * 9}
        w={84 - i * 4}
        h={9}
        colors={[lighten(i % 2 ? MAT_WARM : MAT, 0.2), darken(i % 2 ? MAT_WARM : MAT, 0.3)]}
        r={4}
        outline={i % 2 ? '#8A5266' : '#4A5580'}
      />
    ))}
    <Whiff x={30} y={24} t={t} />
    <Whiff x={62} y={20} t={t} phase={1.2} />
    <Sheen cx={24} cy={30} r={22} strength={0.22} />
  </Group>
);

/** Kombucha. At a yoga class. */
const Kombucha = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 30 42 q 20 -6 40 0 l 0 62 q -20 6 -40 0 Z"
      colors={[lighten(palette.breeze, 0.2), '#B79A5E', '#8A6E38']}
      positions={[0, 0.45, 1]}
      from={[30, 42]}
      to={[70, 104]}
      outline="#5F4A20"
      weight={OUTLINE_FINE}
    />
    {/* the neck and the cap */}
    <Ink d="M 42 18 L 58 18 L 58 44 L 42 44 Z" fill="#9A7C44" outline="#5F4A20" weight={2} />
    <Ink d="M 38 10 L 62 10 L 62 20 L 38 20 Z" fill={palette.alarm} outline="#8E3A2E" weight={2} />
    {/* the culture, floating about in there, which is the actual joke */}
    <Ink d="M 38 62 q 12 -8 24 0 q -2 8 -12 8 q -10 0 -12 -8 Z" fill="#C9B489" outline="#7A6334" weight={2} />
    <Circle cx={46} cy={84} r={3} color="#D8C79E" opacity={0.8} />
    <Circle cx={58} cy={92} r={2.2} color="#D8C79E" opacity={0.7} />
    <Whiff x={70} y={20} t={t} />
  </Group>
);

/** The sock basket. We do not talk about the sock basket. */
const SockBasket = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 10 32 L 90 32 L 84 66 L 16 66 Z"
      colors={[lighten(art.wood, 0.24), art.wood, darken(art.wood, 0.36)]}
      positions={[0, 0.5, 1]}
      from={[12, 32]}
      to={[86, 66]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    {/* the weave */}
    {[0, 1, 2].map((i) => (
      <Stroke key={i} d={`M ${13 + i} ${40 + i * 9} L ${87 - i} ${40 + i * 9}`} color={darken(art.wood, 0.38)} weight={2} opacity={0.55} />
    ))}
    {/* socks, several of which have given up */}
    <Ink d="M 22 32 q 2 -16 14 -14 q 4 10 -2 14 Z" fill={art.cream} outline="#A89C82" weight={2} />
    <Ink d="M 44 32 q 0 -18 14 -14 q 2 10 -4 14 Z" fill={palette.white} outline="#A89C82" weight={2} />
    <Ink d="M 64 32 q 6 -14 18 -8 q -2 8 -8 8 Z" fill={darken(art.cream, 0.18)} outline="#A89C82" weight={2} />
    <Whiff x={34} y={16} t={t} />
    <Whiff x={58} y={10} t={t} phase={1.5} />
    <Whiff x={74} y={14} t={t} phase={2.4} />
  </Group>
);

/** The incense, losing. */
const Incense = ({ t }: ArtProps) => (
  <Group>
    <Ink d="M 30 104 q 20 -8 40 0 q -20 12 -40 0 Z" fill={art.woodDark} outline="#5A3A1A" weight={OUTLINE_FINE} />
    <Stroke d="M 50 104 L 46 34" color="#6E5230" weight={3.5} />
    <Circle cx={46} cy={32} r={3} color={palette.alarm} />
    {/* its one thin ribbon of smoke, against everything else in the room */}
    <Stroke
      d="M 46 28 q -10 -10 -2 -16 q 8 -6 0 -12"
      color={palette.inkSoft}
      weight={2.5}
      opacity={0.45 + 0.2 * Math.sin(t * 1.7)}
    />
    <Whiff x={68} y={60} t={t} />
    <Whiff x={24} y={54} t={t} phase={1.8} />
  </Group>
);

/** The herbal tea. It has notes of pond. */
const TeaUrn = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 22 26 L 78 26 L 74 74 L 26 74 Z"
      colors={[lighten(art.metal, 0.3), art.metal, darken(art.metal, 0.34)]}
      positions={[0, 0.4, 1]}
      from={[24, 26]}
      to={[76, 74]}
      outline="#5E6367"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 18 18 L 82 18 L 82 28 L 18 28 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    {/* the tap, and what is coming out of it */}
    <Ink d="M 74 48 L 88 48 L 88 56 L 74 56 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    <Stroke d="M 86 56 L 86 68" color={palette.stink} weight={3} opacity={0.8} />
    <Ink d="M 30 76 q 20 -6 40 0 q -20 8 -40 0 Z" fill={darken(art.metal, 0.4)} outline="#3E4347" weight={2} />
    <Whiff x={40} y={16} t={t} />
    <Whiff x={64} y={12} t={t} phase={1.3} />
    <Sheen cx={34} cy={34} r={22} strength={0.3} />
  </Group>
);

/** Foam blocks, stacked by somebody who cared. */
const BlockStack = () => (
  <Group>
    <Panel x={10} y={44} w={78} h={20} colors={[lighten(palette.breeze, 0.2), darken(palette.breeze, 0.28)]} r={3} />
    <Panel x={16} y={26} w={66} h={20} colors={[lighten(MAT_WARM, 0.22), darken(MAT_WARM, 0.3)]} r={3} />
    <Panel x={22} y={10} w={54} h={18} colors={[lighten(palette.nugget, 0.24), darken(palette.nugget, 0.3)]} r={3} />
    <Sheen cx={28} cy={18} r={22} strength={0.3} />
  </Group>
);

/** Everybody's water bottle, in a row, waiting to be knocked over. */
const WaterBottles = () => (
  <Group>
    {[
      [14, palette.breeze],
      [42, MAT_WARM],
      [70, palette.stink],
    ].map(([x, c], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} 44 q 8 -4 16 0 l 0 60 q -8 4 -16 0 Z`}
          colors={[palette.white, c as string, darken(c as string, 0.3)]}
          positions={[0, 0.45, 1]}
          from={[Number(x), 44]}
          to={[Number(x) + 16, 104]}
          outline="#6E7A80"
          weight={2}
        />
        <Ink
          d={`M ${Number(x) + 4} 30 L ${Number(x) + 12} 30 L ${Number(x) + 12} 46 L ${Number(x) + 4} 46 Z`}
          fill={art.metalDark}
          outline="#3E4347"
          weight={1.8}
        />
      </Group>
    ))}
    <Sheen cx={22} cy={52} r={22} strength={0.28} />
  </Group>
);

/** A singing bowl, which is about to sing whether anybody wanted it to or not. */
const SingingBowl = () => (
  <Group>
    <Form
      d="M 16 30 q 34 -10 68 0 q -4 42 -34 44 q -30 -2 -34 -44 Z"
      colors={[lighten(palette.nugget, 0.35), '#C89A3C', '#8A6A1E']}
      positions={[0, 0.45, 1]}
      from={[18, 28]}
      to={[80, 72]}
      outline="#6A5216"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 24 36 q 26 8 52 0" color="#E0BE6A" weight={3} opacity={0.7} />
    <Ink d="M 76 12 q 8 2 6 10 l -4 22 q -6 2 -6 -4 Z" fill={art.woodDark} outline="#5A3A1A" weight={2} />
    <Sheen cx={34} cy={36} r={22} strength={0.35} />
  </Group>
);

/** A wobble board. The clue is in the name. */
const WobbleBoard = ({ t }: ArtProps) => (
  <Group transform={[{ translateX: 50 }, { translateY: 50 }, { rotate: 0.08 * Math.sin(t * 1.4) }, { translateX: -50 }, { translateY: -50 }] as Transforms3d}>
    <Ink d="M 44 56 q 6 -6 12 0 q 2 14 -6 16 q -8 -2 -6 -16 Z" fill={art.woodDark} outline="#5A3A1A" weight={2} />
    <Form
      d="M 8 44 q 42 -16 84 0 q -42 16 -84 0 Z"
      colors={[lighten(art.wood, 0.24), art.wood, darken(art.wood, 0.3)]}
      positions={[0, 0.5, 1]}
      from={[10, 36]}
      to={[86, 54]}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 18 44 q 32 8 64 0" color={darken(art.wood, 0.34)} weight={2} opacity={0.6} />
  </Group>
);

/** Bolsters, which are just very firm pillows with a job title. */
const BolsterPile = () => (
  <Group>
    <Form
      d="M 8 48 q 42 -10 84 0 q 2 14 -6 20 q -36 8 -72 0 q -8 -6 -6 -20 Z"
      colors={[lighten(MAT_WARM, 0.2), MAT_WARM, darken(MAT_WARM, 0.32)]}
      positions={[0, 0.45, 1]}
      from={[10, 44]}
      to={[86, 68]}
      outline="#8A5266"
      weight={OUTLINE_FINE}
    />
    <Form
      d="M 16 28 q 34 -10 68 0 q 2 12 -5 17 q -29 7 -58 0 q -7 -5 -5 -17 Z"
      colors={[lighten(MAT, 0.22), MAT, darken(MAT, 0.3)]}
      positions={[0, 0.45, 1]}
      from={[18, 24]}
      to={[80, 45]}
      outline="#4A5580"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 20 36 q 30 6 60 0" color={darken(MAT, 0.34)} weight={2} opacity={0.5} />
    <Sheen cx={28} cy={32} r={24} strength={0.26} />
  </Group>
);

/** The mirror wall. Twelve people watching themselves not enjoy this. */
const MirrorWall = () => (
  <Group>
    <Panel x={6} y={4} w={88} h={310} colors={[lighten(palette.breeze, 0.4), darken(palette.breeze, 0.1)]} r={2} outline="#7E8894" />
    {/* a couple of long highlights, which is all a mirror needs to read as one */}
    <Stroke d="M 22 20 L 74 150" color={palette.white} weight={7} opacity={0.55} />
    <Stroke d="M 18 150 L 62 260" color={palette.white} weight={5} opacity={0.4} />
    <Rect x={6} y={4} width={88} height={310} color="#6E7A80" style="stroke" strokeWidth={OUTLINE_FINE} />
  </Group>
);

// ---------------------------------------------------------------- the beach
//
// A beach has almost nothing on it, so each of these has to carry further than
// an indoor prop does — there is no wall behind them and no floor pattern under
// them, just pale sand. Everything here is therefore a strong silhouette with
// one saturated colour in it; a beige object on beige sand disappears.

const CANVAS_RED = '#D96A5A';
const CANVAS_BLUE = '#5B94B8';

/** Kelp, hauled up the sand by the tide and left there. */
const Seaweed = ({ t }: ArtProps) => (
  <Group>
    {[
      ['M 8 50 C 26 38 30 52 48 42 C 62 34 72 46 92 38', '#4E6B3A'],
      ['M 12 58 C 30 50 38 62 56 52 C 70 44 80 56 94 48', '#3E5A2C'],
    ].map(([d, c], i) => (
      <Stroke key={i} d={d as string} color={c as string} weight={9 - i * 2} />
    ))}
    {/* the bladders, which are the one detail that says kelp and not rope */}
    {[
      [26, 45],
      [48, 43],
      [68, 42],
      [38, 57],
      [62, 51],
    ].map(([x, y], i) => (
      <Circle key={i} cx={x} cy={y} r={4} color="#6A8A4C" />
    ))}
    <Whiff x={32} y={34} t={t} />
    <Whiff x={66} y={30} t={t} phase={1.5} />
  </Group>
);

/** The bait bucket. In the sun. Since this morning. */
const BaitBucket = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 24 44 L 76 44 L 68 108 L 32 108 Z"
      colors={[lighten(CANVAS_BLUE, 0.28), CANVAS_BLUE, darken(CANVAS_BLUE, 0.36)]}
      positions={[0, 0.45, 1]}
      from={[26, 44]}
      to={[74, 106]}
      outline="#2E5470"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 20 38 L 80 38 L 80 48 L 20 48 Z" fill={darken(CANVAS_BLUE, 0.2)} outline="#2E5470" weight={2} />
    {/* the handle, and a tail going over the side */}
    <Stroke d="M 24 40 q 26 -26 52 0" color={art.metalDark} weight={4} />
    <Ink d="M 58 40 q 14 -10 20 2 q -10 8 -20 -2 Z" fill={art.shell} outline="#8A7A5C" weight={2} />
    <Whiff x={36} y={30} t={t} />
    <Whiff x={64} y={24} t={t} phase={1.3} />
    <Whiff x={50} y={18} t={t} phase={2.2} />
    <Sheen cx={36} cy={56} r={20} strength={0.26} />
  </Group>
);

/** Low tide: the flats it leaves behind, and what is living in them. */
const LowTide = ({ t }: ArtProps) => (
  <Group>
    <Ink
      d="M 4 32 q 24 -10 46 -4 q 26 6 46 -2 l 0 26 q -22 8 -46 2 q -22 -6 -46 2 Z"
      fill={art.sandWet}
      outline="#9C8A6A"
      weight={OUTLINE_FINE}
    />
    {/* pools left in the ripples */}
    {[
      [22, 42, 8],
      [50, 46, 10],
      [76, 40, 7],
    ].map(([x, y, r], i) => (
      <Group key={i}>
        <Circle cx={x} cy={y} r={r} color={art.shallow} opacity={0.9} />
        <Circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} color={art.foam} opacity={0.55} />
      </Group>
    ))}
    <Stroke d="M 8 52 q 20 6 42 2 q 22 -4 42 2" color="#9C8A6A" weight={2.5} opacity={0.6} />
    <Whiff x={34} y={26} t={t} />
    <Whiff x={64} y={22} t={t} phase={1.7} />
  </Group>
);

/** A bottle of sunscreen from another era. */
const Sunscreen = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 32 40 q 18 -6 36 0 l 0 52 q -18 6 -36 0 Z"
      colors={[palette.white, lighten(palette.nugget, 0.4), darken(palette.nugget, 0.18)]}
      positions={[0, 0.4, 1]}
      from={[32, 40]}
      to={[68, 92]}
      outline="#9A6E18"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 42 24 L 58 24 L 58 42 L 42 42 Z" fill={darken(palette.nugget, 0.28)} outline="#9A6E18" weight={2} />
    <Ink d="M 38 14 L 62 14 L 62 26 L 38 26 Z" fill={palette.alarm} outline="#8E3A2E" weight={2} />
    {/* a label that has been in a bag for several summers */}
    <Ink d="M 36 54 L 64 54 L 64 76 L 36 76 Z" fill={palette.paper} outline="#A89C82" weight={2} />
    <Stroke d="M 41 62 L 59 62 M 41 68 L 55 68" color={palette.inkSoft} weight={2.5} opacity={0.7} />
    <Whiff x={72} y={26} t={t} />
  </Group>
);

/** A cooler nobody has opened since Saturday. */
const OldCooler = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 8 38 L 92 38 L 86 68 L 14 68 Z"
      colors={[lighten(palette.breeze, 0.18), darken(palette.breeze, 0.18), darken(palette.breeze, 0.44)]}
      positions={[0, 0.5, 1]}
      from={[10, 38]}
      to={[88, 68]}
      outline="#4A6A78"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 4 26 L 96 26 L 92 40 L 8 40 Z" fill={palette.white} outline="#4A6A78" weight={2} />
    <Stroke d="M 12 48 L 88 48" color="#4A6A78" weight={2.5} opacity={0.5} />
    {/* the latch, doing the heaviest work in this entire game */}
    <Ink d="M 42 36 L 58 36 L 58 50 L 42 50 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    <Whiff x={26} y={20} t={t} />
    <Whiff x={56} y={14} t={t} phase={1.4} />
    <Whiff x={78} y={18} t={t} phase={2.5} />
    <Sheen cx={22} cy={32} r={24} strength={0.3} />
  </Group>
);

/** Flip-flops with a past. */
const FlipFlops = ({ t }: ArtProps) => (
  <Group>
    {[
      [6, 44, CANVAS_RED, 0.14],
      [50, 38, '#4E7F6A', -0.1],
    ].map(([x, y, c, rot], i) => (
      <Group
        key={i}
        transform={
          [
            { translateX: Number(x) + 22 },
            { translateY: Number(y) + 14 },
            { rotate: Number(rot) },
            { translateX: -(Number(x) + 22) },
            { translateY: -(Number(y) + 14) },
          ] as Transforms3d
        }
      >
        <Ink
          d={`M ${x} ${Number(y) + 10} q 0 -12 22 -12 q 22 0 22 12 q 0 16 -22 16 q -22 0 -22 -16 Z`}
          fill={c as string}
          outline={darken(c as string, 0.4)}
          weight={OUTLINE_FINE}
        />
        <Stroke
          d={`M ${Number(x) + 22} ${Number(y) + 2} L ${Number(x) + 10} ${Number(y) + 18} M ${
            Number(x) + 22
          } ${Number(y) + 2} L ${Number(x) + 34} ${Number(y) + 18}`}
          color={darken(c as string, 0.45)}
          weight={4}
        />
      </Group>
    ))}
    <Whiff x={30} y={30} t={t} />
    <Whiff x={70} y={24} t={t} phase={1.6} />
  </Group>
);

/** Whatever Gary caught. */
const GarysCatch = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 16 52 q 22 -22 48 -2 q 12 10 0 20 q -26 20 -48 -2 Z"
      colors={[lighten(art.shell, 0.3), art.shell, darken(art.shell, 0.34)]}
      positions={[0, 0.45, 1]}
      from={[18, 34]}
      to={[62, 72]}
      outline="#7A6A4C"
      weight={OUTLINE_FINE}
    />
    {/* the tail, and an eye that has given up */}
    <Ink d="M 62 52 L 88 34 L 88 70 Z" fill={darken(art.shell, 0.18)} outline="#7A6A4C" weight={2} />
    <Circle cx={30} cy={48} r={5} color={palette.white} />
    <Stroke d="M 27 45 L 33 51 M 33 45 L 27 51" color={palette.ink} weight={2.2} />
    <Stroke d="M 24 58 q 8 4 16 0" color="#7A6A4C" weight={2.2} opacity={0.7} />
    <Whiff x={40} y={28} t={t} />
    <Whiff x={66} y={22} t={t} phase={1.9} />
  </Group>
);

/** The boardwalk bins, in high summer. */
const BoardwalkBins = ({ t }: ArtProps) => (
  <Group>
    {[
      [6, '#5E6B4A'],
      [54, '#4E5C3E'],
    ].map(([x, c], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} 34 L ${Number(x) + 40} 34 L ${Number(x) + 35} 78 L ${Number(x) + 5} 78 Z`}
          colors={[lighten(c as string, 0.3), c as string, darken(c as string, 0.34)]}
          positions={[0, 0.45, 1]}
          from={[Number(x), 34]}
          to={[Number(x) + 40, 78]}
          outline="#333C28"
          weight={OUTLINE_FINE}
        />
        <Ink
          d={`M ${Number(x) - 3} 26 L ${Number(x) + 43} 26 L ${Number(x) + 41} 36 L ${
            Number(x) - 1
          } 36 Z`}
          fill={darken(c as string, 0.24)}
          outline="#333C28"
          weight={2}
        />
      </Group>
    ))}
    {/* something has been put in sideways */}
    <Ink d="M 62 18 L 86 10 L 88 22 L 64 30 Z" fill={art.shell} outline="#8A7A5C" weight={2} />
    <Whiff x={24} y={18} t={t} />
    <Whiff x={48} y={10} t={t} phase={1.2} />
    <Whiff x={76} y={6} t={t} phase={2.3} />
  </Group>
);

/** The sea breeze. The only clean air on the whole beach. */
const SeaBreeze = ({ t }: ArtProps) => (
  <Group>
    {/*
      This one needs an *object*, not just moving air.
      
      Drawn as breeze lines alone it was all but invisible on pale sand, which is
      indefensible for the only clean air on the beach — a player cannot choose a
      route round something they cannot see. So it is the wash of a wave arriving:
      foam on the sand, spray coming off it, and the breeze above that.
    */}
    {/*
      Everything here lives inside y 0-133, which is this prop's whole box. The
      first version put the wave at y 128-158 and it was simply clipped away —
      the art is fitted to its footprint, so anything drawn past the box is not
      small, it is gone.
    */}
    <Sheen cx={50} cy={100} r={52} color={art.foam} strength={0.55} />
    <Ink
      d="M 0 112 q 24 -20 50 -14 q 26 6 50 -10 l 0 21 q -24 12 -50 6 q -26 -6 -50 6 Z"
      fill={art.deep}
      outline={darken(art.deep, 0.3)}
      weight={OUTLINE_FINE}
    />
    <Ink
      d="M 2 108 q 24 -16 48 -10 q 24 6 46 -8 l 0 10 q -22 11 -46 5 q -24 -6 -48 6 Z"
      fill={art.shallow}
      outline={darken(art.deep, 0.2)}
      weight={2}
    />
    {/* spray coming off the top of it */}
    {[
      [16, 90, 4.5],
      [38, 82, 3.4],
      [60, 86, 5],
      [82, 78, 3.8],
    ].map(([x, y, r], i) => (
      <Circle key={i} cx={x} cy={y + Math.sin(t * 2.4 + i) * 3} r={r} color={art.foam} opacity={0.9} />
    ))}
    {/* and the breeze itself, coming up off the water */}
    {[0, 1, 2].map((i) => (
      <Stroke
        key={i}
        d={`M ${8 + i * 6} ${64 - i * 24} q 22 ${-13 - i * 2} 40 -2 q 16 10 34 -7`}
        color={i % 2 ? palette.breeze : art.foam}
        weight={7 - i}
        opacity={0.7 + 0.25 * Math.sin(t * 1.6 + i * 0.8)}
      />
    ))}
  </Group>
);

/** A beach umbrella. Blocks the way; hides nobody. */
const Umbrella = () => (
  <Group>
    <Stroke d="M 50 76 L 54 18" color={art.woodDark} weight={5} />
    <Form
      d="M 6 40 q 44 -34 88 0 q -44 -12 -88 0 Z"
      colors={[lighten(CANVAS_RED, 0.3), CANVAS_RED, darken(CANVAS_RED, 0.34)]}
      positions={[0, 0.45, 1]}
      from={[8, 14]}
      to={[92, 42]}
      outline="#8E3A2E"
      weight={OUTLINE_FINE}
    />
    {[24, 50, 76].map((x, i) => (
      <Stroke key={i} d={`M 50 16 L ${x} 40`} color={darken(CANVAS_RED, 0.4)} weight={2.4} opacity={0.65} />
    ))}
    <Ink d="M 30 70 q 20 -8 42 0 q -20 10 -42 0 Z" fill={art.sandWet} outline="#9C8A6A" weight={2} />
    <Sheen cx={26} cy={26} r={26} strength={0.3} />
  </Group>
);

/** A windbreak: four poles and a stretch of stripey canvas. */
const Windbreak = () => (
  <Group>
    {[4, 34, 64, 94].map((x, i) => (
      <Stroke key={i} d={`M ${x} 30 L ${x} 4`} color={art.woodDark} weight={3.5} />
    ))}
    {[
      [4, CANVAS_RED],
      [34, palette.white],
      [64, CANVAS_BLUE],
    ].map(([x, c], i) => (
      <Ink
        key={i}
        d={`M ${x} 6 L ${Number(x) + 30} 6 L ${Number(x) + 30} 26 L ${x} 26 Z`}
        fill={c as string}
        outline="#7A6A4C"
        weight={2}
      />
    ))}
    <Sheen cx={22} cy={12} r={20} strength={0.26} />
  </Group>
);

/** An upturned rowboat, which is the only proper cover on the beach. */
const Rowboat = () => (
  <Group>
    <Form
      d="M 4 28 q 46 -22 92 0 q -8 20 -46 20 q -38 0 -46 -20 Z"
      colors={[lighten(CANVAS_BLUE, 0.3), CANVAS_BLUE, darken(CANVAS_BLUE, 0.4)]}
      positions={[0, 0.45, 1]}
      from={[6, 8]}
      to={[92, 46]}
      outline="#2E5470"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 8 26 q 42 -16 84 0" color={palette.white} weight={3.5} opacity={0.8} />
    <Stroke d="M 12 34 q 38 -12 76 0" color={darken(CANVAS_BLUE, 0.45)} weight={2.4} opacity={0.6} />
    <Sheen cx={26} cy={18} r={24} strength={0.3} />
  </Group>
);

/** The lifeguard tower. Nobody is in it. */
const LifeguardTower = () => (
  <Group>
    {[14, 78].map((x, i) => (
      <Stroke key={i} d={`M ${x} 134 L ${x + (i ? -6 : 6)} 62`} color={art.woodDark} weight={6} />
    ))}
    <Stroke d="M 20 104 L 74 104" color={art.woodDark} weight={4} />
    <Ink d="M 10 58 L 90 58 L 86 96 L 14 96 Z" fill={palette.white} outline="#8A7A5C" weight={OUTLINE_FINE} />
    <Ink d="M 4 40 L 96 40 L 90 60 L 10 60 Z" fill={CANVAS_RED} outline="#8E3A2E" weight={2} />
    <Panel x={26} y={66} w={48} h={20} colors={[art.shallow, darken(art.shallow, 0.3)]} r={2} />
    <Sheen cx={26} cy={48} r={24} strength={0.3} />
  </Group>
);

/** A sandcastle, with about four minutes left. */
const Sandcastle = () => (
  <Group>
    {[
      [10, 46],
      [38, 34],
      [66, 46],
    ].map(([x, y], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} 90 L ${Number(x) + 4} ${y} L ${Number(x) + 22} ${y} L ${Number(x) + 26} 90 Z`}
          colors={[lighten(art.sand, 0.1), art.sandWet, darken(art.sandWet, 0.28)]}
          positions={[0, 0.5, 1]}
          from={[Number(x), Number(y)]}
          to={[Number(x) + 26, 90]}
          outline="#9C8A6A"
          weight={OUTLINE_FINE}
        />
        <Ink
          d={`M ${Number(x) + 2} ${Number(y) - 6} L ${Number(x) + 24} ${Number(y) - 6} L ${
            Number(x) + 24
          } ${y} L ${Number(x) + 2} ${y} Z`}
          fill={art.sandWet}
          outline="#9C8A6A"
          weight={2}
        />
      </Group>
    ))}
    <Stroke d="M 51 28 L 51 10" color={art.woodDark} weight={2.5} />
    <Ink d="M 51 10 L 72 16 L 51 22 Z" fill={CANVAS_RED} outline="#8E3A2E" weight={2} />
  </Group>
);

/** A beach ball, which will go a very long way if kicked. */
const BeachBall = () => (
  <Group>
    <Circle cx={50} cy={52} r={40} color={palette.white} />
    {[
      [CANVAS_RED, 'M 50 12 q 22 18 0 80 q -14 -40 0 -80 Z'],
      [CANVAS_BLUE, 'M 50 12 q -22 18 0 80 q 14 -40 0 -80 Z'],
      [palette.nugget, 'M 12 44 q 38 -14 76 0 q -38 12 -76 0 Z'],
    ].map(([c, d], i) => (
      <Flat key={i} d={d as string} fill={c as string} opacity={0.95} />
    ))}
    <Circle cx={50} cy={52} r={40} color="#8A7A5C" style="stroke" strokeWidth={OUTLINE_FINE} />
    <Sheen cx={34} cy={34} r={22} strength={0.45} />
  </Group>
);

/** A spade in a bucket. Somebody will be back for it. */
const SpadeBucket = () => (
  <Group>
    <Stroke d="M 66 78 L 54 16" color={CANVAS_RED} weight={6} />
    <Ink d="M 46 8 L 68 8 L 64 24 L 50 24 Z" fill={CANVAS_RED} outline="#8E3A2E" weight={2} />
    <Form
      d="M 16 40 L 74 40 L 66 90 L 24 90 Z"
      colors={[lighten(palette.nugget, 0.3), palette.nugget, darken(palette.nugget, 0.36)]}
      positions={[0, 0.45, 1]}
      from={[18, 40]}
      to={[72, 88]}
      outline="#9A6E18"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 20 52 q 24 -18 50 0" color={art.metalDark} weight={3} />
    <Sheen cx={30} cy={52} r={18} strength={0.3} />
  </Group>
);

/** A kite, down. */
const Kite = () => (
  <Group>
    <Ink
      d="M 50 8 L 84 48 L 50 96 L 16 48 Z"
      fill={'#7FB35E'}
      outline="#46702E"
      weight={OUTLINE_FINE}
    />
    <Stroke d="M 50 8 L 50 96 M 16 48 L 84 48" color="#46702E" weight={2.4} opacity={0.7} />
    <Stroke d="M 50 96 q 10 14 -4 20 q -12 6 -2 18" color={art.shell} weight={2.6} />
    <Ink d="M 40 102 L 54 108 L 40 112 Z" fill={CANVAS_RED} outline="#8E3A2E" weight={1.8} />
    <Sheen cx={36} cy={34} r={22} strength={0.3} />
  </Group>
);

/** Somebody's radio, playing something nobody asked for. */
const BeachRadio = ({ t }: ArtProps) => (
  <Group>
    <Panel
      x={6}
      y={24}
      w={88}
      h={50}
      colors={[lighten(art.charcoal, 0.4), darken(art.charcoal, 0.2)]}
      r={5}
      outline="#2E2C28"
    />
    <Stroke d="M 22 24 q 28 -22 54 -6" color={art.metalDark} weight={3} />
    <Circle cx={30} cy={50} r={13} color={darken(art.charcoal, 0.42)} />
    <Circle cx={30} cy={50} r={13} color="#2E2C28" style="stroke" strokeWidth={2} />
    <Circle cx={30} cy={50} r={5} color={art.metalDark} />
    <Panel x={52} y={34} w={34} h={16} colors={[palette.nugget, darken(palette.nugget, 0.3)]} r={2} />
    {[0, 1, 2].map((i) => (
      <Circle key={i} cx={58 + i * 12} cy={62} r={3.4} color={art.metalDark} />
    ))}
    {/* the noise coming out of it */}
    <Stroke
      d="M 92 30 q 10 12 0 24"
      color={palette.inkSoft}
      weight={2.6}
      opacity={0.35 + 0.3 * Math.sin(t * 5)}
    />
  </Group>
);

/** The path through the dunes. Looks like a way off the beach. It is not. */
const DunePath = () => (
  <Group>
    <Ink
      d="M 0 100 q 22 -46 50 -46 q 28 0 50 46 Z"
      fill={darken(art.sand, 0.1)}
      outline="#9C8A6A"
      weight={OUTLINE_FINE}
    />
    <Ink
      d="M 34 100 q 6 -34 16 -34 q 10 0 16 34 Z"
      fill={art.sandWet}
      outline="#9C8A6A"
      weight={2}
    />
    {/* marram grass, which is what makes a dune a dune */}
    {[10, 22, 74, 88].map((x, i) => (
      <Stroke
        key={i}
        d={`M ${x} 92 q ${i % 2 ? 6 : -6} -18 ${i % 2 ? 2 : -2} -30`}
        color={art.hedgeDark}
        weight={3}
      />
    ))}
    <Sheen cx={30} cy={68} r={26} strength={0.24} />
  </Group>
);

/** The lifeguard's own ramp. Also not for you. */
const LifeguardRamp = () => (
  <Group>
    <Ink
      d="M 18 114 L 44 26 L 82 26 L 82 114 Z"
      fill={art.wood}
      outline="#6E4A22"
      weight={OUTLINE_FINE}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <Stroke
        key={i}
        d={`M ${24 + i * 4} ${100 - i * 18} L 82 ${100 - i * 18}`}
        color={darken(art.wood, 0.36)}
        weight={2.6}
        opacity={0.7}
      />
    ))}
    <Stroke d="M 44 26 L 44 114" color={darken(art.wood, 0.45)} weight={3} />
    <Ink d="M 52 10 L 76 10 L 76 26 L 52 26 Z" fill={CANVAS_RED} outline="#8E3A2E" weight={2} />
    <Sheen cx={36} cy={46} r={24} strength={0.24} />
  </Group>
);

// ------------------------------------------------------------- the grocery
//
// A supermarket is shelving and boxes, which is a lot of rectangles — so the
// things the crowd *blames* have to be the shapes that are not. Everything on
// the shortlist is round, soft or spilling; everything structural is square.
// That is what stops eleven blame props on one floor turning into wallpaper.

const SHELF = '#B9B2A4';
const SHELF_DARK = '#8B8478';
const PRODUCE = ['#C9542F', '#D99B2B', '#6E9B47', '#A8567F', '#3E7FA8'];

/** Product on a shelf: rows of little blocks, which is all it needs to be. */
function Stock({ x, y, w, rows, cell = 7 }: { x: number; y: number; w: number; rows: number; cell?: number }) {
  const cells: React.ReactElement[] = [];
  const across = Math.max(1, Math.floor(w / (cell + 1.5)));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < across; c++) {
      cells.push(
        <Rect
          key={`${r}-${c}`}
          x={x + c * (cell + 1.5)}
          y={y + r * (cell + 4)}
          width={cell}
          height={cell}
          color={PRODUCE[(r * 3 + c * 5) % PRODUCE.length]}
          opacity={0.9}
        />
      );
    }
  }
  return <Group>{cells}</Group>;
}

/** A long run of shelving, seen from slightly above. */
const ShelfRun = () => (
  <Group>
    <Ink d="M 2 2 L 98 2 L 95 9 L 5 9 Z" fill={lighten(SHELF, 0.22)} outline={SHELF_DARK} weight={OUTLINE_FINE} />
    <Panel x={3} y={9} w={94} h={20} colors={[SHELF, darken(SHELF, 0.26)]} r={1.5} outline={SHELF_DARK} />
    <Stock x={7} y={12} w={86} rows={2} cell={6} />
    <Stroke d="M 4 29 L 96 29" color={SHELF_DARK} weight={2.5} />
    <Sheen cx={20} cy={10} r={24} strength={0.22} />
  </Group>
);

/** One shelf unit, at the end of a broken aisle. */
const ShelfUnit = () => (
  <Group>
    <Ink d="M 4 4 L 96 4 L 90 16 L 10 16 Z" fill={lighten(SHELF, 0.22)} outline={SHELF_DARK} weight={OUTLINE_FINE} />
    <Panel x={8} y={16} w={84} h={70} colors={[SHELF, darken(SHELF, 0.3)]} r={2} outline={SHELF_DARK} />
    <Stock x={14} y={22} w={72} rows={5} cell={10} />
    <Stroke d="M 9 86 L 91 86" color={SHELF_DARK} weight={3} />
    <Sheen cx={24} cy={22} r={26} strength={0.24} />
  </Group>
);

/** The checkouts. Nobody is on them. */
const Checkouts = () => (
  <Group>
    <Panel x={2} y={6} w={96} h={16} colors={[lighten(art.metal, 0.2), darken(art.metal, 0.28)]} r={2} />
    {/* the belt */}
    <Rect x={8} y={10} width={58} height={8} color={art.charcoal} opacity={0.85} />
    <Panel x={72} y={2} w={22} h={14} colors={[darken(art.charcoal, 0.1), darken(art.charcoal, 0.4)]} r={2} />
    <Rect x={76} y={5} width={14} height={7} color={palette.stink} opacity={0.75} />
    <Stroke d="M 3 22 L 97 22" color={art.metalDark} weight={2.5} />
  </Group>
);

/** The durian. Somebody has opened it. */
const Durian = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 16 62 q 34 -30 68 0 q 6 24 -14 32 q -20 8 -40 0 q -20 -8 -14 -32 Z"
      colors={['#B7B75E', '#8E9440', '#5E6A28']}
      positions={[0, 0.45, 1]}
      from={[18, 34]}
      to={[82, 96]}
      outline="#404A18"
      weight={OUTLINE_FINE}
    />
    {/* the spikes, which are the entire read */}
    {[
      [22, 58], [36, 42], [52, 36], [68, 44], [82, 60],
      [26, 84], [44, 92], [62, 92], [78, 82],
    ].map(([x, y], i) => (
      <Ink
        key={i}
        d={`M ${x - 7} ${y + 6} L ${x} ${y - 10} L ${x + 7} ${y + 6} Z`}
        fill="#A3A84E"
        outline="#404A18"
        weight={1.8}
      />
    ))}
    {/* and it is open */}
    <Ink d="M 40 58 q 12 -8 22 2 q -4 12 -12 12 q -10 -2 -10 -14 Z" fill={art.cream} outline="#8E9440" weight={2} />
    <Whiff x={30} y={30} t={t} />
    <Whiff x={62} y={22} t={t} phase={1.3} />
    <Whiff x={46} y={16} t={t} phase={2.4} />
  </Group>
);

/** The fish counter. It is Tuesday. */
const FishCounter = ({ t }: ArtProps) => (
  <Group>
    <Panel x={2} y={26} w={96} h={30} colors={[lighten(art.metal, 0.22), darken(art.metal, 0.3)]} r={2} />
    {/* the ice, and what is on it */}
    <Ink d="M 6 24 L 94 24 L 90 40 L 10 40 Z" fill={palette.breeze} outline="#7E8894" weight={2} />
    {[18, 42, 66].map((x, i) => (
      <Group key={i}>
        <Ink
          d={`M ${x} 34 q 10 -9 20 -1 q 5 4 0 8 q -11 8 -20 -1 Z`}
          fill={art.shell}
          outline="#7A6A4C"
          weight={1.8}
        />
        <Ink d={`M ${x + 20} 33 L ${x + 28} 28 L ${x + 28} 40 Z`} fill={darken(art.shell, 0.16)} outline="#7A6A4C" weight={1.6} />
      </Group>
    ))}
    <Stroke d="M 4 56 L 96 56" color={art.metalDark} weight={2.5} />
    <Whiff x={26} y={20} t={t} />
    <Whiff x={60} y={14} t={t} phase={1.6} />
  </Group>
);

/** The cheese case, doing what the cheese case does. */
const CheeseCase = ({ t }: ArtProps) => (
  <Group>
    <Panel x={4} y={28} w={92} h={34} colors={[lighten(art.metal, 0.24), darken(art.metal, 0.28)]} r={2} />
    <Panel x={10} y={22} w={80} h={22} colors={[palette.breeze, darken(palette.breeze, 0.2)]} r={2} />
    {[
      [20, '#E8C25E'],
      [42, '#F0DA9B'],
      [64, '#D9A83E'],
    ].map(([x, c], i) => (
      <Group key={i}>
        <Ink
          d={`M ${x} 42 L ${Number(x) + 18} 42 L ${Number(x) + 14} 26 L ${Number(x) + 4} 26 Z`}
          fill={c as string}
          outline="#9A7A18"
          weight={2}
        />
        <Circle cx={Number(x) + 7} cy={35} r={2} color="#B08A2A" opacity={0.8} />
        <Circle cx={Number(x) + 12} cy={31} r={1.5} color="#B08A2A" opacity={0.7} />
      </Group>
    ))}
    <Whiff x={30} y={16} t={t} />
    <Whiff x={66} y={10} t={t} phase={1.4} />
    <Sheen cx={22} cy={30} r={22} strength={0.28} />
  </Group>
);

/** Whatever happened on aisle four, this morning. */
const AisleFour = ({ t }: ArtProps) => (
  <Group>
    <Ink
      d="M 8 52 q 22 -14 44 -6 q 24 8 42 -4 q 4 16 -10 22 q -34 10 -68 2 q -12 -4 -8 -14 Z"
      fill="#C9B489"
      outline="#8A7A4C"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 24 56 q 14 -6 26 0 q -12 8 -26 0 Z" fill={darken('#C9B489', 0.22)} outline="#8A7A4C" weight={1.6} />
    {/* the sign that has been there since ten */}
    <Ink d="M 62 60 L 76 26 L 90 60 Z" fill={palette.nugget} outline="#9A6E18" weight={2} />
    <Stroke d="M 76 36 L 76 48" color={palette.ink} weight={3} />
    <Circle cx={76} cy={53} r={2.4} color={palette.ink} />
    <Whiff x={26} y={38} t={t} />
    <Whiff x={46} y={32} t={t} phase={1.7} />
  </Group>
);

/** Forty pounds of onions. */
const OnionSacks = ({ t }: ArtProps) => (
  <Group>
    {[
      [6, 44],
      [38, 36],
      [66, 46],
    ].map(([x, y], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} ${Number(y) + 16} q 14 -22 28 0 q 4 18 -14 20 q -18 -2 -14 -20 Z`}
          colors={['#D8C9A8', '#B7A684', '#8A7B5C']}
          positions={[0, 0.45, 1]}
          from={[Number(x), Number(y)]}
          to={[Number(x) + 28, Number(y) + 36]}
          outline="#6A5C3E"
          weight={OUTLINE_FINE}
        />
        {/* the netting */}
        {[0, 1, 2].map((k) => (
          <Stroke
            key={k}
            d={`M ${Number(x) + 4 + k * 8} ${Number(y) + 8} L ${Number(x) + 4 + k * 8} ${Number(y) + 34}`}
            color="#6A5C3E"
            weight={1.4}
            opacity={0.5}
          />
        ))}
        <Circle cx={Number(x) + 14} cy={Number(y) + 22} r={5} color="#C2A86E" opacity={0.85} />
      </Group>
    ))}
    <Whiff x={28} y={26} t={t} />
    <Whiff x={64} y={22} t={t} phase={1.5} />
  </Group>
);

/** The chicken that has been going round since breakfast. */
const Rotisserie = ({ t }: ArtProps) => (
  <Group>
    <Panel x={4} y={20} w={92} h={44} colors={[lighten(art.metal, 0.2), darken(art.metal, 0.34)]} r={3} />
    <Panel x={11} y={26} w={78} h={30} colors={['#F2C070', '#C98A2E']} r={2} />
    {/* three of them, on the spit */}
    {[24, 48, 72].map((x, i) => (
      <Ink
        key={i}
        d={`M ${x - 9} 41 q 0 -11 9 -11 q 9 0 9 11 q 0 10 -9 10 q -9 0 -9 -10 Z`}
        fill="#B97A32"
        outline="#7A4E18"
        weight={2}
      />
    ))}
    <Stroke d="M 12 41 L 88 41" color={art.metalDark} weight={2} opacity={0.8} />
    <Stroke d="M 6 62 L 94 62" color={art.metalDark} weight={2.5} />
    <Whiff x={30} y={14} t={t} />
    <Whiff x={64} y={8} t={t} phase={1.8} />
    <Sheen cx={24} cy={28} r={22} strength={0.3} />
  </Group>
);

/** A jar that has given up. */
const PickleJar = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 28 40 q 22 -6 44 0 l 0 52 q -22 6 -44 0 Z"
      colors={[lighten('#8FA84E', 0.4), '#8FA84E', '#5E7030']}
      positions={[0, 0.4, 1]}
      from={[28, 40]}
      to={[72, 92]}
      outline="#46551E"
      weight={OUTLINE_FINE}
    />
    <Ink d="M 30 22 L 70 22 L 70 42 L 30 42 Z" fill={art.metalDark} outline="#3E4347" weight={2} />
    {/* the lid, off */}
    <Ink d="M 68 10 q 18 2 16 10 q -2 8 -16 6 Z" fill={art.metal} outline="#5E6367" weight={2} />
    {[
      [42, 56],
      [58, 66],
      [44, 78],
    ].map(([x, y], i) => (
      <Ink key={i} d={`M ${x - 9} ${y} q 9 -6 18 0 q -9 7 -18 0 Z`} fill="#6E8A32" outline="#46551E" weight={1.6} />
    ))}
    <Whiff x={44} y={16} t={t} />
    <Whiff x={24} y={26} t={t} phase={1.5} />
  </Group>
);

/** The wilted greens bin, which is now a science project. */
const WiltedGreens = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 16 42 L 84 42 L 76 96 L 24 96 Z"
      colors={[lighten('#6E8A5C', 0.26), '#6E8A5C', darken('#6E8A5C', 0.34)]}
      positions={[0, 0.45, 1]}
      from={[18, 42]}
      to={[82, 94]}
      outline="#3E5232"
      weight={OUTLINE_FINE}
    />
    {/* what is in it */}
    <Ink d="M 22 42 q 10 -22 26 -14 q -2 12 -10 14 Z" fill="#8FA84E" outline="#46551E" weight={2} />
    <Ink d="M 48 42 q 6 -20 24 -12 q -4 10 -12 12 Z" fill="#6E8A32" outline="#46551E" weight={2} />
    <Ink d="M 62 44 q 14 -10 22 0 q -8 8 -22 0 Z" fill="#A8A83E" outline="#46551E" weight={2} />
    <Whiff x={30} y={24} t={t} />
    <Whiff x={56} y={16} t={t} phase={1.2} />
    <Whiff x={74} y={22} t={t} phase={2.3} />
  </Group>
);

/** The pet food aisle, having a moment. */
const PetFood = ({ t }: ArtProps) => (
  <Group>
    {[
      [6, '#8E5A3A'],
      [38, '#A8703E'],
      [70, '#7A4E2E'],
    ].map(([x, c], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} 40 q 12 -8 24 0 q 4 22 -2 30 q -10 6 -20 0 q -6 -8 -2 -30 Z`}
          colors={[lighten(c as string, 0.3), c as string, darken(c as string, 0.34)]}
          positions={[0, 0.45, 1]}
          from={[Number(x), 36]}
          to={[Number(x) + 24, 72]}
          outline="#4A2E1A"
          weight={OUTLINE_FINE}
        />
        <Ink
          d={`M ${Number(x) + 3} 48 L ${Number(x) + 21} 48 L ${Number(x) + 21} 58 L ${Number(x) + 3} 58 Z`}
          fill={art.cream}
          outline="#4A2E1A"
          weight={1.6}
        />
        {/* a paw print, because every bag has one */}
        <Circle cx={Number(x) + 12} cy={54} r={2.6} color="#7A4E2E" />
      </Group>
    ))}
    <Whiff x={26} y={28} t={t} />
    <Whiff x={62} y={22} t={t} phase={1.6} />
  </Group>
);

/** Whose trolley is this? */
const AbandonedTrolley = ({ t }: ArtProps) => (
  <Group>
    <Ink
      d="M 14 28 L 88 28 L 78 62 L 24 62 Z"
      fill={lighten(art.metal, 0.12)}
      outline={art.metalDark}
      weight={OUTLINE_FINE}
    />
    {/* the mesh, which is what makes it a trolley and not a box */}
    {[0, 1, 2, 3].map((i) => (
      <Stroke key={`v${i}`} d={`M ${26 + i * 16} 28 L ${30 + i * 14} 62`} color={art.metalDark} weight={1.6} opacity={0.7} />
    ))}
    {[0, 1].map((i) => (
      <Stroke key={`h${i}`} d={`M ${17 + i * 3} ${39 + i * 12} L ${85 - i * 3} ${39 + i * 12}`} color={art.metalDark} weight={1.6} opacity={0.7} />
    ))}
    <Stroke d="M 10 24 L 90 24" color={art.metalDark} weight={4} />
    {/* something has been in there a while */}
    <Ink d="M 40 34 q 14 -10 24 0 q -4 12 -14 12 q -12 -2 -10 -12 Z" fill="#8FA84E" outline="#46551E" weight={2} />
    <Circle cx={30} cy={70} r={5} color={art.charcoal} />
    <Circle cx={72} cy={70} r={5} color={art.charcoal} />
    <Whiff x={52} y={20} t={t} />
  </Group>
);

/** The bleach aisle, losing. */
const BleachAisle = ({ t }: ArtProps) => (
  <Group>
    {[
      [8, palette.breeze],
      [38, palette.white],
      [68, '#C9E0F0'],
    ].map(([x, c], i) => (
      <Group key={i}>
        <Form
          d={`M ${x} 40 q 12 -6 24 0 l 0 44 q -12 6 -24 0 Z`}
          colors={[palette.white, c as string, darken(c as string, 0.28)]}
          positions={[0, 0.4, 1]}
          from={[Number(x), 40]}
          to={[Number(x) + 24, 84]}
          outline="#6E8894"
          weight={OUTLINE_FINE}
        />
        <Ink
          d={`M ${Number(x) + 8} 26 L ${Number(x) + 16} 26 L ${Number(x) + 16} 42 L ${Number(x) + 8} 42 Z`}
          fill={palette.sea}
          outline="#1E4A60"
          weight={1.8}
        />
        <Ink
          d={`M ${Number(x) + 3} 52 L ${Number(x) + 21} 52 L ${Number(x) + 21} 66 L ${Number(x) + 3} 66 Z`}
          fill={palette.sea}
          outline="#1E4A60"
          weight={1.6}
        />
      </Group>
    ))}
    {/* it is trying */}
    <Stroke d="M 30 24 q 10 -12 20 -2" color={palette.breeze} weight={3.5} opacity={0.7} />
    <Whiff x={62} y={18} t={t} />
    <Sheen cx={20} cy={48} r={20} strength={0.3} />
  </Group>
);

/** An open chiller. The only cold air in the building. */
const Chiller = ({ t }: ArtProps) => (
  <Group>
    <Form
      d="M 6 34 L 94 34 L 88 92 L 12 92 Z"
      colors={[lighten(art.metal, 0.3), art.metal, darken(art.metal, 0.3)]}
      positions={[0, 0.4, 1]}
      from={[8, 34]}
      to={[90, 92]}
      outline="#5E6367"
      weight={OUTLINE_FINE}
    />
    {/* the cold inside it */}
    <Ink d="M 14 40 L 86 40 L 82 74 L 18 74 Z" fill={palette.breeze} outline="#6E8894" weight={2} />
    <Stock x={22} y={46} w={58} rows={2} cell={9} />
    {/* and the cold coming out of it */}
    {[0, 1, 2].map((i) => (
      <Stroke
        key={i}
        d={`M ${12 + i * 10} ${30 - i * 12} q 22 ${-10 - i} 38 -2 q 14 8 30 -6`}
        color={i % 2 ? palette.white : palette.breeze}
        weight={5 - i}
        opacity={0.65 + 0.25 * Math.sin(t * 1.5 + i)}
      />
    ))}
    <Sheen cx={22} cy={44} r={24} strength={0.34} />
  </Group>
);

/** A tower of tins, stacked by an optimist. */
const TinTower = () => (
  <Group>
    {[0, 1, 2, 3].map((i) => (
      <Group key={i}>
        <Form
          d={`M 22 ${84 - i * 20} L 78 ${84 - i * 20} L 78 ${100 - i * 20} L 22 ${100 - i * 20} Z`}
          colors={[lighten(art.metal, 0.34), art.metal, darken(art.metal, 0.3)]}
          positions={[0, 0.4, 1]}
          from={[22, 84 - i * 20]}
          to={[78, 100 - i * 20]}
          outline="#5E6367"
          weight={2}
        />
        <Rect x={26} y={88 - i * 20} width={48} height={8} color={PRODUCE[i % PRODUCE.length]} opacity={0.9} />
      </Group>
    ))}
    <Sheen cx={34} cy={30} r={20} strength={0.32} />
  </Group>
);

/** A stack of baskets. */
const BasketStack = () => (
  <Group>
    {/*
      Three baskets, not four, and each one gets a rim of its own — nested at a
      tighter spacing they read as a stack of coloured stripes rather than as
      anything you could carry.
    */}
    {[0, 1, 2].map((i) => (
      <Group key={i}>
        <Ink
          d={`M ${10 + i * 3} ${74 - i * 30} L ${90 - i * 3} ${74 - i * 30} L ${82 - i * 3} ${
            112 - i * 30
          } L ${18 + i * 3} ${112 - i * 30} Z`}
          fill={i % 2 ? '#C9542F' : '#D4633C'}
          outline="#7E2A20"
          weight={OUTLINE_FINE}
        />
        <Ink
          d={`M ${7 + i * 3} ${68 - i * 30} L ${93 - i * 3} ${68 - i * 30} L ${90 - i * 3} ${
            78 - i * 30
          } L ${10 + i * 3} ${78 - i * 30} Z`}
          fill={darken('#C9542F', 0.28)}
          outline="#7E2A20"
          weight={2}
        />
      </Group>
    ))}
    {/* the handle, folded down on the top one */}
    <Stroke d="M 26 20 q 24 -16 48 0" color={art.charcoal} weight={4} />
    <Sheen cx={28} cy={30} r={22} strength={0.26} />
  </Group>
);

/** A wet floor sign, warning about something from hours ago. */
const WetFloorSign = () => (
  <Group>
    <Ink d="M 26 108 L 44 18 L 56 18 L 74 108 Z" fill={palette.nugget} outline="#9A6E18" weight={OUTLINE_FINE} />
    <Stroke d="M 50 38 L 50 66" color={palette.ink} weight={5} />
    <Circle cx={50} cy={78} r={4.5} color={palette.ink} />
    <Stroke d="M 34 96 L 66 96" color="#9A6E18" weight={3} opacity={0.7} />
  </Group>
);

/** A cardboard display of crisps, which will go everywhere. */
const CrispDisplay = () => (
  <Group>
    <Panel x={10} y={36} w={80} h={58} colors={[lighten(art.wood, 0.3), darken(art.wood, 0.2)]} r={2} />
    <Ink d="M 6 18 L 94 18 L 90 40 L 10 40 Z" fill={palette.alarm} outline="#8E3A2E" weight={2} />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <Ink
          key={`${r}-${c}`}
          d={`M ${18 + c * 24} ${46 + r * 16} q 9 -7 18 0 q -9 8 -18 0 Z`}
          fill={[palette.nugget, '#6E9B47', '#C9542F'][r]}
          outline="#7A5A1A"
          weight={1.6}
        />
      ))
    )}
    <Sheen cx={22} cy={28} r={22} strength={0.28} />
  </Group>
);

/** A trolley somebody left in the lane. */
const ShoppingTrolley = () => (
  <Group>
    <Ink d="M 12 30 L 90 30 L 80 68 L 22 68 Z" fill={lighten(art.metal, 0.14)} outline={art.metalDark} weight={OUTLINE_FINE} />
    {[0, 1, 2, 3].map((i) => (
      <Stroke key={i} d={`M ${24 + i * 16} 30 L ${28 + i * 14} 68`} color={art.metalDark} weight={1.6} opacity={0.7} />
    ))}
    <Stroke d="M 8 26 L 94 26" color={art.metalDark} weight={4} />
    <Circle cx={30} cy={78} r={6} color={art.charcoal} />
    <Circle cx={74} cy={78} r={6} color={art.charcoal} />
    <Sheen cx={28} cy={38} r={20} strength={0.26} />
  </Group>
);

/** A pallet, parked where it should not be. */
const Pallet = () => (
  <Group>
    <Ink d="M 4 40 L 96 40 L 92 60 L 8 60 Z" fill={art.wood} outline="#6E4A22" weight={OUTLINE_FINE} />
    {[0, 1, 2, 3].map((i) => (
      <Rect key={i} x={10 + i * 21} y={40} width={4} height={20} color={darken(art.wood, 0.34)} opacity={0.7} />
    ))}
    <Ink d="M 14 16 L 86 16 L 82 40 L 18 40 Z" fill="#C9B489" outline="#8A7A4C" weight={2} />
    <Stroke d="M 18 28 L 82 28" color="#8A7A4C" weight={2} opacity={0.6} />
    <Sheen cx={26} cy={22} r={20} strength={0.24} />
  </Group>
);

const BY_ID: Record<string, Entry> = {
  'potato-salad': { w: 100, h: 50, Art: PotatoSalad },
  grill: { w: 100, h: 80, Art: Grill },
  'uncles-shoes': { w: 100, h: 64, Art: UnclesShoes },
  'trash-can': { w: 100, h: 100, Art: TrashCan },
  'kiddie-pool': { w: 100, h: 69, Art: KiddiePool },
  sprinkler: { w: 100, h: 100, Art: Sprinkler },
  'hedge-gap': { w: 100, h: 167, Art: HedgeGap },
  'lawn-chairs': { w: 100, h: 83, Art: LawnChair },
  'croquet-set': { w: 100, h: 57, Art: CroquetSet },
  'wind-chime': { w: 100, h: 100, Art: WindChime },
  'water-bowl': { w: 100, h: 78, Art: WaterBowl },
  'picnic-table': { w: 100, h: 79, Art: PicnicTable },
  'false-door': { w: 100, h: 125, Art: FalseDoor },
  // --- the restaurant ---
  'cabbage-pot': { w: 100, h: 80, Art: CabbagePot },
  'cheese-cart': { w: 100, h: 75, Art: CheeseCart },
  'onion-board': { w: 100, h: 55, Art: OnionBoard },
  'truffle-plate': { w: 100, h: 75, Art: TrufflePlate },
  'fish-plate': { w: 100, h: 67, Art: FishPlate },
  'kitchen-bin': { w: 100, h: 125, Art: KitchenBin },
  'table-four': { w: 100, h: 77, Art: DiningTable },
  'table-one': { w: 100, h: 75, Art: DiningTable },
  'table-two': { w: 100, h: 75, Art: DiningTable },
  'table-three': { w: 100, h: 75, Art: DiningTable },
  'table-five': { w: 100, h: 75, Art: DiningTable },
  'table-six': { w: 100, h: 75, Art: DiningTable },
  extractor: { w: 100, h: 78, Art: Extractor },
  'plate-stack': { w: 100, h: 120, Art: PlateStack },
  'mop-bucket': { w: 100, h: 91, Art: MopBucket },
  'wine-rack': { w: 100, h: 160, Art: WineRack },
  'walk-in': { w: 100, h: 89, Art: FalseDoor },
  'toilet-door': { w: 100, h: 100, Art: FalseDoor },
  'open-window': { w: 100, h: 150, Art: FalseWindow },
  'false-window': { w: 100, h: 86, Art: FalseWindow },
  'shed-door': { w: 100, h: 125, Art: FalseDoor },
  cooler: { w: 100, h: 79, Art: Cooler },
  shed: { w: 100, h: 115, Art: Shed },
  // --- the school ---
  // Art is fitted inside its footprint, so each `h` here is that prop's own
  // bounds turned into the same proportion. Get it wrong and the drawing is
  // letterboxed into a corner of the space it is supposed to fill.
  'lockers-a': { w: 100, h: 33, Art: LockerBank },
  'lockers-b': { w: 100, h: 33, Art: LockerBank },
  'lockers-c': { w: 100, h: 33, Art: LockerBank },
  'lockers-d': { w: 100, h: 33, Art: LockerBank },
  'lockers-e': { w: 100, h: 33, Art: LockerBank },
  'locker-row': { w: 100, h: 73, Art: LockerRow },
  'gym-bag': { w: 100, h: 67, Art: GymBag },
  'cafeteria-doors': { w: 100, h: 69, Art: CafeteriaDoors },
  'science-lab': { w: 100, h: 75, Art: ScienceLab },
  'milk-carton': { w: 100, h: 83, Art: MilkCarton },
  'lost-and-found': { w: 100, h: 64, Art: LostAndFound },
  'kevins-locker': { w: 100, h: 143, Art: KevinsLocker },
  'backpack-pile': { w: 100, h: 71, Art: BackpackPile },
  'fire-extinguisher': { w: 100, h: 171, Art: FireExtinguisher },
  'open-locker': { w: 100, h: 160, Art: OpenLocker },
  'trophy-case': { w: 100, h: 29, Art: TrophyCase },
  radiator: { w: 100, h: 38, Art: Radiator },
  'vending-machines': { w: 100, h: 58, Art: VendingMachines },
  'ac-vent': { w: 100, h: 117, Art: AcVent },
  'stairwell-window': { w: 100, h: 150, Art: FalseWindow },
  'boys-room': { w: 100, h: 78, Art: FalseDoor },
  'supply-closet': { w: 100, h: 78, Art: FalseDoor },
  'stairwell-door': { w: 100, h: 114, Art: FalseDoor },
  // --- the yoga studio ---
  'mat-1-1': { w: 100, h: 67, Art: YogaMat },
  'mat-1-2': { w: 100, h: 67, Art: YogaMat },
  'mat-1-3': { w: 100, h: 67, Art: YogaMat },
  'mat-2-1': { w: 100, h: 67, Art: YogaMat },
  'mat-2-2': { w: 100, h: 67, Art: YogaMat },
  'mat-2-3': { w: 100, h: 67, Art: YogaMat },
  'mat-3-1': { w: 100, h: 67, Art: YogaMat },
  'mat-3-2': { w: 100, h: 67, Art: YogaMat },
  'mat-3-3': { w: 100, h: 67, Art: YogaMat },
  'mat-4-1': { w: 100, h: 67, Art: YogaMat },
  'mat-4-2': { w: 100, h: 67, Art: YogaMat },
  'mat-4-3': { w: 100, h: 67, Art: YogaMat },
  'barbaras-mat': { w: 100, h: 60, Art: BarbarasMat },
  'hot-yoga-door': { w: 100, h: 75, Art: HotYogaDoor },
  diffuser: { w: 100, h: 100, Art: Diffuser },
  'mat-pile': { w: 100, h: 64, Art: MatPile },
  kombucha: { w: 100, h: 117, Art: Kombucha },
  'sock-basket': { w: 100, h: 70, Art: SockBasket },
  incense: { w: 100, h: 133, Art: Incense },
  'tea-urn': { w: 100, h: 88, Art: TeaUrn },
  'block-stack': { w: 100, h: 91, Art: BlockStack },
  'water-bottles': { w: 100, h: 120, Art: WaterBottles },
  'singing-bowl': { w: 100, h: 80, Art: SingingBowl },
  'wobble-board': { w: 100, h: 75, Art: WobbleBoard },
  'bolster-pile': { w: 100, h: 83, Art: BolsterPile },
  'mirror-wall': { w: 100, h: 325, Art: MirrorWall },
  'studio-window': { w: 100, h: 150, Art: FalseWindow },
  'fire-vent': { w: 100, h: 133, Art: AcVent },
  'front-desk-door': { w: 100, h: 78, Art: FalseDoor },
  'changing-room': { w: 100, h: 78, Art: FalseDoor },
  'prop-cupboard': { w: 100, h: 78, Art: FalseDoor },
  // --- the beach ---
  seaweed: { w: 100, h: 55, Art: Seaweed },
  'bait-bucket': { w: 100, h: 117, Art: BaitBucket },
  'low-tide': { w: 100, h: 58, Art: LowTide },
  sunscreen: { w: 100, h: 100, Art: Sunscreen },
  'old-cooler': { w: 100, h: 70, Art: OldCooler },
  'flip-flops': { w: 100, h: 71, Art: FlipFlops },
  'garys-catch': { w: 100, h: 75, Art: GarysCatch },
  'boardwalk-bins': { w: 100, h: 80, Art: BoardwalkBins },
  'breeze-1': { w: 100, h: 133, Art: SeaBreeze },
  'breeze-2': { w: 100, h: 133, Art: SeaBreeze },
  'breeze-3': { w: 100, h: 133, Art: SeaBreeze },
  'breeze-4': { w: 100, h: 133, Art: SeaBreeze },
  'breeze-5': { w: 100, h: 133, Art: SeaBreeze },
  'umbrella-1': { w: 100, h: 78, Art: Umbrella },
  'umbrella-2': { w: 100, h: 78, Art: Umbrella },
  'umbrella-3': { w: 100, h: 78, Art: Umbrella },
  'umbrella-4': { w: 100, h: 78, Art: Umbrella },
  'windbreak-1': { w: 100, h: 31, Art: Windbreak },
  'windbreak-2': { w: 100, h: 31, Art: Windbreak },
  rowboat: { w: 100, h: 50, Art: Rowboat },
  'lifeguard-tower': { w: 100, h: 138, Art: LifeguardTower },
  sandcastle: { w: 100, h: 83, Art: Sandcastle },
  'beach-ball': { w: 100, h: 100, Art: BeachBall },
  'spade-bucket': { w: 100, h: 100, Art: SpadeBucket },
  kite: { w: 100, h: 109, Art: Kite },
  radio: { w: 100, h: 82, Art: BeachRadio },
  'pier-gate': { w: 100, h: 78, Art: FalseDoor },
  'dune-path': { w: 100, h: 100, Art: DunePath },
  'lifeguard-ramp': { w: 100, h: 114, Art: LifeguardRamp },
  // --- the grocery ---
  'aisle-1': { w: 100, h: 32, Art: ShelfRun },
  'aisle-3': { w: 100, h: 32, Art: ShelfRun },
  'aisle-6': { w: 100, h: 32, Art: ShelfRun },
  'aisle-2a': { w: 100, h: 93, Art: ShelfUnit },
  'aisle-2b': { w: 100, h: 93, Art: ShelfUnit },
  'aisle-4a': { w: 100, h: 93, Art: ShelfUnit },
  'aisle-4b': { w: 100, h: 93, Art: ShelfUnit },
  'aisle-5a': { w: 100, h: 93, Art: ShelfUnit },
  'aisle-5b': { w: 100, h: 93, Art: ShelfUnit },
  checkouts: { w: 100, h: 30, Art: Checkouts },
  durian: { w: 100, h: 88, Art: Durian },
  'fish-counter': { w: 100, h: 62, Art: FishCounter },
  'cheese-case': { w: 100, h: 70, Art: CheeseCase },
  'aisle-four': { w: 100, h: 60, Art: AisleFour },
  'onion-sacks': { w: 100, h: 70, Art: OnionSacks },
  rotisserie: { w: 100, h: 73, Art: Rotisserie },
  'pickle-jar': { w: 100, h: 100, Art: PickleJar },
  'wilted-greens': { w: 100, h: 100, Art: WiltedGreens },
  'pet-food': { w: 100, h: 64, Art: PetFood },
  'abandoned-trolley': { w: 100, h: 78, Art: AbandonedTrolley },
  'bleach-aisle': { w: 100, h: 70, Art: BleachAisle },
  'chiller-1': { w: 100, h: 100, Art: Chiller },
  'chiller-2': { w: 100, h: 100, Art: Chiller },
  'chiller-3': { w: 100, h: 100, Art: Chiller },
  'chiller-4': { w: 100, h: 100, Art: Chiller },
  'tin-tower': { w: 100, h: 127, Art: TinTower },
  'basket-stack': { w: 100, h: 120, Art: BasketStack },
  'wet-floor-sign': { w: 100, h: 120, Art: WetFloorSign },
  'crisp-display': { w: 100, h: 100, Art: CrispDisplay },
  'shopping-trolley': { w: 100, h: 92, Art: ShoppingTrolley },
  pallet: { w: 100, h: 83, Art: Pallet },
  'staff-room': { w: 100, h: 78, Art: FalseDoor },
  stockroom: { w: 100, h: 78, Art: FalseDoor },
  'warehouse-door': { w: 100, h: 114, Art: FalseDoor },
};

/** Anything a level hasn't drawn yet still reads as what it does. */
const BY_KIND: Record<PropKind, Entry> = {
  blame: { w: 100, h: 100, Art: GenericBlame },
  falseExit: { w: 100, h: 114, Art: FalseHatch },
  freshAir: { w: 100, h: 100, Art: GenericFreshAir },
  bump: { w: 100, h: 100, Art: GenericBump },
  solid: { w: 100, h: 100, Art: GenericSolid },
};

/** How much of a prop's own shadow falls on the ground, by kind. */
const SHADOW: Record<PropKind, number> = {
  falseExit: 0.3,
  solid: 0.34,
  blame: 0.28,
  bump: 0.26,
  freshAir: 0.18,
};

/**
 * Draws one prop onto its footprint, given in screen pixels. The art keeps its
 * own proportions and sits on the bottom edge of the footprint, so tall things
 * rise up the screen out of the space they occupy.
 */
export function PropArt({
  prop,
  x,
  y,
  w,
  h,
  t,
}: {
  prop: Prop;
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
}) {
  const entry = BY_ID[prop.id] ?? BY_KIND[prop.kind];
  const s = Math.min(w / entry.w, h / entry.h);
  const Art = entry.Art;

  return (
    <Group
      transform={
        [
          { translateX: x + (w - entry.w * s) / 2 },
          { translateY: y + h - entry.h * s },
          { scale: s },
        ] as Transforms3d
      }
    >
      {/* the ground shadow, thrown away from the light */}
      <GroundShadow
        cx={entry.w * 0.54}
        cy={entry.h - 4}
        rx={entry.w * 0.52}
        strength={SHADOW[prop.kind]}
      />
      <Art t={t} />
    </Group>
  );
}
