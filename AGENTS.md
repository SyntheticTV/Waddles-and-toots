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
  theme/
    palette.ts  the ink set, shared with the design bible
  ui/
    GameScreen  the loop, input, haptics, end card
    Room        Skia drawing, no rules
    Hud         meters and lines (RN text, not canvas text)
    Controls    d-pad and the two buttons
```

**The loop** runs the sim on the JS thread via `requestAnimationFrame` and
re-renders each frame. That is plenty for one room's worth of shapes and it keeps
every rule in plain, testable TypeScript. If a busy room drops frames, push
positions into shared values — don't move the rules into worklets.

## House rules for the code

- **Portrait only, locked.** Never add a landscape path. You climb the room:
  y = 0 is the entrance at the bottom, y = `level.height` is the exit at the top.
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
```
