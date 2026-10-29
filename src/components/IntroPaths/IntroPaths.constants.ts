import type { Vector3Tuple } from 'three';

/**
 * Seeded flight paths: each dagger gets its own archetype, all meet at the convergence point.
 * World units are metres; the field is at the origin, the hero camera at z = 5 looking at -z.
 */
export const FLIGHT = {
    /** Where all five heads meet at CONVERGENCE_SECONDS, above and in front of the field */
    convergence: [0, 9, -6] as Vector3Tuple,
    /** End of the fan: this far above each landing point, along the dagger's own axis */
    fanHeight: 6,
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
    earliestSeconds: 0.25,
    latestSeconds: 2.5,
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
