/**
 * The play surface. Draws one room with Skia and nothing else — no rules live
 * here, it only paints whatever `RunState` currently says.
 *
 * The art itself lives in `src/art`: the room is assembled here, but every
 * pencil stroke is in there, so this file stays about layout, camera and draw
 * order.
 *
 * Two things worth knowing before you move code around:
 *
 * - Scenery is drawn at camera zero inside one translated group (`roomY`), so a
 *   few hundred static nodes never have to be reconciled as the camera moves.
 *   Everything that walks is drawn in screen space (`screenY`).
 * - Actors are sorted back-to-front by world y, so someone further up the room
 *   is drawn behind someone nearer the entrance.
 */

import React, { useRef } from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
  type Transforms3d,
} from '@shopify/react-native-skia';

import { readLocal, readNose, type RunState } from '../game/engine';
import { exitSide, roomWidth } from '../game/types';
import { hazeOpacity, huntHeat, stageFor } from '../game/stink';
import {
  CAMERA_LOOK_AHEAD,
  RIDE_MS,
  PROP_ANIM_FPS,
  HUNT_RADIUS,
  CAMERA_NEAR_ZOOM,
  CAMERA_WIDE_ZOOM,
  CAMERA_ZOOM_IN_EASE,
  CAMERA_ZOOM_OUT_EASE,
  CATCH_RADIUS,
  SPARK_LIFE,
  SUSPICION_MAX,
  WORLD_WIDTH,
} from '../game/tuning';
import { Fluffy, Local, Person, Sniffsalot, Toots, Waddles } from '../art/characters';
import { FishNugget, Poof, Pointer, Spark } from '../art/effects';
import { clamp, withAlpha, wobble } from '../art/ink';
import { PropArt } from '../art/props';
import { ExitGate, Ground, Shadow, Vignette } from '../art/scenery';
import { art, palette } from '../theme/palette';
import { darken } from '../art/shading';

interface Props {
  run: RunState;
  width: number;
  height: number;
}

/** Once this few nuggets are left, the stragglers get a halo so they can be found. */
const HALO_FROM = 3;

/** Character heights, in world units. Everyone is scaled off these. */
const SIZE = {
  waddles: 12,
  follower: 11,
  local: 10,
  person: 14.5,
};

/**
 * Everything in the room that does not move: the props, drawn once and then left
 * alone until the stepped clock ticks.
 *
 * Memoised on the level, the camera scale and that clock — which is the whole
 * point. At sixty frames a second this was a quarter of the work in a frame,
 * every frame, for scenery that is standing still.
 */
const PropLayer = React.memo(function PropLayer({
  level,
  scale,
  height,
  t,
}: {
  level: RunState['level'];
  scale: number;
  height: number;
  t: number;
}) {
  const roomX = (worldX: number) => worldX * scale;
  const roomY = (worldY: number) => height - worldY * scale;
  return (
    <Group>
      {level.props.map((p) => (
        <PropArt
          key={p.id}
          prop={p}
          x={roomX(p.bounds.x)}
          y={roomY(p.bounds.y + p.bounds.height)}
          w={p.bounds.width * scale}
          h={p.bounds.height * scale}
          t={t}
        />
      ))}
    </Group>
  );
});

export function Room({ run, width, height }: Props) {
  // The gate swings rather than snapping, and the camera pulls back rather than
  // cutting. These two refs are the only animation state the room keeps of its
  // own, because the engine has no reason to know how long a hinge takes or how
  // far away the player is standing.
  const openness = useRef(0);
  openness.current += ((run.gateOpen ? 1 : 0) - openness.current) * 0.09;

  /*
   * Normal play is close in on Waddles and Toots; a belly-slide pulls the camera
   * back to the whole room and holds it there for as long as he is sliding
   * (§10). Out is quick because the player asked for it, back in is gentler so
   * it does not feel like being yanked.
   */
  const zoomRef = useRef(CAMERA_NEAR_ZOOM);
  const wanted = run.sliding ? CAMERA_WIDE_ZOOM : CAMERA_NEAR_ZOOM;
  const ease = wanted < zoomRef.current ? CAMERA_ZOOM_OUT_EASE : CAMERA_ZOOM_IN_EASE;
  zoomRef.current += (wanted - zoomRef.current) * ease;
  // Settle exactly, or `scale` never stops changing and the scenery can never
  // stay memoised.
  if (Math.abs(wanted - zoomRef.current) < 0.004) zoomRef.current = wanted;
  const zoom = zoomRef.current;

  /*
   * The zoom is calibrated against the *standard* room width, not this room's.
   *
   * Dividing by the actual width would shrink everything in a wide room — a
   * terminal would be the same picture drawn smaller, rather than a bigger place
   * to walk across. Characters stay the same size on screen whatever the room
   * measures, and a wider room simply means the camera has further to pan.
   */
  const scale = (width / WORLD_WIDTH) * zoom;
  const roomW = roomWidth(run.level);
  const viewHeightWorld = height / scale;
  const t = run.elapsed;

  /*
   * Keep Waddles away from the edge he is heading for, so the screen is mostly
   * the trouble ahead rather than the floor behind. Which edge that is depends
   * on the room: climbing rooms hold him low and look up, and a room whose way
   * out is at the bottom holds him high and looks down.
   */
  const side = exitSide(run.level);
  const lookAhead = side === 'bottom' ? 1 - CAMERA_LOOK_AHEAD : CAMERA_LOOK_AHEAD;
  const camera = clamp(
    run.waddles.y - viewHeightWorld * lookAhead,
    0,
    Math.max(0, run.level.height - viewHeightWorld)
  );

  // Zoomed in, the room is wider than the screen, so the view follows him across
  // it too. At the wide end this clamps to zero and the whole floor is on screen.
  const viewWidthWorld = width / scale;
  /*
   * Sideways, the camera leads the same way it does vertically — but only when
   * the way out is actually in a side wall. In every other room it stays
   * centred, because leading toward nothing just makes the picture lopsided.
   */
  const lookAcross =
    side === 'left' ? 1 - CAMERA_LOOK_AHEAD : side === 'right' ? CAMERA_LOOK_AHEAD : 0.5;
  const cameraX = clamp(
    run.waddles.x - viewWidthWorld * lookAcross,
    0,
    Math.max(0, roomW - viewWidthWorld)
  );

  // World y grows toward the exit, screen y grows downward, so the room is
  // flipped: the exit at y = height sits at the top of the display. `roomX/roomY`
  // are the room drawn at camera zero — the static layer lives in those and is
  // slid into place by one group transform.
  const roomX = (worldX: number) => worldX * scale;
  const roomY = (worldY: number) => height - worldY * scale;
  const toScreenX = (worldX: number) => roomX(worldX) - cameraX * scale;
  const screenY = (worldY: number) => roomY(worldY) + camera * scale;

  /*
   * The clock the props run on, stepped rather than continuous.
   *
   * Props never move — their positions are fixed in room coordinates and the
   * camera slides the whole layer — so the only thing that changes about them
   * frame to frame is `t`, for the whiffs coming off them. Handing them a
   * continuous `t` meant rebuilding several hundred Skia nodes sixty times a
   * second to nudge a few wisps of smoke; stepping it lets `PropLayer` skip the
   * lot most frames.
   *
   * Limited animation is the house style anyway — the dog's head snaps between
   * two drawings rather than blending — so wisps at PROP_ANIM_FPS is not a
   * compromise, it is the same rule applied to the scenery.
   */
  const propT = Math.round(t * PROP_ANIM_FPS) / PROP_ANIM_FPS;

  const haze = hazeOpacity(run.stink);
  const stage = stageFor(run.stink);
  const nose = readNose(run);
  const localDir = readLocal(run);
  const decoyHolding = run.decoyHoldMs > 0;

  // While Fluffy is holding them, the crowd is busy blaming, not panicking.
  const crowdStage = decoyHolding && stage === 'panic' ? 'blame' : stage;
  const blameAt = run.blame?.at ?? null;

  // Toots knows when somebody is getting close, even before the meter does.
  const tootsPos = run.followers[0].pos;
  const crowded = run.crowd.some(
    (p) => Math.hypot(p.pos.x - tootsPos.x, p.pos.y - tootsPos.y) < CATCH_RADIUS * 2.6
  );

  const left = run.nuggets.length - run.collected;
  // Somebody who has decided it is the skunk points at the skunk, not at the
  // potato salad — otherwise a closing ring of people reads as a chat about
  // cheese. §5.
  const hunting = !decoyHolding && huntHeat(run.stink) > 0;

  // The clear patch the haze never covers: everything from Waddles back to the
  // last animal in the line.
  const tail = run.followers[run.followers.length - 1].pos;
  const clearX = toScreenX((run.waddles.x + tail.x) / 2);
  const clearY = screenY((run.waddles.y + tail.y) / 2);
  const clearR =
    (Math.hypot(run.waddles.x - tail.x, run.waddles.y - tail.y) / 2 + 15) * scale;
  /*
   * How far the haze has to reach to cover the corners from wherever the group
   * is standing, and where in that reach the clear patch ends. Both are needed
   * because the gradient now does the hole itself.
   */
  const hazeReach = Math.max(
    Math.hypot(clearX, clearY),
    Math.hypot(width - clearX, clearY),
    Math.hypot(clearX, height - clearY),
    Math.hypot(width - clearX, height - clearY)
  );
  const clearStop = Math.min(0.6, clearR / Math.max(1, hazeReach));

  return (
    <Canvas style={{ width, height }}>
      {/* ------------------------------------------------ the room itself */}
      <Group
        transform={
          [{ translateX: -cameraX * scale }, { translateY: camera * scale }] as Transforms3d
        }
      >
        <Ground level={run.level} width={width} height={height} scale={scale} />

        <PropLayer level={run.level} scale={scale} height={height} t={propT} />

        <ExitGate
          exit={run.level.exit}
          scale={scale}
          toScreenX={roomX}
          toScreenY={roomY}
          t={t}
          openness={openness.current}
          dimmed={haze > 0.4}
          side={side}
        />
      </Group>

      {/* --------------------------------------------------- fish nuggets */}
      {run.nuggets.map((n, i) =>
        n.taken ? null : (
          <FishNugget
            key={i}
            x={toScreenX(n.pos.x)}
            y={screenY(n.pos.y)}
            r={2.9 * scale}
            t={t}
            seed={i}
            urgent={left > 0 && left <= HALO_FROM}
          />
        )
      )}

      {/* ------------------------------------------------------- the cast */}
      {buildActors(run, crowdStage, blameAt, nose.accuracy, crowded, hunting, nose.dir).map((a) => (
        <Group key={a.key}>
          <Shadow x={toScreenX(a.pos.x)} y={screenY(a.pos.y)} r={a.size * scale * 0.26} />
          {a.render(toScreenX(a.pos.x), screenY(a.pos.y) + a.size * scale * 0.1, a.size * scale, t)}
        </Group>
      ))}

      {/* -------------------------------------------------- what they see */}
      {/*
        Sniffsalot has no arrow: he points with his nose, in the art itself. The
        local still gets one, because a squirrel pointing a paw from up a tree
        needs to carry across the whole room.
      */}
      {localDir ? (
        <Pointer
          x={toScreenX(run.local.pos.x)}
          y={screenY(run.local.pos.y) - SIZE.local * scale * 0.7}
          dir={localDir}
          length={11 * scale}
          color={palette.nugget}
          opacity={0.95}
        />
      ) : null}

      {/* ------------------------------------------------------ the poofs */}
      {run.puffs.map((p, i) => (
        <Poof key={i} x={toScreenX(p.pos.x)} y={screenY(p.pos.y)} age={p.age} scale={scale} />
      ))}

      {/* ------------------------------------------------- nuggets going in */}
      {run.sparks.map((spark, i) => (
        <Spark
          key={i}
          x={toScreenX(spark.pos.x)}
          y={screenY(spark.pos.y)}
          age={spark.age}
          life={SPARK_LIFE}
          scale={scale}
        />
      ))}

      <Vignette width={width} height={height} />

      {/* ------------------------------------------------------- the haze */}
      {/*
        One rectangle and one shader. No offscreen layer.

        This used to be a `<Group layer>` with the clear patch punched through it
        by a `dstOut` circle, which is the obvious way to write it and the
        expensive way to run it: `layer` allocates an offscreen surface the size
        of the canvas and composites it, every frame. Worse, it only existed once
        the meter had started climbing — so a round began smooth and got heavy
        exactly as the room got bad, which is the worst possible time for the
        frame rate to go.

        Expressing the hole *as part of the gradient* gets the same picture out of
        a single draw. The haze is now thickest furthest from the group rather
        than thickest at the top, which is also the correction this needed
        anyway: "thickest where the exit is" stopped being true the moment a room
        could put its way out at either end (§10).
      */}
      {haze > 0.01 ? (
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(clearX, clearY)}
            r={hazeReach}
            colors={[
              withAlpha(palette.stink, 0),
              withAlpha(palette.stink, 0),
              withAlpha(palette.stink, haze * 0.72),
              withAlpha(palette.stink, haze),
            ]}
            positions={[0, clearStop, Math.min(0.94, clearStop + 0.34), 1]}
          />
        </Rect>
      ) : null}

      {/*
        The lift doors, shut across the whole screen while the group is riding.

        They are doing two jobs. One is the joke — you are in a box and you can
        see nothing, which is why the line lands. The other is practical: the
        group is teleported to the other floor mid-ride and the camera jumps with
        them, and a cut that nobody sees is not a cut at all.

        Two rectangles sliding, and no offscreen layer.
      */}
      {run.riding ? (
        <Group>
          {(() => {
            const left = run.riding.leftMs / RIDE_MS;
            // Shut fast, open fast, stay shut through the middle.
            const shut = Math.min(1, Math.min((1 - left) * 5, left * 5));
            const half = (width / 2) * shut;
            return (
              <Group>
                <Rect x={0} y={0} width={half} height={height}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(half, 0)}
                    colors={[darken(art.metal, 0.4), art.metal]}
                  />
                </Rect>
                <Rect x={width - half} y={0} width={half} height={height}>
                  <LinearGradient
                    start={vec(width - half, 0)}
                    end={vec(width, 0)}
                    colors={[art.metal, darken(art.metal, 0.44)]}
                  />
                </Rect>
                {/* the seam, so two panels read as two doors */}
                <Rect x={half - 2} y={0} width={4} height={height} color={art.metalDark} opacity={shut} />
                <Rect
                  x={width - half - 2}
                  y={0}
                  width={4}
                  height={height}
                  color={art.metalDark}
                  opacity={shut}
                />
              </Group>
            );
          })()}
        </Group>
      ) : null}

      {/* clouds rolling in from the far end, once it is really bad */}
      {haze > 0.01 && stage === 'panic'
        ? [0, 1, 2].map((i) => (
            <Poof
              key={`drift-${i}`}
              x={width * (0.2 + i * 0.3) + wobble(t, 0.5 + i * 0.2, width * 0.06, i)}
              y={height * (0.07 + i * 0.05) + wobble(t, 0.7, 8, i * 2)}
              age={0}
              scale={scale * (2.6 + i * 0.5)}
              strength={0.45}
            />
          ))
        : null}
    </Canvas>
  );
}

// ----------------------------------------------------------------- the cast

interface Actor {
  key: string;
  pos: { x: number; y: number };
  /** Height in world units. */
  size: number;
  render: (x: number, y: number, size: number, t: number) => React.ReactElement;
}

/**
 * Everyone in the room, sorted so that whoever is nearest the entrance is drawn
 * last and therefore in front. It is the cheapest possible depth sort and it is
 * all a single room needs.
 */
function buildActors(
  run: RunState,
  crowdStage: string,
  blameAt: { x: number; y: number } | null,
  noseAccuracy: number,
  crowded: boolean,
  hunting: boolean,
  nosePoint: { x: number; y: number } | null
): Actor[] {
  const actors: Actor[] = [];
  const tootsPos = run.followers[0].pos;

  run.crowd.forEach((p, i) => {
    const chasing =
      hunting && Math.hypot(p.pos.x - tootsPos.x, p.pos.y - tootsPos.y) < HUNT_RADIUS;
    const lookAt = chasing ? tootsPos : blameAt;
    const pointDir = lookAt ? Math.sign(lookAt.x - p.pos.x) : 0;
    actors.push({
      key: `person-${i}`,
      pos: p.pos,
      size: SIZE.person,
      render: (x, y, size, t) => (
        <Person x={x} y={y} size={size} t={t} seed={i} stage={crowdStage} pointDir={pointDir} />
      ),
    });
  });

  actors.push({
    key: 'local',
    pos: run.local.pos,
    size: SIZE.local,
    render: (x, y, size, t) => (
      <Local
        x={x}
        y={y}
        size={size}
        t={t}
        species={run.local.species}
        mood={run.local.mood}
        found={run.local.found}
      />
    ),
  });

  const [toots, fluffy, sniffsalot] = run.followers;
  const nervous = crowded || run.suspicion > SUSPICION_MAX * 0.5;

  actors.push({
    key: 'sniffsalot',
    pos: sniffsalot.pos,
    size: SIZE.follower,
    render: (x, y, size, t) => (
      <Sniffsalot
        x={x}
        y={y}
        size={size}
        t={t}
        flip={sniffsalot.facing.x < -0.2}
        moving={sniffsalot.moving}
        accuracy={noseAccuracy}
        point={nosePoint}
      />
    ),
  });

  actors.push({
    key: 'fluffy',
    pos: fluffy.pos,
    size: SIZE.follower,
    render: (x, y, size, t) => (
      <Fluffy
        x={x}
        y={y}
        size={size}
        t={t}
        flip={fluffy.facing.x < -0.2}
        moving={fluffy.moving}
        decoy={run.decoyHoldMs > 0}
      />
    ),
  });

  actors.push({
    key: 'toots',
    pos: toots.pos,
    size: SIZE.follower,
    render: (x, y, size, t) => (
      <Toots
        x={x}
        y={y}
        size={size}
        t={t}
        flip={toots.facing.x < -0.2}
        moving={toots.moving}
        nervous={nervous}
      />
    ),
  });

  actors.push({
    key: 'waddles',
    pos: run.waddles,
    size: SIZE.waddles,
    render: (x, y, size, t) => (
      <Waddles
        x={x}
        y={y}
        size={size}
        t={t}
        flip={run.facing.x < -0.2}
        moving={run.moving}
        sliding={run.sliding}
      />
    ),
  });

  // Furthest up the room first, so the near ones overlap them.
  return actors.sort((a, b) => b.pos.y - a.pos.y);
}
