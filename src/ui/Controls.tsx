/**
 * One thumb, two buttons (GAME_DESIGN.md §10). Sized for small hands and kept in
 * the bottom thumb zone, clear of the safe-area inset.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import type { Vec2 } from '../game/types';
import { palette } from '../theme/palette';

const PAD_SIZE = 132;
const DEAD_ZONE = 0.22;

export function Dpad({ onChange }: { onChange: (dir: Vec2) => void }) {
  const update = useCallback(
    (x: number, y: number) => {
      const half = PAD_SIZE / 2;
      // Screen y grows downward; the world's y grows toward the exit.
      const dx = (x - half) / half;
      const dy = (half - y) / half;
      const len = Math.hypot(dx, dy);
      if (len < DEAD_ZONE) {
        onChange({ x: 0, y: 0 });
        return;
      }
      const c = Math.min(1, len);
      onChange({ x: (dx / len) * c, y: (dy / len) * c });
    },
    [onChange]
  );

  const release = useCallback(() => onChange({ x: 0, y: 0 }), [onChange]);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      'worklet';
      runOnJS(update)(e.x, e.y);
    })
    .onUpdate((e) => {
      'worklet';
      runOnJS(update)(e.x, e.y);
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(release)();
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.pad}>
        <View style={styles.padInner} />
        <Text style={[styles.padArrow, styles.padUp]}>▲</Text>
        <Text style={[styles.padArrow, styles.padDown]}>▼</Text>
        <Text style={[styles.padArrow, styles.padLeft]}>◀</Text>
        <Text style={[styles.padArrow, styles.padRight]}>▶</Text>
      </View>
    </GestureDetector>
  );
}

/**
 * A game button.
 *
 * It is a gesture-handler button rather than a `Pressable` for two reasons, both
 * learned the hard way on the slide:
 *
 * 1. **Two thumbs at once.** Sliding means holding the d-pad *and* this button —
 *    and the d-pad is a gesture-handler pan. Mixing React Native's touch
 *    responder with gesture-handler means the second finger is the one that gets
 *    dropped, so the slide simply never fired while you were moving. Both
 *    controls now live in the same touch system.
 *
 * 2. **Never strand the hold.** A `Pressable` that becomes `disabled` mid-press
 *    never fires `onPressOut`, which left `slideHeld` stuck on: the moment the
 *    leash recovered, Waddles shot off on his own. This always fires its release,
 *    so `unavailable` only greys the button out — it never swallows the gesture.
 */
export function ActionButton({
  label,
  hint,
  color,
  unavailable,
  charge,
  onPressIn,
  onPressOut,
  onPress,
}: {
  label: string;
  hint: string;
  color: string;
  /** Drawn as greyed out. Deliberately does not block the touch. */
  unavailable?: boolean;
  /** 0–1, drawn as a bar of remaining slide or cooldown. */
  charge: number;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onPress?: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  const begin = useCallback(() => {
    setPressed(true);
    onPressIn?.();
  }, [onPressIn]);

  const end = useCallback(() => {
    setPressed(false);
    onPressOut?.();
    onPress?.();
  }, [onPressOut, onPress]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        // A thumb that slides off the button mid-slide is still holding it.
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          'worklet';
          runOnJS(begin)();
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(end)();
        }),
    [begin, end]
  );

  return (
    <View style={styles.buttonWrap}>
      <GestureDetector gesture={gesture}>
        <View
          style={[
            styles.button,
            { backgroundColor: unavailable ? '#C9C4B5' : color },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonLabel}>{label}</Text>
        </View>
      </GestureDetector>
      <View style={styles.chargeTrack}>
        <View style={[styles.chargeFill, { width: `${Math.round(charge * 100)}%` }]} />
      </View>
      <Text style={styles.buttonHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: PAD_SIZE,
    height: PAD_SIZE,
    borderRadius: PAD_SIZE / 2,
    borderWidth: 3,
    borderColor: palette.ink,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  padArrow: {
    position: 'absolute',
    color: palette.ink,
    fontSize: 16,
  },
  padUp: { top: 8 },
  padDown: { bottom: 8 },
  padLeft: { left: 10 },
  padRight: { right: 10 },

  buttonWrap: { alignItems: 'center', gap: 5 },
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { transform: [{ translateY: 3 }] },
  buttonLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.white,
  },
  chargeTrack: {
    width: 64,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: palette.ink,
    backgroundColor: palette.paper,
    overflow: 'hidden',
  },
  chargeFill: { height: '100%', backgroundColor: palette.ink },
  buttonHint: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.inkSoft,
    letterSpacing: 0.5,
  },
});
