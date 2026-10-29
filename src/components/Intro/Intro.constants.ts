/** sessionStorage flag: the intro plays once per browser tab session */
export const INTRO_SESSION_KEY = 'intro-played';

/** Shipped seed for the intro paths, picked by hand; ?seed= overrides it in dev */
export const INTRO_SEED = 1;

/** Phase E v2: from the first flare (t = 0) to the last impact, in wall-clock seconds */
export const INTRO_DURATION_SECONDS = 4;

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
    { daggerId: null, startSeconds: 0, endSeconds: 0.2, shot: 'ignition' },
    { daggerId: 'skills', startSeconds: 0.2, endSeconds: 0.75, shot: 'closeRoll' },
    { daggerId: 'contact', startSeconds: 0.75, endSeconds: 1.25, shot: 'highBack' },
    { daggerId: 'education', startSeconds: 1.25, endSeconds: 1.7, shot: 'lowUp' },
    { daggerId: 'experience', startSeconds: 1.7, endSeconds: 2.2, shot: 'sidePass' },
    { daggerId: 'projects', startSeconds: 2.2, endSeconds: 2.75, shot: 'lensGraze' },
    { daggerId: null, startSeconds: 2.75, endSeconds: 3.1, shot: 'wideBehind' },
    { daggerId: null, startSeconds: 3.1, endSeconds: INTRO_DURATION_SECONDS, shot: 'heroWide' }
];

/** All five heads meet at the convergence point at this time */
export const CONVERGENCE_SECONDS = 2.75;
/**
 * After the convergence the formation opens like a fan until this time.
 * Placeholder until the landing handover: the daggers then rest, hidden by the whiteout.
 */
export const FAN_END_SECONDS = 3.1;

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
    riseStartSeconds: 2.92,
    peakSeconds: 3,
    fadeStartSeconds: 3.1,
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
    startSeconds: 0.2,
    fadeSeconds: 0.2,
    renderOrder: 999
} as const;

/**
 * Global slow motion around the impacts: story time runs at timeScale(t) of wall-clock time.
 * Smooth ramps (smootherstep), so no speed ever changes in a single frame.
 */
export const TIME_SCALE = {
    slowRate: 0.12,
    /** The ramp down starts this long before the first impact */
    leadInSeconds: 0.15,
    rampDownSeconds: 0.35,
    /** After the last impact */
    rampUpSeconds: 0.5
} as const;
