/**
 * Experience dagger: long straight blade, brass guard with gear motifs.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -BLADE.length).
 */
/** Points per gear tooth: rise, outer flat, fall, inner flat */
export const TOOTH_STEPS = 4;
export const DEFAULT_BEVEL_SEGMENTS = 2;

export const EXPERIENCE_BLADE = {
    halfWidth: 0.07,
    /** Where the straight edges start tapering to the tip */
    taperStartY: -1.9,
    depth: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2
} as const;

export const RUNE_TEXTURE = {
    width: 64,
    height: 1024,
    glyphCount: 6,
    /** Canvas fraction (from the guard) where glyphs stop, inside the exposed part of the blade */
    glyphAreaEnd: 0.55,
    lineWidth: 4
} as const;

export const GUARD_BAR = {
    halfWidth: 0.22,
    halfHeight: 0.03,
    depth: 0.05,
    bevelSize: 0.01
} as const;

export const GUARD_GEAR = {
    teeth: 8,
    innerRadius: 0.06,
    outerRadius: 0.078,
    holeRadius: 0.025,
    depth: 0.04,
    bevelSize: 0.008
} as const;

export const POMMEL_GEAR = {
    positionY: 0.96,
    teeth: 10,
    innerRadius: 0.075,
    outerRadius: 0.092,
    holeRadius: 0.03,
    depth: 0.05,
    bevelSize: 0.008
} as const;

export const EXPERIENCE_HANDLE = {
    length: 0.92,
    baseRadius: 0.05,
    wrapRadius: 0.058,
    wrapCount: 4,
    radialSegments: 8
} as const;

export const OUTLINE = {
    thickness: 0.008,
    color: '#07090D'
} as const;
