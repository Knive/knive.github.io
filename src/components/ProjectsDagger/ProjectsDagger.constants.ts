/**
 * Projects dagger: wavy kris-like blade, crystal in the guard.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -PROJECTS_BLADE.length).
 */
export const PROJECTS_BLADE = {
    length: 2.2,
    baseHalfWidth: 0.085,
    /** Number of full side-to-side waves from guard to tip */
    waveCount: 3.5,
    waveAmplitude: 0.035,
    /** Outline points per edge; more gives smoother waves */
    sampleCount: 48,
    /** Higher keeps the width longer before narrowing to the tip */
    taperExponent: 4,
    depth: 0.01,
    bevelSize: 0.012
} as const;

export const PROJECTS_GUARD = {
    halfWidth: 0.18,
    halfHeight: 0.04,
    depth: 0.05,
    bevelSize: 0.01
} as const;

/** Glows on hover instead of the blade */
export const CRYSTAL = {
    radius: 0.06,
    /** Vertical stretch so the octahedron reads as a gem */
    stretchY: 1.5,
    color: '#2A1838'
} as const;

export const PROJECTS_HANDLE = {
    length: 0.92,
    baseRadius: 0.05,
    wrapRadius: 0.055,
    wrapCount: 5,
    radialSegments: 8
} as const;

export const PROJECTS_POMMEL = {
    positionY: 0.96,
    radius: 0.075,
    widthSegments: 8,
    heightSegments: 6
} as const;
