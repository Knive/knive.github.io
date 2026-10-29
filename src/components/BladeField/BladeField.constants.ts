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
    skills: { x: -1.3, z: -0.55, tiltX: 0.06, tiltZ: -0.07, yaw: -0.3, exposedRatio: 0.56 },
    projects: { x: 0.12, z: 0.1, tiltX: -0.08, tiltZ: 0.04, yaw: 0.12, exposedRatio: 0.6 },
    education: { x: 1.45, z: -0.4, tiltX: 0.05, tiltZ: -0.15, yaw: -0.22, exposedRatio: 0.66 },
    contact: { x: 2.7, z: 0.45, tiltX: -0.04, tiltZ: 0.1, yaw: 0.32, exposedRatio: 0.58 }
};
