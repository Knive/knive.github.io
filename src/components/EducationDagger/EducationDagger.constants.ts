import type { Outline } from '@/components/Dagger/Dagger.helpers';

/**
 * Education dagger, "Scribe's Quill": short thick blade curved like a quill nib (split at the tip),
 * open-book guard of two unequal leaves with a green crystal drop, bone-white grip, feather pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -EDUCATION_BLADE.length).
 */
export const EDUCATION_BLADE = {
    length: 1.6,
    // Slim but thick: chunky from the side rather than wide
    depth: 0.06,
    bevelSize: 0.016,
    bevelThickness: 0.012
} as const;

/** Both edges bow to the right; the nib split at the tip is buried at rest */
export const EDUCATION_BLADE_OUTLINE: Outline = [
    { to: [-0.06, 0] },
    { to: [0.06, 0] },
    { to: [0.05, -1.0], control: [0.08, -0.5] },
    { to: [0.004, -1.6], control: [0.05, -1.35] },
    { to: [0.002, -1.35] },
    { to: [-0.002, -1.35] },
    { to: [-0.004, -1.6] },
    { to: [-0.06, -1.0], control: [-0.04, -1.35] },
    { to: [-0.06, 0], control: [-0.045, -0.5] }
];

export const EDUCATION_BLADE_PAINT = { seed: 14 } as const;

/** Handwriting-like squiggle down the centre, with a dot after every few loops */
export const SCRIPT_RUNES = {
    startY: -0.06,
    endY: -0.85,
    amplitude: 0.014,
    loops: 9,
    samples: 120,
    lineWidth: 0.006,
    dotEveryLoops: 3,
    dotRadius: 0.01
} as const;

/** Open book: each leaf rises from the centre to its tip; the right one is smaller */
export const GUARD_LEAVES = {
    leftLength: 0.26,
    rightLength: 0.18,
    lift: 0.09,
    thickness: 0.06,
    depth: 0.05,
    bevelSize: 0.01
} as const;

/** Drop hanging under the tip of the right leaf */
export const GUARD_CRYSTAL = {
    radius: 0.065,
    scale: [0.75, 1.35, 1] as const,
    offsetY: -0.08,
    color: '#2f6b38'
} as const;

export const EDUCATION_GRIP = {
    startY: 0.06,
    length: 0.55,
    coreRadius: 0.036,
    strapRadius: 0.02,
    turns: 10,
    radialSegments: 8
} as const;

/** Flat feather vane leaning right, on top of the grip */
export const POMMEL_OUTLINE: Outline = [
    { to: [-0.03, 0] },
    { to: [0.03, 0] },
    { to: [0.1, 0.2], control: [0.085, 0.06] },
    { to: [-0.03, 0], control: [-0.02, 0.17] }
];

export const POMMEL = { positionY: 0.62, depth: 0.04, bevelSize: 0.008 } as const;
