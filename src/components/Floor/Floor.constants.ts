/** Square ground plane centred on the daggers; fog hides its edges */
export const FLOOR = {
    size: 24,
    /** Grid resolution of the bumpy ground mesh, per side */
    segments: 160,
    textureSize: 1024,
    /** Crack layout seed; the dirt and mounds use their own, so cracks stay put if those change */
    crackSeed: 7,
    surfaceSeed: 8,
    roughness: 1
} as const;

/** Soft patches of warm earth and scattered pebbles on the base dirt */
export const DIRT = {
    baseColor: '#3b2a20',
    patchColors: ['#4a3426', '#2e211a', '#56402e', '#33261e'],
    patchCount: 260,
    /** In canvas pixels */
    patchMinRadius: 15,
    patchMaxRadius: 70,
    pebbleColors: ['#1e1611', '#6b5240', '#251b15'],
    pebbleCount: 2500,
    pebbleMinRadius: 0.6,
    pebbleMaxRadius: 2.2
} as const;

/** Gaussian mounds in world units; flattened along the dagger row so blades and crack glow sit at y = 0 */
export const MOUNDS = {
    count: 70,
    seed: 9,
    minHeight: 0.08,
    maxHeight: 0.45,
    minRadius: 0.5,
    maxRadius: 2.2,
    /** Half the width of the dagger row (outermost dagger x in Scene.constants) */
    rowHalfWidth: 2.6,
    /** Flat up to this distance from the row (covers the crack glow decals), full mounds from fullRadius */
    flatRadius: 2,
    fullRadius: 4
} as const;

/** Random-walk impact cracks around each dagger; lengths and widths in canvas pixels, angles in radians */
export const CRACKS = {
    color: '#140d09',
    perDagger: 6,
    // Short enough to stay inside the crack glow decal (2 world units from the dagger)
    minSegments: 4,
    maxSegments: 9,
    segmentLength: 8,
    /** Max change of direction per segment */
    angleJitter: 0.4,
    startWidth: 4,
    minWidth: 1,
    /** Chance per segment to fork a thinner, shorter branch */
    branchChance: 0.15,
    branchMinAngle: 0.3,
    branchMaxAngle: 0.9,
    maxBranchDepth: 3
} as const;
