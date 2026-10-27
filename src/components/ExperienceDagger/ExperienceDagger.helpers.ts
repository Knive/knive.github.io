import { Path, Shape } from 'three';

import {
    createEmissiveMaskTexture,
    extrudeBevelled,
    type BevelSpec
} from '@/components/Dagger/Dagger.helpers';
import {
    EXPERIENCE_BLADE,
    RUNE_TEXTURE,
    TOOTH_STEPS
} from '@/components/ExperienceDagger/ExperienceDagger.constants';

export type GearSpec = BevelSpec & {
    teeth: number;
    innerRadius: number;
    outerRadius: number;
    holeRadius: number;
};

export const createGearGeometry = ({
    teeth,
    innerRadius,
    outerRadius,
    holeRadius,
    ...bevel
}: GearSpec) => {
    const shape = new Shape();
    const stepAngle = (Math.PI * 2) / (teeth * TOOTH_STEPS);
    const toothRadii = [innerRadius, outerRadius, outerRadius, innerRadius];

    for (let step = 0; step < teeth * TOOTH_STEPS; step++) {
        const radius = toothRadii[step % TOOTH_STEPS];
        const angle = step * stepAngle;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (step === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const hole = new Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    return extrudeBevelled(shape, bevel);
};

/** Flat blade: parallel edges from the guard, then a short taper to the tip */
export const createBladeGeometry = () => {
    const { length, halfWidth, taperStartY } = EXPERIENCE_BLADE;
    const shape = new Shape()
        .moveTo(-halfWidth, 0)
        .lineTo(halfWidth, 0)
        .lineTo(halfWidth, taperStartY)
        .lineTo(0, -length)
        .lineTo(-halfWidth, taperStartY)
        .closePath();

    return extrudeBevelled(shape, EXPERIENCE_BLADE);
};

const drawGear = (
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
) => {
    const tickCount = 8;
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    for (let tick = 0; tick < tickCount; tick++) {
        const angle = (tick / tickCount) * Math.PI * 2;
        context.moveTo(
            centerX + Math.cos(angle) * radius * 0.6,
            centerY + Math.sin(angle) * radius * 0.6
        );
        context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    context.stroke();
};

const drawRune = (
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
) => {
    context.beginPath();
    context.moveTo(centerX, centerY - radius);
    context.lineTo(centerX, centerY + radius);
    context.moveTo(centerX - radius * 0.6, centerY - radius * 0.4);
    context.lineTo(centerX, centerY);
    context.lineTo(centerX + radius * 0.6, centerY - radius * 0.4);
    context.stroke();
};

/** Gears and runes alternating down the exposed part of the blade */
const drawRunes = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const { glyphCount, glyphAreaEnd, lineWidth, glyphRadiusRatio } = RUNE_TEXTURE;
    context.lineWidth = lineWidth;

    const glyphSpacing = (height * glyphAreaEnd) / glyphCount;
    const glyphRadius = width * glyphRadiusRatio;
    for (let glyph = 0; glyph < glyphCount; glyph++) {
        const centerY = (glyph + 0.5) * glyphSpacing;
        const drawGlyph = glyph % 2 === 0 ? drawGear : drawRune;
        drawGlyph(context, width / 2, centerY, glyphRadius);
    }
};

export const createRuneTexture = () =>
    createEmissiveMaskTexture({
        halfWidth: EXPERIENCE_BLADE.halfWidth,
        bladeLength: EXPERIENCE_BLADE.length,
        drawGlyphs: drawRunes
    });
