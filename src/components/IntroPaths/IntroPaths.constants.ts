import type { Vector3Tuple } from 'three';

/**
 * Seeded flight paths: each dagger gets its own archetype, all meet at the convergence point.
 * World units are metres; the field is at the origin, the hero camera at z = 5 looking at -z.
 */
export const FLIGHT = {
    /** Where all five heads meet at CONVERGENCE_SECONDS, above and in front of the field */
    convergence: [0, 9, -6] as Vector3Tuple,
    /**
     * Free fall from the fan's end into the ground (m/s and m/s², exaggerated gravity). Each dagger
     * starts it as high as its impact time needs, so later ones fall from higher, out of frame
     */
    fallStartSpeed: 4,
    fallGravity: 40,
    /** Step for velocities by central difference, in seconds */
    velocityStepSeconds: 1 / 240
} as const;

/**
 * Crossings: for this many pairs of daggers, their two nearest interior control points move to
 * their midpoint, so the paths meet there without adding a kink
 */
export const CROSSING_NODES = {
    count: 3,
    /** Only points this close are joined: each moves at most half of it, so no path folds back on itself */
    maxJoinMetres: 8
} as const;

/**
 * Curl-noise displacement (two octaves). It depends only on world position, so two paths through
 * the same crossing node keep crossing; it fades out near the convergence point.
 */
export const PATH_NOISE = {
    amplitude: 1.4,
    frequency: 0.09,
    octaves: 2,
    fadeRadius: 6,
    /** Per-visit phase jitter (radians); 0 in dev review so frames are reproducible */
    phaseJitter: 0.1
} as const;

/** Speed bursts along the flight: smooth bumps on top of the base speed */
export const SPEED_BURSTS = {
    count: 3,
    minAmplitude: 0.5,
    maxAmplitude: 1.1,
    /** Bump half-width in seconds; wide enough that speed never changes 25 % in one frame */
    minWidth: 0.2,
    maxWidth: 0.32,
    /** Bursts are centred between these times */
    earliestSeconds: 0.55,
    latestSeconds: 2.8,
    tableSize: 512
} as const;

export type PathArchetype = 'steepDive' | 'helixTurn' | 'lowSkim' | 'sCurveWhip' | 'wideArc';

export const PATH_ARCHETYPES: PathArchetype[] = [
    'steepDive',
    'helixTurn',
    'lowSkim',
    'sCurveWhip',
    'wideArc'
];
