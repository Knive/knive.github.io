import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { DAGGER_FLOAT, DAGGER_LIFT } from '@/components/Dagger/Dagger.constants';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';
import { getSectionLift } from '@/components/Sections/scrollStore';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';
import { screenToWorld } from '@/utils/screenToWorld';

type DaggerLiftOptions = {
    sectionId: string;
    /** Ground position and rest tilt; the dagger straightens up as it lifts */
    landing: LandingTransform;
    bladeLength: number;
    isIntroPlaying: boolean;
};

/** Resting in the floor: at its landing, with its tilt */
const resetLift = (group: Group, { tiltX, yaw, tiltZ }: LandingTransform) => {
    group.position.set(0, 0, 0);
    group.rotation.set(tiltX, yaw, tiltZ);
    group.scale.setScalar(1);
};

/** Smooth wobble in [-1, 1]: two sines at unrelated speeds */
const wobble = (seconds: number, speed: number) =>
    (Math.sin(seconds * speed) + 0.5 * Math.sin(seconds * speed * 2.3 + 1.3)) / 1.5;

/**
 * Flies the dagger out of the floor to its section's anchor box while that section is active,
 * along a curve (and back along the same curve), then levitates it there.
 * Attach the returned ref to a group inside the dagger's ground group, around its meshes.
 */
export const useDaggerLift = ({
    sectionId,
    landing,
    bladeLength,
    isIntroPlaying
}: DaggerLiftOptions) => {
    const liftRef = useRef<Group>(null);
    const anchorRef = useRef<HTMLElement | null>(null);
    const anchorPosition = useMemo(() => new Vector3(), []);
    const curveControl = useMemo(() => new Vector3(), []);
    const centreOffset = useMemo(() => new Vector3(), []);
    const floatEuler = useMemo(() => new Euler(), []);
    const floatQuaternion = useMemo(() => new Quaternion(), []);
    const cameraInParent = useMemo(() => new Quaternion(), []);
    const restQuaternion = useMemo(
        () => new Quaternion().setFromEuler(new Euler(landing.tiltX, landing.yaw, landing.tiltZ)),
        [landing]
    );
    const isReducedMotion = useMemo(prefersReducedMotion, []);
    // Middle of the whole dagger, from buried tip to pommel, in the ground group's space
    const daggerCentreY =
        bladeLength * landing.exposedRatio + (DAGGER_LIFT.hiltTopY - bladeLength) / 2;
    const phase = landing.x * DAGGER_FLOAT.phasePerUnit;

    useFrame(({ camera, size, clock }) => {
        const group = liftRef.current;
        if (!group?.parent) return;

        const lift = isIntroPlaying ? 0 : getSectionLift(sectionId).value;
        anchorRef.current ??= document.getElementById(getDaggerAnchorId(sectionId));
        const anchor = anchorRef.current;
        const anchorRect = anchor?.getBoundingClientRect();
        // Hidden anchor (narrow screens): the dagger stays in the floor
        if (lift === 0 || !anchor || !anchorRect?.width) {
            resetLift(group, landing);
            return;
        }

        // Held at its sticky position, so the dagger floats (and leaves) from there,
        // even once the box scrolls away with its section or the page jumps
        const stickyTop = parseFloat(getComputedStyle(anchor).top);
        screenToWorld(
            anchorRect.left + anchorRect.width / 2,
            Math.max(anchorRect.top, stickyTop) + anchorRect.height / 2,
            size,
            camera,
            DAGGER_LIFT.distance,
            anchorPosition
        );
        // Ground group space (it slides with the scroll), offset along the camera's up axis so the
        // scaled, screen-upright dagger's centre lands on the anchor whatever the camera pitch
        group.parent.worldToLocal(anchorPosition);
        group.parent.getWorldQuaternion(cameraInParent).invert().multiply(camera.quaternion);
        centreOffset.set(0, daggerCentreY * DAGGER_LIFT.scale, 0).applyQuaternion(cameraInParent);
        anchorPosition.sub(centreOffset);

        // Quadratic curve from the slot (origin) through the control point to the anchor
        curveControl.set(
            anchorPosition.x * DAGGER_LIFT.sideShare,
            anchorPosition.y + DAGGER_LIFT.arcHeight,
            anchorPosition.z * DAGGER_LIFT.sideShare
        );
        group.position
            .copy(curveControl)
            .multiplyScalar(2 * (1 - lift) * lift)
            .addScaledVector(anchorPosition, lift * lift);

        const float = isReducedMotion ? 0 : MathUtils.smoothstep(lift, DAGGER_FLOAT.fadeInFrom, 1);
        const seconds = clock.elapsedTime + phase;
        group.position.y += float * DAGGER_FLOAT.bobHeight * wobble(seconds, DAGGER_FLOAT.bobSpeed);
        group.scale.setScalar(
            MathUtils.lerp(1, DAGGER_LIFT.scale, lift) *
                (1 + float * DAGGER_FLOAT.breathe * Math.sin(seconds * DAGGER_FLOAT.breatheSpeed))
        );
        // From the rest tilt to upright in view space (facing the screen at any camera pitch) as it
        // lifts, then the levitation's slow roll and turn
        floatEuler.set(
            0,
            float * DAGGER_FLOAT.yawAngle * wobble(seconds, DAGGER_FLOAT.yawSpeed),
            float * DAGGER_FLOAT.rollAngle * wobble(seconds, DAGGER_FLOAT.rollSpeed)
        );
        floatQuaternion.setFromEuler(floatEuler).premultiply(cameraInParent);
        group.quaternion.slerpQuaternions(restQuaternion, floatQuaternion, lift);
    });

    return liftRef;
};
