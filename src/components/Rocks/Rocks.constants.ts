import type { Vector3Tuple } from 'three';

export const ROCK_MATERIAL = {
    color: '#2a303b',
    /** Cool moonlight on the edges, like the daggers */
    rimColor: '#5d7ea8'
} as const;

type RockPlacement = {
    /** Centre sits on the ground, so the lower half is buried */
    x: number;
    z: number;
    scale: Vector3Tuple;
    rotationY: number;
};

/** Hand-placed around the dagger row (x -2.6 to 2.6, z = 0), never in front of a dagger */
export const ROCKS: RockPlacement[] = [
    { x: -4.2, z: -1.5, scale: [0.9, 0.55, 0.8], rotationY: 0.4 },
    { x: -3.4, z: 0.9, scale: [0.45, 0.3, 0.4], rotationY: 1.2 },
    { x: -5.8, z: -3.5, scale: [1.4, 0.8, 1.1], rotationY: 2.1 },
    { x: -1.8, z: -3.2, scale: [0.6, 0.35, 0.5], rotationY: 1.7 },
    { x: -0.9, z: 2.3, scale: [0.14, 0.1, 0.13], rotationY: 2.2 },
    { x: 0.6, z: 1.8, scale: [0.18, 0.12, 0.16], rotationY: 0.5 },
    { x: 1.6, z: -2.6, scale: [0.5, 0.3, 0.45], rotationY: 3 },
    { x: 3.8, z: -0.8, scale: [0.7, 0.45, 0.65], rotationY: 0.9 },
    { x: 4.6, z: 1.2, scale: [0.35, 0.25, 0.35], rotationY: 2.6 },
    { x: 6.2, z: -2.8, scale: [1.2, 0.9, 1], rotationY: 0.2 }
];
