import { nowSeconds } from '@/utils/nowSeconds';

/**
 * Scroll state written by ScrollTrigger and read every frame by the scene.
 * Plain module state, like the glow store: scrolling never triggers React renders.
 */

const sectionLifts = new Map<string, { value: number }>();

/** 0 with the dagger in the floor, 1 once it has moved to its section's margin; GSAP tweens `value` */
export const getSectionLift = (sectionId: string) => {
    let lift = sectionLifts.get(sectionId);
    if (!lift) {
        lift = { value: 0 };
        sectionLifts.set(sectionId, lift);
    }
    return lift;
};

/** When each dagger last reached its anchor, in nowSeconds() time */
const arrivals = new Map<string, number>();

export const markArrival = (sectionId: string) => {
    arrivals.set(sectionId, nowSeconds());
};

/** Seconds since the dagger last reached its anchor; null if it never has */
export const getArrivalAge = (sectionId: string) => {
    const arrivedAt = arrivals.get(sectionId);
    return arrivedAt === undefined ? null : nowSeconds() - arrivedAt;
};
