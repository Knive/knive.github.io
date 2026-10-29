import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, MathUtils, SphereGeometry, type Points } from 'three';

import { getCameraProgress } from '@/components/ScrollCamera/cameraStore';
import { STAR_MOTION } from '@/components/ScrollCamera/ScrollCamera.constants';
import { SKY_RADIUS, STARS } from '@/components/Sky/Sky.constants';
import {
    createSkyTexture,
    createStarGeometry,
    createStarMaterial
} from '@/components/Sky/Sky.helpers';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

const SKY_GEOMETRY = new SphereGeometry(SKY_RADIUS, 32, 32);
const SKY_TEXTURE = createSkyTexture();
const STAR_GEOMETRY = createStarGeometry();
const STAR_MATERIAL = createStarMaterial();

/** Visibility that shows exactly the hero stars, each one past its fade */
const HERO_STAR_VISIBILITY = STARS.heroCount / STARS.count + STAR_MOTION.fadeShare;

/** Sunset gradient dome and stars; painted colours, so no fog and no tone mapping */
export const Sky = () => {
    const starsRef = useRef<Points>(null);
    const isReducedMotion = useMemo(prefersReducedMotion, []);

    useFrame(({ clock, gl }) => {
        const { tilt, drift } = getCameraProgress();
        const { uniforms } = STAR_MATERIAL;
        uniforms.uVisibility.value = MathUtils.lerp(
            HERO_STAR_VISIBILITY,
            1 + STAR_MOTION.fadeShare,
            tilt
        );
        uniforms.uFade.value = STAR_MOTION.fadeShare;
        uniforms.uSize.value = STARS.size * gl.getPixelRatio();

        const seconds = isReducedMotion ? 0 : clock.elapsedTime;
        uniforms.uTime.value = seconds;
        uniforms.uTwinkleDepth.value = isReducedMotion ? 0 : STAR_MOTION.twinkleDepth;
        uniforms.uTwinkleSpeed.value = STAR_MOTION.twinkleSpeed;
        if (starsRef.current) {
            starsRef.current.rotation.y =
                drift * STAR_MOTION.spinPerDrift + seconds * STAR_MOTION.spinPerSecond;
        }
    });

    return (
        <>
            <mesh geometry={SKY_GEOMETRY}>
                <meshBasicMaterial
                    map={SKY_TEXTURE}
                    side={BackSide}
                    fog={false}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>
            <points ref={starsRef} geometry={STAR_GEOMETRY} material={STAR_MATERIAL} />
        </>
    );
};
