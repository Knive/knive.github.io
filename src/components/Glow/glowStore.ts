import { MathUtils } from 'three';

import { burstEnvelope } from '@/components/Glow/Glow.helpers';
import { nowSeconds } from '@/utils/nowSeconds';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

type Burst = {
    /** 0..1: hover is low, landing is 1 */
    intensity: number;
    /** performance.now() time in seconds */
    startedAt: number;
    /** False under prefers-reduced-motion: the glow plays, the ring and sparks do not */
    hasMotion: boolean;
};

/**
 * Glow state shared by the daggers, the moving light and the effects.
 * Plain module state: it is read every frame in useFrame, so it never triggers React renders,
 * and anything (the intro, HTML links) can call playGlow.
 */
const bursts = new Map<string, Burst>();
let hoveredDaggerId: string | null = null;
let lastPlayedDaggerId: string | null = null;

/** Single entry point for the landing and hover effects; a new call replaces the running burst */
export const playGlow = (daggerId: string, intensity: number) => {
    bursts.set(daggerId, {
        intensity: MathUtils.clamp(intensity, 0, 1),
        startedAt: nowSeconds(),
        hasMotion: !prefersReducedMotion()
    });
    lastPlayedDaggerId = daggerId;
};

export const getBurst = (daggerId: string) => bursts.get(daggerId);

/** Current burst strength, intensity × envelope; 0 when idle */
export const getBurstStrength = (daggerId: string) => {
    const burst = bursts.get(daggerId);
    if (!burst) return 0;
    return burst.intensity * burstEnvelope(nowSeconds() - burst.startedAt);
};

export const setHoveredDagger = (daggerId: string) => {
    hoveredDaggerId = daggerId;
};

/** Only clears if this dagger is still the hovered one (pointer out can arrive after the next over) */
export const clearHoveredDagger = (daggerId: string) => {
    if (hoveredDaggerId === daggerId) hoveredDaggerId = null;
};

/** The dagger the shared light follows: the hovered one, otherwise the last one played */
export const getActiveDaggerId = () => hoveredDaggerId ?? lastPlayedDaggerId;

export const getHoveredDaggerId = () => hoveredDaggerId;
