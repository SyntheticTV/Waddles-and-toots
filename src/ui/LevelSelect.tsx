/**
 * Pick a room.
 *
 * Locked rooms are shown rather than hidden, and that is the whole point of the
 * screen: a six-year-old who can see that there is a *school* after the
 * restaurant has a reason to get through the restaurant. A list that grows out
 * of nowhere gives them nothing to want.
 *
 * Outside play, so `Pressable` is fine here — the gesture-handler rule in
 * AGENTS.md is about the d-pad and the two buttons, where two fingers land at
 * once.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSound } from '../audio/audio';
import { LEVELS } from '../levels';
import { isUnlocked, recordFor, useProgress } from '../progress';
import { palette } from '../theme/palette';

/** Rooms are numbered for the player, who does not count from zero. */
const ordinal = (i: number) => `Room ${i + 1}`;

function Stars({ cleared, noPoof }: { cleared: boolean; noPoof: boolean }) {
  return (
    <View style={styles.stars}>
      <Text style={[styles.star, cleared && styles.starOn]}>{cleared ? '★' : '☆'}</Text>
      <Text style={[styles.star, noPoof && styles.starOn]}>{noPoof ? '★' : '☆'}</Text>
    </View>
  );
}

export function LevelSelect({
  onPlay,
  onClose,
}: {
  onPlay: (index: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  // Subscribing here is what makes a freshly-earned room appear the moment you
  // come back from beating the one before it.
  useProgress();
  const ids = LEVELS.map((l) => l.id);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 14 }]}>
      <Text style={styles.heading}>Rooms</Text>
      <Text style={styles.sub}>Beat a room to open the next one.</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listInner}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((level, i) => {
          const open = isUnlocked(ids, i);
          const record = recordFor(level.id);
          return (
            <Pressable
              key={level.id}
              disabled={!open}
              style={({ pressed }) => [
                styles.card,
                !open && styles.cardLocked,
                pressed && open && styles.pressed,
              ]}
              onPress={() => {
                playSound('ui-tap');
                onPlay(i);
              }}
              accessibilityRole="button"
              accessibilityState={{ disabled: !open }}
              accessibilityLabel={
                open ? `Play ${level.name}` : `${level.name}, locked. Beat the room before it.`
              }
            >
              <View style={styles.cardText}>
                <Text style={[styles.room, !open && styles.dim]}>{ordinal(i)}</Text>
                <Text style={[styles.name, !open && styles.dim]}>
                  {open ? level.name : '? ? ?'}
                </Text>
                <Text style={[styles.exit, !open && styles.dim]}>
                  {open ? `Out through ${level.exitLabel}` : 'Not open yet'}
                </Text>
              </View>
              {open ? (
                <Stars cleared={record?.cleared ?? false} noPoof={record?.noPoof ?? false} />
              ) : (
                <Text style={styles.lock}>🔒</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        onPress={() => {
          playSound('ui-tap');
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.footer}>★ crossed it   ★★ crossed it without one single poof</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paper, paddingHorizontal: 18 },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: palette.stinkDeep,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },

  list: { flex: 1 },
  listInner: { gap: 10, paddingVertical: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.paperShade,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  // Greyed, but still on the list, so the rooms ahead are something to want.
  cardLocked: { backgroundColor: palette.paper, borderColor: palette.inkSoft, opacity: 0.55 },
  cardText: { flex: 1, gap: 1 },
  room: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: palette.inkSoft,
    textTransform: 'uppercase',
  },
  name: { fontSize: 21, fontWeight: '900', color: palette.ink, letterSpacing: -0.4 },
  exit: { fontSize: 12, fontWeight: '600', color: palette.inkSoft },
  dim: { color: palette.inkSoft },

  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 24, color: palette.paperShade, textShadowColor: palette.inkSoft, textShadowRadius: 1 },
  starOn: { color: palette.nugget },
  lock: { fontSize: 22, opacity: 0.6 },

  back: {
    backgroundColor: palette.paperShade,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  backText: { fontSize: 16, fontWeight: '800', color: palette.ink },
  pressed: { transform: [{ translateY: 3 }] },

  footer: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.inkSoft,
    textAlign: 'center',
    marginTop: 10,
  },
});
