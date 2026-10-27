export const HOVER_GLOW = {
    /** Above 1 so the emissive runes pass the bloom luminance threshold */
    intensity: 3,
    /** Higher values reach the target intensity faster */
    smoothing: 5
} as const;

/** Fresnel rim: kept below 1 so it never blooms */
export const TOON_RIM = {
    /** 0 lights every face, 1 only grazing edges */
    threshold: 0.6,
    intensity: 0.45
} as const;

/**
 * Geometry in local space, y-axis along the blade.
 * The guard sits at y = 0 so it rests on the ground once landed.
 */
export const BLADE = {
    length: 2.2,
    baseRadius: 0.032,
    tipRadius: 0.004,
    radialSegments: 6,
    metalness: 0.92,
    roughness: 0.15
} as const;

export const CROSS_GUARD = {
    width: 0.5,
    height: 0.065,
    depth: 0.09,
    metalness: 0.75,
    roughness: 0.45
} as const;

export const HANDLE = {
    length: 0.92,
    topRadius: 0.058,
    bottomRadius: 0.05,
    radialSegments: 8,
    metalness: 0.2,
    roughness: 0.88
} as const;

export const POMMEL = {
    positionY: 0.96,
    radius: 0.095,
    widthSegments: 8,
    heightSegments: 6,
    metalness: 0.82,
    roughness: 0.28
} as const;

export const LABEL_POSITION_Y = 1.35;

/**
 * How much of each blade stays above ground, like a short sword
 * planted in the earth. The rest of the blade is buried.
 */
export const EXPOSED_BLADE_RATIO = 0.6;

export const DEFAULT_BEVEL_SEGMENTS = 2;

export const OUTLINE = {
    thickness: 0.008,
    color: '#07090D'
} as const;

/** Emissive mask canvas: tall and narrow like a blade; top is the guard, bottom the tip */
export const EMISSIVE_MASK = {
    width: 64,
    height: 1024
} as const;

/** Fake contact shadow on the floor where the blade enters it */
export const CONTACT_SHADOW = {
    size: 0.9,
    /** Just above the floor to avoid z-fighting */
    height: 0.002,
    textureSize: 128,
    opacity: 0.85
} as const;
