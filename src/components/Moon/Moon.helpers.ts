import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

import {
    HALO_TEXTURE,
    RIM_TEXTURE,
    STREAK_MASK,
    STREAK_TEXTURE
} from '@/components/Moon/Moon.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

const createCanvas = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const toTexture = (canvas: HTMLCanvasElement) => {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

/** Thin white ring hugging the disc edge, brightest on the lit (upper left) side; tinted by the material */
export const createRimTexture = () => {
    const { size, lineWidthShare, farSideAlpha } = RIM_TEXTURE;
    const canvas = createCanvas(size, size);
    const context = canvas.getContext('2d');

    if (context) {
        const lineWidth = size * lineWidthShare;
        const lit = context.createLinearGradient(0, 0, size, size);
        lit.addColorStop(0, 'rgba(255, 255, 255, 1)');
        lit.addColorStop(1, `rgba(255, 255, 255, ${farSideAlpha})`);
        context.strokeStyle = lit;
        context.lineWidth = lineWidth;
        context.beginPath();
        // The disc fills 1 / rimScale of the sprite: the ring sits just on its edge
        context.arc(size / 2, size / 2, size / 2 - lineWidth * 2, 0, Math.PI * 2);
        context.stroke();
    }

    return toTexture(canvas);
};

/** Soft radial glow, white at the centre; drawn additively and tinted by the material */
export const createHaloTexture = () => {
    const { size } = HALO_TEXTURE;
    const canvas = createCanvas(size, size);
    const context = canvas.getContext('2d');

    if (context) {
        const radius = size / 2;
        const glow = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
        glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        glow.addColorStop(0.15, 'rgba(255, 255, 255, 0.95)');
        glow.addColorStop(0.25, 'rgba(255, 255, 255, 0.25)');
        glow.addColorStop(0.6, 'rgba(255, 255, 255, 0.07)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, size, size);
    }

    return toTexture(canvas);
};

/**
 * Horizontal band of dark brush strokes, kept clear of the top and bottom edges, that tiles
 * sideways so the texture offset can drift it forever.
 */
export const createStreakTexture = () => {
    const { width, height, seed, strokeCount, color, blur } = STREAK_TEXTURE;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const random = createSeededRandom(seed);

    if (context) {
        context.fillStyle = color;
        context.filter = `blur(${blur}px)`;
        for (let stroke = 0; stroke < strokeCount; stroke++) {
            const y = height / 2 + randomBetween(random, -0.22, 0.22) * height;
            const thickness = randomBetween(random, 0.04, 0.16) * height;
            const length = randomBetween(random, 0.25, 0.6) * width;
            const x = randomBetween(random, 0, width);
            context.globalAlpha = randomBetween(random, 0.25, 0.6);
            // Drawn twice, one width apart, so a stroke crossing the edge wraps around seamlessly
            for (const wrap of [0, -width]) {
                context.beginPath();
                context.ellipse(
                    x + wrap + length / 2,
                    y,
                    length / 2,
                    thickness / 2,
                    0,
                    0,
                    Math.PI * 2
                );
                context.fill();
            }
        }
    }

    const texture = toTexture(canvas);
    texture.wrapS = RepeatWrapping;
    return texture;
};

/** White where the streak shows, fading to black at its ends and edges; used as the sprite's alphaMap */
export const createStreakMaskTexture = () => {
    const { width, height, sideFade, edgeFade } = STREAK_MASK;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    if (context) {
        const sides = context.createLinearGradient(0, 0, width, 0);
        sides.addColorStop(0, 'black');
        sides.addColorStop(sideFade, 'white');
        sides.addColorStop(1 - sideFade, 'white');
        sides.addColorStop(1, 'black');
        context.fillStyle = sides;
        context.fillRect(0, 0, width, height);

        // Multiplied by a vertical fade, so the top and bottom bands go dark too
        const edges = context.createLinearGradient(0, 0, 0, height);
        edges.addColorStop(0, 'black');
        edges.addColorStop(edgeFade, 'white');
        edges.addColorStop(1 - edgeFade, 'white');
        edges.addColorStop(1, 'black');
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = edges;
        context.fillRect(0, 0, width, height);
    }

    return new CanvasTexture(canvas);
};
