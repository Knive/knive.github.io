/**
 * Projects dagger, "Crescent Wave": wide wavy blade with a hooked notch on the spine,
 * open crescent ring around a violet orb, leather grip with copper bands, four-point star pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -PROJECTS_BLADE.length).
 */
export const PROJECTS_BLADE = {
    length: 2.2,
    depth: 0.04,
    bevelSize: 0.018,
    bevelThickness: 0.012
} as const;

/** Both edges follow the same sine, so the whole blade snakes; in shape units */
export const BLADE_WAVES = {
    halfWidth: 0.11,
    amplitude: 0.04,
    count: 3,
    /** The waves stop here; below, the blade tapers straight to the tip */
    endY: -1,
    samplesPerWave: 8,
    taperY: -1.7
} as const;

/** Barb pointing up out of a slot in the right edge, just below the waves */
export const SPINE_HOOK = {
    cutDepth: 0.07,
    cutY: -1.06,
    barbOut: 0.05,
    barbY: -1.01,
    endOut: 0.03,
    endY: -1.2
} as const;

export const PROJECTS_BLADE_PAINT = { seed: 13 } as const;

/** Two engraved lines following the waves, either side of the centre, and dots on the crests */
export const WAVE_RUNES = {
    lineOffset: 0.03,
    startY: -0.04,
    endY: -1.1,
    samples: 48,
    lineWidth: 0.007,
    dotRadius: 0.012
} as const;

/** Open ring around the orb; the gap faces right */
export const CRESCENT_RING = {
    centerY: 0.04,
    outerRadius: 0.2,
    innerRadius: 0.14,
    /** Half of the gap angle, in radians */
    gapHalfAngle: 0.55,
    depth: 0.06,
    bevelSize: 0.012
} as const;

export const GUARD_ORB = {
    radius: 0.12,
    detail: 1,
    depthScale: 0.85,
    color: '#5b2a6e'
} as const;

export const PROJECTS_GRIP = {
    /** Starts at the top of the ring */
    startY: 0.23,
    length: 0.56,
    coreRadius: 0.042,
    strapRadius: 0.022,
    turns: 12,
    radialSegments: 8
} as const;

export const COPPER_BANDS = {
    radius: 0.066,
    height: 0.04,
    radialSegments: 10,
    positionsY: [0.42, 0.62],
    color: '#a8643a'
} as const;

export const STAR_POMMEL = {
    positionY: 0.88,
    points: 4,
    outerRadius: 0.1,
    innerRadius: 0.032,
    depth: 0.05,
    bevelSize: 0.01
} as const;
