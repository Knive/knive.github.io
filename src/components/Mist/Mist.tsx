import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, type Mesh } from 'three';

import { MIST_LAYERS } from '@/components/Mist/Mist.constants';
import { createMistTexture } from '@/components/Mist/Mist.helpers';
import { getCameraProgress } from '@/components/ScrollCamera/cameraStore';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

const MIST_TEXTURE = createMistTexture();
const UNIT_PLANE = new PlaneGeometry(1, 1);

/**
 * Low cloud bands between the dagger row and the tree line. Inside the sinking ground, each sinks a
 * little more at its own rate as the camera tilts (parallax) and drifts sideways.
 */
export const Mist = () => {
    const layerRefs = useRef<(Mesh | null)[]>([]);
    const isReducedMotion = useMemo(prefersReducedMotion, []);
    // One texture per layer, so each drifts on its own offset; they share the canvas
    const layerTextures = useMemo(() => MIST_LAYERS.map(() => MIST_TEXTURE.clone()), []);

    useFrame(({ clock }) => {
        const { tilt } = getCameraProgress();
        MIST_LAYERS.forEach((layer, index) => {
            const mesh = layerRefs.current[index];
            if (!mesh) return;
            mesh.position.y = layer.y - tilt * layer.parallax;
            if (isReducedMotion) return;
            layerTextures[index].offset.x = (clock.elapsedTime * layer.driftSpeed) / layer.width;
        });
    });

    return (
        <>
            {MIST_LAYERS.map((layer, index) => (
                <mesh
                    key={layer.z}
                    ref={(mesh) => {
                        layerRefs.current[index] = mesh;
                    }}
                    geometry={UNIT_PLANE}
                    position={[0, layer.y, layer.z]}
                    scale={[layer.width, layer.height, 1]}
                >
                    <meshBasicMaterial
                        map={layerTextures[index]}
                        color={layer.color}
                        opacity={layer.opacity}
                        transparent
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </>
    );
};
