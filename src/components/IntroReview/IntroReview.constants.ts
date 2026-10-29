/** Dev-only intro review: thresholds of the numeric checks and the frame dump rate */
export const REVIEW = {
    framesPerSecond: 30,
    /** Largest allowed change of speed between consecutive frames, outside the slow-motion ramps */
    maxSpeedChange: 0.25,
    /** Below this world speed (m/s) a dagger counts as resting: no speed check */
    restingSpeed: 0.05,
    /** Two paths closer than this (m) count as crossing */
    crossingDistance: 0.35,
    minCrossings: 3,
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
