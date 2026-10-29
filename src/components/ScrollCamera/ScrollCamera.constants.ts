import { MathUtils } from 'three';

import { CAMERA } from '@/components/Scene/Scene.constants';

/** The rest framing's upward pitch: from CAMERA.position towards CAMERA.lookAt */
const HERO_PITCH = Math.atan2(
    CAMERA.lookAt[1] - CAMERA.position[1],
    CAMERA.position[2] - CAMERA.lookAt[2]
);

/**
 * Every tuning value of the scroll camera. Tilt: 0 in the hero, 1 once the Experience section's top
 * reaches the viewport centre. Drift: 0 there, 1 once Contact's top reaches it.
 * With a 50° vertical FOV the frame's bottom edge sits at pitch - 25° at every aspect ratio: at
 * sectionPitch with the ground sunk by groundSink, the tree tops (highest ground objects) sit
 * about 3.6° below it.
 */
export const SCROLL_CAMERA = {
    heroPitch: HERO_PITCH,
    sectionPitch: MathUtils.degToRad(34),
    /** Extra pitch added slowly from Experience to Contact, so the sky keeps moving */
    driftPitch: MathUtils.degToRad(3),
    /** World units the ground and everything on it have sunk at full tilt */
    groundSink: 7,
    /** MathUtils.damp rate: higher follows the scroll faster; off under reduced motion */
    damping: 6,
    /** Below this gap the damped value snaps to its target, so full tilt is exactly reached */
    snapEpsilon: 0.001
} as const;

/** Star field: fades more stars in as the camera tilts up, twinkles and turns slowly */
export const STAR_MOTION = {
    /** Share of the star list over which each star fades in as the visibility passes it */
    fadeShare: 0.02,
    /** Brightness swing of a twinkle around the star's brightness, peak to peak */
    twinkleDepth: 0.35,
    /** Radians per second; each star varies around it */
    twinkleSpeed: 1.6,
    /** Turn of the star field around the vertical axis, in radians */
    spinPerDrift: MathUtils.degToRad(6),
    spinPerSecond: MathUtils.degToRad(0.08)
} as const;
