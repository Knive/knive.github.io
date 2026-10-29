import { useCallback, useRef } from 'react';
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
 * Drives the emissive of the dagger's glowing parts (runes, crystal...) together:
 * its own pulse, raised while hovered, plus any running playGlow burst.
 * Pass the returned ref callback to each glowing part's material.
 */
export const useDaggerGlow = ({ daggerId, isHovered, pulse }: DaggerGlowOptions) => {
    const glowMaterialsRef = useRef(new Set<MeshToonMaterial>());
    const levelRef = useRef<number>(GLOW_LEVEL.idle);

    const registerGlowMaterial = useCallback((material: MeshToonMaterial | null) => {
        if (!material) return;
        const glowMaterials = glowMaterialsRef.current;
        glowMaterials.add(material);
        return () => {
            glowMaterials.delete(material);
        };
    }, []);

    useFrame(({ clock }, deltaSeconds) => {
        levelRef.current = MathUtils.damp(
            levelRef.current,
            isHovered ? GLOW_LEVEL.hover : GLOW_LEVEL.idle,
            GLOW_LEVEL.smoothing,
            deltaSeconds
        );
        const intensity =
            pulse(clock.elapsedTime) * levelRef.current +
            getBurstStrength(daggerId) * BURST_EMISSIVE_PEAK;

        for (const material of glowMaterialsRef.current) material.emissiveIntensity = intensity;
    });

    return registerGlowMaterial;
};
