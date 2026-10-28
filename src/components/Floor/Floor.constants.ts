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
    baseColor: '#0f141d',
    patchColors: ['#161c27', '#0a0d13', '#1c2430', '#10141a'],
    patchCount: 200,
    /** In canvas pixels */
    patchMinRadius: 20,
    patchMaxRadius: 80,
    /** Corners per patch; few corners give angular stones */
    patchCorners: 5,
    /** Corner distance range, relative to the patch radius */
    cornerMinScale: 0.8,
    cornerMaxScale: 1.1
} as const;

/** Random-walk cracks; lengths and widths in canvas pixels, angles in radians */
export const CRACKS = {
    color: '#05070a',
    perDagger: 8,
    randomCount: 20,
    minSegments: 15,
    maxSegments: 35,
    segmentLength: 12,
    /** Max change of direction per segment */
    angleJitter: 0.4,
    startWidth: 4,
    minWidth: 1,
    /** Chance per segment to fork a thinner, shorter branch */
    branchChance: 0.15,
    branchMinAngle: 0.3,
    branchMaxAngle: 0.9,
    /** Scattered cracks start thinner than the ones under the daggers */
    scatteredWidthRatio: 0.6,
    maxBranchDepth: 3
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
