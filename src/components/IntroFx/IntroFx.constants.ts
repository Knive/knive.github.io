/** Colour of the beats that follow no dagger: the black ignition and the white convergence */
export const IGNITION_COLOR = '#000000';
export const CONVERGENCE_COLOR = '#ffffff';

/** The ignition is near-black except a small clear area around the first flare */
export const IGNITION_FLOOD = {
    alpha: 0.92,
    clearRadius: 0.06
} as const;

/**
 * Flare on the first dagger's head during the ignition: hot core, 4-point cross, long horizontal
 * anamorphic streak. Sizes in view heights; it grows as the head comes at the lens
 */
export const IGNITION_FLARE = {
    coreRadius: 0.018,
    crossLength: 0.16,
    crossWidth: 0.004,
    streakLength: 0.75,
    streakWidth: 0.005,
    /** Colour multiplier at full size, above 1 so it blooms */
    peakIntensity: 3,
    /** Size at the first frame, as a share of the full size */
    startScale: 0.25,
    /** Share of the ignition it takes to light up */
    fadeInShare: 0.25,
    /** Above the colour flood */
    renderOrder: 1001
} as const;
