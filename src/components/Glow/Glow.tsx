import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils, type PointLight } from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import type { CrackPath } from '@/components/Floor/Floor.helpers';
import { CrackGlow, type GlowEffectProps } from '@/components/Glow/Glow.components';
import { GLOW_LIGHT } from '@/components/Glow/Glow.constants';
import {
    getActiveDaggerId,
    getBurstStrength,
    getHoveredDaggerId
} from '@/components/Glow/glowStore';

type DaggerGlowEffectsProps = GlowEffectProps & {
    positionX: number;
    cracks: CrackPath[];
};

type GlowLightProps = {
    daggers: Pick<DaggerConfig, 'sectionId' | 'positionX' | 'glowColor'>[];
};

/**
 * Single moving light for the active glow: glides to the hovered (or last played) dagger,
 * takes its colour, and flares with its burst. Fades out when no dagger is active.
 */
export const GlowLight = ({ daggers }: GlowLightProps) => {
    const lightRef = useRef<PointLight>(null);
    const glowColors = useMemo(
        () => new Map(daggers.map(({ sectionId, glowColor }) => [sectionId, new Color(glowColor)])),
        [daggers]
    );

    useFrame((_, deltaSeconds) => {
        const light = lightRef.current;
        if (!light) return;

        const activeDaggerId = getActiveDaggerId();
        const activeDagger = daggers.find(({ sectionId }) => sectionId === activeDaggerId);
        const ease = (current: number, target: number) =>
            MathUtils.damp(current, target, GLOW_LIGHT.smoothing, deltaSeconds);

        if (!activeDagger) {
            light.intensity = ease(light.intensity, 0);
            return;
        }

        const isHovered = getHoveredDaggerId() === activeDagger.sectionId;
        const targetIntensity =
            (isHovered ? GLOW_LIGHT.hoverIntensity : 0) +
            getBurstStrength(activeDagger.sectionId) * GLOW_LIGHT.burstPeak;

        light.intensity = ease(light.intensity, targetIntensity);
        light.position.x = ease(light.position.x, activeDagger.positionX);
        light.color.lerp(
            glowColors.get(activeDagger.sectionId) ?? light.color,
            1 - Math.exp(-GLOW_LIGHT.smoothing * deltaSeconds)
        );
    });

    // Always mounted (intensity 0 when idle) so the light count, and the shaders, never change
    return (
        <pointLight
            ref={lightRef}
            position={[0, GLOW_LIGHT.height, GLOW_LIGHT.offsetZ]}
            intensity={0}
            decay={GLOW_LIGHT.decay}
        />
    );
};

/** Ground-level burst effects of one dagger; render inside the dagger's ground group */
export const DaggerGlowEffects = ({
    daggerId,
    glowColor,
    positionX,
    cracks
}: DaggerGlowEffectsProps) => (
    <CrackGlow daggerId={daggerId} glowColor={glowColor} positionX={positionX} cracks={cracks} />
);
