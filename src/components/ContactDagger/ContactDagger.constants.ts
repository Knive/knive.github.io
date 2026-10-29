import type { Vector3Tuple } from 'three';

import type { Outline } from '@/components/Dagger/Dagger.helpers';

/**
 * Contact dagger, "Ember Hook": short heavy blade with a saw back and a hooked tip,
 * red worn edge, single hooking quillon with an orange crystal shard, loosely wrapped grip, ring pommel.
 * Local space follows docs/dagger-geometry.md (guard at y = 0, tip at y = -CONTACT_BLADE.length).
 */
export const CONTACT_BLADE = {
    length: 1.8,
    depth: 0.045,
    bevelSize: 0.02,
    bevelThickness: 0.012
} as const;

/** Saw teeth on the right (spine) edge, leaning towards the guard; in shape units */
export const SAW_TEETH = {
    spineX: 0.1,
    startY: -0.1,
    count: 5,
    pitch: 0.1,
    height: 0.045,
    /** How far each tooth point leans back towards the guard */
    lean: 0.02
} as const;

/** From the end of the teeth: spine curves into the hook, belly and recurved edge come back up */
export const CONTACT_BLADE_TAIL: Outline = [
    { to: [0.1, -1.1] },
    { to: [0.2, -1.72], control: [0.05, -1.55] },
    { to: [-0.13, -1.15], control: [0.02, -1.85] },
    { to: [-0.12, 0], control: [-0.18, -0.55] }
];

/** Ember-red worn edge, like the coloured edges of the reference blades */
export const CONTACT_BLADE_PAINT = { edgeColor: '#ff7a4a', seed: 15 } as const;

/** Short spark ticks scattered down the blade centre */
export const SPARK_RUNES = {
    seed: 51,
    count: 10,
    minX: -0.05,
    maxX: 0.05,
    startY: -0.12,
    endY: -0.95,
    length: 0.04,
    lineWidth: 0.008
} as const;

/** Bar with one quillon hooking down and forward on the left */
export const GUARD_OUTLINE: Outline = [
    { to: [0.09, -0.045] },
    { to: [-0.13, -0.045] },
    { to: [-0.25, -0.17], control: [-0.21, -0.06] },
    { to: [-0.15, 0.05], control: [-0.27, 0.03] },
    { to: [0.09, 0.05] }
];

export const GUARD_BEVEL = { depth: 0.07, bevelSize: 0.012 } as const;

/** Shard set at the root of the quillon, tilted along it */
export const GUARD_CRYSTAL = {
    position: [-0.13, 0.005, 0] as Vector3Tuple,
    radius: 0.07,
    scale: [0.55, 1.5, 1.1] as const,
    tilt: 0.7,
    color: '#8a3a16'
} as const;

/** Few, thin turns: the bare tang shows between them */
export const CONTACT_GRIP = {
    startY: 0.05,
    length: 0.6,
    coreRadius: 0.04,
    strapRadius: 0.018,
    turns: 5,
    radialSegments: 8
} as const;

export const TANG_COLOR = '#4a4a52';

/** Ring facing the camera on top of the grip */
export const RING_POMMEL = {
    radius: 0.075,
    tube: 0.022,
    radialSegments: 8,
    tubularSegments: 20
} as const;
