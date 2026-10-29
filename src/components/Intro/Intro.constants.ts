/** sessionStorage flag: the intro plays once per browser tab session */
export const INTRO_SESSION_KEY = 'intro-played';

/** Shipped seed for the intro paths, picked by hand; ?seed= overrides it in dev */
export const INTRO_SEED = 1;

/**
 * Landings, in wall-clock seconds. The impact order is shuffled by the seed, and the gaps between
 * impacts (an uneven rhythm, not a metronome) are shuffled too, with a little seeded jitter.
 */
export const LANDING = {
    firstImpactSeconds: 4.05,
    gapsSeconds: [0.09, 0.21, 0.07, 0.3],
    gapJitterSeconds: 0.02,
    /** The intro must not run longer than this to its last impact */
    latestImpactSeconds: 4.8,
    /** Dust and glow keep playing on the final scene this long after the last impact */
    settleSeconds: 0.5,
    /** Story seconds before its impact over which a dagger turns into its rest pose (a damped spring) */
    orientationSettleSeconds: 0.3,
    /** Spring rate (1/s): higher settles sooner */
    orientationSpringRate: 12,
    /** After the impact the planted dagger quivers: a decaying sideways rock around the entry point */
    quiver: {
        amplitudeRadians: 0.07,
        frequencyHz: 9,
        /** 1/s: the rock fades to about 5 % within the settle */
        decayRate: 6
    }
} as const;

/** Camera archetype of a beat; every head-cam beat uses a different one */
export type ShotArchetype =
    | 'ignition'
    | 'closeRoll'
    | 'highBack'
    | 'lowUp'
    | 'sidePass'
    | 'lensGraze'
    | 'wideBehind'
    | 'heroWide';

export type Beat = {
    /** Dagger the head-cam follows (and whose colour floods the cut), or null */
    daggerId: string | null;
    startSeconds: number;
    endSeconds: number;
    shot: ShotArchetype;
};

/** docs/PHASE-E-v2.md section 3; wall-clock seconds, hard cuts at every beat start */
export const BEATS: Beat[] = [
    { daggerId: null, startSeconds: 0, endSeconds: 0.5, shot: 'ignition' },
    { daggerId: 'skills', startSeconds: 0.5, endSeconds: 1.05, shot: 'closeRoll' },
    { daggerId: 'contact', startSeconds: 1.05, endSeconds: 1.55, shot: 'highBack' },
    { daggerId: 'education', startSeconds: 1.55, endSeconds: 2, shot: 'lowUp' },
    { daggerId: 'experience', startSeconds: 2, endSeconds: 2.5, shot: 'sidePass' },
    { daggerId: 'projects', startSeconds: 2.5, endSeconds: 3.05, shot: 'lensGraze' },
    { daggerId: null, startSeconds: 3.05, endSeconds: 3.7, shot: 'wideBehind' },
    // From the fan's end, when the daggers start falling, until the intro ends (after the last impact)
    { daggerId: null, startSeconds: 3.7, endSeconds: Infinity, shot: 'heroWide' }
];

// { daggerId: null, startSeconds: 0, endSeconds: 0.2, shot: 'ignition' },
// { daggerId: 'skills', startSeconds: 0.2, endSeconds: 0.75, shot: 'closeRoll' },
// { daggerId: 'contact', startSeconds: 0.75, endSeconds: 1.25, shot: 'highBack' },
// { daggerId: 'education', startSeconds: 1.25, endSeconds: 1.7, shot: 'lowUp' },
// { daggerId: 'experience', startSeconds: 1.7, endSeconds: 2.2, shot: 'sidePass' },
// { daggerId: 'projects', startSeconds: 2.2, endSeconds: 2.75, shot: 'lensGraze' },
// { daggerId: null, startSeconds: 2.75, endSeconds: 3.1, shot: 'wideBehind' },

/** All five heads meet at the convergence point at this time */
export const CONVERGENCE_SECONDS = 3.05;
/**
 * After the convergence the formation opens like a fan until this (story) time, ending above each
 * landing point (at the hero-wide cut); then each dagger falls freely into the ground.
 */
export const FAN_END_SECONDS = 3.7;

/**
 * Colour flood at each cut: full-screen, in the incoming beat's colour, peaking on the cut.
 * Times in seconds relative to the cut.
 */
export const FLOOD = {
    peakAlpha: 0.9,
    /** About 2 frames up to the peak, which lands on the cut */
    riseSeconds: 2 / 30,
    /** 1 to 2 frames at the peak */
    holdSeconds: 1.5 / 30,
    decaySeconds: 0.12,
    /** Saturated colour grade kept during the whole beat, strongest at the frame edges */
    sustainAlpha: 0.55,
    /** Share of the frame, from the centre, kept clearer so the head stays readable */
    sustainClearRadius: 0.25,
    renderOrder: 1000
} as const;

/** Whiteout over the convergence burst, fading out into the landing camera (which hides the cut) */
export const WHITEOUT = {
    riseStartSeconds: 3.52,
    peakSeconds: 3.6,
    fadeStartSeconds: 3.7,
    fadeSeconds: 0.25
} as const;

/** Light streak behind each flying dagger (drei Trail) */
export const TRAIL = {
    /** Ribbon width; drei scales it by 0.1 into world units */
    width: 3,
    /** Points kept, in tens of frames */
    length: 4,
    brightness: 3
} as const;

/** Anime speed lines during the flight: thin radial streaks racing out from the centre of the view */
export const SPEED_LINES = {
    /** Angular lanes around the centre; only some carry a streak */
    lanes: 120,
    density: 0.35,
    /** Share of a lane the streak covers at the edge of the view; thinner towards the centre */
    thickness: 0.22,
    /** Streak travel in view heights per second */
    speed: 2.4,
    /** Streak length as a share of its travel cycle */
    length: 0.35,
    /** Clear area around the centre, in view heights */
    innerRadius: 0.16,
    strength: 0.35,
    startSeconds: 0.5,
    fadeSeconds: 0.2,
    renderOrder: 999
} as const;

/**
 * Global slow motion at the apex: story time runs at timeScale(t) of wall-clock time. The daggers
 * hang nose down while the whiteout clears, then time is back to full speed before they fall, so
 * every impact hits at full speed. Smooth ramps (smootherstep), so no speed changes in a single frame.
 */
export const TIME_SCALE = {
    slowRate: 1,
    /** As the whiteout starts to clear */
    startSeconds: 3.7,
    rampDownSeconds: 0.25,
    holdSeconds: 0,
    rampUpSeconds: 0.3
} as const;
