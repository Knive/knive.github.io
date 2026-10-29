import { CanvasTexture, MathUtils, PlaneGeometry, SRGBColorSpace } from 'three';

import { CRACKS, DIRT, FLOOR, MOUNDS } from '@/components/Floor/Floor.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

type Random = () => number;
type CanvasPoint = { x: number; y: number };
/** One crack: a polyline in floor-canvas pixels, drawn thinner towards its end */
export type CrackPath = { points: CanvasPoint[]; startWidth: number };
export type CrackOrigin = { daggerId: string; x: number; z: number };
export type CrackLayout = {
    /** Cracks radiating from each dagger, keyed by dagger id */
    byDagger: Record<string, CrackPath[]>;
};

const createCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = FLOOR.textureSize;
    canvas.height = FLOOR.textureSize;
    return canvas;
};

/**
 * Floor plane is rotated flat (-90° on x): world x maps to canvas x,
 * world z maps to canvas y (canvas top is the far side, z = -size / 2).
 */
export const worldToCanvas = (worldX: number, worldZ: number): CanvasPoint => ({
    x: ((worldX + FLOOR.size / 2) / FLOOR.size) * FLOOR.textureSize,
    y: ((worldZ + FLOOR.size / 2) / FLOOR.size) * FLOOR.textureSize
});

const walkCrack = (
    random: Random,
    start: CanvasPoint,
    startAngle: number,
    startWidth: number,
    depth: number,
    cracks: CrackPath[]
) => {
    const segmentCount = Math.round(randomBetween(random, CRACKS.minSegments, CRACKS.maxSegments));
    const points = [start];
    let angle = startAngle;

    for (let segment = 0; segment < segmentCount; segment++) {
        angle += (random() - 0.5) * CRACKS.angleJitter;
        const previous = points[points.length - 1];
        const next = {
            x: previous.x + Math.cos(angle) * CRACKS.segmentLength,
            y: previous.y + Math.sin(angle) * CRACKS.segmentLength
        };
        points.push(next);

        const canBranch = depth < CRACKS.maxBranchDepth;
        if (canBranch && random() < CRACKS.branchChance) {
            const branchAngle =
                angle +
                (random() < 0.5 ? -1 : 1) *
                    randomBetween(random, CRACKS.branchMinAngle, CRACKS.branchMaxAngle);
            walkCrack(random, next, branchAngle, startWidth / 2, depth + 1, cracks);
        }
    }

    cracks.push({ points, startWidth });
};

/**
 * Cracks radiating from each dagger.
 * Pure and seeded: the floor and the crack glow get the exact same paths.
 */
export const createCrackLayout = (origins: readonly CrackOrigin[]): CrackLayout => {
    const random = createSeededRandom(FLOOR.crackSeed);
    const byDagger: Record<string, CrackPath[]> = {};

    for (const { daggerId, x, z } of origins) {
        const origin = worldToCanvas(x, z);
        const daggerCracks: CrackPath[] = [];
        for (let crack = 0; crack < CRACKS.perDagger; crack++) {
            const angle = (crack / CRACKS.perDagger) * Math.PI * 2 + random();
            walkCrack(random, origin, angle, CRACKS.startWidth, 0, daggerCracks);
        }
        byDagger[daggerId] = daggerCracks;
    }

    return { byDagger };
};

/** Strokes one crack segment by segment, tapering its width */
export const drawCrack = (context: CanvasRenderingContext2D, { points, startWidth }: CrackPath) => {
    for (let index = 1; index < points.length; index++) {
        const remaining = 1 - index / points.length;
        context.lineWidth = Math.max(CRACKS.minWidth, startWidth * remaining);
        context.beginPath();
        context.moveTo(points[index - 1].x, points[index - 1].y);
        context.lineTo(points[index].x, points[index].y);
        context.stroke();
    }
};

/** Soft-edged blob of slightly different earth */
const drawDirtPatch = (context: CanvasRenderingContext2D, random: Random) => {
    const x = random() * FLOOR.textureSize;
    const y = random() * FLOOR.textureSize;
    const radius = randomBetween(random, DIRT.patchMinRadius, DIRT.patchMaxRadius);
    const color = DIRT.patchColors[Math.floor(random() * DIRT.patchColors.length)];
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}00`);
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
};

const drawPebble = (context: CanvasRenderingContext2D, random: Random) => {
    context.fillStyle = DIRT.pebbleColors[Math.floor(random() * DIRT.pebbleColors.length)];
    context.beginPath();
    context.arc(
        random() * FLOOR.textureSize,
        random() * FLOOR.textureSize,
        randomBetween(random, DIRT.pebbleMinRadius, DIRT.pebbleMaxRadius),
        0,
        Math.PI * 2
    );
    context.fill();
};

/** Dirt, pebbles and the impact cracks, identical on every load */
export const createFloorTexture = ({ byDagger }: CrackLayout) => {
    const random = createSeededRandom(FLOOR.surfaceSeed);
    const canvas = createCanvas();
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = DIRT.baseColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let patch = 0; patch < DIRT.patchCount; patch++) drawDirtPatch(context, random);
        for (let pebble = 0; pebble < DIRT.pebbleCount; pebble++) drawPebble(context, random);

        context.strokeStyle = CRACKS.color;
        context.lineCap = 'round';
        Object.values(byDagger)
            .flat()
            .forEach((crack) => drawCrack(context, crack));
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

const MOUND_LIST = (() => {
    const random = createSeededRandom(MOUNDS.seed);
    const halfSize = FLOOR.size / 2;
    return Array.from({ length: MOUNDS.count }, () => ({
        x: randomBetween(random, -halfSize, halfSize),
        z: randomBetween(random, -halfSize, halfSize),
        height: randomBetween(random, MOUNDS.minHeight, MOUNDS.maxHeight),
        radius: randomBetween(random, MOUNDS.minRadius, MOUNDS.maxRadius)
    }));
})();

/** 0 on and near the dagger row, rising to 1 away from it */
const getMoundStrength = (x: number, z: number) => {
    const distanceToRow = Math.hypot(Math.max(Math.abs(x) - MOUNDS.rowHalfWidth, 0), z);
    return MathUtils.smoothstep(distanceToRow, MOUNDS.flatRadius, MOUNDS.fullRadius);
};

/** Ground height at a world point; anything standing on the floor uses it */
export const getGroundHeight = (x: number, z: number) => {
    const strength = getMoundStrength(x, z);
    if (strength === 0) return 0;

    let height = 0;
    for (const mound of MOUND_LIST) {
        const squaredDistance = (x - mound.x) ** 2 + (z - mound.z) ** 2;
        height += mound.height * Math.exp(-squaredDistance / mound.radius ** 2);
    }
    return height * strength;
};

/** Flat-lying grid displaced by the mounds; UVs match worldToCanvas (canvas top is the far side) */
export const createGroundGeometry = () => {
    const geometry = new PlaneGeometry(FLOOR.size, FLOOR.size, FLOOR.segments, FLOOR.segments);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
        positions.setY(index, getGroundHeight(positions.getX(index), positions.getZ(index)));
    }
    geometry.computeVertexNormals();
    return geometry;
};
