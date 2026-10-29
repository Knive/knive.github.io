/** playGlow intensities: hover is a small flash, landing and click/tap the full effect */
export const GLOW_INTENSITY = {
    hover: 0.35,
    landing: 1
} as const;

/** Sustained emissive multiplier around each dagger's own pulse; bloom starts above 1 */
export const GLOW_LEVEL = {
    idle: 0.5,
    hover: 2.5,
    /** While flying in the intro: bright enough that each dagger's runes and crystal bloom in its colour */
    flight: 5,
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
        tickSeconds: 2,
        /** Higher gives a sharper tick */
        decay: 1.5,
        floor: 0.4
    },
    runeShimmer: {
        base: 0.7,
        waves: [
            { frequency: 7, amplitude: 0.15, phase: 0 },
            { frequency: 11.3, amplitude: 0.15, phase: 0.8 }
        ] as SineWave[]
    },
    /**
     * Sonar-like signal (ref: LottieFiles "wave animation"): the halo rings shrink into the core,
     * the bare core rests, then the inner and outer rings swell back out one after the other and hold.
     * Phases are fractions of the period.
     */
    signalWave: {
        periodSeconds: 4.3,
        contractEnd: 0.27,
        innerRing: { start: 0.33, end: 0.5 },
        outerRing: { start: 0.42, end: 0.62 },
        /** Share of the full glow the inner ring brings back; the outer ring brings the rest */
        innerRingShare: 0.55,
        /** Bare core */
        floor: 0.2
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
    peak: 4,
    /** Strength kept once landed: rest × peak stays below 1, a soft glow that never blooms */
    restLevel: 0.2,
    /** Strength held while hovered, on top of the short hover burst */
    hoverLevel: 0.45
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
/** Particles thrown from the blade's entry point by a burst (sparks, dust) */
export type BurstParticleSpec = {
    /** Thrown by a full-intensity burst; fewer for weaker ones */
    maxCount: number;
    lifeSeconds: number;
    minSpeed: number;
    maxSpeed: number;
    /** Max angle from vertical, in radians: small throws up, near PI / 2 skims the ground */
    coneAngle: number;
    gravity: number;
    /** Velocity lost per second (exponential); 0 for none */
    drag: number;
    originHeight: number;
    size: number;
    /** Additive glow (colour fades) or normal blending (opacity fades) */
    isAdditive: boolean;
    /** Additive: colour multiplier at birth, above 1 blooms. Normal: opacity at birth */
    peak: number;
};

export const SPARKS: BurstParticleSpec = {
    maxCount: 32,
    lifeSeconds: 0.9,
    minSpeed: 1.2,
    maxSpeed: 3,
    coneAngle: 0.6,
    gravity: 6,
    drag: 0,
    originHeight: 0.05,
    size: 0.05,
    isAdditive: true,
    peak: 4
};

/** Earth kicked up low and outwards by the impact, slowing down and settling */
export const DUST: BurstParticleSpec & { color: string; textureSize: number } = {
    maxCount: 28,
    lifeSeconds: 1.6,
    minSpeed: 0.6,
    maxSpeed: 2,
    coneAngle: 1.35,
    gravity: 0.4,
    drag: 2.2,
    originHeight: 0.08,
    size: 0.35,
    isAdditive: false,
    peak: 0.55,
    color: '#8a6a50',
    textureSize: 64
};
