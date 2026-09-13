/**
 * Wires the room, the HUD and the controls to the simulation.
 *
 * The sim runs on the JS thread through requestAnimationFrame and the screen
 * re-renders each frame. That is plenty for one room's worth of shapes, and it
 * keeps every rule in plain testable TypeScript. If a busy room ever drops
 * frames, the fix is to push positions into shared values rather than to move
 * the rules into worklets.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  createRun,
  step,
  type GameEvent,
  type InputState,
  type RunState,
} from '../game/engine';
import { enterGame, followRun, leaveGame, playSound } from '../audio/audio';
import { SOUND_FOR_EVENT } from '../audio/library';
import { sayAnimal, sayBlame, sayCaught, sayDecoy } from '../audio/voices';
import { DECOY_COOLDOWN_MS, SLIDE_MAX_MS } from '../game/tuning';
import type { LevelSpec } from '../game/types';
import { palette } from '../theme/palette';
import { ActionButton, Dpad } from './Controls';
import { Hud } from './Hud';
import { Room } from './Room';

const MAX_FRAME_MS = 50;

/** How long the group's reaction to a dozing local stays on screen. */
const ASLEEP_LINE_MS = 3200;

export function GameScreen({
  level,
  onExit,
  onNext,
}: {
  level: LevelSpec;
  onExit: () => void;
  /** The next room, if this is not the last one. */
  onNext?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [runId, setRunId] = useState(0);
  /** What one of the animals said about the local going under, and until when. */
  const asleepRef = useRef<{ text: string; untilMs: number } | null>(null);
  const runRef = useRef<RunState>(createRun(level));
  const inputRef = useRef<InputState>({ move: { x: 0, y: 0 }, slideHeld: false, decoyPressed: false });
  const [, setFrame] = useState(0);

  // The yard and the pressure bed belong to a run, not to the app.
  useEffect(() => {
    enterGame();
    return leaveGame;
  }, []);

  // A fresh run whenever the level changes or the player retries.
  useEffect(() => {
    runRef.current = createRun(level);
    inputRef.current = { move: { x: 0, y: 0 }, slideHeld: false, decoyPressed: false };
  }, [level, runId]);

  useEffect(() => {
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!last) {
        last = now;
        return;
      }
      const dtMs = Math.min(now - last, MAX_FRAME_MS);
      last = now;

      const run = runRef.current;
      step(run, dtMs, inputRef.current);
      inputRef.current.decoyPressed = false;

      if (run.events.length) {
        for (const e of run.events) {
          if (e.kind === 'local-asleep' && e.text) {
            asleepRef.current = { text: e.text, untilMs: now + ASLEEP_LINE_MS };
          }
        }
        drainEvents(run.events);
        run.events.length = 0;
      }
      if (asleepRef.current && now > asleepRef.current.untilMs) asleepRef.current = null;

      // The beds and the room's mood are read from the state, not from events.
      followRun(run);

      setFrame((f) => f + 1);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [runId]);

  const handleMove = useCallback((dir: { x: number; y: number }) => {
    inputRef.current.move = dir;
  }, []);

  const run = runRef.current;
  const slideCharge = run.slideLeftMs / SLIDE_MAX_MS;
  const decoyCharge = 1 - Math.max(0, run.decoyCooldownMs) / DECOY_COOLDOWN_MS;

  return (
    <View style={styles.root}>
      <Room run={run} width={width} height={height} />

      <Hud run={run} topInset={insets.top} asleepLine={asleepRef.current?.text ?? null} />

      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 14) + 10 }]}>
        <Dpad onChange={handleMove} />
        <View style={styles.buttons}>
          <ActionButton
            label="A"
            hint="SLIDE"
            color={palette.sea}
            charge={slideCharge}
            // Greyed out, but still pressable: a button that stops accepting
            // touches mid-hold never tells us the thumb came off.
            unavailable={run.leashBroken || run.slideRechargeMs > 0}
            onPressIn={() => {
              inputRef.current.slideHeld = true;
            }}
            onPressOut={() => {
              inputRef.current.slideHeld = false;
            }}
          />
          <ActionButton
            label="B"
            hint="DECOY"
            color={palette.alarm}
            charge={decoyCharge}
            unavailable={run.decoyCooldownMs > 0}
            onPress={() => {
              if (runRef.current.decoyCooldownMs > 0) return;
              inputRef.current.decoyPressed = true;
            }}
          />
        </View>
      </View>

      {run.outcome !== 'playing' ? (
        <EndCard
          run={run}
          onRetry={() => {
            playSound('ui-tap');
            setRunId((n) => n + 1);
          }}
          onExit={() => {
            playSound('ui-tap');
            onExit();
          }}
          onNext={
            onNext
              ? () => {
                  playSound('ui-tap');
                  onNext();
                }
              : undefined
          }
        />
      ) : null}
    </View>
  );
}

function EndCard({
  run,
  onRetry,
  onExit,
  onNext,
}: {
  run: RunState;
  onRetry: () => void;
  onExit: () => void;
  onNext?: () => void;
}) {
  const escaped = run.outcome === 'escaped';
  // Getting out earns the next room; losing does not.
  const showNext = escaped && onNext !== undefined;
  return (
    <View style={styles.endWrap}>
      <View style={styles.endCard}>
        <Text style={styles.endTitle}>{escaped ? 'Out the side gate!' : 'They got Toots!'}</Text>
        <Text style={styles.endBody}>
          {escaped
            ? `Every last one of the ${run.collected} fish nuggets, and out through ${run.level.exitLabel}.`
            : `The crowd grabbed him, got a faceful, and scattered anyway. ${run.collected} of ${run.nuggets.length} fish were in the bag.`}
        </Text>
        {showNext ? (
          <Pressable style={styles.endButton} onPress={onNext}>
            <Text style={styles.endButtonText}>Next room!</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.endButton, showNext && styles.endButtonQuiet]}
          onPress={onRetry}
        >
          <Text style={styles.endButtonText}>{escaped ? 'Again!' : 'Try again'}</Text>
        </Pressable>
        {/*
          The only way out of a room. GAME_DESIGN.md §10 is firm that there are
          no menus during play, so this is the one place it can live.
        */}
        <Pressable style={styles.endExit} onPress={onExit}>
          <Text style={styles.endExitText}>Back to the start</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * One pass over what just happened: a haptic for the ones you should feel, and a
 * sound for the ones you should hear. Sound is doing the heavy comedic lifting
 * (GAME_DESIGN.md §14.4), so almost everything gets one.
 */
function drainEvents(events: GameEvent[]): void {
  for (const e of events) {
    const sound = SOUND_FOR_EVENT[e.kind];
    if (sound) playSound(sound);

    // The people are the only ones who talk (§14.2), and what they say is the
    // joke — so they say it out loud rather than only in a bubble.
    if (e.kind === 'blame' && e.text) sayBlame(e.text);
    if (e.kind === 'decoy' && e.text) sayDecoy(e.text, e.tookTheFall === true);
    if (e.kind === 'caught') sayCaught();
    // The bubble is the echo; the voice is the joke (§14.2).
    if (e.kind === 'local-asleep' && e.text) sayAnimal(e.text);

    switch (e.kind) {
      case 'poof':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case 'nugget':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case 'decoy':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'caught':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
      case 'escaped':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'gate-open':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'leash-warning':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      case 'slide-empty':
        // Out of puff is not the same as losing the group, so it doesn't hit
        // as hard.
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      default:
        break;
    }
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paperShade },

  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  buttons: { flexDirection: 'row', gap: 14, alignItems: 'flex-end' },

  endWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#18211BAA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  endCard: {
    backgroundColor: palette.paper,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 18,
    padding: 22,
    gap: 12,
    maxWidth: 340,
  },
  endTitle: { fontSize: 26, fontWeight: '800', color: palette.stinkDeep },
  endBody: { fontSize: 15, color: palette.inkSoft, lineHeight: 21 },
  endButton: {
    marginTop: 4,
    backgroundColor: palette.stink,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  endButtonText: { fontSize: 17, fontWeight: '800', color: palette.ink },
  endButtonQuiet: { backgroundColor: palette.paperShade },
  endExit: { alignItems: 'center', paddingVertical: 8 },
  endExitText: { fontSize: 14, fontWeight: '700', color: palette.inkSoft },
});
