import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

import {
    getIntroEndSeconds,
    getIntroPaths,
    getIntroTime,
    isIntroSeeking,
    startIntroClock
} from '@/components/Intro/introStore';
import { createShot, getShot } from '@/components/IntroCamera/IntroCamera.helpers';
import { CAMERA } from '@/components/Scene/Scene.constants';

type IntroCameraProps = {
    onIntroEnd: () => void;
};

const restoreRestFraming = (camera: PerspectiveCamera) => {
    camera.position.set(...CAMERA.position);
    camera.lookAt(...CAMERA.lookAt);
    camera.fov = CAMERA.fov;
    camera.updateProjectionMatrix();
};

/**
 * Intro camera: the shot director's camera for the current intro time, applied every frame.
 * Mount only while the intro plays; unmounting (end or skip) restores the rest framing.
 */
export const IntroCamera = ({ onIntroEnd }: IntroCameraProps) => {
    const camera = useThree((state) => state.camera);
    const hasEndedRef = useRef(false);
    const shot = useMemo(createShot, []);

    useEffect(
        () => () => {
            if (camera instanceof PerspectiveCamera) restoreRestFraming(camera);
        },
        [camera]
    );

    useFrame(() => {
        if (hasEndedRef.current || !(camera instanceof PerspectiveCamera)) return;
        startIntroClock();

        const seconds = getIntroTime();
        if (seconds >= getIntroEndSeconds() && !isIntroSeeking()) {
            hasEndedRef.current = true;
            onIntroEnd();
            return;
        }

        getShot(getIntroPaths(), seconds, shot);
        camera.position.copy(shot.position);
        camera.lookAt(shot.lookAt);
        camera.rotateZ(shot.roll);
        if (camera.fov !== shot.fov) {
            camera.fov = shot.fov;
            camera.updateProjectionMatrix();
        }
    });

    return null;
};
