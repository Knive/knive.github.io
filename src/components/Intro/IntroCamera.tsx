import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { BRAID, CAMERA_RAIL, INTRO } from '@/components/Intro/Intro.constants';
import {
    createFlightPlan,
    getShakeOffset,
    getShowcaseIndex,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';
import { getIntroTime, isIntroSeeking, startIntroClock } from '@/components/Intro/introStore';
import { CAMERA } from '@/components/Scene/Scene.constants';

type IntroCameraProps = {
    daggers: Pick<DaggerConfig, 'sectionId' | 'landing'>[];
    onIntroEnd: () => void;
};

const REST_POSITION = new Vector3(...CAMERA.position);
const REST_TARGET = new Vector3(...CAMERA.lookAt);
const RAIL_OFFSET = new Vector3(...CAMERA_RAIL.offset);
/** The braid's spine shifted aside: the camera chases the group along it */
const RAIL = new CatmullRomCurve3(
    BRAID.spine.map((point) => new Vector3(...point).add(RAIL_OFFSET))
);

/**
 * Intro camera: rides its rail beside the braid, looking at the group (and at each dagger in turn),
 * rolls into the turns, then swings down to the rest framing for the impacts and shakes on each.
 * Mount only while the intro plays; unmounting (end or skip) snaps the camera to its rest framing.
 */
export const IntroCamera = ({ daggers, onIntroEnd }: IntroCameraProps) => {
    const camera = useThree((state) => state.camera);
    const hasEndedRef = useRef(false);
    const plans = useMemo(
        () =>
            daggers.map(({ sectionId, landing }, strand) =>
                createFlightPlan(strand, sectionId, landing)
            ),
        [daggers]
    );
    const { position, target, point, smoothedTarget, shake } = useMemo(
        () => ({
            position: new Vector3(),
            target: new Vector3(),
            point: new Vector3(),
            smoothedTarget: new Vector3(),
            shake: new Vector3()
        }),
        []
    );

    useEffect(
        () => () => {
            camera.position.copy(REST_POSITION);
            camera.lookAt(REST_TARGET);
        },
        [camera]
    );

    useFrame((_, deltaSeconds) => {
        if (hasEndedRef.current) return;
        startIntroClock();

        const flightSeconds = toFlightSeconds(getIntroTime());
        if (flightSeconds >= INTRO.endSeconds && !isIntroSeeking()) {
            hasEndedRef.current = true;
            onIntroEnd();
            return;
        }

        // Look at the group's centre, pulled towards the showcased dagger
        target.set(0, 0, 0);
        plans.forEach((plan) => target.add(plan.getWorldPoint(flightSeconds, point)));
        target.divideScalar(plans.length);
        const showcaseIndex = getShowcaseIndex(flightSeconds);
        if (showcaseIndex !== null) {
            plans[showcaseIndex].getWorldPoint(flightSeconds, point);
            target.lerp(point, CAMERA_RAIL.showcaseFocus);
        }

        const braidProgress = MathUtils.clamp(flightSeconds / INTRO.splitSeconds, 0, 1);
        RAIL.getPointAt(braidProgress, position);

        // From the split, swing down to the rest framing, reached at the first impact
        const restBlend = MathUtils.smoothstep(
            flightSeconds,
            INTRO.splitSeconds,
            INTRO.firstLandingSeconds
        );
        position.lerp(REST_POSITION, restBlend);
        target.lerp(REST_TARGET, restBlend);

        if (flightSeconds === 0 || smoothedTarget.lengthSq() === 0) smoothedTarget.copy(target);
        smoothedTarget.lerp(target, 1 - Math.exp(-CAMERA_RAIL.smoothing * deltaSeconds));

        camera.position.copy(position).add(getShakeOffset(flightSeconds, shake));
        camera.lookAt(smoothedTarget);
        camera.rotateZ(CAMERA_RAIL.maxRoll * Math.sin(braidProgress * Math.PI) * (1 - restBlend));
    });

    return null;
};
