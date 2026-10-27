/**
 * Contact dagger: throwing dagger with a ring pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -CONTACT_BLADE.length).
 */
export const CONTACT_BLADE = {
    length: 2.0,
    baseHalfWidth: 0.03,
    /** Curve control point that swells the leaf-shaped belly */
    bellyHalfWidth: 0.12,
    bellyY: -0.7,
    depth: 0.008,
    bevelSize: 0.012
} as const;

/** Short chevron notches near the base of the blade */
export const NOTCH_MARKS = {
    count: 3,
    /** Canvas fractions, from the guard */
    start: 0.08,
    spacing: 0.05,
    /** Half of a notch's width as a fraction of the canvas width */
    halfWidth: 0.12,
    /** How far the chevron point dips, as a fraction of the canvas height */
    dip: 0.01,
    lineWidth: 5
} as const;

/** Small collar instead of a real guard */
export const CONTACT_COLLAR = {
    halfWidth: 0.06,
    halfHeight: 0.02,
    depth: 0.04,
    bevelSize: 0.008
} as const;

export const CONTACT_HANDLE = {
    length: 0.6,
    baseRadius: 0.032,
    wrapRadius: 0.038,
    wrapCount: 6,
    radialSegments: 8
} as const;

/** Ring pommel facing the camera */
export const CONTACT_RING = {
    radius: 0.075,
    tube: 0.018,
    radialSegments: 8,
    tubularSegments: 20
} as const;
