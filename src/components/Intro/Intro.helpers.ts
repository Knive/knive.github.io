import { CatmullRomCurve3, MathUtils, Quaternion, Vector3, type Object3D } from 'three';

import {
    CAMERA_SHAKE,
    FLIGHT_PATH,
    INTRO,
    INTRO_SESSION_KEY
} from '@/components/Intro/Intro.constants';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

const BLADE_TIP_DIRECTION = new Vector3(0, -1, 0);
const CENTRE_LANDING_ORDER = 2;

const SLOW_MOTION_START = INTRO.firstLandingSeconds - INTRO.slowMotion.leadInSeconds;
const SLOW_MOTION_REAL_SECONDS = INTRO.slowMotion.leadInSeconds / INTRO.slowMotion.rate;

/** Session storage can throw (private mode, blocked site data): then the intro just plays */
const hasPlayedThisSession = () => {
    try {
        return sessionStorage.getItem(INTRO_SESSION_KEY) !== null;
    } catch {
        return false;
    }
};

export const markIntroPlayed = () => {
    try {
        sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
        // Not stored: the intro plays again on reload, which is harmless
    }
};

export const shouldPlayIntro = () => !prefersReducedMotion() && !hasPlayedThisSession();

/** Real seconds since the intro started → flight seconds, slowed down just before the lead's impact */
export const toFlightSeconds = (realSeconds: number) => {
    if (realSeconds < SLOW_MOTION_START) return realSeconds;

    const slowedSeconds = realSeconds - SLOW_MOTION_START;
    if (slowedSeconds < SLOW_MOTION_REAL_SECONDS) {
        return SLOW_MOTION_START + slowedSeconds * INTRO.slowMotion.rate;
    }
    return realSeconds - SLOW_MOTION_REAL_SECONDS + INTRO.slowMotion.leadInSeconds;
};

export const getLandingSeconds = (landingOrder: number) =>
    INTRO.firstLandingSeconds + landingOrder * INTRO.landingGapSeconds;

/** Sky-to-floor path in dagger-local space, ending at the rest position (origin) */
export const createFlightCurve = (landingOrder: number) => {
    const startX = (landingOrder - CENTRE_LANDING_ORDER) * FLIGHT_PATH.spreadX;
    const [, startY, startZ] = FLIGHT_PATH.start;
    const [, middleY, middleZ] = FLIGHT_PATH.middle;

    return new CatmullRomCurve3([
        new Vector3(startX, startY, startZ),
        new Vector3(startX / 2, middleY, middleZ),
        new Vector3(...FLIGHT_PATH.approach),
        new Vector3(0, 0, 0)
    ]);
};

/** Flight progress in [0, 1]: 0 before launch, 1 once landed */
export const getFlightProgress = (landingSeconds: number, flightSeconds: number) => {
    const launchSeconds = landingSeconds - INTRO.flightSeconds;
    const linearProgress = MathUtils.clamp(
        (flightSeconds - launchSeconds) / INTRO.flightSeconds,
        0,
        1
    );
    return linearProgress ** FLIGHT_PATH.acceleration;
};

const tangent = new Vector3();
const orientation = new Quaternion();

/** Places the dagger on its curve, blade tip leading along the path */
export const applyFlightPose = (curve: CatmullRomCurve3, progress: number, target: Object3D) => {
    curve.getPointAt(progress, target.position);
    curve.getTangentAt(progress, tangent);
    target.quaternion.copy(orientation.setFromUnitVectors(BLADE_TIP_DIRECTION, tangent));
};

/** Decaying shake after each landing; 0 outside the shake windows */
export const getShakeOffset = (flightSeconds: number, daggerCount: number, offset: Vector3) => {
    offset.set(0, 0, 0);
    for (let landingOrder = 0; landingOrder < daggerCount; landingOrder++) {
        const ageSeconds = flightSeconds - getLandingSeconds(landingOrder);
        if (ageSeconds < 0 || ageSeconds >= CAMERA_SHAKE.seconds) continue;

        const strength = CAMERA_SHAKE.amplitude * (1 - ageSeconds / CAMERA_SHAKE.seconds);
        const phase = ageSeconds * CAMERA_SHAKE.frequency;
        offset.x += Math.sin(phase) * strength;
        offset.y += Math.cos(phase * 1.3) * strength;
    }
    return offset;
};
