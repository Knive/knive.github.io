import type { Vector3Tuple } from 'three';

/** sessionStorage flag: the intro plays once per browser tab session */
export const INTRO_SESSION_KEY = 'intro-played';

/**
 * Intro timeline in flight seconds (real seconds once slow motion is taken out).
 * Landings follow the DAGGERS order; the first one is the lead the camera follows.
 */
export const INTRO = {
    /** Time from launch to landing, the same for every dagger */
    flightSeconds: 2.6,
    /** The lead launches at 0 */
    firstLandingSeconds: 2.6,
    landingGapSeconds: 0.4,
    /** The camera is back to its rest framing and the intro ends */
    endSeconds: 5.4,
    slowMotion: {
        /** Flight seconds before the lead's impact that play slowed down */
        leadInSeconds: 0.6,
        /** Playback rate inside the slow-motion window */
        rate: 0.35
    }
} as const;

/** Flight path control points in dagger-local space; the last point is the rest position */
export const FLIGHT_PATH = {
    /** High in the night sky, far behind the floor */
    start: [0, 9, -16] as Vector3Tuple,
    middle: [0, 5.5, -7] as Vector3Tuple,
    /** Directly above the landing spot, so the blade drops in upright */
    approach: [0, 1.4, -0.2] as Vector3Tuple,
    /** Start x offset per landing step from the centre dagger, so the paths fan out */
    spreadX: 1.2,
    /** Progress exponent: above 1 the dagger accelerates into the floor */
    acceleration: 1.6
} as const;

/** Camera offset from the lead dagger while following it */
export const CAMERA_FOLLOW = {
    offset: [0.9, 0.7, 3.6] as Vector3Tuple
} as const;

/** Small camera shake after each landing */
export const CAMERA_SHAKE = {
    amplitude: 0.05,
    seconds: 0.3,
    /** Angular frequency in radians per second */
    frequency: 60
} as const;
