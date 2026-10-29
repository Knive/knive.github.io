import type { Outline } from '@/components/Dagger/Dagger.helpers';

/**
 * Skills dagger, "Rune Fang": long blade with a straight left edge and a scalloped right edge,
 * runes down a dark fuller, forward crescent guard on one side with a teal crystal in a ring,
 * criss-cross leather binding, hooked fang pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -SKILLS_BLADE.length).
 */
export const SKILLS_BLADE = {
    length: 2.4,
    depth: 0.04,
    bevelSize: 0.018,
    bevelThickness: 0.012
} as const;

/** Three shallow scallops on the right edge, in the exposed part; the needle tip is buried at rest */
export const SKILLS_BLADE_OUTLINE: Outline = [
    { to: [-0.08, 0] },
    { to: [0.09, 0] },
    { to: [0.09, -0.3], control: [0.045, -0.15] },
    { to: [0.09, -0.6], control: [0.045, -0.45] },
    { to: [0.09, -0.9], control: [0.045, -0.75] },
    { to: [0.08, -1.9] },
    { to: [0, -2.4], control: [0.07, -2.2] },
    { to: [-0.08, -1.9], control: [-0.07, -2.2] },
    { to: [-0.08, 0] }
];

/** Teal-tinted worn edge, like the coloured edges of the reference blades */
export const SKILLS_BLADE_PAINT = { edgeColor: '#9ff2ea', seed: 12 } as const;

/** Dark groove down the blade centre that holds the runes, in shape units */
export const FULLER = {
    x: -0.005,
    halfWidth: 0.028,
    startY: -0.08,
    endY: -1.35,
    color: 'rgba(0, 0, 0, 0.4)'
} as const;

export const FULLER_RUNES = {
    count: 7,
    /** Glyph half-height in shape units; strokes come from RUNE_STROKES */
    radius: 0.06,
    lineWidth: 0.007
} as const;

/** Rune strokes as [x1, y1, x2, y2] in a unit square centred on the glyph */
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

/** Crescent sweeping forward and up on the left, short stub on the right; the ring covers the middle */
export const GUARD_OUTLINE: Outline = [
    { to: [-0.06, -0.045] },
    { to: [-0.31, 0.14], control: [-0.27, -0.08] },
    { to: [-0.05, 0.045], control: [-0.18, 0.01] },
    { to: [0.15, 0.035] },
    { to: [0.15, -0.035] }
];

export const GUARD_BEVEL = { depth: 0.06, bevelSize: 0.012 } as const;

/** Ring facing the camera at the guard centre, holding the crystal */
export const GUARD_RING = {
    positionY: 0.01,
    radius: 0.075,
    tube: 0.022,
    radialSegments: 8,
    tubularSegments: 20
} as const;

export const GUARD_CRYSTAL = {
    radius: 0.06,
    scale: [0.8, 1.15, 1.2] as const,
    color: '#2a8f8a'
} as const;

export const SKILLS_GRIP = {
    startY: 0.09,
    length: 0.72,
    coreRadius: 0.04,
    strapRadius: 0.014,
    turns: 5,
    radialSegments: 8
} as const;

/** Small hook bending to the right on top of the grip */
export const POMMEL_OUTLINE: Outline = [
    { to: [-0.045, 0] },
    { to: [0.045, 0] },
    { to: [0.05, 0.05] },
    { to: [0.15, 0], control: [0.14, 0.09] },
    { to: [0.02, 0.13], control: [0.13, 0.15] },
    { to: [-0.045, 0.08] }
];

export const POMMEL = { positionY: 0.81, depth: 0.05, bevelSize: 0.01 } as const;
