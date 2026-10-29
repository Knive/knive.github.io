import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { CAMERA_FOLLOW, INTRO } from '@/components/Intro/Intro.constants';
import {
    createFlightCurve,
    getFlightProgress,
    getShakeOffset,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';
import { CAMERA } from '@/components/Scene/Scene.constants';

type IntroCameraProps = {
    leadDagger: Pick<DaggerConfig, 'landing' | 'bladeLength'>;
    daggerCount: number;
    onIntroEnd: () => void;
};

const REST_POSITION = new Vector3(...CAMERA.position);
const REST_TARGET = new Vector3(...CAMERA.lookAt);
const FOLLOW_OFFSET = new Vector3(...CAMERA_FOLLOW.offset);
const SETTLE_SECONDS = INTRO.endSeconds - INTRO.firstLandingSeconds;

/**
 * Intro camera: follows the lead dagger down to its impact, then settles back to the rest
 * framing while the others land, shaking a little on each landing. Mount only while the intro plays;
 * unmounting (end or skip) snaps the camera to its rest framing.
 */
export const IntroCamera = ({ leadDagger, daggerCount, onIntroEnd }: IntroCameraProps) => {
    const camera = useThree((state) => state.camera);
    const hasEndedRef = useRef(false);
    const leadCurve = useMemo(() => createFlightCurve(0), []);
    const { position, target, shake } = useMemo(
        () => ({ position: new Vector3(), target: new Vector3(), shake: new Vector3() }),
        []
    );

    useEffect(
        () => () => {
            camera.position.copy(REST_POSITION);
            camera.lookAt(REST_TARGET);
        },
        [camera]
    );

    useFrame(({ clock }) => {
        if (hasEndedRef.current) return;

        const flightSeconds = toFlightSeconds(clock.elapsedTime);
        if (flightSeconds >= INTRO.endSeconds) {
            hasEndedRef.current = true;
            onIntroEnd();
            return;
        }

        // Look at the lead's guard: its flight point raised by the same offset as its meshes
        const leadProgress = getFlightProgress(INTRO.firstLandingSeconds, flightSeconds);
        leadCurve.getPointAt(leadProgress, target);
        target.x += leadDagger.landing.x;
        target.y += leadDagger.bladeLength * leadDagger.landing.exposedRatio;
        target.z += leadDagger.landing.z;
        position.copy(target).add(FOLLOW_OFFSET);

        const settleProgress = MathUtils.smoothstep(
            (flightSeconds - INTRO.firstLandingSeconds) / SETTLE_SECONDS,
            0,
            1
        );
        position.lerp(REST_POSITION, settleProgress);
        target.lerp(REST_TARGET, settleProgress);

        camera.position.copy(position).add(getShakeOffset(flightSeconds, daggerCount, shake));
        camera.lookAt(target);
    });

    return null;
};
