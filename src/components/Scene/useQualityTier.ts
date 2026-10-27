import { useState } from 'react';
import { MathUtils } from 'three';

import {
    QUALITY_TIER_ORDER,
    QUALITY_TIERS,
    type QualityTier
} from '@/components/Scene/Scene.constants';

/** Touch devices start cheap; PerformanceMonitor raises the tier if the frame rate allows it */
const getInitialTier = (): QualityTier =>
    window.matchMedia('(pointer: coarse)').matches ? 'low' : 'medium';

/**
 * Current quality tier and the handlers to plug into drei's PerformanceMonitor.
 */
export const useQualityTier = () => {
    const [tier, setTier] = useState<QualityTier>(getInitialTier);

    const stepTier = (step: 1 | -1) =>
        setTier((currentTier) => {
            const nextIndex = MathUtils.clamp(
                QUALITY_TIER_ORDER.indexOf(currentTier) + step,
                0,
                QUALITY_TIER_ORDER.length - 1
            );
            return QUALITY_TIER_ORDER[nextIndex];
        });

    return {
        settings: QUALITY_TIERS[tier],
        handleIncline: () => stepTier(1),
        handleDecline: () => stepTier(-1),
        handleFallback: () => setTier('low')
    };
};
