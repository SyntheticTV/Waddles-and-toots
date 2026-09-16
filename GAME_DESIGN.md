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

**Win a level:** collect **every** fish nugget in the room, then get the whole
group through the exit on the far side of it. The gate will not open until the
last nugget is in — Waddles is not leaving good food behind, and he is not
listening to anybody's opinion about it.

**Lose a level**, either way:

- The crowd narrows the smell down to Toots and catches him, or
- **anybody in the room physically touches Toots.** However calm the room looks,
  a hand on the skunk ends the round then and there. Steering a skunk through a
  crowd without letting anyone brush against him is the moment-to-moment game;
  the meter is the pressure that makes it hard.

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

### What pauses it

**Nothing lowers it. Ever.** The meter is a one-way clock: the room only gets
worse, and every tool the player has buys *time*, not relief. That is what makes
the back half of a level feel like the back half of a level.

- Fluffy's misdirection holds it where it is while the crowd is distracted (§7)
- **Fresh air** holds it where it is — but only while you are standing in it.
  There is no lingering benefit you can carry away with you; step out and the
  clock starts again. Fresh air is a place, not a pickup.

### The three crowd stages

| Stage | Meter | Crowd behavior | Line |
|---|---|---|---|
| 1. **Sniff** | 0–33% | A head turns. A nose wrinkles. | *"...do you smell that?"* |
| 2. **Blame** | 34–66% | People investigate the wrong thing — the cheese, the mop bucket, the hot dog cart, the trash fish, someone's car | *"It's GOT to be the potato salad."* |
| 3. **Panic** | 67–100% | Hands waving, eyes watering — and a ring of them closing in on the skunk to throw him out | *"EVERYBODY OUT!"* |

Blame targets are authored per level and get funnier as the meter climbs. They are
props in the room, so kids can spot them before the crowd does.

### The crowd closes in

People do not only stand about smelling things. The higher the meter, the more of
them break off and walk at Toots — they have worked out roughly where it is coming
from and they want it *out*. They are slower than Waddles, so they can always be
outrun, but they cannot be ignored, and a room full of them converging is what
turns the back half of a level into a chase.

This is what Fluffy is *for*. A decoy does not slow the meter so much as break the
chase: everyone currently walking at Toots turns round and goes to look at
whatever Fluffy has pinned it on, which buys the seconds needed to get past them.
The loop the player learns is **spot the closing ring -> spend the decoy -> move
through the gap**, and it is the reason the decoy has a cooldown rather than a
cost.

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
  cart, the mop bucket, the dumpster. Freezes the meter while it holds; it never
  knocks it back, because nothing does (§5).
- **Decoy skunk:** Fluffy turns up with white stripes down his back and lets himself
  get caught. The crowd goes *"AH HA! It was the CAT!"* … sniffs him … *"…that's not
  it either."* Buys the most time, and it is a reliable laugh every single time.

**While a decoy is holding, nobody can lay a hand on Toots.** Every face in the
room is pointed at the cheese cart, so the ring of people closing in (§5) breaks
up and walks away, and the player gets a few seconds of clear floor. This is the
one move that answers a chase, which is why it is on a cooldown rather than a
cost: you cannot buy your way out twice in a row.

On a cooldown, so it is a resource and not a solution. Misdirection only ever delays
the truth, so the pressure always comes back.

---

## 8. Mr. Sniffsalot — the compass

- **He points with his face, not with an arrow.** His head turns left and right
  to look where he is pointing — the muzzle and eyes travelling across the skull
  while his ears stay put — and his nose lifts when the way out is straight up
  the room. There is no floating indicator to read: the compass is a dog looking
  at something, which a child understands without being taught, and which keeps
  the screen clear.
- Early in a round that nose is sharp: **it finds fish.** While a single nugget is
  still out there that is all he is interested in, however far away it is — he is
  a dog and it is food.
- **He only points at the way out once every nugget is in.** That is the moment
  his job changes from finding things to getting everybody out, and it is a
  deliberate piece of teaching: when the dog suddenly turns and points at a door,
  the player learns that they are done collecting and the run is now a race.
- As the meter climbs his nose degrades, in stages:
  1. His nose drifts
  2. It lags behind and wanders
  3. He sneezes and points confidently at completely the wrong thing (a mop)
  4. He gives up and sits down

  Because the direction is expressed by his head rather than by a graphic, a
  failing nose *looks* like a failing nose: it is his head that wanders, so the
  player watches the dog rather than reading a gauge.
- **He also shows how much of it is a guess**, because a wandering head alone is
  not enough. The trouble with stages 1–3 is that he looks exactly as certain as
  he does at stage 0 while being wrong by up to 170°, so the player is not merely
  uninformed, they are being *misled* — and at stink 50, where he can already be
  115° out, nothing on screen says so.

  So a **question mark** appears over him, and it fades in with the error rather
  than switching on at a threshold: nothing while he is reliable, faint as he
  starts to guess, solid by the time he has given up. That grading is the point.
  A light that only comes on at the end would leave the whole middle of a round —
  the part where a player is actually misled — unmarked.

  Once he has given up entirely he **shakes his head**, three swings and a pause,
  riding on the same face-slide that does the pointing: the motion the player has
  already learnt to read, now going side to side instead of settling somewhere.
  And he **whines** — the exact counterpart of the "ruff ruff" he gives for fresh
  air (§8), so the two halves of the message, *I know the way* and *I have lost
  it*, are recognisable as a pair without anybody being told.

  Three channels on purpose, because they answer different questions. The whine
  is an *event* — it tells a player who is looking somewhere else. The head shake
  is a *behaviour* — it reads as "no" without needing to be literate. The question
  mark is the *state* — it is still there thirty seconds later when somebody
  finally glances at the dog, which neither of the other two can do.
- **Fresh air resets him, while he is standing in it.** Open windows, ocean
  breezes, vents, an open freezer case. His nose clears the moment he is in it and
  clouds again the moment he leaves, so fresh air is somewhere you *go* to get a
  bearing rather than something you collect.
- **He barks when it clears.** Two sharp barks — the one moment in the game a
  player is told, unmistakably, *I know where we are going*. In a room thick
  enough that nothing else is readable, that bark is the whole navigation system,
  and it is why fresh air is worth crossing a room for.

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

**You can hear all of it.** The yawn is audible, the snoring carries, and the
snort when one wakes up is unmistakable — and it all gets louder the closer you
are, so a sleeping local is something you can find by ear from across the room.
None of it is speech: the animals never speak (§14.2), they yawn and snore and
snuffle.

Design notes:
- Roughly 1 in 4 rooms, and never two in a row — but it can happen in *any* room,
  including the ones where the way out is hardest to find.
- **When one goes under, the group notices.** One of the animals reacts in a
  speech bubble — *"awww, he's asleep"*, *"…he must be a Snoozalot"* — so a player
  who was not watching still learns what just happened, and learns the word for
  it. The animals do not say it out loud; it is a bubble, because §14.2 is not
  negotiable.
- There is always a **tell** a sharp-eyed kid can spot a second early — droopy eyelids,
  a slow sway, one yawn before the real one, and that yawn is *heard* as well as
  seen. Spotting the tell is its own little game.
- A sleeping local can be woken by walking the group into them — **but bumping
  anything startles Toots, including this** (§6). Waking your own compass costs
  you a poof and a chunk of the meter, so it is a real decision rather than a free
  retry. They wake up startled, point somewhere random, and go straight back to
  sleep.
- The local is always a bonus and never something the player depends on, so an
  unreliable one never feels unfair.

---

## 10. Screen and controls

**Portrait only.** Locked. Grab the phone or iPad and play — never turn the device.
This is a pick-it-up-for-three-minutes game and rotating is friction.

### What portrait means for a room

The room runs **vertically**: the group enters at the bottom of the screen and the exit
is at the top. The camera follows Waddles up the room.

**The camera is close, and the slide is how you look around.** Normal play is
zoomed in on Waddles and Toots — close enough to read a face and to see exactly
how near that person is getting — which means the room is wider than the screen
and the view pans left and right as well as up. Hold the slide and the camera
pulls back to the full width of the room for as long as the slide lasts, so a
belly-slide is both a burst of speed and the only way to see the whole floor at
once.

That gives the slide a second job and a real cost: the wide view is the one that
shows you where the fish and the people are, and taking it means leaving the
group behind while you do.

- The conga line trails *below* Waddles, so it is always on screen and readable.
- The crowd fills the room ahead, so the player is always looking into the trouble.
- Rooms are tall and fairly narrow. A wide room (the beach) becomes a tall one by
  turning the walk into a walk up the sand.
- The green haze creeps down from the top — it eats the exit first, which is exactly
  the thing the player needs to see.

### Finding the way out

**Later rooms hide the exit in plain sight.** A room can hold any number of doors,
gates, hatches and windows that look like a way out and are not — a painted door,
a cupboard, a window onto a wall. The real one is never marked differently; it is
only ever *found*.

This is what the local is for. A room with one obvious door does not need a
squirrel pointing at it, so the local was a charming bonus and nothing more. A
room with five doors and one that works makes the local the difference between a
run and a guess — which is also what makes it matter, and funny, when your only
reliable guide turns out to be a Snoozalot.

The false ones are authored per room and the count climbs as the levels do:

| Rooms | False ways out |
|---|---|
| 1–2 | one or two, and not next to the real one |
| 3–5 | two or three, and now allowed to share a wall with it |
| 4+ | and the group starts in the *middle*, so the way out may be behind them |
| 6+ | four or more, and at least one very convincing |

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

### Outside the room

A home screen with the four of them standing on it — Toots poofing every few
seconds, so a child who cannot read yet still knows what the game is — and two
buttons: **START**, and **Settings**.

Settings is two switches, remembered between sessions:

| Switch | What it covers |
|---|---|
| **Sound** | Gurgles, poofs, nuggets, the crowd, the room's own bed and the pressure bed |
| **Music** | The jingle, and nothing else |

The phone's own silent switch mutes everything, which is the control a parent
reaches for first.

The only way out of a room is the end card, which offers *again* and *back to the
start*. That is deliberate: a room is 90–150 seconds and quitting halfway is not
a thing a three-minute game needs to support.

---

## 11. Fish nuggets

- Coin-like fish nuggets, scattered through each room, reasonably easy to spot and reach.
- **They are the objective.** Every nugget in the room has to be collected before
  the gate opens. This is what makes a room a puzzle instead of a dash: the
  question stops being *how do I get out* and becomes *what order do I do this in,
  and what do I do about the three of them sitting in the worst possible places*.
- Some sit in tempting places: past the crowd, near a blame prop, or right next to
  something that will bump Toots. Those are the corners of the puzzle.
- The exit shows its state plainly: the gate is visibly shut, and it swings open
  the moment the last nugget goes in. Nobody should ever walk into the gateway and
  wonder why nothing happened.

Because the meter is still running the whole time, a room is now a route-planning
problem under a clock. Authoring rule: **a room must be completable with time to
spare by a player who takes a sensible route**, or the puzzle is just a memory
test of where you died.

Nuggets carry between levels and feed the meta-reward (see §13).

---

## 12. Levels

Each level is one room crossed entrance-to-exit, with an escape that suits the place.

### Launch set

| # | Level | Exit | The local | Blame targets |
|---|---|---|---|---|
| 1 | Backyard BBQ | The side gate | Squirrel | Potato salad, the grill, Uncle's shoes |
| 2 | Fine restaurant | Kitchen's back door | Kitchen mouse | The cabbage, the cheese cart, the onions, a truffle |
| 3 | School hallway | Gym fire doors | Classroom hamster | The lockers, the cafeteria, the science lab, a kid named Kevin |
| 4 | Sunrise yoga | The fire door behind the mats | Studio cat | The hot room, the diffuser, the sock basket, Barbara's mat |
| 5 | Sunset beach | The boardwalk ramp | Jetty otter | Seaweed, low tide, the bait bucket, Gary's catch |
| 6 | Firehouse kitchen | The pole / bay door | The dalmatian | The chili pot, turnout gear, the boots |

> The beach's local was written as a dolphin, and a dolphin would be better once
> the locals have their own silhouettes. They all share the squirrel's for now,
> so a dolphin would come out as a blue-grey squirrel; an otter belongs on that
> shoreline *and* survives the shared shape.

> The school moved up from five to three because it is the natural place to
> teach the false-exit rule: a corridor is already a row of identical doors, so
> the room explains itself without a tutorial. It is also the first room whose
> crowd properly moves — the diners in room two barely roamed, which is why
> careless play scored *better* there than in the backyard.

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

### Which way is out

Rooms one to three are climbed: in at the bottom, out at the top. **From room
four the group enters in the middle of the room and the way out can be at either
end.** Nothing in a level file says which — it is read off where the exit
actually sits, so a room cannot claim one thing and place another.

This is what finally makes the local worth finding. While every room was climbed,
"which way out" had one answer and the false doors could only cost you a few
seconds; now the doors at the far end can be duds *and* the real one behind you,
and the only things that will tell you are the animal who lives here and the
dog's nose once the fish are in.

It also changes the shape of a room. The route is a there-and-back, so the path
is longer than the room is tall, and **where the last fish leaves you standing is
now a design decision**: weight the fish to the wrong end and the gate unlocks
with the whole room between the group and the door.

**Losing a run to a wrong guess is acceptable.** A room whose answer you only
learn by walking it is a room you may have to play twice, and that is the
intended cost — the second attempt is not a punishment, it is the level being
understood. So the wrong end stays expensive, and none of the tuning should be
softened to rescue a first-time player who ignores the animal and the nose. What
is *not* acceptable is a room where the answer cannot be learned at all: hence
fresh air at both ends, so the nose can always be cleared.

Later rooms will widen and put doors on the sides as well. Not yet — the width is
still fixed at `WORLD_WIDTH`.

### Cover, and the room that has none

Rooms are built out of the thing you put between yourself and the crowd. The
backyard has furniture, the restaurant a grid of tables, the hallway banks of
lockers, the studio rows of mats — and in all four the answer to a crowd is to
get an object between you and it.

**The beach removes that, on purpose.** Eight objects on five hundred and sixty
units of open sand, and none of them hides anybody: an umbrella blocks your path
without blocking anyone's view. What replaces cover is the **water's edge** —
clean air the whole length of one side, so the room becomes a route decision
rather than a maze. Hug the water and the meter is on hold and the nose works,
but it is the long way round in full view; cut across the dry sand and it is half
the distance with not a lungful of clean air on it.

That is also why the fish are pulled toward the dry side. If they sat in the
breeze the waterline would be one safe corridor and the room would have no
decision in it.

### The local is always an animal

Never a person. The crowd is drawn by `Person` and the local by `Local` — two
different components — so a local cannot be one of the people in the room, by
construction. Every room's local is an animal that belongs in *that* room: the
backyard squirrel, the kitchen mouse, the classroom hamster, the yoga studio's
rabbit.

They are also never a cat. Fluffy is the cat, and §7's gag is the room deciding
it was "the CAT"; a second cat across the floor muddies the one joke the decoy is
built on.

### Level authoring checklist

Every room needs: an entrance, an exit, **a local**, 3+ blame props, 1–2 fresh-air
sources, a nugget layout, a crowd density map, at least one prop that bumps Toots,
and — from room three onward — **false ways out**.

From room four, also: an entrance in the middle, and fresh air at *both* ends.
The nose is what tells you which way the exit is, the nose only works in clear
air, and a player stranded at the far end with a fogged nose and no air to clear
it has no way to learn anything — which is not difficulty, it is a dead end.

Because the meter never falls (§5), a room also has to be *finishable on one tank*:
the fresh-air sources are the only pauses in the whole run, so they have to sit on
a sensible route rather than in a corner nobody visits.

---

## 13. Progression

- Levels unlock in order; completed levels are replayable for a better nugget haul.
  **Built.** The first room is always open and each one after it opens when the
  one before it is cleared. START carries on from the first room you have *not*
  cleared rather than starting the game over — and once everything is cleared it
  stays on the last one, so finishing the game does not leave START pointing at
  nothing.
- **Locked rooms are shown, not hidden.** A six-year-old who can see there is a
  school after the restaurant has a reason to get through the restaurant; a list
  that grows out of nowhere gives them nothing to want. Their *names* are still
  withheld — a named room is a spoiled surprise rather than a reason to keep
  going — so a locked row reads "? ? ?" until it opens.
- The Rooms button is hidden until a second room is open. A picker with one thing
  in it is a button that does nothing, and on a first launch START should be the
  only thing on the screen worth looking at.
- Nuggets feed a shared trough — a between-levels beat where the four of them eat,
  which is where hats, scarves and silly accessories get unlocked.
- Per-level stars: **crossed it** / **crossed it without a single poof** / and a
  third still to decide.
  > The old third star was *crossed it with most nuggets*, which stopped meaning
  > anything when every nugget became mandatory (§11). Speed is the obvious
  > replacement; it is not decided yet. See §16.

---

## 14. Comedy rules

1. **Escalate, never repeat.** A gag used in stage 1 must change by stage 3.
2. **Everybody talks, and talking is the point.** People and animals both, out
   loud, in their own recorded voices. The jokes *are* the game — the reason to
   reach room six is to hear what room six says — so a line that exists only as
   text on screen is a line that has not landed. Bubbles still appear and are
   still welcome, but they are the echo, not the joke.

   Waddles is the one exception, and it is not a technicality: **he still never
   says a word.** He is oblivious, and obliviousness is silent. Everyone else can
   react; he cannot, because reacting would mean he had noticed.
3. **Waddles never acknowledges the smell.** Not once. It is funnier every time.
3a. **Every toot gets a verdict, three seconds late.** Somewhere in the room, a
   few seconds after a poof, one voice says what it thinks of what it just
   smelled — "Whew wee!", "That's a crime against the nostrils", "Nope." The
   delay is the whole joke: on the frame itself it is a sound effect, three
   seconds later it is somebody across the room slowly working out that
   something is wrong. This is the gag the player triggers most, so the list is
   the longest in the game (seventy-odd lines) and it is **dealt from a shuffled
   bag**: every line is heard before any line repeats. A run of toots gets one
   verdict, not a backlog — people react to a smell, not to each emission.

   **Every fifth or sixth verdict, somebody gives up on words and just screams.**
   Five *or* six, never a fixed five: a rate a player can count is a gag they can
   see coming. The screams are levelled to sit exactly where the spoken verdicts
   sit — the joke is that somebody lost their composure, not that the game
   suddenly got loud.
4. **Sound carries the joke.** `gurgle gurgle`, the poof, the crowd's slow "ohhhh no".
5. **Failure is a punchline.** Every loss ends on a gag, not a sad noise.
6. **Nothing gross is ever shown.** Green clouds, watering eyes, waving hands. That's it.

---

## 15. Technical approach (proposed)

- **Expo SDK**, TypeScript, React Native
- **Rendering:** `@shopify/react-native-skia` for the play surface (2D canvas-style
  drawing at 60fps), with the room drawn as layered sprites
- **Game loop / motion:** `react-native-reanimated` on the UI thread
- **Voices:** `expo-speech`. The crowd's lines are spoken by the device, pitched
  and paced from a hash of the line so the one blaming the potato salad always
  sounds like the same person and never sounds like the one blaming the grill.
  One line at a time, by priority — a shout cuts off a mutter, a mutter waits its
  turn — and the jingle drops a long way underneath, because the line is the
  joke and the tune is only furniture.

  **Nobody ever talks over anybody.** A line in progress always finishes, even
  if the room has just worked it out and even if somebody has been caught. Two
  voices at once is unintelligible, and in a game whose jokes *are* the content,
  losing half of two lines is worse than hearing one of them a beat late.
  Priority still decides who speaks *next*, and exactly one line waits — a
  backlog would have the room reciting, in a quiet moment, everything it thought
  of while it was busy. A line that has waited too long is dropped rather than
  arriving after its moment has gone.

  **And the room does not repeat itself.** A prop that has just been accused
  goes quiet for a while, and the crowd picks the nearest one that has not —
  so it works *down* its shortlist instead of looping the same joke every three
  seconds at anybody standing near the potato salad. Passing over a prop rather
  than falling silent is the better half of the rule: in a supermarket with
  eleven suspects, it is the whole character of the level. It is a gap, not a
  ban — long enough that you will not hear a line twice crossing a room once,
  short enough that a long stay in one corner does not silence it forever
- **Audio:** `expo-audio`, playing a synthesised set built by `tools/make-sounds.mjs`
  — the gurgle-and-poof, the nugget, Fluffy's whistle, the crowd sniffing and
  then blaming and then going up all at once, the win fanfare and the losing
  trombone, the latch letting go when the last fish goes in, plus looping beds:
  **one per room** — wind and birds in the yard, babble and cutlery and the
  glass and moved dishes over a quiet room tone in the restaurant, waves arriving
  and gulls on the beach — under a low
  pressure drone the game fades up as the meter climbs so the room feels worse
  before anybody says anything. Exactly one room bed plays at a time, chosen by
  the level's scenery, because a restaurant with wind in it is wrong in a way a
  player hears immediately and cannot name.

  **No bed contains voices.** Two attempts at a synthetic dining crowd both came
  out wrong — a bed made of voices either sounds like a machine imitating people,
  or it competes with the actual people in the room, who are busy delivering the
  jokes this game is made of. A quiet room with things happening in it is a
  better restaurant than a fake crowd, and it leaves the speech band clear for
  the punchlines. Sounds are code, like the art, so a gag can be retimed in a line
- **Haptics:** `expo-haptics` — a little buzz on every poof
- **Save:** `@react-native-async-storage/async-storage`; save on level end, always
- **Art:** shaded vector shapes drawn directly in Skia rather than exported as
  sprite sheets — it scales cleanly from a phone to an iPad, recolours for free
  (Fluffy in his decoy stripes), and keeps the whole game in one codebase with no
  asset pipeline. Forms are modelled with a single light from the upper left,
  contours are drawn in each shape's own dark tone rather than in flat black, and
  everything that stands on the grass drops a soft shadow onto it

Decision still open — Skia vs. a WebView-hosted 2D engine. Skia is the recommendation:
it keeps everything in one Expo codebase and performs well on low-end Android.

---

## 16. Open questions

1. ~~What is Snoozalot?~~ **Resolved:** every room has a local, and any local can turn
   out to be a Snoozalot. See §9.
2. ~~Portrait or landscape?~~ **Resolved: portrait, locked.** See §10.
3. ~~Does the crowd catching Toots end the level?~~ **Resolved: it ends it**, and
   so does anyone touching him. See §4.
4. How many rooms in the first release?
5. Does the player ever control anyone but Waddles?
6. What is the third star, now that every nugget is mandatory? Probably a time,
   but a time pushes against "never punish curiosity" (§2.4) — a player who
   explores the room should not lose a star for it.
