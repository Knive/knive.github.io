import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, type Group } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { DAGGER_LIFT } from '@/components/Dagger/Dagger.constants';
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

/**
 * Moves the dagger out of the floor to its section's anchor box while that section is active.
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
    const isReducedMotion = useMemo(prefersReducedMotion, []);
    // Middle of the whole dagger, from buried tip to pommel, in the ground group's space
    const daggerCentreY =
        bladeLength * landing.exposedRatio + (DAGGER_LIFT.hiltTopY - bladeLength) / 2;

    useFrame(({ camera, size, clock }) => {
        const group = liftRef.current;
        if (!group) return;

        const lift = isIntroPlaying ? 0 : getSectionLift(sectionId).value;
        anchorRef.current ??= document.getElementById(getDaggerAnchorId(sectionId));
        const anchorRect = anchorRef.current?.getBoundingClientRect();
        // Hidden anchor (narrow screens): the dagger stays in the floor
        if (lift === 0 || !anchorRect?.width) {
            resetLift(group, landing);
            return;
        }

        screenToWorld(
            anchorRect.left + anchorRect.width / 2,
            anchorRect.top + anchorRect.height / 2,
            size,
            camera,
            DAGGER_LIFT.distance,
            anchorPosition
        );
        const scale = MathUtils.lerp(1, DAGGER_LIFT.scale, lift);
        // Ground group space, offset so the scaled dagger's centre lands on the anchor
        anchorPosition.x -= landing.x;
        anchorPosition.z -= landing.z;
        anchorPosition.y -= daggerCentreY * scale;

        // From the rest position (origin) towards the anchor
        group.position.copy(anchorPosition).multiplyScalar(lift);
        group.scale.setScalar(scale);
        const sway = isReducedMotion
            ? 0
            : Math.sin(clock.elapsedTime * DAGGER_LIFT.swaySpeed) * DAGGER_LIFT.swayAngle;
        // From the rest tilt to upright (plus the idle sway) as it lifts
        group.rotation.set(
            landing.tiltX * (1 - lift),
            MathUtils.lerp(landing.yaw, sway, lift),
            landing.tiltZ * (1 - lift)
        );
    });

    return liftRef;
};
