import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, type Mesh, type MeshBasicMaterial } from 'three';

import type { CrackPath } from '@/components/Floor/Floor.helpers';
import { CRACK_GLOW } from '@/components/Glow/Glow.constants';
import { createCrackGlowTexture } from '@/components/Glow/Glow.helpers';
import { getBurstStrength } from '@/components/Glow/glowStore';

export type GlowEffectProps = {
    daggerId: string;
    glowColor: string;
};

type CrackGlowProps = GlowEffectProps & {
    /** World x of the dagger, to line the glow up with the floor cracks */
    positionX: number;
    cracks: CrackPath[];
};

/** The dagger's floor cracks lighting up in its colour with each burst; render at ground level */
export const CrackGlow = ({ daggerId, glowColor, positionX, cracks }: CrackGlowProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshBasicMaterial>(null);
    const texture = useMemo(() => createCrackGlowTexture(cracks, positionX), [cracks, positionX]);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        const strength = getBurstStrength(daggerId);
        mesh.visible = strength > 0;
        material.color.copy(baseColor).multiplyScalar(strength * CRACK_GLOW.peak);
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, CRACK_GLOW.height, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
        >
            <planeGeometry args={[CRACK_GLOW.size, CRACK_GLOW.size]} />
            <meshBasicMaterial
                ref={materialRef}
                map={texture}
                transparent
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
};
