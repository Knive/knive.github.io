import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, type Group } from 'three';

import { DAGGER_LIFT, EXPOSED_BLADE_RATIO } from '@/components/Dagger/Dagger.constants';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';
import { getSectionLift } from '@/components/Sections/scrollStore';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';
import { screenToWorld } from '@/utils/screenToWorld';

type DaggerLiftOptions = {
    sectionId: string;
    /** World x of the dagger's ground group */
    positionX: number;
    bladeLength: number;
    isIntroPlaying: boolean;
};

const resetLift = (group: Group) => {
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);
    group.scale.setScalar(1);
};

/**
 * Moves the dagger out of the floor to its section's anchor box while that section is active.
 * Attach the returned ref to a group inside the dagger's ground group, around its meshes.
 */
export const useDaggerLift = ({
    sectionId,
    positionX,
    bladeLength,
    isIntroPlaying
}: DaggerLiftOptions) => {
    const liftRef = useRef<Group>(null);
    const anchorRef = useRef<HTMLElement | null>(null);
    const anchorPosition = useMemo(() => new Vector3(), []);
    const isReducedMotion = useMemo(prefersReducedMotion, []);
    // Middle of the whole dagger, from buried tip to pommel, in the ground group's space
    const daggerCentreY =
        bladeLength * EXPOSED_BLADE_RATIO + (DAGGER_LIFT.hiltTopY - bladeLength) / 2;

    useFrame(({ camera, size, clock }) => {
        const group = liftRef.current;
        if (!group) return;

        const lift = isIntroPlaying ? 0 : getSectionLift(sectionId).value;
        anchorRef.current ??= document.getElementById(getDaggerAnchorId(sectionId));
        const anchorRect = anchorRef.current?.getBoundingClientRect();
        // Hidden anchor (narrow screens): the dagger stays in the floor
        if (lift === 0 || !anchorRect?.width) {
            resetLift(group);
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
        anchorPosition.x -= positionX;
        anchorPosition.y -= daggerCentreY * scale;

        // From the rest position (origin) towards the anchor
        group.position.copy(anchorPosition).multiplyScalar(lift);
        group.scale.setScalar(scale);
        group.rotation.y = isReducedMotion
            ? 0
            : Math.sin(clock.elapsedTime * DAGGER_LIFT.swaySpeed) * DAGGER_LIFT.swayAngle * lift;
    });

    return liftRef;
};
