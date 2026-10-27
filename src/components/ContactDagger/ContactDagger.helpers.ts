import { Shape, TorusGeometry } from 'three';

import { createEmissiveMaskTexture, extrudeBevelled } from '@/components/Dagger/Dagger.helpers';
import {
    CONTACT_BLADE,
    CONTACT_RING,
    NOTCH_MARKS
} from '@/components/ContactDagger/ContactDagger.constants';

/** Leaf-shaped throwing blade: narrow at the base, swelling belly, curved taper to the tip */
export const createBladeGeometry = () => {
    const { length, baseHalfWidth, bellyHalfWidth, bellyY } = CONTACT_BLADE;
    const shape = new Shape()
        .moveTo(-baseHalfWidth, 0)
        .lineTo(baseHalfWidth, 0)
        .quadraticCurveTo(bellyHalfWidth, bellyY, 0, -length)
        .quadraticCurveTo(-bellyHalfWidth, bellyY, -baseHalfWidth, 0);

    return extrudeBevelled(shape, CONTACT_BLADE);
};

/** Torus lies in the xy plane, so the ring faces the camera */
export const createRingGeometry = () => {
    const { radius, tube, radialSegments, tubularSegments } = CONTACT_RING;
    return new TorusGeometry(radius, tube, radialSegments, tubularSegments);
};

const drawNotches = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const { count, start, spacing, halfWidth, dip, lineWidth } = NOTCH_MARKS;
    context.lineWidth = lineWidth;
    context.beginPath();
    for (let notch = 0; notch < count; notch++) {
        const notchY = (start + notch * spacing) * height;
        context.moveTo(width * (0.5 - halfWidth), notchY);
        context.lineTo(width / 2, notchY + dip * height);
        context.lineTo(width * (0.5 + halfWidth), notchY);
    }
    context.stroke();
};

/** The notches only cover the centre, so the belly control width is a safe mapping width */
export const createNotchTexture = () =>
    createEmissiveMaskTexture({
        halfWidth: CONTACT_BLADE.bellyHalfWidth,
        bladeLength: CONTACT_BLADE.length,
        drawGlyphs: drawNotches
    });
