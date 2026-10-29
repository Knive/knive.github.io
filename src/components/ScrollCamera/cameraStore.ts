import { MathUtils } from 'three';

/**
 * Scroll progress of the camera, written every frame by ScrollCamera (damped) and read by the
 * ground, mist, sky and moon. Plain module state, like the scroll store: no React renders.
 */
const progress = { tilt: 0, drift: 0 };

export const getCameraProgress = (): Readonly<typeof progress> => progress;

export const setCameraProgress = (tilt: number, drift: number) => {
    progress.tilt = tilt;
    progress.drift = drift;
};

/** Page scroll at which a section's top reaches the viewport centre */
const getSectionCentreScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return 0;
    return section.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
};

/** Undamped targets from the page scroll: tilt eases in over the hero, drift is linear after it */
export const getScrollTargets = () => {
    const tiltEnd = Math.max(getSectionCentreScroll('experience'), 1);
    const driftEnd = Math.max(getSectionCentreScroll('contact'), tiltEnd + 1);
    const scroll = window.scrollY;
    return {
        tilt: MathUtils.smoothstep(scroll, 0, tiltEnd),
        drift: MathUtils.clamp((scroll - tiltEnd) / (driftEnd - tiltEnd), 0, 1)
    };
};
