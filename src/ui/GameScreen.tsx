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
  nudgeLocal,
  step,
  type GameEvent,
  type InputState,
  type RunState,
} from '../game/engine';
import { DECOY_COOLDOWN_MS, SLIDE_MAX_MS } from '../game/tuning';
import type { LevelSpec } from '../game/types';
import { palette } from '../theme/palette';
import { ActionButton, Dpad } from './Controls';
import { Hud } from './Hud';
import { Room } from './Room';

const MAX_FRAME_MS = 50;

export function GameScreen({ level }: { level: LevelSpec }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [runId, setRunId] = useState(0);
  const runRef = useRef<RunState>(createRun(level));
  const inputRef = useRef<InputState>({ move: { x: 0, y: 0 }, slideHeld: false, decoyPressed: false });
  const [, setFrame] = useState(0);

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
        drainEvents(run.events, run);
        run.events.length = 0;
      }

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

      <Hud run={run} topInset={insets.top} />

      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 14) + 10 }]}>
        <Dpad onChange={handleMove} />
        <View style={styles.buttons}>
          <ActionButton
            label="A"
            hint="SLIDE"
            color={palette.sea}
            charge={slideCharge}
            disabled={run.leashBroken}
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
            disabled={run.decoyCooldownMs > 0}
            onPress={() => {
              inputRef.current.decoyPressed = true;
              nudgeLocal(runRef.current);
            }}
          />
        </View>
      </View>

      {run.outcome !== 'playing' ? (
        <EndCard run={run} onRetry={() => setRunId((n) => n + 1)} />
      ) : null}
    </View>
  );
}

function EndCard({ run, onRetry }: { run: RunState; onRetry: () => void }) {
  const escaped = run.outcome === 'escaped';
  return (
    <View style={styles.endWrap}>
      <View style={styles.endCard}>
        <Text style={styles.endTitle}>{escaped ? 'Out the side gate!' : 'They got Toots!'}</Text>
        <Text style={styles.endBody}>
          {escaped
            ? `Everyone made it through ${run.level.exitLabel} with ${run.collected} fish nuggets.`
            : 'The crowd grabbed him, got a faceful, and scattered anyway.'}
        </Text>
        <Pressable style={styles.endButton} onPress={onRetry}>
          <Text style={styles.endButtonText}>{escaped ? 'Again!' : 'Try again'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function drainEvents(events: GameEvent[], run: RunState): void {
  for (const e of events) {
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
      case 'leash-warning':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
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
});
