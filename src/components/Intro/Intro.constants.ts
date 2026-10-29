import type { Vector3Tuple } from 'three';

/** sessionStorage flag: the intro plays once per browser tab session */
export const INTRO_SESSION_KEY = 'intro-played';

/**
 * Intro timeline in flight seconds (real seconds once slow motion is taken out).
 * All daggers launch together and braid through the sky, split at splitSeconds,
 * then dive and land one after the other in LANDING_SEQUENCE order.
 */
export const INTRO = {
    splitSeconds: 3.4,
    firstLandingSeconds: 4.3,
    /** Impacts follow each other quickly, like a flurry of blows */
    landingGapSeconds: 0.12,
    /** The camera is back to its rest framing and the intro ends */
    endSeconds: 5.5,
    slowMotion: {
        /** Flight seconds before the first impact that play slowed down */
        leadInSeconds: 0.45,
        /** Playback rate inside the slow-motion window */
        rate: 0.25
    }
} as const;

/** Section ids in impact order: centre first, then outwards */
export const LANDING_SEQUENCE = ['projects', 'skills', 'education', 'experience', 'contact'];

/**
 * The daggers braid around a shared spine through the night sky, from far behind the field
 * to above it; each strand weaves on a 1:2 Lissajous figure so the strands cross over and under.
 */
export const BRAID = {
    /** World-space spine, sampled by arc length over the braid */
    spine: [
        [-16, 17, -42],
        [-8, 14, -27],
        [0, 11, -16],
        [3, 8, -8],
        [1, 6, -3]
    ] as Vector3Tuple[],
    /** Full weaving turns along the spine */
    turns: 2.5,
    /** Strand radius: tight at the launch, widest mid-flight */
    startRadius: 0.4,
    peakRadius: 1.4,
    /** Binormal amplitude relative to the radius; the second Lissajous axis */
    weave: 0.7,
    /** Spine resolution for its Frenet frames */
    frameSegments: 200
} as const;

/** Dive from the split point to the landing; heights along each dagger's own (tilted) axis */
export const DIVE = {
    highApproach: 3,
    lowApproach: 0.7,
    /** Progress exponent: above 1 the dagger accelerates into the floor */
    acceleration: 1.8
} as const;

/** Camera rail: the spine shifted to the side, below and towards the viewer, so it chases the braid */
export const CAMERA_RAIL = {
    offset: [2.2, -1, 3.6] as Vector3Tuple,
    /** Share of the way from the group's centre to the showcased dagger that the camera looks at */
    showcaseFocus: 0.6,
    /** Each dagger in turn gets the camera's attention for this long during the braid */
    showcaseSeconds: 0.55,
    showcaseStartSeconds: 0.6,
    /** Roll in radians at the peak of the braid; level again before the dive */
    maxRoll: 0.18,
    /** Higher values follow the target faster */
    smoothing: 6
} as const;

/** Decaying shake after each impact; the first impact shakes hardest */
export const CAMERA_SHAKE = {
    amplitude: 0.05,
    firstImpactBoost: 2.2,
    seconds: 0.35,
    /** Angular frequency in radians per second */
    frequency: 60
} as const;

/** Light streak behind each flying dagger (drei Trail) */
export const TRAIL = {
    /** Ribbon width; drei scales it by 0.1 into world units */
    width: 3,
    /** Points kept, in tens of frames */
    length: 4,
    brightness: 3
} as const;

/** Additive full-screen light: a tint of the showcased dagger during the braid, flashes on impact */
export const SCREEN_FLASH = {
    tintStrength: 0.08,
    impactPeak: 0.35,
    impactDecaySeconds: 0.15,
    /** The last impact whites out the screen, like the reference's reveal */
    finalColor: '#ffffff',
    finalPeak: 0.9,
    finalDecaySeconds: 0.45,
    /** Drawn after everything else */
    renderOrder: 1000
} as const;
