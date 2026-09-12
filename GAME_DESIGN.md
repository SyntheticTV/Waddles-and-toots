# Waddles and Toots — Game Design Document

**Status:** Draft v0.3 — 2026-09-12
**Platform:** Expo (iOS / Android, web as a bonus)
**Audience:** Kids, and adults who are young at heart
**Session length:** 3 minutes or less per play

This file is the source of truth for the design. Update it here first, then build from it.

---

## 1. Premise

Four animal friends need to cross a room full of people without anyone figuring out
that the terrible smell is coming from Toots, the skunk who travels with them.

Waddles the penguin leads. He is collecting fish nuggets and is completely oblivious
to the smell. Everyone else is dealing with the consequences.

The joke is the gap: Waddles is having a wonderful time while an entire building
evacuates behind him.

---

## 2. Design pillars

1. **Laugh out loud, on a timer.** Something funny should happen every 15–20 seconds.
2. **Three minutes, start to finish.** Play a room, put the phone down, pick it up later.
3. **One thumb, two buttons.** A six-year-old should understand it without reading.
4. **Never punish curiosity.** Failing is funny, not sad. You always want one more try.

### Session rules that follow from the pillars

- A level is one room, crossed once. Target 90–150 seconds.
- Progress saves the moment a level ends. Nothing is ever lost by closing the app.
- No timers that run while the app is closed. No energy meters. No pressure to return.

---

## 3. Cast

| Character | Species | Role in play | Relationship to the stink |
|---|---|---|---|
| **Waddles** | Penguin | The player character. Everyone follows him. | Completely oblivious |
| **Toots** | Skunk | The clock | Creates it |
| **Fluffy** | Cat | The delay | Redirects blame away from it |
| **Mr. Sniffsalot** | Dog | The compass | His nose fails as it rises |
| **The local** | Varies by room | Neutral guide | Unaffected — they live here |

"Snoozalot" is not a character. It is a **condition the local might turn out to have.**

Every character is wired to the same meter. That is the spine of the whole design.

---

## 4. Core loop

```
Enter room  ->  follow Sniffsalot toward nuggets and the exit
            ->  stink rises, crowd gets suspicious
            ->  spend Fluffy to buy time / find fresh air to restore the nose
            ->  reach the exit before the crowd catches Toots
            ->  tally nuggets  ->  next room
```

**Win a level:** get the whole group through the exit on the far side of the room.
**Lose a level:** the crowd narrows the smell down to Toots and catches him.

Losing is a gag, not a game over — the crowd lifts Toots up, gets a face full of it,
and the group scatters out the door anyway. Retry is one tap.

---

## 5. The Stink Meter (central system)

The meter is the clock, the difficulty curve, and the comedy engine at once. It only
ever goes up on its own; everything the player does is about slowing it or spending it.

### What raises it

- A slow constant drip, just from Toots existing
- **Poofs:** every time Toots is *startled or bumped* — `gurgle gurgle` -> green poof
  from behind his tail -> a chunk added at once
- Belly-sliding near Toots rattles him, which causes poofs
- Crowded areas concentrate it faster than open ones

### What lowers or pauses it

- Fluffy's misdirection (see §7)
- Fresh air sources — open windows, ocean breeze, AC vents, an open fridge
- Leaving the area a poof happened in

### The three crowd stages

| Stage | Meter | Crowd behavior | Line |
|---|---|---|---|
| 1. **Sniff** | 0–33% | A head turns. A nose wrinkles. | *"...do you smell that?"* |
| 2. **Blame** | 34–66% | People investigate the wrong thing — the cheese, the mop bucket, the hot dog cart, the trash fish, someone's car | *"It's GOT to be the potato salad."* |
| 3. **Panic** | 67–100% | Hands waving, eyes watering, people crawling for the exits | *"EVERYBODY OUT!"* |

Blame targets are authored per level and get funnier as the meter climbs. They are
props in the room, so kids can spot them before the crowd does.

### Visibility

As the meter rises, a green haze thickens over the screen. By stage 3 the player
genuinely cannot see the exit — which is the moment Sniffsalot's nose (and the local,
if they are awake) stops being a bonus and becomes the thing that saves the run.

The haze must never hide the group itself, the nugget the player is standing on, or the
d-pad. It obscures *distance*, not the player.

---

## 6. Waddles — movement and the belly slide

- Waddle: steady four-direction movement. The others follow in a conga line.
- **Belly slide:** a fast burst. It leaves the group behind.
  - Hold it too long and a warning fires (sound + on-screen cue) and the player must
    return to the group before continuing.
  - Sliding past Toots or into scenery bumps him -> poof -> meter jumps.

The whole skill of the game lives here: **spacing**. Slide out for a far nugget, get
back before the crowd closes in on an unattended skunk.

---

## 7. Fluffy — misdirection

Fluffy does not stop the smell. He redirects the blame.

- **Plant a scapegoat:** Fluffy draws the crowd's attention onto a prop — the cheese
  cart, the mop bucket, the dumpster. Knocks the meter down a notch or freezes it.
- **Decoy skunk:** Fluffy turns up with white stripes down his back and lets himself
  get caught. The crowd goes *"AH HA! It was the CAT!"* … sniffs him … *"…that's not
  it either."* Buys the most time, and it is a reliable laugh every single time.

On a cooldown, so it is a resource and not a solution. Misdirection only ever delays
the truth, so the pressure always comes back.

---

## 8. Mr. Sniffsalot — the compass

- Early in a round his nose is sharp: a clear indicator points at the nearest fish
  nuggets and at the exit.
- As the meter climbs his nose degrades, in stages:
  1. The pointer drifts
  2. It lags behind and wobbles
  3. He sneezes and points confidently at completely the wrong thing (a mop)
  4. He gives up and sits down
- **Fresh air resets him.** Open windows, ocean breezes, vents, an open freezer case.
  A few glorious seconds of a perfect lock-on.

This gives the player a reason to route through fresh air instead of only chasing
nuggets, and it makes the late round funny instead of frustrating.

---

## 9. The local — and the Snoozalot

**Every room has a local.** An animal who lives there, doesn't care about the smell,
and knows the way out. Find them and they point — at the exit, at a fish nugget stash,
or at a fresh-air source.

The local is a different animal in every room, chosen to fit the place:

| Room | The local |
|---|---|
| Backyard BBQ | A squirrel in the tree |
| Beach | A dolphin just past the surf |
| Fine restaurant | A mouse behind the kitchen baseboard |
| Firehouse kitchen | The firehouse dalmatian |
| School | The classroom hamster |
| Grocery store | A lobster in the tank, pointing with a claw |
| Laundromat | A moth |
| Library | The library cat |
| Elevator | A spider in the ceiling corner |
| Movie theater | A mouse working through the spilled popcorn |
| Airplane cabin | A very nervous parrot |
| Petting zoo | A goat (it is still never the goats) |

Locals are a reason to explore the room instead of beelining for the exit, and they
give every level its own little friend to discover.

### The Snoozalot

**Once in a while, the local turns out to be a Snoozalot.** Not a species — a surprise.
Any local can be one.

They start giving directions perfectly normally, and then: a yawn. A slow blink. The
head-drop. A snore bubble, still pointing at the ceiling. Sometimes they make it all
the way through and are genuinely useful. You don't find out which one you've got
until it happens.

Design notes:
- Roughly 1 in 4 rooms, and never two in a row.
- There is always a **tell** a sharp-eyed kid can spot a second early — droopy eyelids,
  a slow sway, one yawn before the real one. Spotting the tell is its own little game.
- A sleeping local can be woken: bump into them, or let a poof go off nearby. They wake
  up startled, point somewhere random, and go straight back to sleep.
- The local is always a bonus and never something the player depends on, so an
  unreliable one never feels unfair.

---

## 10. Screen and controls

**Portrait only.** Locked. Grab the phone or iPad and play — never turn the device.
This is a pick-it-up-for-three-minutes game and rotating is friction.

### What portrait means for a room

The room runs **vertically**: the group enters at the bottom of the screen and the exit
is at the top. The camera follows Waddles up the room.

- The conga line trails *below* Waddles, so it is always on screen and readable.
- The crowd fills the room ahead, so the player is always looking into the trouble.
- Rooms are tall and fairly narrow. A wide room (the beach) becomes a tall one by
  turning the walk into a walk up the sand.
- The green haze creeps down from the top — it eats the exit first, which is exactly
  the thing the player needs to see.

### Layout

```
┌─────────────────────┐
│  stink meter        │  top, under the safe area
│                     │
│      the exit       │  top of the room
│         ↑           │
│      the crowd      │
│         ↑           │
│   Waddles + line    │  camera keeps him low-center
│                     │
│  [d-pad]     (A)(B) │  bottom thumb zone
└─────────────────────┘
```

Respect the safe areas — notch at the top, home indicator at the bottom. Nothing
important within a thumb's width of the bottom edge except the controls themselves.

### Controls

Touch, sized for small hands.

| Control | Placement | Action |
|---|---|---|
| D-pad / thumbstick | Bottom left | Move Waddles up / down / left / right |
| **A — Slide** | Bottom right | Belly-slide burst (limited, strands the group) |
| **B — Decoy** | Bottom right | Send Fluffy to misdirect (cooldown) |

Nothing else. No menus during play, no pause-screen management.

---

## 11. Fish nuggets

- Coin-like fish nuggets, scattered through each room, reasonably easy to spot and reach.
- They are the score, not the objective — you can finish a room with none and still win.
- Some sit in tempting places: past the crowd, near a blame prop, or right next to
  something that will bump Toots.

Nuggets carry between levels and feed the meta-reward (see §13).

---

## 12. Levels

Each level is one room crossed entrance-to-exit, with an escape that suits the place.

### Launch set

| # | Level | Exit | The local | Blame targets |
|---|---|---|---|---|
| 1 | Backyard BBQ | The side gate | Squirrel | Potato salad, the grill, Uncle's shoes |
| 2 | Beach | Boardwalk ramp | Dolphin | Seaweed, low tide, the bait bucket |
| 3 | Fine restaurant | Kitchen's back door | Kitchen mouse | Truffles, the cheese cart, the wine |
| 4 | Firehouse kitchen | The pole / bay door | The dalmatian | The chili pot, turnout gear, the boots |
| 5 | School | Gym fire doors | Classroom hamster | The cafeteria, the locker room, a kid named Kevin |

### Candidate levels

- **Elevator** — tiny room, worst possible place, floor-by-floor escape *(top pick)*
- **Yoga class** — deep breaths. deep, terrible breaths. *(top pick)*
- **Movie theater** — dark and hazy already, popcorn butter to blame
- **Grocery store** — durians, seafood counter, cheese aisle: blame targets everywhere
- **Public pool locker room** — everyone already suspects everyone
- **Petting zoo / county fair** — "it's the goats!" (it is never the goats)
- **Library** — must stay quiet, so people react in furious whispers
- **Airplane cabin** — one aisle, no escape, exit row at the end
- **Wedding reception** — blame the fish course, and the grandma who says nothing
- **Laundromat** — the one place where "something smells" is an actual mystery

### Level authoring checklist

Every room needs: an entrance, an exit, **a local**, 3+ blame props, 1–2 fresh-air
sources, a nugget layout, a crowd density map, and at least one prop that bumps Toots.

---

## 13. Progression

- Levels unlock in order; completed levels are replayable for a better nugget haul.
- Nuggets feed a shared trough — a between-levels beat where the four of them eat,
  which is where hats, scarves and silly accessories get unlocked.
- Per-level stars: **crossed it** / **crossed it with most nuggets** / **crossed it
  without a single poof**.

---

## 14. Comedy rules

1. **Escalate, never repeat.** A gag used in stage 1 must change by stage 3.
2. **The animals never speak.** Sounds and faces only. People speak.
3. **Waddles never acknowledges the smell.** Not once. It is funnier every time.
4. **Sound carries the joke.** `gurgle gurgle`, the poof, the crowd's slow "ohhhh no".
5. **Failure is a punchline.** Every loss ends on a gag, not a sad noise.
6. **Nothing gross is ever shown.** Green clouds, watering eyes, waving hands. That's it.

---

## 15. Technical approach (proposed)

- **Expo SDK**, TypeScript, React Native
- **Rendering:** `@shopify/react-native-skia` for the play surface (2D canvas-style
  drawing at 60fps), with the room drawn as layered sprites
- **Game loop / motion:** `react-native-reanimated` on the UI thread
- **Audio:** `expo-audio` — sound is doing heavy comedic lifting, budget for it
- **Haptics:** `expo-haptics` — a little buzz on every poof
- **Save:** `@react-native-async-storage/async-storage`; save on level end, always
- **Art:** flat vector-style sprites, heavy outlines, exported as sprite sheets

Decision still open — Skia vs. a WebView-hosted 2D engine. Skia is the recommendation:
it keeps everything in one Expo codebase and performs well on low-end Android.

---

## 16. Open questions

1. ~~What is Snoozalot?~~ **Resolved:** every room has a local, and any local can turn
   out to be a Snoozalot. See §9.
2. ~~Portrait or landscape?~~ **Resolved: portrait, locked.** See §10.
3. Does the crowd catching Toots end the level, or just cost nuggets and continue?
4. How many rooms in the first release?
5. Does the player ever control anyone but Waddles?
