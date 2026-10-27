/** Square floor plane centred on the daggers; fog hides its edges */
export const FLOOR = {
    size: 24,
    textureSize: 1024,
    /** Crack layout seed; the stone and puddles use their own, so cracks stay put if those change */
    crackSeed: 7,
    surfaceSeed: 8,
    metalness: 0.05
} as const;

/** Flagstone-like patches of slightly different darks on the base stone */
export const STONE = {
    baseColor: '#0B0E13',
    patchColors: ['#0E1218', '#090C10', '#12161C', '#0C0F14'],
    patchCount: 260,
    /** In canvas pixels */
    patchMinRadius: 12,
    patchMaxRadius: 56,
    /** Corners per patch; few corners give angular stones */
    patchCorners: 6,
    /** Corner distance range, relative to the patch radius */
    cornerMinScale: 0.7,
    cornerMaxScale: 1.2
} as const;

/** Random-walk cracks; lengths and widths in canvas pixels, angles in radians */
export const CRACKS = {
    color: '#020304',
    perDagger: 5,
    randomCount: 14,
    minSegments: 10,
    maxSegments: 28,
    segmentLength: 9,
    /** Max change of direction per segment */
    angleJitter: 0.55,
    startWidth: 3,
    minWidth: 0.6,
    /** Chance per segment to fork a thinner, shorter branch */
    branchChance: 0.12,
    branchMinAngle: 0.4,
    branchMaxAngle: 1.1,
    /** Scattered cracks start thinner than the ones under the daggers */
    scatteredWidthRatio: 0.7,
    maxBranchDepth: 2
} as const;

/** Wet patches in the roughness map: dark is smooth (wet), light is rough (dry stone) */
export const PUDDLES = {
    count: 22,
    minRadius: 30,
    maxRadius: 120,
    dryRoughnessColor: '#E0E0E0',
    wetRoughnessColor: 'rgba(30, 30, 30, 1)',
    wetRoughnessTransparent: 'rgba(30, 30, 30, 0)'
} as const;

/** High tier only: real blurred reflections (drei MeshReflectorMaterial) */
export const REFLECTOR = {
    resolution: 512,
    blur: [300, 100] as [number, number],
    mixBlur: 1,
    mixStrength: 1.4,
    mirror: 0
} as const;
