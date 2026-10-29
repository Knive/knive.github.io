import type { Vector3Tuple } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';

/** Euler rotation (x, y, z order) of a blade resting at its landing */
export const toRestRotation = ({ tiltX, yaw, tiltZ }: LandingTransform): Vector3Tuple => [
    tiltX,
    yaw,
    tiltZ
];
