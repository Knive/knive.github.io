import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
    Box3,
    Frustum,
    Matrix4,
    Mesh,
    Vector3,
    type Camera,
    type Object3D,
    type WebGLRenderer
} from 'three';

import { DAGGERS } from '@/components/Scene/Scene.constants';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';
import { getSectionLift } from '@/components/Sections/scrollStore';
import { getCameraProgress } from '@/components/ScrollCamera/cameraStore';

type SceneMeasure = {
    tilt: number;
    drift: number;
    /** Any tree mesh inside the camera frustum, rendered or not */
    isTreeInFrustum: boolean;
    /** Any ground, rock, bush or mist mesh inside the camera frustum, rendered or not */
    isGroundInFrustum: boolean;
    isSceneryRendered: boolean;
    isMoonInFrame: boolean;
    /** Projected disc diameter, in percent of the viewport height */
    moonHeightPercent: number;
    activeSection: string | null;
    /** Active dagger's projected centre inside its anchor box; null without one */
    isDaggerBesideSection: boolean | null;
    drawCalls: number;
    triangles: number;
};

declare global {
    interface Window {
        /** Dev only: numeric checks of the scroll framing, for scripts/scene-review */
        __scene?: { measure: () => Promise<SceneMeasure> };
    }
}

const frustum = new Frustum();
const viewProjection = new Matrix4();
const box = new Box3();
const point = new Vector3();
const offset = new Vector3();

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Draw calls and triangles of one whole frame: bloom renders several passes, each resets the counters */
const countFrame = async (gl: WebGLRenderer) => {
    gl.info.autoReset = false;
    await nextFrame();
    gl.info.reset();
    await nextFrame();
    const { calls, triangles } = gl.info.render;
    gl.info.autoReset = true;
    return { drawCalls: calls, triangles };
};

const isAnyMeshInFrustum = (root: Object3D | undefined) => {
    let isInFrustum = false;
    root?.traverse((object) => {
        if (isInFrustum || !(object instanceof Mesh)) return;
        object.geometry.computeBoundingBox();
        box.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);
        isInFrustum = frustum.intersectsBox(box);
    });
    return isInFrustum;
};

/** Moon disc: in frame if its centre is, and its diameter projected along the camera's up axis */
const measureMoon = (moon: Object3D | undefined, camera: Camera) => {
    if (!moon) return { isMoonInFrame: false, moonHeightPercent: 0 };
    moon.getWorldPosition(point);
    offset.set(0, moon.userData.discDiameter / 2, 0).applyQuaternion(camera.quaternion);
    const top = point.clone().add(offset).project(camera);
    const bottom = point.clone().sub(offset).project(camera);
    const centre = point.project(camera);
    return {
        isMoonInFrame: Math.abs(centre.x) <= 1 && Math.abs(centre.y) <= 1 && centre.z < 1,
        moonHeightPercent: Math.round(((top.y - bottom.y) / 2) * 1000) / 10
    };
};

const getActiveSection = () => {
    const lifted = DAGGERS.map(({ sectionId }) => ({
        sectionId,
        lift: getSectionLift(sectionId).value
    })).sort((a, b) => b.lift - a.lift)[0];
    return lifted.lift > 0 ? lifted.sectionId : null;
};

/** Projected centre of the active dagger's meshes, tested against its anchor box */
const isDaggerBeside = (root: Object3D, camera: Camera, sectionId: string | null) => {
    const anchor = sectionId && document.getElementById(getDaggerAnchorId(sectionId));
    const parts = sectionId && root.getObjectByName(`dagger-parts-${sectionId}`);
    if (!anchor || !parts) return null;
    const rect = anchor.getBoundingClientRect();
    if (!rect.width) return null;
    const centre = box.setFromObject(parts).getCenter(point).project(camera);
    const x = ((centre.x + 1) / 2) * window.innerWidth;
    const y = ((1 - centre.y) / 2) * window.innerHeight;
    // The anchor box scrolls away while its dagger holds the sticky position: test horizontally
    // against the box and vertically against the viewport's sticky band
    return x >= rect.left && x <= rect.right && y >= 0 && y <= window.innerHeight;
};

/** Dev only: window.__scene.measure() reports what the camera frames, for the scene review */
export const useSceneDevTools = () => {
    const { scene, camera, gl } = useThree();

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        window.__scene = {
            measure: async () => {
                const frameCounts = await countFrame(gl);
                camera.updateMatrixWorld();
                viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                frustum.setFromProjectionMatrix(viewProjection);
                const scenery = scene.getObjectByName('scenery');
                const activeSection = getActiveSection();
                return {
                    ...getCameraProgress(),
                    isTreeInFrustum: isAnyMeshInFrustum(scene.getObjectByName('trees')),
                    isGroundInFrustum: isAnyMeshInFrustum(scenery),
                    isSceneryRendered: scenery?.visible ?? false,
                    ...measureMoon(scene.getObjectByName('moon-disc'), camera),
                    activeSection,
                    isDaggerBesideSection: isDaggerBeside(scene, camera, activeSection),
                    ...frameCounts
                };
            }
        };

        return () => {
            delete window.__scene;
        };
    }, [scene, camera, gl]);
};
