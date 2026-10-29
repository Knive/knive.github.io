import { CanvasTexture, SRGBColorSpace } from 'three';

import { getGroundHeight } from '@/components/Floor/Floor.helpers';
import {
    BUSH_LEAVES,
    CARD_TEXTURE_SIZE,
    GRASS_BLADES,
    SCATTER,
    VEGETATION_COLOR
} from '@/components/Vegetation/Vegetation.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

type CardPlacement = {
    x: number;
    y: number;
    z: number;
    height: number;
    isFlipped: boolean;
};

const createCardTexture = (draw: (context: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_TEXTURE_SIZE;
    canvas.height = CARD_TEXTURE_SIZE;
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = VEGETATION_COLOR;
        draw(context);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

/** Tapered, leaning blades fanning out from the bottom centre */
export const createGrassTexture = () =>
    createCardTexture((context) => {
        const random = createSeededRandom(GRASS_BLADES.seed);
        const bottom = CARD_TEXTURE_SIZE;
        const centerX = CARD_TEXTURE_SIZE / 2;

        for (let blade = 0; blade < GRASS_BLADES.count; blade++) {
            const baseX = centerX + randomBetween(random, -1, 1) * GRASS_BLADES.baseSpread;
            const lean = randomBetween(random, -1, 1) * GRASS_BLADES.maxLean;
            const length = randomBetween(random, GRASS_BLADES.minLength, GRASS_BLADES.maxLength);
            const tipX = baseX + Math.sin(lean) * length;
            const tipY = bottom - Math.cos(lean) * length;
            // Control point below the tip's lean: the blade curves over as it rises
            const controlX = baseX + Math.sin(lean) * length * 0.3;
            const controlY = bottom - length * 0.6;

            context.beginPath();
            context.moveTo(baseX - GRASS_BLADES.baseWidth, bottom);
            context.quadraticCurveTo(controlX, controlY, tipX, tipY);
            context.quadraticCurveTo(controlX, controlY, baseX + GRASS_BLADES.baseWidth, bottom);
            context.fill();
        }
    });

/** Overlapping leaf clumps in a low crown, resting on the bottom edge */
export const createBushTexture = () =>
    createCardTexture((context) => {
        const random = createSeededRandom(BUSH_LEAVES.seed);
        const crownRadiusX = (CARD_TEXTURE_SIZE * BUSH_LEAVES.crownWidth) / 2;
        const crownRadiusY = (CARD_TEXTURE_SIZE * BUSH_LEAVES.crownHeight) / 2;
        const centerX = CARD_TEXTURE_SIZE / 2;
        const centerY = CARD_TEXTURE_SIZE - crownRadiusY;

        for (let leaf = 0; leaf < BUSH_LEAVES.count; leaf++) {
            const angle = random() * Math.PI * 2;
            const distance = Math.sqrt(random());
            const radius = randomBetween(random, BUSH_LEAVES.minRadius, BUSH_LEAVES.maxRadius);
            const x = centerX + Math.cos(angle) * distance * crownRadiusX;
            // Clamp so clumps never hang below the ground line
            const y = Math.min(
                centerY + Math.sin(angle) * distance * crownRadiusY,
                CARD_TEXTURE_SIZE - radius
            );

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    });

/** True near the dagger row, and in front of it where cards would hide the blades */
const isBlockingDaggers = (x: number, z: number) => {
    const isInFrontOfRow = z > 0 && Math.abs(x) < SCATTER.rowHalfWidth + SCATTER.rowClearance;
    const distanceToRow = Math.hypot(Math.max(Math.abs(x) - SCATTER.rowHalfWidth, 0), z);
    return isInFrontOfRow || distanceToRow < SCATTER.rowClearance;
};

/** Seeded card positions standing on the bumpy ground, clear of the dagger row */
export const scatterCards = (count: number, seed: number, minHeight: number, maxHeight: number) => {
    const random = createSeededRandom(seed);
    const placements: CardPlacement[] = [];
    const maxAttempts = count * SCATTER.maxAttemptsPerCard;

    for (let attempt = 0; attempt < maxAttempts && placements.length < count; attempt++) {
        const x = randomBetween(random, -SCATTER.halfWidth, SCATTER.halfWidth);
        const z = randomBetween(random, SCATTER.minZ, SCATTER.maxZ);
        if (isBlockingDaggers(x, z)) continue;

        placements.push({
            x,
            y: getGroundHeight(x, z),
            z,
            height: randomBetween(random, minHeight, maxHeight),
            isFlipped: random() < 0.5
        });
    }

    return placements;
};
