import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type MeshToonMaterial } from 'three';

import { HOVER_GLOW } from '@/components/Dagger/Dagger.constants';

/**
 * Eases the dagger's glowing part (runes, crystal...) towards the hover intensity.
 * Attach the returned ref to that part's material.
 */
export const useDaggerHoverGlow = (isHovered: boolean) => {
    const glowMaterialRef = useRef<MeshToonMaterial>(null);

    useFrame((_, deltaSeconds) => {
        const glowMaterial = glowMaterialRef.current;
        if (!glowMaterial) return;

        const targetGlowIntensity = isHovered ? HOVER_GLOW.intensity : 0;
        glowMaterial.emissiveIntensity = MathUtils.damp(
            glowMaterial.emissiveIntensity,
            targetGlowIntensity,
            HOVER_GLOW.smoothing,
            deltaSeconds
        );
    });

    return glowMaterialRef;
};
