/**
 * Skills dagger: double-edged blade, runes in the fuller.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -SKILLS_BLADE.length).
 */
export const SKILLS_BLADE = {
    length: 2.2,
    halfWidth: 0.085,
    /** Where both edges start converging faster towards the tip */
    taperStartY: -1.4,
    taperHalfWidth: 0.07,
    depth: 0.004,
    /** A wide, single-step bevel gives the diamond cross-section and the central ridge */
    bevelSize: 0.04,
    bevelThickness: 0.022,
    bevelSegments: 1
} as const;

export const SKILLS_RUNES = {
    glyphCount: 5,
    /** Canvas fraction (from the guard) where glyphs stop, inside the exposed part of the blade */
    glyphAreaEnd: 0.55,
    lineWidth: 4,
    /** Glyph radius as a fraction of the canvas width */
    glyphRadiusRatio: 0.28
} as const;

/** Rune strokes as [x1, y1, x2, y2] in a unit square centred on the glyph (y down) */
export const RUNE_STROKES: readonly (readonly [number, number, number, number])[][] = [
    [
        [0, -1, 0, 1],
        [0, -0.7, 0.6, -0.2],
        [0, -0.2, 0.6, 0.3]
    ],
    [
        [0, -1, 0, 1],
        [0, -1, 0.6, -0.4],
        [0.6, -0.4, 0, 0.1],
        [0, 0.1, 0.6, 1]
    ],
    [
        [-0.6, -1, 0.6, 1],
        [0.6, -1, -0.6, 1]
    ],
    [
        [0, -1, 0, 1],
        [-0.6, -0.4, 0.6, 0.4]
    ]
];

export const SKILLS_GUARD = {
    halfWidth: 0.2,
    halfHeight: 0.035,
    depth: 0.06,
    bevelSize: 0.012
} as const;

export const SKILLS_HANDLE = {
    length: 0.92,
    baseRadius: 0.048,
    wrapRadius: 0.056,
    wrapCount: 6,
    radialSegments: 8
} as const;

export const SKILLS_POMMEL = {
    positionY: 0.96,
    radius: 0.07,
    thickness: 0.035,
    radialSegments: 12
} as const;
