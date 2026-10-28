import { Vector3, type Camera } from 'three';

type ViewportSize = { width: number; height: number };

const pointOnRay = new Vector3();

/** World point `distance` units from the camera along the ray through a viewport pixel */
export const screenToWorld = (
    clientX: number,
    clientY: number,
    viewport: ViewportSize,
    camera: Camera,
    distance: number,
    out: Vector3
) => {
    pointOnRay
        .set((clientX / viewport.width) * 2 - 1, -(clientY / viewport.height) * 2 + 1, 0.5)
        .unproject(camera);
    return out
        .copy(pointOnRay)
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance)
        .add(camera.position);
};
