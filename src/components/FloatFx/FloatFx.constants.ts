/**
 * 2D glow around a dagger floating at its section's anchor. Lengths in the dagger's own units
 * (before the lift scale), centred on the middle of the dagger; speeds per second.
 */
export const FLOAT_FX = {
    /** Share of the lift from which the effects fade in: they appear as the dagger settles */
    fadeInFrom: 0.6
} as const;

/** Additive soft disc behind the dagger, breathing with the dagger's own pulse */
export const HALO = {
    size: 3.4,
    textureSize: 128,
    /** Opacity at the pulse's low point and at its peak */
    minOpacity: 0.25,
    maxOpacity: 0.55
} as const;

/** Sparks drifting up around the blade and fading near the top */
export const EMBERS = {
    count: 26,
    seed: 41,
    /** Particles spawn within this horizontal radius of the blade axis */
    radius: 0.45,
    /** Rise from -height / 2 to height / 2, then loop */
    height: 3.2,
    minSpeed: 0.25,
    maxSpeed: 0.6,
    /** Sideways sway */
    wobble: 0.08,
    wobbleSpeed: 2.2,
    /** Share of the height over which they fade out at the top */
    fadeShare: 0.4,
    /** World size of a particle (points size ignores the lift scale) */
    size: 0.05,
    textureSize: 32,
    opacity: 0.9
} as const;

/** Painterly wisps rising behind the dagger: a procedural flipbook, swappable for a painted sheet */
export const WISP = {
    columns: 4,
    rows: 2,
    /** Canvas pixels per frame */
    frameWidth: 128,
    frameHeight: 256,
    framesPerSecond: 10,
    seed: 53,
    strokeCount: 7,
    minStrokeWidth: 3,
    maxStrokeWidth: 9,
    /** Sideways sweep of a stroke's curve, in canvas pixels */
    sway: 40,
    strokeAlpha: 0.3,
    width: 1.8,
    height: 3,
    opacity: 0.35
} as const;

/** Glyphs orbiting the blade on a tilted ellipse */
export const RUNE_ORBIT = {
    count: 6,
    seed: 67,
    textureSize: 64,
    strokesPerGlyph: 4,
    radiusX: 0.75,
    radiusZ: 0.35,
    /** Vertical rise and fall around the orbit: tilts the ellipse */
    tilt: 0.25,
    /** Radians per second */
    speed: 0.6,
    /** Slightly above the dagger's middle, around the upper blade */
    centerY: 0.3,
    size: 0.2,
    opacity: 0.85
} as const;
