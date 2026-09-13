/**
 * Everything the player reads. Text lives in React Native views rather than on
 * the Skia canvas so it stays crisp and accessible.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RunState } from '../game/engine';
import { stageFor } from '../game/stink';
import { LEASH_WARN, STINK_MAX, SUSPICION_MAX } from '../game/tuning';
import { palette } from '../theme/palette';

const STAGE_LABEL: Record<string, string> = {
  calm: 'All clear',
  sniff: 'Someone sniffed',
  blame: 'They’re blaming things',
  panic: 'EVERYBODY OUT',
};

export function Hud({
  run,
  topInset,
  asleepLine,
}: {
  run: RunState;
  topInset: number;
  /** What one of the animals thinks about the local nodding off, if anything. */
  asleepLine: string | null;
}) {
  const stage = stageFor(run.stink);
  const stinkPct = Math.round((run.stink / STINK_MAX) * 100);
  const suspicionPct = Math.round((run.suspicion / SUSPICION_MAX) * 100);
  const total = run.nuggets.length;
  const left = total - run.collected;
  // Standing in an open gateway with the line strung out behind you is the one
  // place the game can look broken, so it gets its own line.
  const tail = run.followers[run.followers.length - 1].pos;
  const strungOut = Math.hypot(run.waddles.x - tail.x, run.waddles.y - tail.y) > LEASH_WARN;

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

        {/*
          The nuggets are the objective now (§11), so this has to read as a
          checklist rather than a score: how many are left, at a glance, without
          counting anything.
        */}
        <View style={styles.nuggets}>
          <Text style={styles.nuggetCount}>
            {run.collected}
            <Text style={styles.nuggetTotal}>/{total}</Text>
          </Text>
          <Text style={styles.label}>FISH</Text>
          <View style={styles.pips}>
            {run.nuggets.map((n, i) => (
              <View key={i} style={[styles.pip, n.taken && styles.pipOn]} />
            ))}
          </View>
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

      {/* The one thing a player must never be confused about: why can't I leave? */}
      {run.atExit && !run.gateOpen ? (
        <Banner
          text={`The gate won't budge — ${left} more fish to find!`}
          color={palette.alarm}
        />
      ) : run.atExit && strungOut ? (
        <Banner text="Everyone through together!" color={palette.alarm} />
      ) : run.leashBroken ? (
        <Banner text="Wait for the others!" color={palette.alarm} />
      ) : run.gateOpen ? (
        <Banner text="That's all of them — get out!" color={palette.stinkDeep} />
      ) : run.freshAirLock > 0 ? (
        <Banner text="Fresh air — the nose is working" color={palette.sea} />
      ) : null}

      {run.blame ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{run.blame.text}</Text>
        </View>
      ) : null}

      {/*
        What the group makes of it. This is a *bubble*, not a voice: the animals
        never speak out loud (§14.2), but they are certainly allowed an opinion.
      */}
      {asleepLine ? <ThoughtBubble text={asleepLine} /> : null}

      {run.local.found && run.local.mood === 'asleep' ? (
        <Banner text={`The ${run.local.species} is asleep. Wake him?`} color={palette.inkSoft} />
      ) : null}
    </View>
  );
}

/** An animal having a thought. Rounder and softer than a person's speech. */
function ThoughtBubble({ text }: { text: string }) {
  return (
    <View style={styles.thought}>
      <Text style={styles.thoughtText}>{text}</Text>
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

  nuggets: { alignItems: 'center', maxWidth: 128 },
  nuggetCount: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.nugget,
    lineHeight: 28,
  },
  nuggetTotal: { fontSize: 15, fontWeight: '800', color: palette.inkSoft },
  pips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    marginTop: 4,
  },
  pip: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: palette.inkSoft,
    backgroundColor: 'transparent',
  },
  pipOn: { backgroundColor: palette.nugget, borderColor: palette.ink },

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

  thought: {
    alignSelf: 'center',
    backgroundColor: palette.paper,
    borderWidth: 3,
    borderColor: palette.inkSoft,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    maxWidth: '86%',
  },
  thoughtText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.inkSoft,
    textAlign: 'center',
    fontStyle: 'italic',
  },

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
