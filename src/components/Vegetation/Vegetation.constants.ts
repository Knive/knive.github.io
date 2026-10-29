/** Unlit dark silhouettes, like the trees; the fog fades the far ones */
export const VEGETATION_COLOR = '#1a120e';

/** Scatter area in world units; the camera sits at z = 5 */
export const SCATTER = {
    halfWidth: 11,
    minZ: -11,
    maxZ: 3,
    /** Keep this far from every planted blade */
    bladeClearance: 1,
    /** Half-width of the strip kept clear in front of each dagger, towards the camera */
    frontClearance: 0.7,
    /** Placement tries per card before giving up */
    maxAttemptsPerCard: 20
} as const;

type CardSpec = {
    count: number;
    seed: number;
    minHeight: number;
    maxHeight: number;
    /** Width / height of a card */
    aspect: number;
};

export const GRASS: CardSpec = {
    count: 260,
    seed: 31,
    minHeight: 0.18,
    maxHeight: 0.45,
    aspect: 1.2
};
export const BUSHES: CardSpec = {
    count: 28,
    seed: 32,
    minHeight: 0.35,
    maxHeight: 0.9,
    aspect: 1.5
};

/** Canvas silhouettes; lengths in canvas pixels, angles in radians from vertical */
export const CARD_TEXTURE_SIZE = 256;

export const GRASS_BLADES = {
    count: 13,
    seed: 41,
    baseSpread: 30,
    baseWidth: 5,
    minLength: 120,
    maxLength: 240,
    maxLean: 0.7
} as const;

export const BUSH_LEAVES = {
    count: 34,
    seed: 42,
    minRadius: 14,
    maxRadius: 40,
    /** Crown ellipse the leaf clumps are centred in, as shares of the canvas */
    crownWidth: 0.7,
    crownHeight: 0.55
} as const;
