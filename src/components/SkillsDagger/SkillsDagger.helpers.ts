import { OctahedronGeometry, TorusGeometry } from 'three';

import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import {
    createBladePaintTexture,
    createOutlinedPart,
    createRuneMaskTexture
} from '@/components/Dagger/Dagger.helpers';
import {
    FULLER,
    FULLER_RUNES,
    GUARD_CRYSTAL,
    GUARD_RING,
    RUNE_STROKES,
    SKILLS_BLADE,
    SKILLS_BLADE_OUTLINE,
    SKILLS_BLADE_PAINT
} from '@/components/SkillsDagger/SkillsDagger.constants';

const drawFuller = (context: CanvasRenderingContext2D) => {
    const { x, halfWidth, startY, endY, color } = FULLER;
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x - halfWidth, endY, halfWidth * 2, startY - endY, halfWidth);
    context.fill();
};

/** Angular runes evenly spaced down the fuller */
const drawFullerRunes = (context: CanvasRenderingContext2D) => {
    const { count, radius, lineWidth } = FULLER_RUNES;
    const spacing = (FULLER.endY - FULLER.startY) / count;
    context.lineWidth = lineWidth;

    for (let rune = 0; rune < count; rune++) {
        const centerY = FULLER.startY + (rune + 0.5) * spacing;
        context.beginPath();
        for (const [x1, y1, x2, y2] of RUNE_STROKES[rune % RUNE_STROKES.length]) {
            // Strokes span a unit square; squeeze them into the fuller's width
            context.moveTo(FULLER.x + x1 * FULLER.halfWidth, centerY + y1 * radius);
            context.lineTo(FULLER.x + x2 * FULLER.halfWidth, centerY + y2 * radius);
        }
        context.stroke();
    }
};

export const createBlade = () => {
    const blade = createOutlinedPart(SKILLS_BLADE_OUTLINE, SKILLS_BLADE);
    return {
        geometry: blade.geometry,
        paintMap: createBladePaintTexture(
            blade,
            { ...STEEL_PAINT, ...SKILLS_BLADE_PAINT },
            drawFuller
        ),
        runeMap: createRuneMaskTexture(blade.bounds, drawFullerRunes)
    };
};

/** Torus lies in the xy plane, so the ring faces the camera */
export const createRingGeometry = () => {
    const { radius, tube, radialSegments, tubularSegments } = GUARD_RING;
    return new TorusGeometry(radius, tube, radialSegments, tubularSegments);
};

export const createCrystalGeometry = () =>
    new OctahedronGeometry(GUARD_CRYSTAL.radius).scale(...GUARD_CRYSTAL.scale);
