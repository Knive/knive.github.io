import { CanvasTexture, SRGBColorSpace } from 'three';

import { CRACKS, FLOOR, PUDDLES, STONE } from '@/components/Floor/Floor.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

type Random = () => number;
type CanvasPoint = { x: number; y: number };
/** One crack: a polyline in floor-canvas pixels, drawn thinner towards its end */
export type CrackPath = { points: CanvasPoint[]; startWidth: number };
export type CrackOrigin = { daggerId: string; positionX: number };
export type CrackLayout = {
    /** Cracks radiating from each dagger, keyed by dagger id */
    byDagger: Record<string, CrackPath[]>;
    scattered: CrackPath[];
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
 * Cracks radiating from each dagger, plus scattered ones across the floor.
 * Pure and seeded: the floor and the crack glow get the exact same paths.
 */
export const createCrackLayout = (origins: readonly CrackOrigin[]): CrackLayout => {
    const random = createSeededRandom(FLOOR.crackSeed);
    const byDagger: Record<string, CrackPath[]> = {};

    for (const { daggerId, positionX } of origins) {
        const origin = worldToCanvas(positionX, 0);
        const daggerCracks: CrackPath[] = [];
        for (let crack = 0; crack < CRACKS.perDagger; crack++) {
            const angle = (crack / CRACKS.perDagger) * Math.PI * 2 + random();
            walkCrack(random, origin, angle, CRACKS.startWidth, 0, daggerCracks);
        }
        byDagger[daggerId] = daggerCracks;
    }

    const scattered: CrackPath[] = [];
    for (let crack = 0; crack < CRACKS.randomCount; crack++) {
        const start = { x: random() * FLOOR.textureSize, y: random() * FLOOR.textureSize };
        walkCrack(
            random,
            start,
            random() * Math.PI * 2,
            CRACKS.startWidth * CRACKS.scatteredWidthRatio,
            1,
            scattered
        );
    }

    return { byDagger, scattered };
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

/** Irregular polygon patch, for flagstone variation */
const drawStonePatch = (context: CanvasRenderingContext2D, random: Random) => {
    const centerX = random() * FLOOR.textureSize;
    const centerY = random() * FLOOR.textureSize;
    const radius = randomBetween(random, STONE.patchMinRadius, STONE.patchMaxRadius);

    context.fillStyle = STONE.patchColors[Math.floor(random() * STONE.patchColors.length)];
    context.beginPath();
    for (let corner = 0; corner < STONE.patchCorners; corner++) {
        const angle = (corner / STONE.patchCorners) * Math.PI * 2;
        const cornerRadius =
            radius * randomBetween(random, STONE.cornerMinScale, STONE.cornerMaxScale);
        const x = centerX + Math.cos(angle) * cornerRadius;
        const y = centerY + Math.sin(angle) * cornerRadius;
        if (corner === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
};

const createColorMap = (random: Random, cracks: CrackPath[]) => {
    const canvas = createCanvas();
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = STONE.baseColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let patch = 0; patch < STONE.patchCount; patch++) drawStonePatch(context, random);

        context.strokeStyle = CRACKS.color;
        context.lineCap = 'round';
        cracks.forEach((crack) => drawCrack(context, crack));
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

/** Soft-edged smooth blobs: the wet patches catch the coloured lights as highlights */
const createRoughnessMap = (random: Random) => {
    const canvas = createCanvas();
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = PUDDLES.dryRoughnessColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let puddle = 0; puddle < PUDDLES.count; puddle++) {
            const x = random() * canvas.width;
            const y = random() * canvas.height;
            const radius = randomBetween(random, PUDDLES.minRadius, PUDDLES.maxRadius);
            const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, PUDDLES.wetRoughnessColor);
            gradient.addColorStop(1, PUDDLES.wetRoughnessTransparent);
            context.fillStyle = gradient;
            context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    }

    return new CanvasTexture(canvas);
};

/** Colour (stone + cracks) and roughness (wet patches) maps, identical on every load */
export const createFloorTextures = ({ byDagger, scattered }: CrackLayout) => {
    const random = createSeededRandom(FLOOR.surfaceSeed);
    const cracks = [...Object.values(byDagger).flat(), ...scattered];

    return {
        colorMap: createColorMap(random, cracks),
        roughnessMap: createRoughnessMap(random)
    };
};
