/** Soft cloud canvas shared by every mist layer */
export const MIST_TEXTURE = {
    width: 512,
    height: 256,
    seed: 31,
    blobCount: 90,
    /** In canvas pixels */
    blobMinRadius: 20,
    blobMaxRadius: 70,
    /** Alpha at a blob's centre; overlapping blobs build up the denser parts */
    blobAlpha: 0.12
} as const;

type MistLayer = {
    /** World position of the layer centre; negative z sits behind the daggers */
    y: number;
    z: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
    /** Extra world units the layer sinks at full tilt; nearer layers move more */
    parallax: number;
    /** Sideways drift in world units per second; off under reduced motion */
    driftSpeed: number;
};

/** From far to near, between the tree line and the dagger row */
export const MIST_LAYERS: MistLayer[] = [
    {
        y: 1.6,
        z: -8,
        width: 30,
        height: 5,
        color: '#8a6a86',
        opacity: 0.5,
        parallax: 0.08,
        driftSpeed: 0.05
    },
    {
        y: 0.9,
        z: -5,
        width: 22,
        height: 3.5,
        color: '#a07a8a',
        opacity: 0.45,
        parallax: 0.14,
        driftSpeed: -0.07
    },
    {
        y: 0.4,
        z: -2.5,
        width: 16,
        height: 2.5,
        color: '#b88a86',
        opacity: 0.35,
        parallax: 0.22,
        driftSpeed: 0.1
    }
];
