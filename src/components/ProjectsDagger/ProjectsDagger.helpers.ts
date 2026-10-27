import { OctahedronGeometry, Shape, SphereGeometry } from 'three';

import { extrudeBevelled } from '@/components/Dagger/Dagger.helpers';
import {
    CRYSTAL,
    PROJECTS_BLADE,
    PROJECTS_POMMEL
} from '@/components/ProjectsDagger/ProjectsDagger.constants';

/** Point on one edge at progress t (0 at the guard, 1 at the tip); side is 1 for right, -1 for left */
const getEdgePoint = (progress: number, side: 1 | -1) => {
    const { length, baseHalfWidth, waveCount, waveAmplitude, taperExponent } = PROJECTS_BLADE;
    const centerX = waveAmplitude * Math.sin(progress * waveCount * Math.PI * 2);
    const halfWidth = baseHalfWidth * (1 - progress ** taperExponent);
    return { x: centerX + side * halfWidth, y: -progress * length };
};

/** Kris blade: the whole blade snakes side to side while narrowing to the tip */
export const createBladeGeometry = () => {
    const { sampleCount } = PROJECTS_BLADE;
    const shape = new Shape();

    for (let sample = 0; sample <= sampleCount; sample++) {
        const { x, y } = getEdgePoint(sample / sampleCount, 1);
        if (sample === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    // Back up the left edge; skip the tip, both edges already meet there
    for (let sample = sampleCount - 1; sample >= 0; sample--) {
        const { x, y } = getEdgePoint(sample / sampleCount, -1);
        shape.lineTo(x, y);
    }
    shape.closePath();

    return extrudeBevelled(shape, PROJECTS_BLADE);
};

export const createCrystalGeometry = () =>
    new OctahedronGeometry(CRYSTAL.radius).scale(1, CRYSTAL.stretchY, 1);

export const createPommelGeometry = () => {
    const { radius, widthSegments, heightSegments } = PROJECTS_POMMEL;
    return new SphereGeometry(radius, widthSegments, heightSegments);
};
