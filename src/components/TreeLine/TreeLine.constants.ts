/** Canvas for one tree silhouette; transparent around the near-black tree */
export const TREE_TEXTURE = {
    width: 1024,
    height: 1024,
    color: '#040507',
    variantCount: 3,
    seedBase: 101,
    /** Empty margin kept around the crown, in canvas pixels */
    padding: 12
} as const;

/** Width / height of a tree plane, matching the canvas */
export const TREE_ASPECT = TREE_TEXTURE.width / TREE_TEXTURE.height;

/** Recursive bare branches; lengths and widths in canvas pixels, angles in radians */
export const BRANCHES = {
    trunkLength: 330,
    trunkWidth: 34,
    lengthDecay: 0.72,
    widthDecay: 0.62,
    minWidth: 1.2,
    maxDepth: 8,
    minForks: 2,
    maxForks: 3,
    /** Fan of child branches around the parent direction */
    spreadAngle: 0.45,
    /** Random bend at each kink, for gnarled branches */
    angleJitter: 0.35,
    /** Kinks per branch */
    segments: 3,
    /** Below this depth the trunk barely bends */
    stiffDepth: 1,
    /** Child length variation, relative to lengthDecay */
    minLengthScale: 0.8,
    maxLengthScale: 1.1
} as const;

type TreePlacement = {
    x: number;
    /** Negative: behind the daggers; fog fades the far ones */
    z: number;
    height: number;
    variant: number;
    isFlipped: boolean;
};

/** Spread wide so the dagger row in front stays readable */
export const TREES: TreePlacement[] = [
    { x: -9, z: -6, height: 8, variant: 0, isFlipped: false },
    { x: -5.5, z: -9, height: 7, variant: 1, isFlipped: true },
    { x: -2, z: -12, height: 9, variant: 2, isFlipped: false },
    { x: 1.5, z: -10, height: 6.5, variant: 0, isFlipped: true },
    { x: 5, z: -7, height: 7.5, variant: 2, isFlipped: true },
    { x: 8.5, z: -11, height: 9, variant: 1, isFlipped: false },
    { x: 11, z: -6.5, height: 8.5, variant: 0, isFlipped: false }
];
