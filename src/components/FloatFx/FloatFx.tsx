import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import {
    ArrivalStreak,
    Embers,
    Halo,
    RuneOrbit,
    Wisp,
    type FloatFxPartProps
} from '@/components/FloatFx/FloatFx.components';
import { getFloatStrength } from '@/components/FloatFx/FloatFx.helpers';
import type { GlowPulse } from '@/components/Glow/Glow.helpers';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

type FloatFxProps = FloatFxPartProps & {
    pulse: GlowPulse;
    /** Middle of the dagger, from tip to pommel, in the parent's space */
    centerY: number;
};

/**
 * 2D glow of a dagger floating at its section's anchor: halo, rising embers, wisps, orbiting runes,
 * and a light streak as it arrives.
 * Render inside the dagger's lift group, so it follows the flight and the levitation.
 * Under reduced motion only the still halo shows.
 */
export const FloatFx = ({ pulse, centerY, ...partProps }: FloatFxProps) => {
    const groupRef = useRef<Group>(null);
    const isReducedMotion = useMemo(prefersReducedMotion, []);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.visible =
            getFloatStrength(partProps.sectionId, partProps.isIntroPlaying) > 0;
    });

    return (
        <group ref={groupRef} position={[0, centerY, 0]} visible={false}>
            <Halo {...partProps} pulse={pulse} isReducedMotion={isReducedMotion} />
            {!isReducedMotion && (
                <>
                    <Wisp {...partProps} />
                    <Embers {...partProps} />
                    <RuneOrbit {...partProps} />
                    <ArrivalStreak
                        sectionId={partProps.sectionId}
                        glowColor={partProps.glowColor}
                    />
                </>
            )}
        </group>
    );
};
