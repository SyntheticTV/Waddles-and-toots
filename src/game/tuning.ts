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
 * A round should run 90–150 seconds (§2). Standing still and touching nothing
 * fills the meter in ~150s; a normal messy run tops out sooner.
 */
export const STINK_MAX = 100;
export const STINK_DRIFT_PER_SEC = STINK_MAX / 150;

/** Gurgle gurgle. One poof from behind Toots' tail. */
export const POOF_STINK = 9;

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

/** Pin the blame on a prop. Knocks the meter back. §7. */
export const DECOY_SCAPEGOAT_RELIEF = 16;

/** White stripes, gets caught on purpose. The big one. */
export const DECOY_SKUNK_RELIEF = 28;

/** Suspicion wiped by a decoy, whichever kind. */
export const DECOY_SUSPICION_RELIEF = 45;

export const DECOY_COOLDOWN_MS = 11000;

/** How long the crowd stays busy with whatever Fluffy pinned it on. */
export const DECOY_HOLD_MS = 3400;

// ------------------------------------------------- Mr. Sniffsalot's nose

/**
 * Nose accuracy is 1 at a clean meter and 0 once the room reeks — the pointer
 * drifts, lags, then points confidently at a mop. §8.
 */
export const NOSE_FAILS_AT = 78;

/** Standing in fresh air gives this many seconds of a perfect lock-on. */
export const FRESH_AIR_LOCK_SECONDS = 6;

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
