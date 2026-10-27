import { CylinderGeometry, Shape } from 'three';

import { createEmissiveMaskTexture, extrudeBevelled } from '@/components/Dagger/Dagger.helpers';
import {
    RUNE_STROKES,
    SKILLS_BLADE,
    SKILLS_POMMEL,
    SKILLS_RUNES
} from '@/components/SkillsDagger/SkillsDagger.constants';

/** Symmetric double edge: slight narrowing, then a long taper to the tip */
export const createBladeGeometry = () => {
    const { length, halfWidth, taperStartY, taperHalfWidth } = SKILLS_BLADE;
    const shape = new Shape()
        .moveTo(-halfWidth, 0)
        .lineTo(halfWidth, 0)
        .lineTo(taperHalfWidth, taperStartY)
        .lineTo(0, -length)
        .lineTo(-taperHalfWidth, taperStartY)
        .closePath();

    return extrudeBevelled(shape, SKILLS_BLADE);
};

/** Disc facing the camera (cylinder axis turned to z) */
export const createPommelGeometry = () => {
    const { radius, thickness, radialSegments } = SKILLS_POMMEL;
    return new CylinderGeometry(radius, radius, thickness, radialSegments).rotateX(Math.PI / 2);
};

const drawRunes = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const { glyphCount, glyphAreaEnd, lineWidth, glyphRadiusRatio } = SKILLS_RUNES;
    context.lineWidth = lineWidth;

    const glyphSpacing = (height * glyphAreaEnd) / glyphCount;
    const glyphRadius = width * glyphRadiusRatio;
    for (let glyph = 0; glyph < glyphCount; glyph++) {
        const centerX = width / 2;
        const centerY = (glyph + 0.5) * glyphSpacing;
        context.beginPath();
        for (const [x1, y1, x2, y2] of RUNE_STROKES[glyph % RUNE_STROKES.length]) {
            context.moveTo(centerX + x1 * glyphRadius, centerY + y1 * glyphRadius);
            context.lineTo(centerX + x2 * glyphRadius, centerY + y2 * glyphRadius);
        }
        context.stroke();
    }
};

export const createRuneTexture = () =>
    createEmissiveMaskTexture({
        halfWidth: SKILLS_BLADE.halfWidth,
        bladeLength: SKILLS_BLADE.length,
        drawGlyphs: drawRunes
    });
