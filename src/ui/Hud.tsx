/**
 * Everything the player reads. Text lives in React Native views rather than on
 * the Skia canvas so it stays crisp and accessible.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RunState } from '../game/engine';
import { stageFor } from '../game/stink';
import { STINK_MAX, SUSPICION_MAX } from '../game/tuning';
import { palette } from '../theme/palette';

const STAGE_LABEL: Record<string, string> = {
  calm: 'All clear',
  sniff: 'Someone sniffed',
  blame: 'They’re blaming things',
  panic: 'EVERYBODY OUT',
};

export function Hud({ run, topInset }: { run: RunState; topInset: number }) {
  const stage = stageFor(run.stink);
  const stinkPct = Math.round((run.stink / STINK_MAX) * 100);
  const suspicionPct = Math.round((run.suspicion / SUSPICION_MAX) * 100);

  return (
    <View style={[styles.wrap, { paddingTop: topInset + 8 }]} pointerEvents="none">
      <View style={styles.row}>
        <View style={styles.meterBlock}>
          <Text style={styles.label}>STINK</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${stinkPct}%`, backgroundColor: stinkColor(stage) }]} />
          </View>
          <Text style={[styles.stage, { color: stinkColor(stage) }]}>{STAGE_LABEL[stage]}</Text>
        </View>

        <View style={styles.nuggets}>
          <Text style={styles.nuggetCount}>{run.collected}</Text>
          <Text style={styles.label}>NUGGETS</Text>
        </View>
      </View>

      {suspicionPct > 8 ? (
        <View style={styles.suspicionBlock}>
          <Text style={styles.suspicionLabel}>They’re onto the skunk</Text>
          <View style={styles.suspicionTrack}>
            <View style={[styles.suspicionFill, { width: `${suspicionPct}%` }]} />
          </View>
        </View>
      ) : null}

      {run.leashBroken ? (
        <Banner text="Wait for the others!" color={palette.alarm} />
      ) : run.freshAirLock > 0 ? (
        <Banner text="Fresh air — the nose is working" color={palette.sea} />
      ) : null}

      {run.blame ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{run.blame.text}</Text>
        </View>
      ) : null}

      {run.local.found && run.local.mood === 'asleep' ? (
        <Banner text={`The ${run.local.species} fell asleep.`} color={palette.inkSoft} />
      ) : null}
    </View>
  );
}

function Banner({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.banner, { borderColor: color }]}>
      <Text style={[styles.bannerText, { color }]}>{text}</Text>
    </View>
  );
}

function stinkColor(stage: string): string {
  if (stage === 'panic') return palette.alarm;
  if (stage === 'blame') return palette.stinkDeep;
  if (stage === 'sniff') return palette.stink;
  return palette.inkSoft;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  meterBlock: { flex: 1, gap: 4 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: palette.inkSoft,
  },
  track: {
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: palette.ink,
    backgroundColor: palette.paper,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
  stage: { fontSize: 12, fontWeight: '800' },

  nuggets: { alignItems: 'center' },
  nuggetCount: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.nugget,
    lineHeight: 28,
  },

  suspicionBlock: { gap: 3 },
  suspicionLabel: { fontSize: 11, fontWeight: '800', color: palette.alarm },
  suspicionTrack: {
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: palette.alarm,
    backgroundColor: palette.paper,
    overflow: 'hidden',
  },
  suspicionFill: { height: '100%', backgroundColor: palette.alarm },

  banner: {
    alignSelf: 'flex-start',
    borderWidth: 2.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFFEE',
  },
  bannerText: { fontSize: 13, fontWeight: '800' },

  bubble: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderWidth: 2.5,
    borderColor: palette.ink,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
  },
});
