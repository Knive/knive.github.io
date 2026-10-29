import { CanvasTexture, RepeatWrapping } from 'three';

import { MIST_TEXTURE } from '@/components/Mist/Mist.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

/**
 * White cloud band: soft overlapping blobs, densest along the middle and fading to nothing
 * at the top and bottom. Tinted by the material colour; wraps horizontally for the drift.
 */
export const createMistTexture = () => {
    const { width, height, seed, blobCount, blobMinRadius, blobMaxRadius, blobAlpha } =
        MIST_TEXTURE;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const random = createSeededRandom(seed);

    for (let index = 0; context && index < blobCount; index++) {
        const radius = randomBetween(random, blobMinRadius, blobMaxRadius);
        // Kept a radius away from the top and bottom so no blob is cut; x wraps instead
        const centerY = randomBetween(random, radius, height - radius);
        const centerX = random() * width;

        for (const wrappedX of [centerX - width, centerX, centerX + width]) {
            const gradient = context.createRadialGradient(
                wrappedX,
                centerY,
                0,
                wrappedX,
                centerY,
                radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${blobAlpha})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            context.fillStyle = gradient;
            context.fillRect(wrappedX - radius, centerY - radius, radius * 2, radius * 2);
        }
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    return texture;
};
