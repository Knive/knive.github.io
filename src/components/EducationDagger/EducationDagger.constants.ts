/**
 * Education dagger: short stiletto, slim and symmetrical.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -EDUCATION_BLADE.length).
 */
export const EDUCATION_BLADE = {
    /** Shorter than the others, so less blade shows above ground */
    length: 1.5,
    halfWidth: 0.035,
    depth: 0.002,
    /** A wide, single-step bevel gives the needle its diamond cross-section */
    bevelSize: 0.02,
    bevelThickness: 0.016,
    bevelSegments: 1
} as const;

/** Faint line glowing down the centre of the blade */
export const CENTRE_LINE = {
    lineWidth: 6,
    /** Canvas fraction (from the guard) where the line stops, inside the exposed part of the blade */
    lineEnd: 0.6
} as const;

/** Small round guard, a flat disc around the blade */
export const EDUCATION_GUARD = {
    radius: 0.08,
    thickness: 0.025,
    radialSegments: 12
} as const;

export const EDUCATION_HANDLE = {
    length: 0.7,
    baseRadius: 0.03,
    wrapRadius: 0.036,
    wrapCount: 5,
    radialSegments: 8
} as const;

export const EDUCATION_POMMEL = {
    radius: 0.045,
    /** Share of the radius sunk into the top of the handle */
    sinkRatio: 0.4,
    widthSegments: 8,
    heightSegments: 6
} as const;
