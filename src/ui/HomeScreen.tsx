/**
 * The first thing you see. Two buttons and the four of them standing there,
 * already in trouble.
 *
 * The cast is drawn with the same art the room uses, so the title screen can
 * never drift out of step with the game — and Toots keeps poofing on the title
 * screen, which tells a six-year-old what the game is before they read a word
 * of it (they may not read at all).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Canvas } from '@shopify/react-native-skia';

import { playSound } from '../audio/audio';
import { TitleCast } from '../art/titleCast';
import { palette } from '../theme/palette';

export function HomeScreen({
  onStart,
  onRooms,
  onSettings,
}: {
  onStart: () => void;
  /** Open the room picker. Only offered once there is a choice to make. */
  onRooms?: () => void;
  onSettings: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [t, setT] = useState(0);
  const startedAt = useRef(0);

  // The cast idles on the title screen, so it needs its own little clock.
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (!startedAt.current) startedAt.current = now;
      setT((now - startedAt.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stageWidth = Math.min(width, 520);
  const stageHeight = Math.min(230, stageWidth * 0.52);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.titleBlock}>
        <Text style={styles.kicker}>A comedy about a smell</Text>
        <Text style={styles.title}>Waddles</Text>
        <Text style={styles.titleAnd}>and</Text>
        <Text style={styles.title}>Toots</Text>
      </View>

      <View style={{ width: stageWidth, height: stageHeight }}>
        <Canvas style={{ width: stageWidth, height: stageHeight }}>
          <TitleCast width={stageWidth} height={stageHeight} t={t} />
        </Canvas>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.start, pressed && styles.pressed]}
          onPress={() => {
            playSound('ui-tap');
            onStart();
          }}
          accessibilityRole="button"
          accessibilityLabel="Start the game"
        >
          <Text style={styles.startText}>START</Text>
        </Pressable>

        {/*
          Hidden until a second room is open. A picker with one thing in it is a
          button that does nothing, and on the first launch — which is the one
          that matters — START is the only thing anybody should be looking at.
        */}
        {onRooms ? (
          <Pressable
            style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
            onPress={() => {
              playSound('ui-tap');
              onRooms();
            }}
            accessibilityRole="button"
            accessibilityLabel="Choose a room"
          >
            <Text style={styles.settingsText}>Rooms</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
          onPress={() => {
            playSound('ui-tap');
            onSettings();
          }}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>Get everyone across the yard. Nobody touch the skunk.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  titleBlock: { alignItems: 'center', gap: 2 },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: palette.inkSoft,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: '900',
    color: palette.stinkDeep,
    letterSpacing: -1,
  },
  titleAnd: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.nugget,
    marginVertical: -2,
  },

  buttons: { width: '100%', maxWidth: 340, gap: 12, alignItems: 'stretch' },
  start: {
    backgroundColor: palette.stink,
    borderWidth: 4,
    borderColor: palette.ink,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
  startText: { fontSize: 26, fontWeight: '900', color: palette.ink, letterSpacing: 2 },
  settings: {
    backgroundColor: palette.paperShade,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  settingsText: { fontSize: 16, fontWeight: '800', color: palette.ink },
  pressed: { transform: [{ translateY: 3 }] },

  footer: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.inkSoft,
    textAlign: 'center',
  },
});
