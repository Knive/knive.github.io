import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';

import {
    FALL_DURATION_SECONDS,
    FALL_HEIGHT,
    HOVER_GLOW,
    IDLE_SWAY,
    IMPACT_SHAKE
} from '@/components/Dagger/Dagger.constants';
import type { BladeMaterial } from '@/components/Dagger/Dagger.components';

type DaggerAnimationOptions = {
    fallDelaySeconds: number;
    /** Desynchronises the idle sway between daggers */
    swayPhaseOffset: number;
    isHovered: boolean;
    onLand: () => void;
};

/** Gravity-like acceleration */
const easeInQuad = (progress: number) => progress * progress;

const getFallHeight = (timeSinceDrop: number) => {
    const fallProgress = Math.min(1, timeSinceDrop / FALL_DURATION_SECONDS);
    return FALL_HEIGHT * (1 - easeInQuad(fallProgress));
};

/** Rapid oscillation that decays to zero over the shake duration */
const getImpactShakeAngle = (timeSinceImpact: number) => {
    const remainingShake = 1 - timeSinceImpact / IMPACT_SHAKE.durationSeconds;
    const oscillation = Math.sin(timeSinceImpact * IMPACT_SHAKE.frequency);
    return oscillation * IMPACT_SHAKE.amplitude * remainingShake ** 2;
};

const getIdleSwayAngle = (elapsedTime: number, phaseOffset: number) =>
    Math.sin((elapsedTime + phaseOffset) * IDLE_SWAY.frequency) * IDLE_SWAY.amplitude;

const getLandedTiltAngle = (timeSinceImpact: number, elapsedTime: number, phaseOffset: number) =>
    timeSinceImpact < IMPACT_SHAKE.durationSeconds
        ? getImpactShakeAngle(timeSinceImpact)
        : getIdleSwayAngle(elapsedTime, phaseOffset);

/**
 * Drives the dagger fall, impact shake, idle sway and hover glow.
 * Attach the returned refs to the dagger group and blade material.
 */
export const useDaggerAnimation = ({
    fallDelaySeconds,
    swayPhaseOffset,
    isHovered,
    onLand
}: DaggerAnimationOptions) => {
    const groupRef = useRef<Group>(null);
    const bladeMaterialRef = useRef<BladeMaterial>(null);
    const elapsedTimeRef = useRef(0);
    const hasLandedRef = useRef(false);

    useFrame((_, deltaSeconds) => {
        const group = groupRef.current;
        if (!group) return;

        elapsedTimeRef.current += deltaSeconds;
        const timeSinceDrop = elapsedTimeRef.current - fallDelaySeconds;
        if (timeSinceDrop <= 0) return;

        if (hasLandedRef.current) {
            const timeSinceImpact = timeSinceDrop - FALL_DURATION_SECONDS;
            group.rotation.z = getLandedTiltAngle(
                timeSinceImpact,
                elapsedTimeRef.current,
                swayPhaseOffset
            );
        } else {
            group.position.y = getFallHeight(timeSinceDrop);
            if (timeSinceDrop >= FALL_DURATION_SECONDS) {
                hasLandedRef.current = true;
                onLand();
            }
        }

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

    return { groupRef, bladeMaterialRef };
};
