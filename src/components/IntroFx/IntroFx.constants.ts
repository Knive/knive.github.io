/** Colour of the beats that follow no dagger: the black ignition and the white convergence */
export const IGNITION_COLOR = '#000000';
export const CONVERGENCE_COLOR = '#ffffff';

/** The ignition is near-black except a small clear area around the first flare */
export const IGNITION_FLOOD = {
    alpha: 0.92,
    clearRadius: 0.06
} as const;

/** Placeholder heads until the painted flipbooks: a glowing dot at each blade tip */
export const HEAD_GLOW = {
    sizeMetres: 1.2,
    /** Colour multiplier, above 1 so the heads bloom */
    brightness: 4,
    textureSize: 64
} as const;
