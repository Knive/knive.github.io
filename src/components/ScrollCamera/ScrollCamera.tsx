import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

import { SCROLL_CAMERA } from '@/components/ScrollCamera/ScrollCamera.constants';
import {
    getCameraProgress,
    getScrollTargets,
    setCameraProgress
} from '@/components/ScrollCamera/cameraStore';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

type ScrollCameraProps = {
    isIntroPlaying: boolean;
};

const dampTowards = (current: number, target: number, delta: number) => {
    const next = MathUtils.damp(current, target, SCROLL_CAMERA.damping, delta);
    return Math.abs(target - next) < SCROLL_CAMERA.snapEpsilon ? target : next;
};

/**
 * Pitches the camera up as the page scrolls, with no roll or yaw: the hero keeps the rest framing,
 * the sections see only sky. Mount it before the daggers, and keep it mounted during the intro,
 * so its frame callback always runs first and the dagger anchors use this frame's camera.
 */
export const ScrollCamera = ({ isIntroPlaying }: ScrollCameraProps) => {
    const isReducedMotion = useMemo(prefersReducedMotion, []);

    useFrame(({ camera }, delta) => {
        // IntroCamera owns the camera until the intro ends, then restores the rest framing
        if (isIntroPlaying) return;

        const target = getScrollTargets();
        const current = getCameraProgress();
        const tilt = isReducedMotion ? target.tilt : dampTowards(current.tilt, target.tilt, delta);
        const drift = isReducedMotion
            ? target.drift
            : dampTowards(current.drift, target.drift, delta);
        setCameraProgress(tilt, drift);

        const pitch =
            MathUtils.lerp(SCROLL_CAMERA.heroPitch, SCROLL_CAMERA.sectionPitch, tilt) +
            SCROLL_CAMERA.driftPitch * drift;
        camera.rotation.set(pitch, 0, 0);
    });

    return null;
};
