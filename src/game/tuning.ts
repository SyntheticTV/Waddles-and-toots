/**
 * Every number that decides how the game feels, in one place.
 *
 * Because all four animals are wired to the same stink meter (GAME_DESIGN.md §3),
 * changing STINK_DRIFT_PER_SEC alone moves the whole game's difficulty: the clock,
 * the crowd, the fog and the dog's nose all follow it.
 */

/** Rooms are authored this wide in world units. Scales to the device width. */
export const WORLD_WIDTH = 100;

// ---------------------------------------------------------------- the clock

/**
 * A round should run 90–150 seconds (§2).
 *
 * The meter is one-way now — nothing the player does ever pushes it back down
 * (§5) — so the clock itself had to slow to compensate. It used to be 150s of
 * drift *plus* whatever a couple of decoys handed back, which came to roughly
 * this. Removing the relief without slowing the drift made a careful-but-unhurried
 * player lose every single time, which is not the game.
 *
 * Standing still and touching nothing fills the meter in ~210s; a normal messy
 * run tops out a good deal sooner, and fresh air is the only thing that pauses it.
 */
export const STINK_MAX = 100;
export const STINK_DRIFT_PER_SEC = STINK_MAX / 210;

/**
 * Gurgle gurgle. One poof from behind Toots' tail.
 *
 * Priced down from 9 when the meter became one-way (§5). At 9 a point it was
 * costing nearly a tenth of the entire run and there was no longer any way to
 * win it back, so five clumsy bumps ended a round before the room had even got
 * going. It still stings — three of these is a fifth of the clock — but it is a
 * mistake you can play through rather than a verdict.
 */
export const POOF_STINK = 6;

/** Poofs can't chain — Toots needs a moment to reload. */
export const POOF_COOLDOWN_MS = 900;

/** Standing in a knot of people concentrates it. Multiplies the drift. */
export const CROWD_DENSITY_MULTIPLIER = 1.9;

/** Radius in world units within which a person counts as "crowding you". */
export const CROWD_RADIUS = 18;

// ------------------------------------------------------------ crowd stages

/** Thresholds for sniff / blame / panic. §5. */
export const STAGE_SNIFF = 1;
export const STAGE_BLAME = 34;
export const STAGE_PANIC = 67;

/**
 * How close the crowd is to working out it's Toots. Rises while people are near
 * the group at blame stage or above; reaching 100 means Toots gets caught.
 */
export const SUSPICION_MAX = 100;
export const SUSPICION_PER_SEC_NEAR = 11;
export const SUSPICION_DECAY_PER_SEC = 7;
/** Within this many world units, a person is actively eyeing the group. */
export const SUSPICION_RADIUS = 22;

/**
 * Close enough to touch. A person who actually reaches Toots has him, whatever
 * the meters say — the round ends there. Keep this tight: it is the one rule
 * that can end a run instantly, so it has to feel like contact and not like bad
 * luck. Anyone who wants the round to survive a brush can raise it or add a
 * grace period here rather than in the engine.
 */
export const CATCH_RADIUS = 4.5;

// ----------------------------------------------------------- the chase

/**
 * The crowd does not only stand about smelling things (§5). Past `HUNT_FROM` on
 * the meter, anybody close enough breaks off and walks at Toots, and they get
 * quicker the worse the room gets.
 *
 * `CROWD_HUNT_SPEED` is deliberately well under `WADDLE_SPEED`: a hunter must
 * always be outrunnable, or the player has no answer but the decoy, and the
 * decoy has a cooldown.
 */
export const CROWD_IDLE_SPEED = 7;
export const CROWD_HUNT_SPEED = 25;

/**
 * Nobody goes after him until the room is already blaming things out loud — the
 * stage table in §5 says stage 2 is where they start investigating, so that is
 * where the chase starts too. Before that everyone is just milling and a player
 * can squeeze past anybody.
 */
export const HUNT_FROM = STAGE_BLAME;
/** And by this much stink they are as committed as they are going to get. */
export const HUNT_FLAT_OUT = 78;

/** How near a person has to be before they will commit to the chase. */
export const HUNT_RADIUS = 42;

/** How fast a distracted crowd walks over to whatever Fluffy pinned it on. */
export const DECOY_PULL_SPEED = 17;

// -------------------------------------------------------------- the camera

/**
 * How close the camera sits in normal play, and how far it pulls back while
 * Waddles is sliding (§10). At NEAR the room is wider than the screen, so the
 * view pans sideways as well as up; at WIDE the whole floor is on screen, which
 * is the whole point of hitting slide.
 */
export const CAMERA_NEAR_ZOOM = 2;
export const CAMERA_WIDE_ZOOM = 1;

/** Per-frame easing: snap out to the wide view, drift back in. */
export const CAMERA_ZOOM_OUT_EASE = 0.22;
export const CAMERA_ZOOM_IN_EASE = 0.07;

/** Where Waddles sits on screen: a third up from the bottom, centred across. */
export const CAMERA_LOOK_AHEAD = 0.34;

// -------------------------------------------------------------- movement

/** Waddling. World units per second. */
export const WADDLE_SPEED = 38;

/** Belly slide. Fast, and it leaves everyone behind. §6. */
export const SLIDE_SPEED = WADDLE_SPEED * 2.2;

/** How long Waddles may slide before the warning fires. */
export const SLIDE_MAX_MS = 2200;

/** Cooling-off before he can slide again. */
export const SLIDE_RECHARGE_MS = 1600;

/**
 * How far ahead of the group Waddles may get before the leash warning starts.
 * Past LEASH_BREAK he has to come back before he can slide again.
 */
export const LEASH_WARN = 26;
export const LEASH_BREAK = 44;

/** Spacing between animals in the conga line, in world units. */
export const LINE_SPACING = 7;

/** Sliding into Toots, or into a bump prop, startles him. */
export const BUMP_RADIUS = 6;

// ---------------------------------------------------------------- Fluffy

/**
 * A decoy buys time, not relief.
 *
 * The meter never falls (§5), so these are zero — kept, rather than deleted, as
 * the place where somebody will inevitably want to put a number back. Don't:
 * the one-way meter is what makes the back half of a room feel like the back
 * half of a room. What a decoy actually does is freeze the meter, break the
 * chase and wipe suspicion, which is plenty.
 */
export const DECOY_SCAPEGOAT_RELIEF = 0;
export const DECOY_SKUNK_RELIEF = 0;

/** Suspicion wiped by a decoy, whichever kind. */
export const DECOY_SUSPICION_RELIEF = 45;

export const DECOY_COOLDOWN_MS = 11000;

/**
 * How far away a prop can be and still be a believable thing to blame.
 *
 * `DECOY_MIN_GAP` is the important one: the scapegoat has to be far enough from
 * Toots that the room walking over to look at it *opens* a gap instead of
 * closing one. A decoy that herds the crowd onto the skunk is worse than no
 * decoy at all — which is exactly what happens if this is too small.
 */
export const DECOY_RANGE = 62;
export const DECOY_MIN_GAP = 22;

/** How long the crowd stays busy with whatever Fluffy pinned it on. */
export const DECOY_HOLD_MS = 3400;

// ------------------------------------------------- Mr. Sniffsalot's nose

/**
 * Nose accuracy is 1 at a clean meter and 0 once the room reeks — the pointer
 * drifts, lags, then points confidently at a mop. §8.
 */
export const NOSE_FAILS_AT = 78;

/**
 * Fresh air is a place, not a pickup (§5).
 *
 * His nose clears while he is standing in it and clouds over again shortly after
 * he leaves — just enough grace that walking through does not strobe the bark,
 * but nowhere near enough to carry a working nose across the room.
 */
export const FRESH_AIR_GRACE_SECONDS = 0.6;

/** Radius of a fresh-air source, in world units. */
export const FRESH_AIR_RADIUS = 14;

// ------------------------------------------------------------- the local

/** Roughly one room in four has a Snoozalot, and never two in a row. §9. */
export const SNOOZALOT_CHANCE = 0.25;

/** How long a local points before a Snoozalot nods off. */
export const SNOOZE_AFTER_MS = 4200;

/** The tell: droopy eyes and a small yawn, this long before they go. */
export const SNOOZE_TELL_MS = 900;

/** A woken local points somewhere random for this long, then sleeps again. */
export const SNOOZE_WAKE_MS = 1800;

// ---------------------------------------------------------------- pickup

/** How close Waddles must be to hoover up a fish nugget. */
export const NUGGET_RADIUS = 5;

/** How long the little burst of stars lives where a nugget was. */
export const SPARK_LIFE = 0.7;
