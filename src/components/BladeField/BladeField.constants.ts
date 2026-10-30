import type { Outline } from '@/components/Dagger/Dagger.helpers';

/**
 * Hand-placed landed composition: where each CV dagger and each decorative blade is planted.
 * No runtime randomness: the scene looks the same on every load.
 */

export type LandingTransform = {
    /** Ground point the blade enters, in world units */
    x: number;
    z: number;
    /** Lean in radians: positive tiltX tips the hilt towards the camera, positive tiltZ to the left */
    tiltX: number;
    tiltZ: number;
    /** Turn around the blade axis; kept small so the flat blades still face the camera */
    yaw: number;
    /** Share of the blade above ground; the rest is buried */
    exposedRatio: number;
};

/** The five CV daggers, keyed by section id; not a straight row, each leans its own way */
export const DAGGER_LANDINGS: Record<string, LandingTransform> = {
    experience: { x: -2.75, z: 0.35, tiltX: -0.05, tiltZ: 0.13, yaw: 0.25, exposedRatio: 0.62 },
    skills: { x: -1.6, z: -0.55, tiltX: 0.06, tiltZ: -0.07, yaw: -0.3, exposedRatio: 0.56 },
    projects: { x: 0.12, z: 0.1, tiltX: -0.08, tiltZ: 0.04, yaw: 0.12, exposedRatio: 0.6 },
    education: { x: 1.45, z: -0.4, tiltX: 0.05, tiltZ: -0.15, yaw: -0.22, exposedRatio: 0.66 },
    contact: { x: 2.7, z: 0.45, tiltX: -0.04, tiltZ: 0.1, yaw: 0.32, exposedRatio: 0.58 }
};

export type DecorBlade = LandingTransform & {
    /** Index into DECOR_VARIANTS */
    variant: number;
    /** World length of the blade; the whole sword scales with it */
    bladeLength: number;
};

/**
 * Plain swords around the daggers, like a field of planted blades. Checked against the dagger labels
 * and the hero title at 1440×900: the two framing swords lean out of the frame edges, the others
 * stand in the gaps between the daggers with their tips below the labels.
 */
export const DECOR_BLADES: DecorBlade[] = [
    {
        x: -7.2,
        z: -4,
        tiltX: 0,
        tiltZ: 0.28,
        yaw: 0.2,
        exposedRatio: 0.34,
        variant: 0,
        bladeLength: 4.5
    },
    {
        x: 7.1,
        z: -4.2,
        tiltX: 0,
        tiltZ: -0.26,
        yaw: -0.2,
        exposedRatio: 0.45,
        variant: 0,
        bladeLength: 4.2
    },
    {
        x: -0.9,
        z: -4,
        tiltX: -0.04,
        tiltZ: -0.08,
        yaw: 0.1,
        exposedRatio: 0.4,
        variant: 0,
        bladeLength: 3.2
    },
    {
        x: 2,
        z: -5.5,
        tiltX: 0.05,
        tiltZ: 0.1,
        yaw: -0.15,
        exposedRatio: 0.3,
        variant: 2,
        bladeLength: 3.6
    },
    {
        x: -3.8,
        z: -6,
        tiltX: 0,
        tiltZ: -0.05,
        yaw: 0.25,
        exposedRatio: 0.6,
        variant: 1,
        bladeLength: 3.8
    },
    {
        x: 5.5,
        z: -7,
        tiltX: -0.03,
        tiltZ: 0.06,
        yaw: -0.1,
        exposedRatio: 0.5,
        variant: 0,
        bladeLength: 4
    },
    {
        x: -6.5,
        z: -8,
        tiltX: 0.04,
        tiltZ: 0.1,
        yaw: 0.15,
        exposedRatio: 0.45,
        variant: 2,
        bladeLength: 4.2
    },
    {
        x: 1.5,
        z: -9,
        tiltX: 0,
        tiltZ: -0.04,
        yaw: 0.05,
        exposedRatio: 0.6,
        variant: 0,
        bladeLength: 4
    }
];

/** Sword shapes are drawn for this blade length, then scaled to each DecorBlade's bladeLength */
export const DECOR_BASE_LENGTH = 3;

export const DECOR_MATERIAL = {
    bladeColor: '#9aa4ae',
    hiltColor: '#2e2a2a',
    /** Cool moonlight rim, like the rocks */
    rimColor: '#5d7ea8'
} as const;

type DecorVariant = { outline: Outline; guardHalfWidth: number; paintSeed: number };

/** Straight longsword, broad blade with an uneven tip, curved sabre */
export const DECOR_VARIANTS: DecorVariant[] = [
    {
        outline: [
            { to: [-0.1, 0] },
            { to: [0.1, 0] },
            { to: [0.085, -2.5] },
            { to: [0, -3] },
            { to: [-0.085, -2.5] }
        ],
        guardHalfWidth: 0.35,
        paintSeed: 61
    },
    {
        outline: [
            { to: [-0.17, 0] },
            { to: [0.17, 0] },
            { to: [0.16, -2.3] },
            { to: [0, -3] },
            { to: [-0.16, -2.6] }
        ],
        guardHalfWidth: 0.45,
        paintSeed: 62
    },
    {
        outline: [
            { to: [-0.09, 0] },
            { to: [0.1, 0] },
            { to: [0.06, -3], control: [0.22, -1.6] },
            { to: [-0.09, 0], control: [0.05, -1.5] }
        ],
        guardHalfWidth: 0.28,
        paintSeed: 63
    }
];

/** Hilt in base-length units; the pommel top stays at about 0.67 above the guard */
export const DECOR_BLADE_BEVEL = { depth: 0.04, bevelSize: 0.02, bevelThickness: 0.012 } as const;

export const DECOR_GUARD = { halfHeight: 0.04, depth: 0.07, bevelSize: 0.015 } as const;

export const DECOR_GRIP = { startY: 0.04, length: 0.5, radius: 0.045, radialSegments: 8 } as const;

export const DECOR_POMMEL = { positionY: 0.6, radius: 0.07, segments: 8 } as const;
