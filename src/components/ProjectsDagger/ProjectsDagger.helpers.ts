import { IcosahedronGeometry, Shape } from 'three';

import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import {
    createBladePaintTexture,
    createOutlinedPart,
    createRuneMaskTexture,
    extrudeBevelled,
    type Outline
} from '@/components/Dagger/Dagger.helpers';
import {
    BLADE_WAVES,
    CRESCENT_RING,
    GUARD_ORB,
    PROJECTS_BLADE,
    PROJECTS_BLADE_PAINT,
    SPINE_HOOK,
    STAR_POMMEL,
    WAVE_RUNES
} from '@/components/ProjectsDagger/ProjectsDagger.constants';

/** Sideways offset of the blade centre at height y (0 at the guard and below the waves) */
const getWaveOffset = (y: number) => {
    if (y < BLADE_WAVES.endY) return 0;
    return (
        BLADE_WAVES.amplitude * Math.sin((y / BLADE_WAVES.endY) * BLADE_WAVES.count * Math.PI * 2)
    );
};

/** Wavy edge from the guard down to the end of the waves, on one side (1 right, -1 left) */
const sampleWavyEdge = (side: 1 | -1): Outline => {
    const sampleCount = BLADE_WAVES.count * BLADE_WAVES.samplesPerWave;
    return Array.from({ length: sampleCount + 1 }, (_, sample) => {
        const y = (sample / sampleCount) * BLADE_WAVES.endY;
        return { to: [getWaveOffset(y) + side * BLADE_WAVES.halfWidth, y] as const };
    });
};

const createBladeOutline = (): Outline => {
    const { halfWidth, taperY } = BLADE_WAVES;
    const { cutDepth, cutY, barbOut, barbY, endOut, endY } = SPINE_HOOK;
    const tipY = -PROJECTS_BLADE.length;

    return [
        ...sampleWavyEdge(1),
        { to: [halfWidth - cutDepth, cutY] },
        { to: [halfWidth + barbOut, barbY] },
        { to: [halfWidth + endOut, endY] },
        { to: [halfWidth * 0.9, taperY] },
        { to: [0, tipY], control: [halfWidth * 0.8, tipY + 0.25] },
        { to: [-halfWidth * 0.9, taperY], control: [-halfWidth * 0.8, tipY + 0.25] },
        ...[...sampleWavyEdge(-1)].reverse()
    ];
};

const drawWaveRunes = (context: CanvasRenderingContext2D) => {
    const { lineOffset, startY, endY, samples, lineWidth, dotRadius } = WAVE_RUNES;
    context.lineWidth = lineWidth;

    for (const offset of [-lineOffset, lineOffset]) {
        context.beginPath();
        for (let sample = 0; sample <= samples; sample++) {
            const y = startY + (sample / samples) * (endY - startY);
            const x = getWaveOffset(y) + offset;
            if (sample === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();
    }

    // A dot on each crest, between the two lines
    for (let crest = 0; crest < BLADE_WAVES.count * 2; crest++) {
        const y = ((crest + 0.5) / (BLADE_WAVES.count * 2)) * BLADE_WAVES.endY;
        context.beginPath();
        context.arc(getWaveOffset(y), y, dotRadius, 0, Math.PI * 2);
        context.fill();
    }
};

export const createBlade = () => {
    const blade = createOutlinedPart(createBladeOutline(), PROJECTS_BLADE);
    return {
        geometry: blade.geometry,
        paintMap: createBladePaintTexture(blade, { ...STEEL_PAINT, ...PROJECTS_BLADE_PAINT }),
        runeMap: createRuneMaskTexture(blade.bounds, drawWaveRunes)
    };
};

/** Thick ring open on the right, centred on the origin */
export const createCrescentRingGeometry = () => {
    const { outerRadius, innerRadius, gapHalfAngle, ...bevel } = CRESCENT_RING;
    const startAngle = gapHalfAngle;
    const endAngle = Math.PI * 2 - gapHalfAngle;
    const shape = new Shape()
        .absarc(0, 0, outerRadius, startAngle, endAngle, false)
        .absarc(0, 0, innerRadius, endAngle, startAngle, true);
    shape.closePath();
    return extrudeBevelled(shape, bevel);
};

export const createOrbGeometry = () =>
    new IcosahedronGeometry(GUARD_ORB.radius, GUARD_ORB.detail).scale(1, 1, GUARD_ORB.depthScale);

/** Flat star with long points up, down, left and right */
export const createStarPommelGeometry = () => {
    const { points, outerRadius, innerRadius, ...bevel } = STAR_POMMEL;
    const corners = points * 2;
    const outline: Outline = Array.from({ length: corners }, (_, corner) => {
        const angle = (corner / corners) * Math.PI * 2 + Math.PI / 2;
        const radius = corner % 2 === 0 ? outerRadius : innerRadius;
        return { to: [Math.cos(angle) * radius, Math.sin(angle) * radius] as const };
    });
    return createOutlinedPart(outline, bevel).geometry;
};
