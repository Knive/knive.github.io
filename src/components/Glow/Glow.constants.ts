/** playGlow intensities: hover is a small flash, landing (and click/tap until the intro exists) the full effect */
export const GLOW_INTENSITY = {
    hover: 0.35,
    landing: 1
} as const;

/** Sustained emissive multiplier around each dagger's own pulse; bloom starts above 1 */
export const GLOW_LEVEL = {
    idle: 0.5,
    hover: 2.5,
    /** Higher values reach the target level faster */
    smoothing: 5
} as const;

/** Extra emissive added at the peak of a full-intensity burst */
export const BURST_EMISSIVE_PEAK = 6;

/** One-shot burst: linear attack, then exponential decay to ~1% at the end */
export const BURST_ENVELOPE = {
    attackSeconds: 0.06,
    durationSeconds: 1.2,
    /** Envelope value left at durationSeconds, where it snaps to 0 */
    endLevel: 0.01
} as const;

export type SineWave = { frequency: number; amplitude: number; phase: number };

/** Per-dagger pulse shapes; times in seconds, outputs kept within [0, 1] */
export const PULSE = {
    clockwork: {
        tickSeconds: 1,
        /** Higher gives a sharper tick */
        decay: 6,
        floor: 0.2
    },
    runeShimmer: {
        base: 0.7,
        waves: [
            { frequency: 7, amplitude: 0.15, phase: 0 },
            { frequency: 11.3, amplitude: 0.15, phase: 0.8 }
        ] as SineWave[]
    },
    heartbeat: {
        periodSeconds: 1.6,
        /** Beat centres as fractions of the period: "lub" then "dub" */
        firstBeat: 0.1,
        secondBeat: 0.32,
        secondBeatStrength: 0.7,
        /** Beat width as a fraction of the period */
        beatWidth: 0.06,
        floor: 0.25
    },
    breathing: {
        periodSeconds: 4,
        floor: 0.15
    },
    emberFlicker: {
        base: 0.6,
        waves: [
            { frequency: 5.3, amplitude: 0.2, phase: 0 },
            { frequency: 13.7, amplitude: 0.12, phase: 1.3 },
            { frequency: 29.1, amplitude: 0.08, phase: 2.1 }
        ] as SineWave[]
    }
} as const;

/** The one shared light that follows the active dagger and takes its glow colour */
export const GLOW_LIGHT = {
    /** Relative to the active dagger's base: at hilt height, slightly towards the camera */
    height: 0.8,
    offsetZ: 0.6,
    /** Sustained intensity while the dagger is hovered */
    hoverIntensity: 3,
    /** Extra intensity at the peak of a full-intensity burst */
    burstPeak: 15,
    decay: 2,
    /** Higher values follow the active dagger faster (position, colour and intensity) */
    smoothing: 6
} as const;

/** Glowing cracks: an additive decal on the floor around each dagger, lit by its bursts */
export const CRACK_GLOW = {
    /** World units; cracks beyond it stay dark */
    size: 4,
    textureSize: 512,
    /** Just above the floor and the contact shadow */
    height: 0.003,
    /** Colour multiplier at a full burst; above 1 so the cracks bloom */
    peak: 4
} as const;

/** Flat ring racing outwards over the floor; radii in world units */
export const SHOCKWAVE_RING = {
    durationSeconds: 0.6,
    /** Radius reached by a full-intensity burst */
    maxRadius: 2.4,
    /** Ring band as a fraction of its radius */
    innerRadiusRatio: 0.9,
    segments: 48,
    /** Just above the crack glow */
    height: 0.006,
    /** Colour multiplier at the start of a full burst; above 1 so it blooms */
    peak: 3
} as const;

/** Sparks thrown up from the blade's entry point; world units and seconds */
export const SPARKS = {
    /** Thrown by a full-intensity burst; fewer for weaker ones */
    maxCount: 32,
    lifeSeconds: 0.9,
    minSpeed: 1.2,
    maxSpeed: 3,
    /** Max angle from vertical, in radians */
    coneAngle: 0.6,
    gravity: 6,
    originHeight: 0.05,
    size: 0.05,
    /** Colour multiplier at birth; above 1 so they bloom */
    peak: 4
} as const;
