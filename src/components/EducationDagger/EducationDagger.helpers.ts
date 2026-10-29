import { OctahedronGeometry } from 'three';

import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import {
    createBladePaintTexture,
    createOutlinedPart,
    createRuneMaskTexture,
    type Outline
} from '@/components/Dagger/Dagger.helpers';
import {
    EDUCATION_BLADE,
    EDUCATION_BLADE_OUTLINE,
    EDUCATION_BLADE_PAINT,
    GUARD_CRYSTAL,
    GUARD_LEAVES,
    SCRIPT_RUNES
} from '@/components/EducationDagger/EducationDagger.constants';

const drawScript = (context: CanvasRenderingContext2D) => {
    const { startY, endY, amplitude, loops, samples, lineWidth, dotEveryLoops, dotRadius } =
        SCRIPT_RUNES;
    const getPoint = (progress: number) => ({
        x: amplitude * Math.sin(progress * loops * Math.PI * 2),
        y: startY + progress * (endY - startY)
    });
    context.lineWidth = lineWidth;

    context.beginPath();
    for (let sample = 0; sample <= samples; sample++) {
        const { x, y } = getPoint(sample / samples);
        if (sample === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
    }
    context.stroke();

    for (let loop = dotEveryLoops; loop < loops; loop += dotEveryLoops) {
        const { y } = getPoint(loop / loops);
        context.beginPath();
        context.arc(amplitude * 2, y, dotRadius, 0, Math.PI * 2);
        context.fill();
    }
};

export const createBlade = () => {
    const blade = createOutlinedPart(EDUCATION_BLADE_OUTLINE, EDUCATION_BLADE);
    return {
        geometry: blade.geometry,
        paintMap: createBladePaintTexture(blade, { ...STEEL_PAINT, ...EDUCATION_BLADE_PAINT }),
        runeMap: createRuneMaskTexture(blade.bounds, drawScript)
    };
};

/** One book leaf from the centre to x = side * length, rising towards its tip */
const createLeafOutline = (side: 1 | -1, length: number): Outline => {
    const { lift, thickness } = GUARD_LEAVES;
    const tipX = side * length;
    return [
        { to: [0, -thickness / 2] },
        { to: [tipX, lift], control: [tipX * 0.6, -thickness] },
        { to: [0, thickness / 2], control: [tipX * 0.5, lift + thickness / 2] }
    ];
};

export const createGuardGeometries = () => ({
    leftLeaf: createOutlinedPart(createLeafOutline(-1, GUARD_LEAVES.leftLength), GUARD_LEAVES)
        .geometry,
    rightLeaf: createOutlinedPart(createLeafOutline(1, GUARD_LEAVES.rightLength), GUARD_LEAVES)
        .geometry
});

export const createCrystalGeometry = () =>
    new OctahedronGeometry(GUARD_CRYSTAL.radius).scale(...GUARD_CRYSTAL.scale);
