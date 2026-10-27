import { CylinderGeometry, Shape, SphereGeometry } from 'three';

import { createEmissiveMaskTexture, extrudeBevelled } from '@/components/Dagger/Dagger.helpers';
import {
    CENTRE_LINE,
    EDUCATION_BLADE,
    EDUCATION_GUARD,
    EDUCATION_POMMEL
} from '@/components/EducationDagger/EducationDagger.constants';

/** Needle: straight taper from the guard to the tip */
export const createBladeGeometry = () => {
    const { length, halfWidth } = EDUCATION_BLADE;
    const shape = new Shape()
        .moveTo(-halfWidth, 0)
        .lineTo(halfWidth, 0)
        .lineTo(0, -length)
        .closePath();

    return extrudeBevelled(shape, EDUCATION_BLADE);
};

/** Flat disc around the blade (cylinder axis along y) */
export const createGuardGeometry = () => {
    const { radius, thickness, radialSegments } = EDUCATION_GUARD;
    return new CylinderGeometry(radius, radius, thickness, radialSegments);
};

export const createPommelGeometry = () => {
    const { radius, widthSegments, heightSegments } = EDUCATION_POMMEL;
    return new SphereGeometry(radius, widthSegments, heightSegments);
};

const drawCentreLine = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.lineWidth = CENTRE_LINE.lineWidth;
    context.beginPath();
    context.moveTo(width / 2, 0);
    context.lineTo(width / 2, height * CENTRE_LINE.lineEnd);
    context.stroke();
};

export const createCentreLineTexture = () =>
    createEmissiveMaskTexture({
        halfWidth: EDUCATION_BLADE.halfWidth,
        bladeLength: EDUCATION_BLADE.length,
        drawGlyphs: drawCentreLine
    });
