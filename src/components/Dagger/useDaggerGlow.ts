import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type MeshToonMaterial } from 'three';

import { BURST_EMISSIVE_PEAK, GLOW_LEVEL } from '@/components/Glow/Glow.constants';
import type { GlowPulse } from '@/components/Glow/Glow.helpers';
import { getBurstStrength } from '@/components/Glow/glowStore';

type DaggerGlowOptions = {
    daggerId: string;
    isHovered: boolean;
    pulse: GlowPulse;
};

/**
 * Drives the emissive of the dagger's glowing part (runes, crystal...):
 * its own pulse, raised while hovered, plus any running playGlow burst.
 * Attach the returned ref to that part's material.
 */
export const useDaggerGlow = ({ daggerId, isHovered, pulse }: DaggerGlowOptions) => {
    const glowMaterialRef = useRef<MeshToonMaterial>(null);
    const levelRef = useRef<number>(GLOW_LEVEL.idle);

    useFrame(({ clock }, deltaSeconds) => {
        const glowMaterial = glowMaterialRef.current;
        if (!glowMaterial) return;

        levelRef.current = MathUtils.damp(
            levelRef.current,
            isHovered ? GLOW_LEVEL.hover : GLOW_LEVEL.idle,
            GLOW_LEVEL.smoothing,
            deltaSeconds
        );
        glowMaterial.emissiveIntensity =
            pulse(clock.elapsedTime) * levelRef.current +
            getBurstStrength(daggerId) * BURST_EMISSIVE_PEAK;
    });

    return glowMaterialRef;
};
