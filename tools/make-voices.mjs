/**
 * Records every line the crowd says, once, at build time.
 *
 * The game has a small, fixed script — every line is either authored on a prop
 * in a level file or sits in `src/audio/lines.ts` — so there is no reason to ask
 * a speech API anything at runtime. Each line is sent off once and the result
 * lands in `assets/voice/`, which the app then plays like any other sound:
 * offline, instantly, and without a credential anywhere near the bundle.
 *
 * This file owns the *casting* — who says what, in which voice. It does not own
 * the credentials, and there are two ways to get the audio made:
 *
 *   1. Hand the job to a tool that already has the credentials (how this game's
 *      voices were actually recorded, so no key ever came near this repo):
 *
 *        npm run voices -- --plan ../SomeAudioApp/plan.json
 *        cd ../SomeAudioApp && node record-the-plan.mjs
 *        npm run voices -- --manifest-only
 *
 *      The recorder reads the plan, writes `<id>.mp3` into the plan's `outDir`,
 *      and `--manifest-only` then regenerates `src/audio/voiceClips.ts` from
 *      whatever files exist. Anything the recorder skipped simply keeps using the
 *      device voice.
 *
 *   2. Or set VOICE_API_URL and VOICE_API_KEY in `.env` (see `.env.example`) and
 *      run `npm run voices`, which calls the API itself.
 *
 * Either way `npm run voices -- --dry-run` shows the plan and calls nothing, and
 * re-running only pays for lines whose text or casting actually changed.
 *
 * A recorded line should be **topped, tailed and levelled** before it lands here:
 * raw output carries up to a second of silence before anybody speaks, which is
 * fatal for a gag that has to land the instant it fires.
 */

import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'voice');
const MANIFEST = path.join(ROOT, 'src', 'audio', 'voiceClips.ts');

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
/** Write the plan as JSON for another tool to execute, and call nothing here. */
const PLAN_TO = argAfter('--plan');
/** Rebuild the manifest from whatever is already on disk. */
const MANIFEST_ONLY = process.argv.includes('--manifest-only');

function argAfter(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

// --------------------------------------------------------------- the cast
//
// Who says what.
//
// A line always comes back in the same voice, so the person who blames the
// potato salad is recognisably not the person who blames the grill. That is the
// whole point of recording rather than pitch-shifting one device voice: a party
// should sound like a room full of different people.
//
// These are Chirp3-HD voices, which are the most natural on offer — and, being
// modern voices, they ignore SSML and pitch entirely. Character therefore comes
// from *casting*, not from knobs: pick a different person, not a different pitch.
//
// Casting is **by line id, never by position**. Levels are going to be added and
// props are going to be reordered, and if voices were handed out by index then
// inserting one prop into level one would re-cast every line after it and force
// the lot to be recorded again. Anything already recorded is pinned here; a line
// that is not pinned draws from the pool, deterministically, by its own id — so
// a new level's crowd is cast the moment it is written, and nobody else moves.

/** Already recorded, and therefore fixed. Do not reshuffle these. */
const CAST_BY_ID = {
  'backyard-bbq--potato-salad': 'Kore', // absolutely certain
  'backyard-bbq--grill': 'Fenrir', // alarmed
  'backyard-bbq--uncles-shoes': 'Gacrux', // this has happened before
  'backyard-bbq--trash-can': 'Puck', // indignant
  'backyard-bbq--kiddie-pool': 'Vindemiatrix', // weary

  'noticed-1': 'Achernar',
  'noticed-2': 'Umbriel',
  'noticed-3': 'Leda',

  'panic-1': 'Algenib',
  'panic-2': 'Sulafat',
  'panic-3': 'Schedar',

  'caught-1': 'Orus',
  'caught-2': 'Despina',
  'caught-3': 'Rasalgethi',

  // The cat gag, all in one voice — it is one person being wrong and then
  // finding out, and it only works if it is the same person both times (§7).
  /*
   * The group itself. Waddles is not on this list and never will be: he has not
   * noticed anything (§14.2).
   */
  'animal-asleep-1': 'Leda',
  'animal-asleep-2': 'Enceladus',
  'animal-asleep-3': 'Callirrhoe',

  /*
   * Room two. Two diners landed on the same voice by chance, which is exactly
   * what this table is for — the manager complainer is pinned somewhere else so
   * the room sounds like a room full of different people.
   */
  'fine-restaurant--table-four': 'Pulcherrima',
  'fine-restaurant--truffle-plate': 'Rasalgethi',

  /*
   * Room four. The incense and the tea urn both drew Alnilam — two people
   * standing a few feet apart in the same voice — so the tea is pinned
   * elsewhere. This is the table doing its job, not a bug.
   */
  'sunrise-yoga--tea-urn': 'Laomedeia',

  /*
   * Room five drew three collisions out of eight, which is about what eight
   * lines out of a fifteen-voice pool should do. Pinned so the beach sounds like
   * eight different people rather than five.
   */
  'sunset-beach--sunscreen': 'Achird',
  'sunset-beach--old-cooler': 'Autonoe',
  'sunset-beach--boardwalk-bins': 'Erinome',

  /*
   * Room six has eleven suspects, which is the most of any room and more than a
   * fifteen-voice pool can hand out cleanly — three of them collided. Pinned so
   * the supermarket sounds like eleven different shoppers.
   */
  /* Room seven: two pairs landed together out of eight. */
  'gate-14-departures--food-court': 'Laomedeia',
  'gate-14-departures--toilet-door': 'Sadachbia',

  'big-save-grocery--rotisserie': 'Zephyr',
  'big-save-grocery--abandoned-trolley': 'Aoede',
  'big-save-grocery--bleach-aisle': 'Zubenelgenubi',

  'decoy-1': 'Iapetus',
  'decoy-2': 'Iapetus',
  'decoy-cat': 'Iapetus',
};

/**
 * Everyone else at the party, for lines that have not been cast by hand. All
 * thirty Chirp3-HD voices exist; these are the ones not already spoken for, so a
 * new room draws strangers rather than the people from the last one.
 */
const POOL = [
  'Achird', 'Algieba', 'Alnilam', 'Charon', 'Enceladus', 'Laomedeia',
  'Sadachbia', 'Sadaltager', 'Zubenelgenubi', 'Aoede', 'Autonoe',
  'Callirrhoe', 'Erinome', 'Pulcherrima', 'Zephyr',
];

const voiceName = (short) => `en-US-Chirp3-HD-${short}`;

/** The voice for a line, pinned if we have recorded it, drawn from the pool if not. */
function castFor(id) {
  const pinned = CAST_BY_ID[id];
  if (pinned) return { name: voiceName(pinned) };
  // Stable, and independent of how many other lines exist or what order they
  // are in: the same id always lands on the same voice.
  const n = parseInt(hash(id), 16) % POOL.length;
  return { name: voiceName(POOL[n]) };
}

const LANGUAGE = 'en-US';

// ------------------------------------------------------- reading the game

function loadProjectModules() {
  const require = createRequire(pathToFileURL(path.join(ROOT, 'package.json')));
  const ts = require('typescript');
  for (const ext of ['.ts']) {
    Module._extensions[ext] = function (mod, filename) {
      const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true,
        },
        fileName: filename,
      });
      mod._compile(out.outputText, filename);
    };
  }
  return {
    levels: require(path.join(ROOT, 'src/levels/index.ts')),
    lines: require(path.join(ROOT, 'src/audio/lines.ts')),
    engine: require(path.join(ROOT, 'src/game/engine.ts')),
  };
}

/** Every line in the game, with who says it and what it should be called. */
function collectLines() {
  const { levels, lines, engine } = loadProjectModules();
  const out = [];

  // Authored per level: each blame prop is its own person.
  for (const level of levels.LEVELS) {
    for (const prop of level.props) {
      if (!prop.blameLine) continue;
      const id = `${level.id}--${prop.id}`;
      out.push({ id, text: prop.blameLine, role: 'blame', voice: castFor(id) });
    }
  }

  const stock = [
    ['noticed', lines.NOTICED],
    ['panic', lines.PANIC],
    ['caught', lines.CAUGHT],
    ['decoy', lines.DECOY_PAYOFF],
  ];
  for (const [role, list] of stock) {
    list.forEach((text, i) => {
      const id = `${role}-${i + 1}`;
      out.push({ id, text, role, voice: castFor(id) });
    });
  }

  /*
   * The toot reactions, which are by far the longest list in the game and the
   * one most likely to be added to.
   *
   * Their ids come from the *text*, not from the position, so writing a new
   * joke into the middle of the list costs one recording rather than re-casting
   * and re-recording all seventy. This is the rule the rest of the casting
   * follows too (see above); it just matters more here than anywhere else.
   */
  for (const text of lines.TOOT_REACTIONS) {
    const id = `toot--${hash(text)}`;
    out.push({ id, text, role: 'toot', voice: castFor(id) });
  }

  out.push({
    id: 'decoy-cat',
    text: engine.DECOY_CAT_LINE,
    role: 'decoy',
    voice: castFor('decoy-cat'),
  });

  // The group's own lines. The animals talk now (§14.2) — except Waddles, who
  // has not noticed anything and never will.
  engine.ASLEEP_LINES.forEach((text, i) => {
    const id = `animal-asleep-${i + 1}`;
    out.push({ id, text, role: 'animal', voice: castFor(id) });
  });

  return out;
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

const stampOf = (line) => hash(`${line.text}|${line.voice.name}`);

// ------------------------------------------------------------- the one seam
//
// THE ONLY PART THAT KNOWS ABOUT YOUR API.
//
// Written against the shape Google's Text-to-Speech REST endpoint uses: POST a
// JSON body, get back `audioContent` as base64. If your endpoint differs, this
// function is the only thing that changes — everything else works off whatever
// bytes it returns.

async function synthesize(line) {
  const url = process.env.VOICE_API_URL;
  const key = process.env.VOICE_API_KEY;
  if (!url) throw new Error('VOICE_API_URL is not set — see .env.example');

  const headers = { 'Content-Type': 'application/json' };
  if (key) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      input: { text: line.text },
      voice: { languageCode: LANGUAGE, name: line.voice.name },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  const body = await response.json();
  if (!body.audioContent) throw new Error('no audioContent in the response');
  return Buffer.from(body.audioContent, 'base64');
}

// -------------------------------------------------------------- the manifest

function writeManifest(recorded) {
  const entries = recorded
    .map(
      (line) =>
        `  ${JSON.stringify(line.text)}: require('../../assets/voice/${line.id}.mp3'),`
    )
    .join('\n');

  const file = `/**
 * Recorded crowd lines. GENERATED by tools/make-voices.mjs — do not edit.
 *
 * Keyed by the line itself, so anything that has a recording plays it and
 * anything that does not falls back to the device voice. Run \`npm run voices\`
 * after changing or adding a line.
 */

export const VOICE_CLIPS: Record<string, number> = {
${entries}
};

/** The recording for a line, if there is one. */
export function clipFor(text: string): number | undefined {
  return VOICE_CLIPS[text];
}
`;
  fs.writeFileSync(MANIFEST, file);
}

// ------------------------------------------------------------------- run

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // No .env yet. --dry-run still works; a real run will complain below.
}

const lines = collectLines();
const stamps = path.join(OUT_DIR, '.stamps.json');
let previous = {};
try {
  previous = JSON.parse(fs.readFileSync(stamps, 'utf8'));
} catch {
  previous = {};
}

const todo = lines.filter((l) => FORCE || previous[l.id] !== stampOf(l));
const chars = todo.reduce((n, l) => n + l.text.length, 0);

console.log(`${lines.length} lines in the game, ${todo.length} to record (${chars} characters).\n`);
for (const line of lines) {
  const state = todo.includes(line) ? 'record' : 'have  ';
  console.log(
    `  ${state}  ${line.id.padEnd(26)} ${line.voice.name.padEnd(17)} "${line.text}"`
  );
}

if (DRY_RUN) {
  console.log('\n--dry-run: nothing called, nothing written.');
  process.exit(0);
}

if (PLAN_TO) {
  /*
   * Clear out the recordings this plan supersedes, before handing it over.
   *
   * We know which lines changed — the stamps say so — but the tool on the other
   * end is a simple one that skips anything already on disk. Without this, a line
   * that has been *re-cast* is quietly skipped and keeps the old voice: the text
   * is the same and the file is there, so nothing looks wrong. That has now
   * happened twice, both times silently, and both times the fix was to delete one
   * file by hand and run it again.
   */
  let cleared = 0;
  for (const line of todo) {
    const stale = path.join(OUT_DIR, `${line.id}.mp3`);
    if (fs.existsSync(stale)) {
      fs.rmSync(stale);
      cleared++;
    }
  }
  if (cleared) console.log(`
cleared ${cleared} recording(s) whose text or casting changed`);

  // Hand the whole job to another tool — one that already holds the credentials
  // — rather than asking for them here. It writes the mp3s; we own the casting.
  fs.writeFileSync(
    PLAN_TO,
    JSON.stringify(
      {
        languageCode: LANGUAGE,
        outDir: OUT_DIR,
        lines: lines.map((l) => ({ id: l.id, text: l.text, voice: l.voice.name })),
      },
      null,
      2
    )
  );
  console.log(`\nPlan for ${lines.length} lines written to ${PLAN_TO}`);
  process.exit(0);
}

if (MANIFEST_ONLY) {
  const have = lines.filter((l) => fs.existsSync(path.join(OUT_DIR, `${l.id}.mp3`)));
  for (const line of have) previous[line.id] = stampOf(line);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(stamps, JSON.stringify(previous, null, 2));
  writeManifest(have);
  console.log(`\nManifest rebuilt: ${have.length}/${lines.length} lines have a recording.`);
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let failed = 0;
for (const line of todo) {
  try {
    const audio = await synthesize(line);
    fs.writeFileSync(path.join(OUT_DIR, `${line.id}.mp3`), audio);
    previous[line.id] = stampOf(line);
    console.log(`  recorded  ${line.id}  (${(audio.length / 1024).toFixed(0)} KB)`);
  } catch (error) {
    failed++;
    console.error(`  FAILED    ${line.id}: ${error.message}`);
  }
}

fs.writeFileSync(stamps, JSON.stringify(previous, null, 2));

// Only lines that actually have a file on disk go in the manifest; the rest keep
// falling back to the device voice, so a half-finished run still leaves a game
// that talks.
const onDisk = lines.filter((l) => fs.existsSync(path.join(OUT_DIR, `${l.id}.mp3`)));
writeManifest(onDisk);

console.log(`\n${onDisk.length}/${lines.length} lines recorded.`);
if (failed) {
  console.log(`${failed} failed — those keep using the device voice until they work.`);
  process.exit(1);
}
