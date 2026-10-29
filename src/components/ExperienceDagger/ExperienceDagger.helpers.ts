import { CylinderGeometry, OctahedronGeometry, Path, Shape } from 'three';

import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import {
    createBladePaintTexture,
    createOutlinedPart,
    createRuneMaskTexture,
    extrudeBevelled,
    type BevelSpec
} from '@/components/Dagger/Dagger.helpers';
import {
    EXPERIENCE_BLADE,
    EXPERIENCE_BLADE_OUTLINE,
    EXPERIENCE_BLADE_PAINT,
    GUARD_CRYSTAL,
    HEX_POMMEL,
    SPINE_RUNES,
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

/** Square gear-tooth glyphs, alternating open side, with a dot inside */
const drawSpineRunes = (context: CanvasRenderingContext2D) => {
    const { x, startY, endY, count, halfSize, lineWidth } = SPINE_RUNES;
    const spacing = (endY - startY) / (count - 1);
    context.lineWidth = lineWidth;

    for (let rune = 0; rune < count; rune++) {
        const y = startY + rune * spacing;
        const openSide = rune % 2 === 0 ? 1 : -1;
        context.beginPath();
        context.moveTo(x - halfSize, y - halfSize * openSide);
        context.lineTo(x - halfSize, y + halfSize * openSide);
        context.lineTo(x + halfSize, y + halfSize * openSide);
        context.lineTo(x + halfSize, y - halfSize * openSide);
        context.stroke();
        context.beginPath();
        context.arc(x, y, lineWidth, 0, Math.PI * 2);
        context.fill();
    }
};

export const createBlade = () => {
    const blade = createOutlinedPart(EXPERIENCE_BLADE_OUTLINE, EXPERIENCE_BLADE);
    return {
        geometry: blade.geometry,
        paintMap: createBladePaintTexture(blade, { ...STEEL_PAINT, ...EXPERIENCE_BLADE_PAINT }),
        runeMap: createRuneMaskTexture(blade.bounds, drawSpineRunes)
    };
};

export const createCrystalGeometry = () =>
    new OctahedronGeometry(GUARD_CRYSTAL.radius).scale(...GUARD_CRYSTAL.scale);

/** Hexagonal prism turned to face the camera, flat sides up and down */
export const createHexPommelGeometry = () => {
    const { radius, thickness, sides } = HEX_POMMEL;
    return new CylinderGeometry(radius, radius, thickness, sides)
        .rotateY(Math.PI / sides)
        .rotateX(Math.PI / 2);
};
