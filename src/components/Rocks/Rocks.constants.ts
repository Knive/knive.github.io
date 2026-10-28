import type { Vector3Tuple } from 'three';

export const ROCK_MATERIAL = {
    color: '#2a303b',
    /** Cool moonlight on the edges, like the daggers */
    rimColor: '#5d7ea8'
} as const;

type RockPlacement = {
    /** Centre sits on the floor, so the lower half is buried */
    position: Vector3Tuple;
    scale: Vector3Tuple;
    rotationY: number;
};

/** Hand-placed around the dagger row (x -2.6 to 2.6, z = 0), never in front of a dagger */
export const ROCKS: RockPlacement[] = [
    { position: [-4.2, 0, -1.5], scale: [0.9, 0.55, 0.8], rotationY: 0.4 },
    { position: [-3.4, 0, 0.9], scale: [0.45, 0.3, 0.4], rotationY: 1.2 },
    { position: [-5.8, 0, -3.5], scale: [1.4, 0.8, 1.1], rotationY: 2.1 },
    { position: [-1.8, 0, -3.2], scale: [0.6, 0.35, 0.5], rotationY: 1.7 },
    { position: [-0.9, 0, 2.3], scale: [0.14, 0.1, 0.13], rotationY: 2.2 },
    { position: [0.6, 0, 1.8], scale: [0.18, 0.12, 0.16], rotationY: 0.5 },
    { position: [1.6, 0, -2.6], scale: [0.5, 0.3, 0.45], rotationY: 3 },
    { position: [3.8, 0, -0.8], scale: [0.7, 0.45, 0.65], rotationY: 0.9 },
    { position: [4.6, 0, 1.2], scale: [0.35, 0.25, 0.35], rotationY: 2.6 },
    { position: [6.2, 0, -2.8], scale: [1.2, 0.9, 1], rotationY: 0.2 }
];
