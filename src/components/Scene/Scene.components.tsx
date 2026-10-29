import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { FOG } from '@/components/Scene/Scene.constants';
import { getCameraProgress } from '@/components/ScrollCamera/cameraStore';
import { SCROLL_CAMERA } from '@/components/ScrollCamera/ScrollCamera.constants';
import { useSceneDevTools } from '@/components/Scene/useSceneDevTools';

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
 * Sinks its children (the ground and what stands on it) while the camera tilts up, so the sections
 * read over the sky. Follows the camera's tilt, so it also runs under reduced motion.
 */
export const GroundSlide = ({ children }: { children: ReactNode }) => {
    const groupRef = useRef<Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.y = -SCROLL_CAMERA.groundSink * getCameraProgress().tilt;
    });

    return <group ref={groupRef}>{children}</group>;
};

// Dev only: ?keepGround keeps the scenery rendering at full tilt, to measure what hiding it saves
const isKeepGroundRequested =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('keepGround');

/** Ground, trees, rocks, bushes and mist: out of frame at full tilt, so they stop rendering there */
export const Scenery = ({ children }: { children: ReactNode }) => {
    const groupRef = useRef<Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.visible = isKeepGroundRequested || getCameraProgress().tilt < 1;
    });

    return (
        <group ref={groupRef} name="scenery">
            {children}
        </group>
    );
};

/** Dev only: exposes window.__scene for the scene review script */
export const SceneDevTools = () => {
    useSceneDevTools();
    return null;
};
