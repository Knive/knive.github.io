/** Fresnel rim: kept below 1 so it never blooms */
export const TOON_RIM = {
    /** 0 lights every face, 1 only grazing edges */
    threshold: 0.6,
    intensity: 0.45
} as const;

/** Just above the tallest pommel (y = 1), clear of the hero title */
export const LABEL_POSITION_Y = 1.1;

export const DEFAULT_BEVEL_SEGMENTS = 2;

export const OUTLINE = {
    thickness: 0.008,
    color: '#07090D'
} as const;

/**
 * Invisible box that catches the pointer, wider than the thin blades so they are easy to hover.
 * It stands on the ground and reaches above the pommel.
 */
export const HIT_SHAPE = {
    width: 0.55,
    depth: 0.4,
    /** From the guard to just above the tallest pommel */
    hiltHeight: 1.1
} as const;

/** Fake contact shadow on the floor where the blade enters it */
export const CONTACT_SHADOW = {
    size: 0.9,
    /** Just above the floor to avoid z-fighting */
    height: 0.002,
    textureSize: 128,
    opacity: 0.85
} as const;

/** Dagger lifted out of the floor into its section's margin, centred on the section's anchor box */
export const DAGGER_LIFT = {
    /** World units from the camera along the ray through the anchor's centre */
    distance: 5,
    /** Smaller than on the floor, so the whole dagger fits the anchor box */
    scale: 0.55,
    /** Top of the tallest pommel above the guard, to centre the whole dagger, buried tip included */
    hiltTopY: 1,
    /** Slow idle turn around the blade axis while lifted */
    swayAngle: 0.35,
    swaySpeed: 0.6
} as const;

/** Canvases drawn in shape units (blade paint, rune mask): the longest side gets this many pixels */
export const SHAPE_TEXTURE_SIZE = 1024;

/** Painted blade metal (ref: Arcane props): worn lighter edges and light scratches */
export const BLADE_PAINT = {
    /** Worn band along the outline, in shape units */
    edgeWidth: 0.022,
    scratchCount: 70,
    scratchMinLength: 0.02,
    scratchMaxLength: 0.09,
    scratchWidth: 0.003,
    scratchColor: 'rgba(255, 255, 255, 0.18)'
} as const;

/** Helical leather strap around a grip core; lengths in world units */
export const LEATHER_WRAP = {
    segmentsPerTurn: 16,
    radialSegments: 5,
    /** Grayscale, tinted by the material colour */
    textureWidth: 128,
    textureHeight: 32,
    baseColor: '#d6d0c8',
    edgeColor: '#7a746c',
    stitchColor: '#8d877f',
    stitchesPerTurn: 3
} as const;

/** Grayscale blade paint, tinted by the dagger's bladeColor: darker towards the tip, bright worn edge */
export const STEEL_PAINT = {
    baseColor: '#bdbdbd',
    tipColor: '#858585',
    edgeColor: '#ffffff'
} as const;
