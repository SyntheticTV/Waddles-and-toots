/**
 * Settings: three switches, and a way back.
 *
 * Sized for the same hands the d-pad is sized for — the whole row is the target,
 * not just the switch — and it says what each one does in words a grown-up
 * reading over a shoulder can take in at a glance.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSound } from '../audio/audio';
import { toggleSetting, useSettings, type Settings } from '../settings';
import { palette } from '../theme/palette';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useSettings();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 18 }]}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.rows}>
        <Row
          label="Sound"
          detail="Gurgles, poofs and the fish"
          setting="sound"
          on={settings.sound}
        />
        <Row label="Music" detail="The tune under the game" setting="music" on={settings.music} />
        <Row
          label="Voices"
          detail={
            settings.sound
              ? 'The people saying what they think it is'
              : 'The people saying what they think it is (needs Sound)'
          }
          setting="voices"
          on={settings.voices}
        />
      </View>

      <Text style={styles.note}>
        The phone&apos;s silent switch turns everything off too.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.done, pressed && styles.pressed]}
        onPress={() => {
          playSound('ui-tap');
          onClose();
        }}
        accessibilityRole="button"
      >
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}

function Row({
  label,
  detail,
  setting,
  on,
}: {
  label: string;
  detail: string;
  setting: keyof Settings;
  on: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => {
        toggleSetting(setting);
        // Play it *after* the toggle so turning sound back on is audible, and
        // turning it off is the last thing you hear.
        playSound('ui-tap');
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch on={on} />
    </Pressable>
  );
}

/** A chunky switch, drawn rather than imported, to match the buttons. */
function Switch({ on }: { on: boolean }) {
  return (
    <View style={[styles.track, { backgroundColor: on ? palette.stink : palette.paperShade }]}>
      <View style={[styles.knob, on ? styles.knobOn : styles.knobOff]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 30, fontWeight: '900', color: palette.stinkDeep },

  rows: { width: '100%', maxWidth: 400, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: palette.paperShade,
    borderWidth: 3,
    borderColor: palette.ink,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowPressed: { transform: [{ translateY: 2 }] },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 19, fontWeight: '800', color: palette.ink },
  rowDetail: { fontSize: 13, fontWeight: '600', color: palette.inkSoft },

  track: {
    width: 68,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: palette.ink,
    justifyContent: 'center',
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: palette.ink,
    backgroundColor: palette.paper,
  },
  knobOn: { alignSelf: 'flex-end', marginRight: 3 },
  knobOff: { alignSelf: 'flex-start', marginLeft: 3 },

  note: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.inkSoft,
    textAlign: 'center',
    maxWidth: 320,
  },

  done: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.stink,
    borderWidth: 4,
    borderColor: palette.ink,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneText: { fontSize: 20, fontWeight: '900', color: palette.ink, letterSpacing: 1 },
  pressed: { transform: [{ translateY: 3 }] },
});
