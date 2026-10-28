/**
 * Scroll state written by ScrollTrigger and read every frame by the scene.
 * Plain module state, like the glow store: scrolling never triggers React renders.
 */

/** 0 with the hero fully in view, 1 once it has scrolled out */
export const heroScroll = { progress: 0 };

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
