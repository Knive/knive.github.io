import { OctahedronGeometry, TorusGeometry } from 'three';

import {
    CONTACT_BLADE,
    CONTACT_BLADE_PAINT,
    CONTACT_BLADE_TAIL,
    GUARD_CRYSTAL,
    RING_POMMEL,
    SAW_TEETH,
    SPARK_RUNES
} from '@/components/ContactDagger/ContactDagger.constants';
import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import {
    createBladePaintTexture,
    createOutlinedPart,
    createRuneMaskTexture,
    type Outline
} from '@/components/Dagger/Dagger.helpers';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

const createBladeOutline = (): Outline => {
    const { spineX, startY, count, pitch, height, lean } = SAW_TEETH;
    const teeth = Array.from({ length: count }, (_, tooth) => {
        const toothTopY = startY - tooth * pitch;
        return [
            { to: [spineX + height, toothTopY + lean - pitch / 2] as const },
            { to: [spineX, toothTopY - pitch] as const }
        ];
    }).flat();

    return [
        { to: [-0.12, 0] },
        { to: [spineX, 0] },
        { to: [spineX, startY] },
        ...teeth,
        ...CONTACT_BLADE_TAIL
    ];
};

/** Short strokes at seeded spots and angles, like sparks */
const drawSparks = (context: CanvasRenderingContext2D) => {
    const { seed, count, minX, maxX, startY, endY, length, lineWidth } = SPARK_RUNES;
    const random = createSeededRandom(seed);
    context.lineWidth = lineWidth;

    for (let spark = 0; spark < count; spark++) {
        const x = randomBetween(random, minX, maxX);
        const y = startY + (spark / (count - 1)) * (endY - startY);
        const angle = random() * Math.PI;
        context.beginPath();
        context.moveTo(x - (Math.cos(angle) * length) / 2, y - (Math.sin(angle) * length) / 2);
        context.lineTo(x + (Math.cos(angle) * length) / 2, y + (Math.sin(angle) * length) / 2);
        context.stroke();
    }
};

export const createBlade = () => {
    const blade = createOutlinedPart(createBladeOutline(), CONTACT_BLADE);
    return {
        geometry: blade.geometry,
        paintMap: createBladePaintTexture(blade, { ...STEEL_PAINT, ...CONTACT_BLADE_PAINT }),
        runeMap: createRuneMaskTexture(blade.bounds, drawSparks)
    };
};

export const createCrystalGeometry = () =>
    new OctahedronGeometry(GUARD_CRYSTAL.radius)
        .scale(...GUARD_CRYSTAL.scale)
        .rotateZ(GUARD_CRYSTAL.tilt);

/** Torus lies in the xy plane, so the ring faces the camera */
export const createRingGeometry = () => {
    const { radius, tube, radialSegments, tubularSegments } = RING_POMMEL;
    return new TorusGeometry(radius, tube, radialSegments, tubularSegments);
};
