/** Dev-only intro review: thresholds of the numeric checks and the frame dump rate */
export const REVIEW = {
    framesPerSecond: 30,
    /** Largest allowed change of speed between consecutive frames, outside the slow-motion ramps */
    maxSpeedChange: 0.25,
    /** Below this world speed (m/s) a dagger counts as resting: no speed check */
    restingSpeed: 0.05,
    /**
     * Below this screen speed (view widths per second) a dagger is held still by the camera (its own
     * head-cam): relative changes of a near-zero speed mean nothing, so it is not compared
     */
    restingScreenSpeed: 0.2,
    /**
     * Screen-speed changes smaller than this (view widths per second, about half a percent of the
     * frame per frame) are invisible, so they never fail, whatever their relative size
     */
    minVisibleScreenSpeedChange: 0.15,
    /** The followed head is held nearly still by its head-cam: compared down to this screen speed */
    restingSubjectScreenSpeed: 0.1,
    /**
     * Daggers closer than this (m) to the camera are not screen-checked: whipping past the lens,
     * their screen speed changes fast by perspective alone
     */
    nearCameraMetres: 6,
    /** Two paths closer than this (m) count as crossing */
    crossingDistance: 0.35,
    minCrossings: 3,
    /** Crossings are counted up to this long before the convergence, where all paths meet by design */
    crossingMarginSeconds: 0.3,
    /** Path samples per dagger for the crossing check */
    crossingSamples: 240
} as const;

/** URL switches, dev only: ?t=1.25 opens paused at that time, ?seed=123 re-rolls, ?review hides the page chrome */
export const REVIEW_PARAMS = {
    time: 't',
    seed: 'seed',
    review: 'review'
} as const;

export const REVIEW_BODY_CLASS = 'intro-review';
