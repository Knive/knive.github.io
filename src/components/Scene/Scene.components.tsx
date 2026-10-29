import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';

import { FOG, GROUND_SLIDE } from '@/components/Scene/Scene.constants';
import { getScrolledViewports } from '@/utils/getScrolledViewports';

/** Warm sunset light from left, cool moonlight fill from right */
export const Lights = () => {
    return (
        <>
            <ambientLight intensity={0.15} />
            <directionalLight position={[-2, 2, 2]} intensity={5} color="#e59866" />
            <directionalLight position={[2, 4, 1]} intensity={2} color="#5dade2" />
        </>
    );
};

/** Background in the fog colour, so distant things dissolve into the night */
export const Atmosphere = () => (
    <>
        <color attach="background" args={[FOG.color]} />
        <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
    </>
);

/**
 * Sinks its children (the ground and what stands on it) out of frame during the first screen of scroll,
 * so the sections read over the sky. Follows the scroll directly, so it also runs under reduced motion.
 */
export const GroundSlide = ({ children }: { children: ReactNode }) => {
    const groupRef = useRef<Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        const slide = MathUtils.clamp(getScrolledViewports(), 0, 1);
        groupRef.current.position.y = -GROUND_SLIDE.depth * slide;
    });

    return <group ref={groupRef}>{children}</group>;
};
