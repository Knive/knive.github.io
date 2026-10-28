import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

import { CAMERA, SCROLL_CAMERA } from '@/components/Scene/Scene.constants';
import { heroScroll } from '@/components/Sections/scrollStore';

const REST_TARGET = new Vector3(...CAMERA.lookAt);
const SKY_TARGET = new Vector3(...SCROLL_CAMERA.skyLookAt);

/** Tilts the camera up to the sky as the hero scrolls out, so the text is read over the dark sky */
export const ScrollCamera = () => {
    const target = useMemo(() => new Vector3(), []);

    useFrame(({ camera }) => {
        camera.lookAt(target.lerpVectors(REST_TARGET, SKY_TARGET, heroScroll.progress));
    });

    return null;
};
