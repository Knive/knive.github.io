import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

import { HOVER_GLOW } from '@/components/Dagger/Dagger.constants';
import type { BladeMaterial } from '@/components/Dagger/Dagger.components';

/**
 * Eases the blade emissive towards the hover intensity.
 * Attach the returned ref to the blade material.
 */
export const useDaggerHoverGlow = (isHovered: boolean) => {
    const bladeMaterialRef = useRef<BladeMaterial>(null);

    useFrame((_, deltaSeconds) => {
        const bladeMaterial = bladeMaterialRef.current;
        if (!bladeMaterial) return;

        const targetGlowIntensity = isHovered ? HOVER_GLOW.intensity : 0;
        bladeMaterial.emissiveIntensity = MathUtils.damp(
            bladeMaterial.emissiveIntensity,
            targetGlowIntensity,
            HOVER_GLOW.smoothing,
            deltaSeconds
        );
    });

    return bladeMaterialRef;
};
