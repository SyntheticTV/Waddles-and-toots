# Waddles and Toots

A comedy game for kids and adults who are young at heart. Four animals have to
cross a crowded room before anyone works out that the smell is coming from the
skunk.

**Read [GAME_DESIGN.md](GAME_DESIGN.md) before changing anything about how the
game plays.** It is the source of truth for the design; this file is only about
the code.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any code.

## Stack

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript

- `@shopify/react-native-skia` — the play surface
- `react-native-reanimated` v4 (+ `react-native-worklets`) — gesture plumbing, and
  the escape hatch if rendering ever needs the UI thread. No `babel.config.js` is
  needed: babel-preset-expo 57 wires the worklets plugin automatically. Don't add
  one.
- `react-native-gesture-handler` — the d-pad and buttons
- `expo-audio`, `expo-haptics` — sound is doing heavy comedic lifting; every poof
  gets a haptic
- `expo-speech` — the crowd's lines, spoken. The animals never get a voice; that
  rule comes from GAME_DESIGN.md §14.2 and it is not a style preference
- `@react-native-async-storage/async-storage` — save on level end, always

## Layout

```
src/
  game/
    types.ts    shared shapes (levels, props, stages)
    tuning.ts   every number that decides how the game feels
    stink.ts    the stink meter — pure, no React, no Skia
    engine.ts   the simulation for one room: step(state, dt, input)
  levels/
    <level>.ts  one room each, authored in world units
  art/
    ink.ts        the drawing kit: path cache, outline weights, the 100-unit box
    shading       gradients, rim light, fur, eyes, ground shadows
    characters    the cast, plus the crowd
    props         one drawing per prop id, with fallbacks per kind
    scenery       ground, side fences, the exit gate, the vignette
    effects       nuggets, poofs, pointers
    titleCast     the four of them on the home screen
  audio/
    library.ts    the catalogue: gain, voices, and which event sounds like what
    audio.ts      the service: one-shots, the beds, the jingle, the settings
    voices.ts     the people talking, through the device's text-to-speech
  settings.ts   two switches, remembered between sessions
  theme/
    palette.ts  the ink set and the art set, shared with the design bible
  ui/
    HomeScreen    title, START, Settings
    SettingsPanel the two switches
    GameScreen    the loop, input, haptics, end card
    Room          camera, draw order, composition — no shapes of its own
    Hud           meters and lines (RN text, not canvas text)
    Controls      d-pad and the two buttons
```

Generated things live outside `src/`:

```
assets/audio/*.wav   the sound set — build output, never hand-edited
tools/make-sounds.mjs  the source of that sound set: npm run sounds
```

**The art is vector, drawn in Skia** — no sprite sheets, no image assets. Every
character lives in a 100-unit box with its feet at the origin (see `art/ink.ts`),
so one drawing serves a phone and an iPad, and a character can be recoloured
(Fluffy in his stripes) without a second asset. Paths are authored as SVG strings
and parsed once into a module-level cache; never build a path string from a value
that changes per frame, or the cache grows forever.

Characters face the camera and mirror to turn. Expressions are always props
handed down from `RunState` — the art never decides anything, so it cannot
disagree with the simulation.

**One light, upper-left.** Every gradient runs from that corner, every rim light
sits on that side, every shadow falls to the lower right. It is the single rule
that makes a penguin, a grill and a shed look like they are in the same yard, so
don't light one thing differently because it looks nicer alone.

Gradients cost a shader per frame, so `Form` is for the big masses only — a body,
a head, a lid — and everything smaller uses `Cel` or a flat fill. If a busy room
ever drops frames, the static scenery is the thing to bake into a Skia `Picture`;
the rules stay where they are.

**Two coordinate spaces, and mixing them up is the easy bug.** The camera zooms
(close in normal play, wide while sliding) and pans in both axes, so:

- `roomX/roomY` are the room at camera zero. Everything world-static — the ground,
  the props, the gate — is drawn in these and slid into place by the *one* group
  transform that wraps them. That is what keeps a few hundred unchanging nodes
  memoised instead of re-rendered every frame.
- `toScreenX/screenY` are actual screen pixels, for everything that moves:
  animals, nuggets, poofs, sparks, pointers.

Draw a prop with `toScreenX` and it will slide twice as fast as the floor it is
standing on. `scale` is pixels per world unit *including* the zoom, so anything
sized off it follows the camera for free.

**The stink meter is one-way.** Nothing in the game may lower it — not a decoy,
not fresh air, not a good deed. Tools buy *time*: a decoy freezes it while the
crowd is distracted, fresh air freezes it while you stand in it, and that is the
whole of the relief on offer (GAME_DESIGN.md §5). If a change seems to need the
meter to fall, the answer is a longer freeze or a slower drift, never a subtraction
— the one-way clock is what makes the back half of a room feel like the back half
of a room.

A corollary worth knowing before you tune anything: because nothing is ever won
back, **every cost is permanent**, so costs have to be priced accordingly. Poofs
were repriced from 9 to 6 when the meter became one-way, because five clumsy
bumps were ending a round that had barely started.

**Every in-game control is a gesture-handler gesture, never a `Pressable`.**
Sliding means holding the d-pad *and* the A button at the same time, and mixing
React Native's touch responder with gesture-handler drops whichever finger came
second — so the slide silently never fired while you were moving. For the same
reason a held button is never `disabled`: a `Pressable` that goes disabled
mid-press never fires `onPressOut`, which strands the input as held. Grey the
button out, but always let the gesture finish. Menus are outside play and can use
`Pressable` freely.

**Audio is a service, not a hook.** The jingle plays across the home screen, the
settings panel and the room, and no screen outlives another — so `audio.ts` owns
the players, the app starts it once, and screens call into it. `enterGame` and
`leaveGame` bracket the two room beds; the music ignores both.

**Secrets live in `.env`, and `.env` is only ever read by `tools/`.** Those
scripts run on a developer's machine at build time. Nothing in `.env` reaches the
app, because a key inside a mobile app can always be extracted from it — Expo
inlines `EXPO_PUBLIC_*` into the bundle in plaintext, and that is the only kind
of env var app code can see. If a feature seems to need a credential at runtime,
that is the signal to move the work to build time instead, which is exactly what
happened with the voices.

**The crowd's lines are recorded at build time** by `npm run voices`, which walks
every level and `src/audio/lines.ts` and writes `assets/voice/` plus the
generated `src/audio/voiceClips.ts`. Recordings are committed, because a fresh
clone has no API key and must still have a game that talks. `--dry-run` shows the
plan without calling anything; re-running only pays for lines whose text or
casting changed.

The voices in this repo were recorded by handing `--plan` to a separate tool that
already held the credentials, so no key ever entered this project. That is the
preferred route and `tools/make-voices.mjs` documents it. This file owns the
casting either way: **character comes from picking a different person, not from
pitching one voice up and down** — the Chirp3-HD voices ignore pitch and SSML
entirely, and a party should sound like a room full of different people.

Casting is **by line id, never by position**, so adding a level or reordering a
level's props never re-casts anybody and never forces a re-record. Lines already
recorded are pinned in `CAST_BY_ID`; anything new draws from `POOL` by a hash of
its own id. If two people in one room happen to land on the same voice, pin one
of them by hand — that is what the table is for.

**Any line without a recording still gets spoken** by the device. That fallback
is load-bearing: it means a new joke can be written into a level and heard on the
next reload, before anybody re-runs the recorder.

**The talking is text-to-speech, not audio files.** Blame lines are authored per
level and read out by the device voice, which means a new level's jokes are
spoken the moment somebody writes them — no recording session, no re-export. The
cost is that the voice is whatever the device has, so nothing may depend on how
it sounds: every spoken line is also on screen, and the game is fully playable
with Voices off. `voices.ts` allows exactly one line at a time, by priority, and
it is the only module that may import `expo-speech`.

**The sound is synthesised, not recorded.** `tools/make-sounds.mjs` is the source
and `assets/audio/*.wav` is the build output, the same relationship the art has
with its path data. To change a sound, change its recipe and run `npm run
sounds`; never hand-edit a wav, because the next run will overwrite it. The
script has no dependencies and its noise source is seeded, so the same code
always produces the same bytes.

`useGameAudio` follows the same contract as the art: it reads `RunState` and
makes noise, and decides nothing. One-shots come from the events the engine
already reports; the things the engine has no event for — the room turning, a
slide starting, a lungful of fresh air — are edge-triggered inside `follow`.

**The loop** runs the sim on the JS thread via `requestAnimationFrame` and
re-renders each frame. That is plenty for one room's worth of shapes and it keeps
every rule in plain, testable TypeScript. If a busy room drops frames, push
positions into shared values — don't move the rules into worklets.

## House rules for the code

- **Portrait only, locked.** Never add a landscape path. World y still runs from
  0 at the bottom of the room to `level.height` at the top — but which end you
  are *heading for* is the level's business, not an assumption. From room four
  the group starts in the middle and the way out can be at either end, so ask
  `exitFacesUp(level)` rather than assuming the top. The camera, the gate art and
  the dog's nose all read it; anything new that cares about "forward" must too.
  Rooms are still only ever climbed or descended — the width is fixed at
  `WORLD_WIDTH` and a side exit is not supported yet.
- **Rooms are authored in world units,** `WORLD_WIDTH` (100) across and as tall as
  the level says, so a room plays the same on a phone and an iPad. Never author a
  level in pixels.
- **Keep game rules pure.** Anything that decides what happens — the meter,
  suspicion, the nose — stays a plain function in `src/game/`, testable without a
  device. React and Skia only draw the result.
- **Tuning numbers live in `tuning.ts`,** never inline at the call site. The whole
  game hangs off the stink meter, so a magic number buried in a component is a
  difficulty change nobody can find later.
- **Nothing gross is ever drawn.** Green clouds, watering eyes, waving hands.
  That is the entire vocabulary.

## Commands

```
npm start          expo start
npm run android    run on Android
npm run ios        run on iOS (macOS only)
npm run web        run in a browser
npm run typecheck  tsc --noEmit
npm run sounds     regenerate assets/audio from tools/make-sounds.mjs
```
