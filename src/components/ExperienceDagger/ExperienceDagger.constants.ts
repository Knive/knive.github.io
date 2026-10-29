import type { Outline } from '@/components/Dagger/Dagger.helpers';

/**
 * Experience dagger, "Foreman's Cleaver": broad blade with a notched spine,
 * brass guard with a gear on one side and a square hook on the other, hex-nut pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -EXPERIENCE_BLADE.length).
 */

/** Points per gear tooth: rise, outer flat, fall, inner flat */
export const TOOTH_STEPS = 4;

export const EXPERIENCE_BLADE = {
    length: 2.1,
    depth: 0.035,
    bevelSize: 0.02,
    bevelThickness: 0.012
} as const;

/** Cutting edge on the left, notched spine on the right; the clipped tip is buried at rest */
export const EXPERIENCE_BLADE_OUTLINE: Outline = [
    { to: [-0.13, 0] },
    { to: [0.12, 0] },
    // Three square notches in the spine, in the exposed part
    { to: [0.12, -0.18] },
    { to: [0.09, -0.18] },
    { to: [0.09, -0.25] },
    { to: [0.12, -0.25] },
    { to: [0.12, -0.38] },
    { to: [0.09, -0.38] },
    { to: [0.09, -0.45] },
    { to: [0.12, -0.45] },
    { to: [0.12, -0.58] },
    { to: [0.09, -0.58] },
    { to: [0.09, -0.65] },
    { to: [0.12, -0.65] },
    { to: [0.12, -1.6] },
    // Clipped tip, then the belly sweeps back up the cutting edge
    { to: [0.03, -2.1] },
    { to: [-0.15, -1.45], control: [-0.19, -1.9] },
    { to: [-0.13, 0] }
];

export const EXPERIENCE_BLADE_PAINT = { seed: 11 } as const;

/** Tooth glyphs in a column along the spine, in shape units */
export const SPINE_RUNES = {
    x: -0.01,
    startY: -0.1,
    endY: -1.15,
    count: 9,
    halfSize: 0.022,
    lineWidth: 0.008
} as const;

/** Bar with a square hook dropping on the right; the gear covers its left end */
export const GUARD_OUTLINE: Outline = [
    { to: [-0.2, -0.045] },
    { to: [0.17, -0.045] },
    { to: [0.17, -0.12] },
    { to: [0.25, -0.12] },
    { to: [0.25, 0.05] },
    { to: [-0.2, 0.05] }
];

export const GUARD_BEVEL = { depth: 0.07, bevelSize: 0.012 } as const;

export const GUARD_GEAR = {
    positionX: -0.24,
    teeth: 9,
    innerRadius: 0.085,
    outerRadius: 0.11,
    holeRadius: 0.045,
    depth: 0.06,
    bevelSize: 0.01
} as const;

/** Amber crystal set in the gear hub; thicker than the gear so it shows on both sides */
export const GUARD_CRYSTAL = {
    radius: 0.07,
    scale: [1, 1.2, 1.3] as const,
    color: '#b07a2a'
} as const;

export const EXPERIENCE_GRIP = {
    startY: 0.05,
    length: 0.75,
    coreRadius: 0.045,
    // Strap thickness close to the winding pitch, so the turns touch
    strapRadius: 0.026,
    turns: 14,
    radialSegments: 8
} as const;

/** Brass rings at both ends of the leather */
export const GRIP_FERRULE = {
    radius: 0.064,
    height: 0.05,
    radialSegments: 10,
    positionsY: [0.075, 0.8]
} as const;

/** Hex nut facing the camera */
export const HEX_POMMEL = {
    positionY: 0.88,
    radius: 0.085,
    thickness: 0.07,
    sides: 6
} as const;
