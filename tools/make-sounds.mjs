/**
 * Makes every sound in the game, from scratch, with no dependencies.
 *
 *     npm run sounds
 *
 * The sounds are *code*, the same way the art is: this script is the source and
 * `assets/audio/*.wav` is the build output. If a sound is wrong, change the
 * recipe here and run it again — don't hand-edit the wav.
 *
 * Sound is doing heavy comedic lifting (GAME_DESIGN.md §14.4), so the rules are
 * the same as the art's: the gag escalates rather than repeats, nothing is
 * gross, and the animals never speak — they gurgle, chirp, trill and snore.
 * People are the only ones who make word-shaped noises, and even then it is
 * vowels through formant filters, not words.
 *
 * Everything is 22.05 kHz mono 16-bit, which is plenty for cartoon effects and
 * keeps the whole set near a megabyte.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 22050;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'audio');

// --------------------------------------------------------------- the kit

const TAU = Math.PI * 2;
const buf = (seconds) => new Float32Array(Math.max(1, Math.ceil(SR * seconds)));
const at = (v, t) => (typeof v === 'function' ? v(t) : v);

/** A deterministic noise source, so every run of this script is identical. */
let seed = 0x9e3779b9;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
}

function wave(type, ph) {
  const p = ph - Math.floor(ph);
  switch (type) {
    case 'saw':
      return p * 2 - 1;
    case 'square':
      return p < 0.5 ? 1 : -1;
    case 'tri':
      return 4 * Math.abs(p - 0.5) - 1;
    case 'noise':
      return rand();
    default:
      return Math.sin(TAU * p);
  }
}

/** One voice: a waveform whose frequency and amplitude can both move. */
function tone({ dur, freq = 440, amp = 1, type = 'sine', phase = 0 }) {
  const out = buf(dur);
  let ph = phase;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += at(freq, t) / SR;
    out[i] = wave(type, ph) * at(amp, t);
  }
  return out;
}

function noise({ dur, amp = 1 }) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) out[i] = rand() * at(amp, i / SR);
  return out;
}

/** One-pole lowpass. `cut` may move over time. */
function lowpass(src, cut) {
  const out = new Float32Array(src.length);
  let y = 0;
  for (let i = 0; i < src.length; i++) {
    const a = 1 - Math.exp((-TAU * Math.max(20, at(cut, i / SR))) / SR);
    y += a * (src[i] - y);
    out[i] = y;
  }
  return out;
}

function highpass(src, cut) {
  const low = lowpass(src, cut);
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = src[i] - low[i];
  return out;
}

/**
 * A state-variable bandpass. This is the workhorse: sweeping one of these over
 * noise is what makes a spray, a sniff, a whoosh and a vowel.
 */
function bandpass(src, centre, q = 4) {
  const out = new Float32Array(src.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < src.length; i++) {
    const t = i / SR;
    const f = 2 * Math.sin((Math.PI * Math.min(at(centre, t), SR * 0.45)) / SR);
    const damp = 1 / q;
    const high = src[i] - low - damp * band;
    band += f * high;
    low += f * band;
    out[i] = band;
  }
  return out;
}

// Envelopes.
const decay = (tau) => (t) => Math.exp(-t / tau);
const hit =
  (attack, tau) =>
  (t) =>
    (t < attack ? t / attack : Math.exp(-(t - attack) / tau));
const swell =
  (dur, shape = 2) =>
  (t) => {
    const x = Math.min(1, Math.max(0, t / dur));
    return Math.pow(Math.sin(Math.PI * x), shape);
  };

function mix(dest, src, offsetSeconds = 0, gain = 1) {
  const start = Math.round(offsetSeconds * SR);
  for (let i = 0; i < src.length; i++) {
    const j = start + i;
    if (j >= 0 && j < dest.length) dest[j] += src[i] * gain;
  }
  return dest;
}

/** Trim clicks off both ends. Every sound gets this. */
function fades(b, inSec = 0.004, outSec = 0.02) {
  const nIn = Math.round(inSec * SR);
  const nOut = Math.round(outSec * SR);
  for (let i = 0; i < nIn && i < b.length; i++) b[i] *= i / nIn;
  for (let i = 0; i < nOut && i < b.length; i++) b[b.length - 1 - i] *= i / nOut;
  return b;
}

function normalize(b, peak = 0.86) {
  let max = 0;
  for (let i = 0; i < b.length; i++) max = Math.max(max, Math.abs(b[i]));
  if (max < 1e-6) return b;
  const g = peak / max;
  for (let i = 0; i < b.length; i++) b[i] *= g;
  return b;
}

/**
 * Makes a buffer loop seamlessly by crossfading its tail over its head, then
 * cutting the tail off. Ambience beds only.
 */
function seamless(b, fadeSeconds) {
  const n = Math.round(fadeSeconds * SR);
  const out = b.slice(0, b.length - n);
  for (let i = 0; i < n; i++) {
    const w = i / n;
    out[i] = out[i] * w + b[b.length - n + i] * (1 - w);
  }
  return out;
}

/**
 * Loops a *rhythmic* buffer. Anything still ringing past the loop point is folded
 * back onto the start, so a note that decays across the seam keeps decaying and
 * the downbeat stays sharp. `seamless` would blur the beat; this doesn't.
 */
function wrapTail(b, loopSeconds) {
  const n = Math.round(loopSeconds * SR);
  const out = b.slice(0, n);
  for (let i = n; i < b.length; i++) out[i - n] += b[i];
  return out;
}

function writeWav(name, samples) {
  const n = samples.length;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); // PCM
  b.writeUInt16LE(1, 22); // mono
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    b.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name), b);
  return b.length;
}

// ----------------------------------------------------------- the voices

/**
 * A bubble: a short sine whose pitch shoots upward. Two or three of these in a
 * row is the universal sound of something gurgling, and it is the warning the
 * player gets a beat before the poof.
 */
function bubble(f0, f1, dur = 0.09) {
  const g = tone({
    dur,
    freq: (t) => f0 + (f1 - f0) * Math.pow(t / dur, 0.6),
    amp: hit(0.004, dur * 0.35),
  });
  return lowpass(g, 2600);
}

/** A vowel: a buzzy larynx through two formants. The crowd is built of these. */
function vowel({ dur, pitch, formants, amp = 1, wobbleHz = 5.2, wobble = 0.02 }) {
  const src = tone({
    dur,
    freq: (t) => at(pitch, t) * (1 + Math.sin(TAU * wobbleHz * t) * wobble),
    type: 'saw',
    amp: 1,
  });
  const out = new Float32Array(src.length);
  formants.forEach(([f, gain], i) => {
    const band = bandpass(src, f, i === 0 ? 7 : 9);
    for (let j = 0; j < out.length; j++) out[j] += band[j] * gain;
  });
  for (let j = 0; j < out.length; j++) out[j] *= at(amp, j / SR);
  return out;
}

/** A struck wooden note — the nugget, and the notes of the win fanfare. */
function mallet({ dur, freq, amp = 1 }) {
  const out = buf(dur);
  const partials = [
    [1, 1, 0.5],
    [2.01, 0.4, 0.22],
    [3.02, 0.18, 0.12],
    [5.4, 0.08, 0.06],
  ];
  for (const [mult, gain, tau] of partials) {
    mix(out, tone({ dur, freq: freq * mult, amp: (t) => gain * Math.exp(-t / tau) }), 0, 1);
  }
  // the knock of the beater
  mix(out, lowpass(noise({ dur: 0.02, amp: hit(0.001, 0.006) }), 3000), 0, 0.35);
  for (let i = 0; i < out.length; i++) out[i] *= at(amp, i / SR);
  return out;
}

/** A slide whistle. Pure comedy, used by Fluffy and by the loss. */
function whistle({ dur, from, to, amp = 1, curve = 1 }) {
  const glide = (t) => from + (to - from) * Math.pow(Math.min(1, t / dur), curve);
  const body = tone({ dur, freq: glide, amp: swell(dur, 0.8) });
  const air = bandpass(noise({ dur, amp: swell(dur, 0.8) }), glide, 12);
  const out = new Float32Array(body.length);
  for (let i = 0; i < out.length; i++) out[i] = (body[i] * 0.85 + air[i] * 0.5) * at(amp, i / SR);
  return out;
}

/** A chirp: birds in the yard, and the squirrel saying hello. */
function chirp({ dur = 0.07, from = 2400, to = 3800, amp = 1 }) {
  return tone({
    dur,
    freq: (t) => from + (to - from) * Math.sin((Math.PI * t) / dur),
    amp: (t) => at(amp, t) * Math.sin((Math.PI * t) / dur) ** 1.5,
  });
}

// ------------------------------------------------------------ the sounds

const sounds = {};

/**
 * Gurgle gurgle. The whole game is named after this one, so it gets the most
 * work: two bubbles of warning, then the poof itself — a noise burst with its
 * filter falling away, fluttering just enough to be rude without being gross.
 */
sounds['poof'] = () => {
  // The gurgle is the warning, so it has to land close behind the bump that
  // caused it — long enough to be a gag, short enough to feel like one event.
  const out = buf(1.0);
  mix(out, bubble(190, 430, 0.09), 0.0, 0.5);
  mix(out, bubble(150, 520, 0.1), 0.1, 0.55);
  mix(out, bubble(230, 600, 0.07), 0.19, 0.4);

  // the spray: bandpassed noise sliding down, with a comedy flutter
  const dur = 0.72;
  const flutter = (t) => 1 + 0.35 * Math.sin(TAU * 34 * t) + 0.15 * Math.sin(TAU * 51 * t);
  const spray = bandpass(
    noise({ dur, amp: (t) => hit(0.012, 0.24)(t) * flutter(t) }),
    (t) => 2600 * Math.exp(-t / 0.2) + 320,
    3.2
  );
  mix(out, spray, 0.26, 1);
  // a low thump underneath so it has some weight on a phone speaker
  mix(out, tone({ dur: 0.3, freq: (t) => 120 - 50 * t, amp: hit(0.005, 0.09) }), 0.26, 0.5);
  return out;
};

/** A fish nugget. Bright, two notes up, over before you notice it. */
sounds['nugget'] = () => {
  const out = buf(0.42);
  mix(out, mallet({ dur: 0.22, freq: 988 }), 0, 0.9); // B5
  mix(out, mallet({ dur: 0.3, freq: 1319 }), 0.07, 0.8); // E6
  mix(out, chirp({ dur: 0.05, from: 3000, to: 4200, amp: 0.25 }), 0.07, 1);
  return out;
};

/** Fluffy going to work: a whistle up, and a smug little trill. */
sounds['decoy'] = () => {
  const out = buf(1.0);
  mix(out, whistle({ dur: 0.42, from: 420, to: 1250, curve: 0.7, amp: 0.55 }), 0, 1);
  // the cat's trill — a purr-ish burble, because the animals never speak
  const trill = tone({
    dur: 0.34,
    freq: (t) => 620 + 90 * Math.sin(TAU * 18 * t) - 160 * t,
    amp: hit(0.02, 0.16),
  });
  mix(out, lowpass(trill, 2200), 0.44, 0.7);
  mix(out, mallet({ dur: 0.3, freq: 784, amp: 0.5 }), 0.62, 1);
  return out;
};

/** "It's GOT to be the potato salad." A knot of people muttering. */
sounds['blame'] = () => {
  const out = buf(1.25);
  const voices = [
    [0.0, 128, 0.9],
    [0.11, 96, 0.8],
    [0.26, 152, 0.7],
    [0.42, 112, 0.6],
  ];
  for (const [t0, pitch, gain] of voices) {
    // "oh" sliding into "ah" — a shrug with a mouth on it
    mix(
      out,
      vowel({
        dur: 0.62,
        pitch: (t) => pitch * (1 - 0.12 * t),
        formants: [
          [(t) => 480 + 200 * t, 1],
          [(t) => 820 + 260 * t, 0.55],
          [2500, 0.12],
        ],
        amp: swell(0.62, 1.4),
      }),
      t0,
      gain * 0.5
    );
  }
  return out;
};

/** "...do you smell that?" One nose, working. */
sounds['sniff'] = () => {
  const out = buf(0.5);
  const one = (t0, len, gain) =>
    mix(
      out,
      bandpass(
        noise({ dur: len, amp: (t) => Math.pow(t / len, 0.7) * Math.exp(-Math.max(0, t - len * 0.7) / 0.03) }),
        (t) => 700 + 1800 * (t / len),
        2.4
      ),
      t0,
      gain
    );
  one(0.0, 0.13, 0.9);
  one(0.17, 0.15, 1);
  return out;
};

/** EVERYBODY OUT. The room going up all at once. */
sounds['panic'] = () => {
  const out = buf(1.6);
  const voices = [
    [0.0, 190, 1],
    [0.05, 240, 0.85],
    [0.12, 155, 0.9],
    [0.19, 300, 0.7],
    [0.3, 210, 0.75],
    [0.4, 265, 0.6],
  ];
  for (const [t0, pitch, gain] of voices) {
    mix(
      out,
      vowel({
        dur: 0.9,
        // a shout: up fast, then wobbling as it runs out of breath
        pitch: (t) => pitch * (1 + 0.5 * Math.min(1, t / 0.12) - 0.18 * t),
        formants: [
          [730, 1],
          [1150, 0.6],
          [2600, 0.22],
        ],
        amp: hit(0.05, 0.5),
        wobbleHz: 6.5,
        wobble: 0.045,
      }),
      t0,
      gain * 0.42
    );
  }
  // chairs going over
  mix(out, lowpass(noise({ dur: 0.5, amp: hit(0.01, 0.14) }), 900), 0.22, 0.3);
  return out;
};

/** Out the side gate. Five notes, up and away. */
sounds['escaped'] = () => {
  const out = buf(1.9);
  const notes = [
    [0.0, 523.25, 0.22],
    [0.13, 659.25, 0.22],
    [0.26, 783.99, 0.24],
    [0.39, 1046.5, 0.5],
    [0.62, 1318.5, 0.9],
  ];
  for (const [t0, f, len] of notes) {
    mix(out, mallet({ dur: len + 0.4, freq: f }), t0, 0.8);
    mix(out, mallet({ dur: len + 0.3, freq: f * 2 }), t0, 0.18);
  }
  // a shaker to give it a skip
  for (let i = 0; i < 6; i++) {
    mix(out, highpass(noise({ dur: 0.06, amp: hit(0.002, 0.02) }), 4000), 0.06 + i * 0.13, 0.22);
  }
  mix(out, chirp({ dur: 0.12, from: 2000, to: 3600, amp: 0.3 }), 0.68, 1);
  return out;
};

/** They got Toots. A trombone feeling sorry for itself. */
sounds['caught'] = () => {
  const out = buf(1.9);
  const wah = (t0, f0, f1, len) => {
    const src = tone({
      dur: len,
      freq: (t) => f0 + (f1 - f0) * Math.min(1, t / (len * 0.8)),
      type: 'saw',
      amp: hit(0.03, len * 0.5),
    });
    // the mute opening and closing over the note
    const shaped = bandpass(src, (t) => 700 + 900 * Math.sin((Math.PI * t) / len), 2.2);
    const body = lowpass(src, 1400);
    const one = new Float32Array(src.length);
    for (let i = 0; i < one.length; i++) one[i] = body[i] * 0.7 + shaped[i] * 0.8;
    mix(out, one, t0, 1);
  };
  wah(0.0, 233.08, 220, 0.36); // wah
  wah(0.34, 207.65, 196, 0.36); // wah
  wah(0.68, 185, 146.83, 0.95); // waaaaah
  mix(out, lowpass(noise({ dur: 0.4, amp: hit(0.008, 0.1) }), 700), 1.5, 0.2);
  return out;
};

/** Too far ahead. A worried little "uh-oh" on a whistle. */
sounds['leash'] = () => {
  const out = buf(0.62);
  mix(out, whistle({ dur: 0.16, from: 900, to: 1150, amp: 0.8 }), 0, 1);
  mix(out, whistle({ dur: 0.3, from: 1150, to: 700, amp: 0.8 }), 0.18, 1);
  return out;
};

/** The belly slide. Air going past a penguin. */
sounds['slide'] = () => {
  const dur = 0.85;
  const out = bandpass(
    noise({ dur, amp: swell(dur, 1.6) }),
    (t) => 900 + 2200 * Math.sin((Math.PI * t) / dur),
    1.8
  );
  mix(out, lowpass(noise({ dur: 0.25, amp: hit(0.01, 0.07) }), 500), 0, 0.4);
  return out;
};

/** Found the local. A friendly chirp, twice. */
sounds['local-found'] = () => {
  const out = buf(0.55);
  mix(out, chirp({ dur: 0.09, from: 1800, to: 3000, amp: 0.9 }), 0.0, 1);
  mix(out, chirp({ dur: 0.11, from: 2200, to: 3600, amp: 0.8 }), 0.14, 1);
  mix(out, mallet({ dur: 0.25, freq: 1568, amp: 0.35 }), 0.14, 1);
  return out;
};

/** The Snoozalot, going. In through the nose, out through a small whistle. */
sounds['snore'] = () => {
  const out = buf(1.7);
  // the long draw in: a buzzy rattle under filtered breath
  const inLen = 0.75;
  const rattle = tone({
    dur: inLen,
    freq: (t) => 62 + 8 * Math.sin(TAU * 11 * t),
    type: 'saw',
    amp: swell(inLen, 1.2),
  });
  mix(out, lowpass(rattle, (t) => 500 + 700 * t), 0.05, 0.55);
  mix(
    out,
    bandpass(noise({ dur: inLen, amp: swell(inLen, 1.3) }), (t) => 420 + 500 * t, 2),
    0.05,
    0.4
  );
  // and the little whistle out
  mix(out, whistle({ dur: 0.55, from: 620, to: 430, amp: 0.35 }), 0.95, 1);
  return out;
};

/** Fresh air. The nose comes back — a shimmer up. */
sounds['fresh-air'] = () => {
  const out = buf(0.9);
  const notes = [1046.5, 1318.5, 1568, 2093];
  notes.forEach((f, i) => {
    mix(out, tone({ dur: 0.5, freq: f, amp: hit(0.01, 0.16) }), i * 0.06, 0.3);
  });
  mix(
    out,
    bandpass(noise({ dur: 0.6, amp: swell(0.6, 1.6) }), (t) => 1200 + 3000 * t, 3),
    0.02,
    0.25
  );
  return out;
};

/**
 * The yard: wind in the hedge, and birds who have no idea what is about to
 * happen to this party. Loops.
 */
sounds['bed-yard'] = () => {
  const len = 9.4;
  const out = buf(len);
  // wind, made of two slow-moving bands so it breathes
  const w1 = bandpass(
    noise({ dur: len, amp: (t) => 0.5 + 0.32 * Math.sin(TAU * 0.13 * t) }),
    (t) => 420 + 180 * Math.sin(TAU * 0.11 * t),
    1.1
  );
  const w2 = bandpass(
    noise({ dur: len, amp: (t) => 0.4 + 0.3 * Math.sin(TAU * 0.077 * t + 1.7) }),
    (t) => 900 + 400 * Math.sin(TAU * 0.05 * t),
    1.4
  );
  mix(out, w1, 0, 0.5);
  mix(out, w2, 0, 0.3);
  // birds, unevenly spaced so it never sounds like a metronome
  const birds = [
    [0.9, 2300, 3500],
    [1.05, 2500, 3700],
    [3.4, 2000, 3100],
    [3.52, 2100, 3400],
    [3.66, 2400, 3000],
    [6.2, 2700, 4000],
    [7.8, 2200, 3300],
    [7.95, 2350, 3550],
  ];
  for (const [t0, a, b] of birds) {
    mix(out, chirp({ dur: 0.075, from: a, to: b, amp: 0.5 }), t0, 0.5);
  }
  return seamless(out, 1.2);
};

/**
 * The dining room, after hours quiet: the room itself, a glass set down now and
 * then, and somebody moving dishes about. Loops.
 *
 * There is deliberately no chatter in here. Two goes at synthesising a crowd
 * both came out wrong — a bed made of voices either sounds like a machine
 * imitating people, or it competes with the actual people in the room, who are
 * busy delivering the jokes this game is made of. Silence with things happening
 * in it is a better restaurant than a fake crowd, and it leaves the whole speech
 * band clear for the punchlines.
 *
 * Sixteen seconds, which is long for a loop, because sparse events give the ear
 * something to memorise and a short cycle would start sounding like a rhythm.
 */
sounds['bed-room'] = () => {
  const len = 16;
  const out = buf(len);

  // The room itself: the extractor, the fridge, the building. Quiet, and only
  // here so the gaps between events sound like a room rather than a mute button.
  mix(out, lowpass(noise({ dur: len, amp: 0.5 }), 190), 0, 0.5);
  mix(out, bandpass(noise({ dur: len, amp: (t) => 0.5 + 0.2 * Math.sin(TAU * 0.06 * t) }), 300, 1.2), 0, 0.12);

  /*
   * One plate, cup or bowl meeting a table. A *click*, not a ting: a broadband
   * tap with a short dull ring behind it. The ring is what says china; keeping
   * it short is what stops the room turning into a wind chime.
   */
  const dish = (freq, bright = 0.45) => {
    const b = buf(0.12);
    mix(b, bandpass(noise({ dur: 0.06, amp: hit(0.0004, 0.007) }), freq, 4), 0, 1);
    mix(b, lowpass(noise({ dur: 0.014, amp: hit(0.0002, 0.003) }), 6000), 0, bright);
    mix(b, tone({ dur: 0.09, freq: freq * 1.42, amp: hit(0.0004, 0.016) }), 0, 0.22);
    return b;
  };

  /*
   * Dishes being *moved*, which is a different sound from a dish being put down:
   * a short drag as the stack comes off the table, then two or three of them
   * knocking together as it is carried. Uneven on purpose — a person doing this
   * is not keeping time.
   */
  const dishesMoved = (freq, clacks, spread) => {
    const b = buf(0.9);
    // the drag
    mix(
      b,
      bandpass(noise({ dur: 0.2, amp: swell(0.2, 1.8) }), (t) => 1500 + 900 * t, 2.2),
      0,
      0.4
    );
    let t = 0.1;
    for (let i = 0; i < clacks; i++) {
      mix(b, dish(freq * (1 + 0.12 * i), 0.35), t, 0.8 - i * 0.12);
      t += spread * (0.7 + 0.6 * ((i * 7919) % 11) / 11);
    }
    return b;
  };

  // A glass set down. The one bright thing in here, and rare enough to be an
  // event rather than a texture.
  const glass = (freq) => {
    const b = buf(0.6);
    mix(b, tone({ dur: 0.5, freq, amp: hit(0.001, 0.12) }), 0, 0.8);
    mix(b, tone({ dur: 0.3, freq: freq * 2.76, amp: hit(0.001, 0.04) }), 0, 0.25);
    mix(b, lowpass(noise({ dur: 0.01, amp: hit(0.0002, 0.002) }), 7000), 0, 0.3);
    return b;
  };

  // Spread unevenly across the sixteen seconds, with one long gap so the room
  // is allowed to go quiet — that is what makes the next clink land.
  mix(out, dish(2400), 0.8, 0.5);
  mix(out, glass(1760), 2.3, 0.42);
  mix(out, dishesMoved(2050, 3, 0.13), 4.1, 0.5);
  mix(out, dish(1820, 0.3), 6.6, 0.4);
  mix(out, glass(2090), 8.2, 0.34);
  mix(out, dishesMoved(2650, 4, 0.1), 10.4, 0.45);
  mix(out, dish(2900), 13.1, 0.36);
  mix(out, dishesMoved(1950, 2, 0.16), 14.3, 0.4);

  return seamless(out, 1.4);
};

/**
 * The pressure. A low uneasy drone the game fades up as the meter climbs, so the
 * room feels worse before anybody says anything. Loops.
 */
sounds['bed-stink'] = () => {
  const len = 5.2;
  const out = buf(len);
  // two detuned lows, beating slowly against each other
  mix(out, tone({ dur: len, freq: 58, type: 'tri', amp: 0.6 }), 0, 1);
  mix(out, tone({ dur: len, freq: 58.7, type: 'tri', amp: 0.5 }), 0, 1);
  mix(out, tone({ dur: len, freq: 87.5, type: 'sine', amp: (t) => 0.22 + 0.12 * Math.sin(TAU * 0.19 * t) }), 0, 1);
  // a slow churn on top, like something turning over in a bin
  mix(
    out,
    bandpass(
      noise({ dur: len, amp: (t) => 0.3 + 0.25 * Math.sin(TAU * 0.23 * t) }),
      (t) => 260 + 120 * Math.sin(TAU * 0.17 * t),
      2.5
    ),
    0,
    0.35
  );
  return seamless(out, 1.0);
};

// ---------------------------------------------------------------- screams

/**
 * Somebody who has had enough.
 *
 * A scream is the one place a synthesised voice actually works. Nobody holds an
 * opinion about the exact timbre of a shriek the way they do about a speaking
 * voice, and a shriek has no words in it — so none of the objections that sank
 * the synthetic dining crowd apply here.
 *
 * What makes it read as a scream rather than a note is the *strain*: a band of
 * noise riding along above the pitch. Clean tone alone sounds like singing.
 */
function shriek({ dur, pitch, formants, rasp = 0.32, amp = 1 }) {
  const out = vowel({ dur, pitch, formants, amp, wobbleHz: 6.4, wobble: 0.035 });
  const air = bandpass(noise({ dur, amp: (t) => at(amp, t) }), (t) => at(pitch, t) * 3.2, 2.2);
  for (let i = 0; i < out.length; i++) out[i] += air[i] * rasp;
  return out;
}

/** Fast in, and not quite as fast out. */
const gate = (dur, attack, release) => (t) =>
  Math.max(0, Math.min(1, t / attack)) * Math.max(0, Math.min(1, (dur - t) / release));

/** A lady, startled, at some volume. Short — a long scream stops being a joke. */
sounds['scream-1'] = () => {
  const dur = 0.6;
  const out = buf(dur);
  // Up fast, held, then falling away as she runs out of it.
  const pitch = (t) => 740 + 280 * Math.min(1, t / 0.06) - 320 * Math.max(0, (t - 0.4) / 0.2);
  mix(
    out,
    shriek({
      dur,
      pitch,
      // "aaah", wide open
      formants: [[880, 1], [1350, 0.6], [2900, 0.18]],
      rasp: 0.36,
      amp: gate(dur, 0.028, 0.14),
    }),
    0,
    1
  );
  return out;
};

/**
 * The other one: three beats, high-dip-high, in the shape of the stock scream
 * everybody knows from the films. Ours, not theirs — same joke, own recipe.
 */
sounds['scream-2'] = () => {
  const dur = 0.8;
  const out = buf(dur);
  const beats = [
    // AAAH
    { at: 0, len: 0.3, from: 430, to: 340, f: [[790, 1], [1180, 0.55], [2600, 0.15]] },
    // -eee-
    { at: 0.3, len: 0.17, from: 520, to: 570, f: [[340, 1], [2250, 0.7], [3000, 0.2]] },
    // AAAH
    { at: 0.47, len: 0.33, from: 470, to: 300, f: [[760, 1], [1150, 0.5], [2500, 0.14]] },
  ];
  for (const b of beats) {
    mix(
      out,
      shriek({
        dur: b.len,
        pitch: (t) => b.from + (b.to - b.from) * (t / b.len),
        formants: b.f,
        rasp: 0.28,
        amp: gate(b.len, 0.02, 0.07),
      }),
      b.at,
      1
    );
  }
  return out;
};

/** A yelp. Barely a scream at all, which is why it is the funny one. */
sounds['scream-3'] = () => {
  const dur = 0.34;
  const out = buf(dur);
  const pitch = (t) => 880 + 420 * Math.min(1, t / 0.05) - 260 * Math.max(0, (t - 0.16) / 0.18);
  mix(
    out,
    shriek({
      dur,
      // "eee", pinched
      pitch,
      formants: [[420, 1], [2400, 0.75], [3100, 0.2]],
      rasp: 0.3,
      amp: gate(dur, 0.02, 0.1),
    }),
    0,
    1
  );
  return out;
};

// ------------------------------------------------------------------ music

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** A plucked string-ish bass. Short, round, stays out of the way. */
function pluck({ dur, freq, amp = 1 }) {
  const body = tone({ dur, freq, type: 'tri', amp: (t) => Math.exp(-t / (dur * 0.45)) });
  const click = lowpass(noise({ dur: 0.012, amp: hit(0.001, 0.004) }), 2200);
  const out = lowpass(body, (t) => 1600 * Math.exp(-t / 0.12) + 240);
  mix(out, click, 0, 0.25);
  for (let i = 0; i < out.length; i++) out[i] *= at(amp, i / SR);
  return out;
}

/** An off-beat chord stab. This is the sneaking-across-the-room sound. */
function pizz({ dur, freq, amp = 1 }) {
  const src = tone({ dur, freq, type: 'saw', amp: (t) => Math.exp(-t / (dur * 0.3)) });
  const out = bandpass(src, freq * 2.2, 2.6);
  for (let i = 0; i < out.length; i++) out[i] = (out[i] * 0.7 + src[i] * 0.4) * at(amp, i / SR);
  return out;
}

const shaker = (dur = 0.05) =>
  highpass(noise({ dur, amp: hit(0.002, dur * 0.25) }), 5200);

const kick = () => {
  const out = tone({ dur: 0.16, freq: (t) => 120 * Math.exp(-t / 0.045) + 42, amp: hit(0.004, 0.06) });
  return lowpass(out, 900);
};

/**
 * The jingle: eight bars of somebody being extremely pleased with themselves
 * while walking away from a disaster. C major, oom-pah bass, marimba on top, and
 * a shaker keeping it light enough to sit under the gags for three minutes.
 *
 * Chords: C  Am  F  G  |  C  Am  Dm  G
 */
sounds['music-jingle'] = () => {
  const BPM = 132;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const BARS = 8;
  const LOOP = BAR * BARS;
  const out = buf(LOOP + 1.6); // room for the last notes to ring

  // [bass root, bass fifth, chord tones]
  const bars = [
    [36, 43, [60, 64, 67]], // C
    [45, 52, [57, 60, 64]], // Am
    [41, 48, [53, 57, 60]], // F
    [43, 50, [55, 59, 62]], // G
    [36, 43, [60, 64, 67]], // C
    [45, 52, [57, 60, 64]], // Am
    [38, 45, [50, 53, 57]], // Dm
    [43, 50, [55, 59, 62, 65]], // G7
  ];

  // [bar, beat, midi, beats]
  const melody = [
    [0, 0, 67, 0.5], [0, 0.5, 64, 0.5], [0, 1, 67, 0.5], [0, 2, 72, 1],
    [1, 0, 69, 0.75], [1, 1, 67, 0.75], [1, 2, 64, 1],
    [2, 0, 65, 0.5], [2, 0.5, 69, 0.5], [2, 1, 72, 1], [2, 2.5, 69, 0.5],
    [3, 0, 67, 0.5], [3, 1, 71, 0.5], [3, 2, 74, 1],
    [4, 0, 76, 0.5], [4, 0.5, 72, 0.5], [4, 1, 67, 0.5], [4, 2, 64, 1],
    [5, 0, 69, 0.5], [5, 1, 72, 0.5], [5, 2, 76, 1],
    [6, 0, 74, 0.5], [6, 0.5, 72, 0.5], [6, 1, 69, 0.5], [6, 2, 65, 1],
    [7, 0, 67, 0.5], [7, 0.5, 71, 0.5], [7, 1, 74, 0.5], [7, 2, 79, 1.5],
  ];

  for (let bar = 0; bar < BARS; bar++) {
    const t0 = bar * BAR;
    const [root, fifth, chord] = bars[bar];

    // oom — pah — oom — pah
    mix(out, pluck({ dur: BEAT * 0.9, freq: hz(root) }), t0, 0.5);
    mix(out, pluck({ dur: BEAT * 0.9, freq: hz(fifth) }), t0 + BEAT * 2, 0.44);
    for (const beat of [1, 3]) {
      for (const n of chord) {
        mix(out, pizz({ dur: BEAT * 0.5, freq: hz(n) }), t0 + BEAT * beat, 0.11);
      }
    }

    // a light shaker on the off-beats only
    for (const beat of [0.5, 1.5, 2.5, 3.5]) {
      mix(out, shaker(), t0 + BEAT * beat, beat === 2.5 ? 0.16 : 0.11);
    }
    mix(out, kick(), t0, 0.32);
    mix(out, kick(), t0 + BEAT * 2, 0.24);
  }

  for (const [bar, beat, midi, beats] of melody) {
    mix(
      out,
      mallet({ dur: Math.max(0.3, beats * BEAT + 0.25), freq: hz(midi) }),
      bar * BAR + beat * BEAT,
      0.42
    );
  }

  return wrapTail(out, LOOP);
};

/**
 * The last nugget goes in and the gate lets go. A latch clacking back, then the
 * hinge, then a little chime that says *go*.
 */
sounds['gate-open'] = () => {
  const out = buf(1.3);
  // the latch
  mix(out, lowpass(noise({ dur: 0.05, amp: hit(0.001, 0.012) }), 2600), 0, 0.8);
  mix(out, mallet({ dur: 0.16, freq: 330, amp: 0.5 }), 0.01, 1);
  // the hinge swinging
  mix(
    out,
    bandpass(noise({ dur: 0.45, amp: swell(0.45, 1.6) }), (t) => 700 + 900 * t, 6),
    0.1,
    0.3
  );
  // and the way out
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    mix(out, mallet({ dur: 0.6, freq: f }), 0.3 + i * 0.08, 0.55);
  });
  mix(out, chirp({ dur: 0.12, from: 1800, to: 3200, amp: 0.25 }), 0.56, 1);
  return out;
};

/** The slide running out under him: a short, deflating puff. */
sounds['slide-empty'] = () => {
  const out = buf(0.42);
  mix(out, whistle({ dur: 0.26, from: 900, to: 340, amp: 0.5, curve: 0.7 }), 0, 1);
  mix(
    out,
    bandpass(noise({ dur: 0.3, amp: hit(0.01, 0.09) }), (t) => 1400 * Math.exp(-t / 0.12) + 260, 2),
    0.02,
    0.5
  );
  mix(out, tone({ dur: 0.14, freq: (t) => 90 - 30 * t, amp: hit(0.004, 0.05) }), 0.16, 0.4);
  return out;
};

/**
 * Ruff ruff. The one moment the player is told, without any doubt, *I know where
 * we are going* (§8).
 *
 * Two barks, the second lower and shorter, because one bark is a noise and two is
 * a dog telling you something. A bark is a burst of voice shaped by a throat: a
 * short buzzy vowel, opened by a fast filter sweep and cut off hard.
 */
sounds['bark'] = () => {
  const out = buf(0.78);

  const ruff = (t0, pitch, len, gain) => {
    const voice = tone({
      dur: len,
      freq: (t) => pitch * (1 - 0.35 * (t / len)),
      type: 'saw',
      amp: hit(0.006, len * 0.3),
    });
    // the mouth opening and shutting again
    const shaped = bandpass(voice, (t) => 900 + 1500 * Math.sin((Math.PI * t) / len), 2.4);
    const body = lowpass(voice, 1500);
    const one = new Float32Array(voice.length);
    for (let i = 0; i < one.length; i++) one[i] = body[i] * 0.55 + shaped[i] * 0.9;
    mix(out, one, t0, gain);
    // the bite of air at the front of it
    mix(out, bandpass(noise({ dur: 0.05, amp: hit(0.002, 0.014) }), 2600, 1.8), t0, gain * 0.5);
  };

  ruff(0, 210, 0.17, 1);
  ruff(0.26, 178, 0.2, 0.85);
  return out;
};


/**
 * The tell, out loud: a small animal yawn (§9). Squeaky on the way in, sighing
 * on the way out — the sound a sharp-eared player should learn to dread, because
 * it means their compass is about to nod off.
 */
sounds['yawn'] = () => {
  const out = buf(1.0);
  const len = 0.62;
  // the intake: a wavering little squeak climbing
  const squeak = tone({
    dur: len,
    freq: (t) => 380 + 420 * (t / len) + 30 * Math.sin(TAU * 7 * t),
    amp: swell(len, 1.3),
  });
  mix(out, lowpass(squeak, 2400), 0.02, 0.5);
  mix(
    out,
    bandpass(noise({ dur: len, amp: swell(len, 1.4) }), (t) => 500 + 900 * (t / len), 2.2),
    0.02,
    0.3
  );
  // and the sigh back out
  mix(out, whistle({ dur: 0.36, from: 620, to: 330, amp: 0.4 }), 0.62, 1);
  mix(
    out,
    bandpass(noise({ dur: 0.34, amp: hit(0.02, 0.12) }), (t) => 700 - 300 * t, 1.8),
    0.62,
    0.3
  );
  return out;
};

/** Woken up: a snort and a startled squeak, all at once. */
sounds['startle'] = () => {
  const out = buf(0.42);
  mix(out, bandpass(noise({ dur: 0.12, amp: hit(0.003, 0.03) }), 900, 1.6), 0, 0.7);
  mix(out, chirp({ dur: 0.12, from: 700, to: 1700, amp: 0.8 }), 0.04, 1);
  mix(out, chirp({ dur: 0.08, from: 1500, to: 1100, amp: 0.4 }), 0.17, 1);
  return out;
};

/** A menu tap. Wooden, tiny, no comedy required. */
sounds['ui-tap'] = () => {
  const out = buf(0.12);
  mix(out, mallet({ dur: 0.1, freq: 880 }), 0, 0.7);
  mix(out, mallet({ dur: 0.08, freq: 1320 }), 0, 0.3);
  return out;
};

// ------------------------------------------------------------------ run

/** Beds sit lower than effects so nothing has to fight the gags. */
const PEAK = {
  'scream-1': 0.82,
  'scream-2': 0.82,
  'scream-3': 0.78,
  'music-jingle': 0.5,
  'ui-tap': 0.5,
  'slide-empty': 0.6,
  bark: 0.8,
  yawn: 0.55,
  startle: 0.6,
  'gate-open': 0.8,
  'bed-yard': 0.34,
  // A near-empty room: nearly all of its energy is in a handful of clicks, so
  // it is levelled by the events rather than by an average nobody can hear.
  'bed-room': 0.5,
  'bed-stink': 0.4,
  slide: 0.6,
  sniff: 0.62,
  blame: 0.72,
  snore: 0.62,
};

fs.mkdirSync(OUT, { recursive: true });

let total = 0;
for (const [name, make] of Object.entries(sounds)) {
  seed = 0x9e3779b9; // same noise every run, so the wavs are reproducible
  const samples = normalize(fades(make()), PEAK[name] ?? 0.86);
  const bytes = writeWav(`${name}.wav`, samples);
  total += bytes;
  console.log(
    `${name.padEnd(12)} ${(samples.length / SR).toFixed(2)}s  ${(bytes / 1024).toFixed(0)} KB`
  );
}
console.log(`\n${Object.keys(sounds).length} sounds, ${(total / 1024 / 1024).toFixed(2)} MB total`);
