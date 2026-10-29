import { CanvasTexture, MathUtils } from 'three';

import { FLOAT_FX, RUNE_ORBIT, WISP } from '@/components/FloatFx/FloatFx.constants';
import { getSectionLift } from '@/components/Sections/scrollStore';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

/** 0 until the dagger nears its anchor, 1 once it floats there; always 0 during the intro */
export const getFloatStrength = (sectionId: string, isIntroPlaying: boolean) =>
    isIntroPlaying
        ? 0
        : MathUtils.smoothstep(getSectionLift(sectionId).value, FLOAT_FX.fadeInFrom, 1);

/**
 * White wisp flipbook (columns × rows frames, read left to right, top to bottom): soft brush strokes
 * rising from the bottom, each swaying a little further through the loop. Tinted by the material colour.
 */
export const createWispSheet = () => {
    const { columns, rows, frameWidth, frameHeight, seed, strokeCount, sway, strokeAlpha } = WISP;
    const frameCount = columns * rows;
    const canvas = document.createElement('canvas');
    canvas.width = columns * frameWidth;
    canvas.height = rows * frameHeight;
    const context = canvas.getContext('2d');
    const random = createSeededRandom(seed);
    const strokes = Array.from({ length: strokeCount }, () => ({
        x: randomBetween(random, 0.25, 0.75) * frameWidth,
        width: randomBetween(random, WISP.minStrokeWidth, WISP.maxStrokeWidth),
        phase: random() * Math.PI * 2
    }));

    for (let frame = 0; context && frame < frameCount; frame++) {
        const left = (frame % columns) * frameWidth;
        const top = Math.floor(frame / columns) * frameHeight;
        const loopAngle = (frame / frameCount) * Math.PI * 2;
        // Clipped to its cell, so swaying strokes never bleed into the next frame
        context.save();
        context.beginPath();
        context.rect(left, top, frameWidth, frameHeight);
        context.clip();
        context.lineCap = 'round';
        context.shadowColor = 'white';
        // Brightest in the middle, fading out at both ends of the wisp
        const fade = context.createLinearGradient(0, top, 0, top + frameHeight);
        fade.addColorStop(0, 'rgba(255, 255, 255, 0)');
        fade.addColorStop(0.5, `rgba(255, 255, 255, ${strokeAlpha})`);
        fade.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.strokeStyle = fade;

        for (const stroke of strokes) {
            const bend = Math.sin(loopAngle + stroke.phase) * sway;
            context.lineWidth = stroke.width;
            context.shadowBlur = stroke.width * 2;
            context.beginPath();
            context.moveTo(left + stroke.x, top + frameHeight * 0.95);
            context.bezierCurveTo(
                left + stroke.x + bend,
                top + frameHeight * 0.65,
                left + stroke.x - bend,
                top + frameHeight * 0.35,
                left + stroke.x + bend * 0.5,
                top + frameHeight * 0.08
            );
            context.stroke();
        }
        context.restore();
    }

    return new CanvasTexture(canvas);
};

/** Small angular glyphs: a few straight strokes each on a glowing white canvas */
export const createRuneTextures = () => {
    const { count, seed, textureSize, strokesPerGlyph } = RUNE_ORBIT;
    const random = createSeededRandom(seed);
    const margin = textureSize * 0.2;
    const randomPoint = () => randomBetween(random, margin, textureSize - margin);

    return Array.from({ length: count }, () => {
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const context = canvas.getContext('2d');

        if (context) {
            context.strokeStyle = 'white';
            context.lineWidth = textureSize * 0.06;
            context.lineCap = 'round';
            context.shadowColor = 'white';
            context.shadowBlur = textureSize * 0.1;
            // A vertical stave, then branches: reads as a rune rather than a scribble
            context.beginPath();
            context.moveTo(textureSize / 2, margin);
            context.lineTo(textureSize / 2, textureSize - margin);
            for (let index = 1; index < strokesPerGlyph; index++) {
                context.moveTo(textureSize / 2, randomPoint());
                context.lineTo(randomPoint(), randomPoint());
            }
            context.stroke();
        }

        return new CanvasTexture(canvas);
    });
};
