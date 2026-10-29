import { CylinderGeometry, SphereGeometry, type Vector3Tuple } from 'three';

import {
    DECOR_BLADE_BEVEL,
    DECOR_GRIP,
    DECOR_GUARD,
    DECOR_POMMEL,
    DECOR_VARIANTS,
    type LandingTransform
} from '@/components/BladeField/BladeField.constants';
import { STEEL_PAINT } from '@/components/Dagger/Dagger.constants';
import { createBladePaintTexture, createOutlinedPart } from '@/components/Dagger/Dagger.helpers';

/** Euler rotation (x, y, z order) of a blade resting at its landing */
export const toRestRotation = ({ tiltX, yaw, tiltZ }: LandingTransform): Vector3Tuple => [
    tiltX,
    yaw,
    tiltZ
];

/** Blade, paint and guard of each sword variant, built once and shared by every blade using it */
export const createVariantParts = () =>
    DECOR_VARIANTS.map(({ outline, guardHalfWidth, paintSeed }) => {
        const blade = createOutlinedPart(outline, DECOR_BLADE_BEVEL);
        const { halfHeight, ...guardBevel } = DECOR_GUARD;
        return {
            bladeGeometry: blade.geometry,
            paintMap: createBladePaintTexture(blade, { ...STEEL_PAINT, seed: paintSeed }),
            guardGeometry: createOutlinedPart(
                [
                    { to: [-guardHalfWidth, -halfHeight] },
                    { to: [guardHalfWidth, -halfHeight] },
                    { to: [guardHalfWidth, halfHeight] },
                    { to: [-guardHalfWidth, halfHeight] }
                ],
                guardBevel
            ).geometry
        };
    });

export const createGripGeometry = () =>
    new CylinderGeometry(
        DECOR_GRIP.radius,
        DECOR_GRIP.radius,
        DECOR_GRIP.length,
        DECOR_GRIP.radialSegments
    ).translate(0, DECOR_GRIP.startY + DECOR_GRIP.length / 2, 0);

export const createPommelGeometry = () =>
    new SphereGeometry(DECOR_POMMEL.radius, DECOR_POMMEL.segments, DECOR_POMMEL.segments).translate(
        0,
        DECOR_POMMEL.positionY,
        0
    );
