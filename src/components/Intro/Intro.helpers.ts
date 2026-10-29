import { CatmullRomCurve3, Euler, MathUtils, Quaternion, Vector3, type Object3D } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { toRestRotation } from '@/components/BladeField/BladeField.helpers';
import {
    BRAID,
    CAMERA_RAIL,
    CAMERA_SHAKE,
    DIVE,
    INTRO,
    INTRO_SESSION_KEY,
    LANDING_SEQUENCE
} from '@/components/Intro/Intro.constants';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

const BLADE_TIP_DIRECTION = new Vector3(0, -1, 0);
/** Flight seconds between the two samples that give a dagger's direction of travel */
const TANGENT_STEP_SECONDS = 0.01;

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

/** Real seconds since the intro started → flight seconds, slowed down just before the first impact */
export const toFlightSeconds = (realSeconds: number) => {
    if (realSeconds < SLOW_MOTION_START) return realSeconds;

    const slowedSeconds = realSeconds - SLOW_MOTION_START;
    if (slowedSeconds < SLOW_MOTION_REAL_SECONDS) {
        return SLOW_MOTION_START + slowedSeconds * INTRO.slowMotion.rate;
    }
    return realSeconds - SLOW_MOTION_REAL_SECONDS + INTRO.slowMotion.leadInSeconds;
};

/** Flight seconds of a dagger's impact */
const getLandingSecondsByOrder = (landingOrder: number) =>
    INTRO.firstLandingSeconds + landingOrder * INTRO.landingGapSeconds;

export const getLandingSeconds = (sectionId: string) =>
    getLandingSecondsByOrder(LANDING_SEQUENCE.indexOf(sectionId));

const SPINE = new CatmullRomCurve3(BRAID.spine.map((point) => new Vector3(...point)));
const SPINE_FRAMES = SPINE.computeFrenetFrames(BRAID.frameSegments, false);
const STRAND_COUNT = LANDING_SEQUENCE.length;

/** World point of one strand of the braid: the spine plus a Lissajous offset in its normal plane */
const getBraidPoint = (strand: number, flightSeconds: number, target: Vector3) => {
    const progress = MathUtils.clamp(flightSeconds / INTRO.splitSeconds, 0, 1);
    const frame = Math.round(progress * BRAID.frameSegments);
    const angle = (BRAID.turns * progress + strand / STRAND_COUNT) * Math.PI * 2;
    const radius = MathUtils.lerp(
        BRAID.startRadius,
        BRAID.peakRadius,
        Math.sin(progress * Math.PI)
    );

    return SPINE.getPointAt(progress, target)
        .addScaledVector(SPINE_FRAMES.normals[frame], radius * Math.cos(angle))
        .addScaledVector(SPINE_FRAMES.binormals[frame], radius * BRAID.weave * Math.sin(2 * angle));
};

export type FlightPlan = ReturnType<typeof createFlightPlan>;

/**
 * One dagger's flight in world space: its strand of the braid, then a dive that ends along
 * the dagger's own tilted axis, into its landing point.
 */
export const createFlightPlan = (strand: number, sectionId: string, landing: LandingTransform) => {
    const landingSeconds = getLandingSeconds(sectionId);
    const landingPoint = new Vector3(landing.x, 0, landing.z);
    const restQuaternion = new Quaternion().setFromEuler(new Euler(...toRestRotation(landing)));
    const alongAxis = (height: number) =>
        new Vector3(0, height, 0).applyQuaternion(restQuaternion).add(landingPoint);
    const dive = new CatmullRomCurve3([
        getBraidPoint(strand, INTRO.splitSeconds, new Vector3()),
        alongAxis(DIVE.highApproach),
        alongAxis(DIVE.lowApproach),
        landingPoint.clone()
    ]);

    const getWorldPoint = (flightSeconds: number, target: Vector3) => {
        if (flightSeconds <= INTRO.splitSeconds)
            return getBraidPoint(strand, flightSeconds, target);
        const diveProgress = MathUtils.clamp(
            (flightSeconds - INTRO.splitSeconds) / (landingSeconds - INTRO.splitSeconds),
            0,
            1
        );
        return dive.getPointAt(diveProgress ** DIVE.acceleration, target);
    };

    return {
        landingSeconds,
        landingPoint,
        inverseRestQuaternion: restQuaternion.clone().invert(),
        getWorldPoint
    };
};

const worldPoint = new Vector3();
const nextPoint = new Vector3();
const orientation = new Quaternion();

/**
 * Places the dagger on its flight, blade tip leading. The flight group sits inside the dagger's
 * tilted ground group, so the world pose is turned into that group's space.
 */
export const applyFlightPose = (plan: FlightPlan, flightSeconds: number, target: Object3D) => {
    plan.getWorldPoint(flightSeconds, worldPoint);
    plan.getWorldPoint(flightSeconds + TANGENT_STEP_SECONDS, nextPoint);
    const direction = nextPoint.sub(worldPoint);

    target.position
        .copy(worldPoint)
        .sub(plan.landingPoint)
        .applyQuaternion(plan.inverseRestQuaternion);
    if (direction.lengthSq() === 0) return;
    orientation.setFromUnitVectors(BLADE_TIP_DIRECTION, direction.normalize());
    target.quaternion.copy(plan.inverseRestQuaternion).multiply(orientation);
};

/** Index (in DAGGERS order) of the dagger the camera showcases during the braid, or null */
export const getShowcaseIndex = (flightSeconds: number) => {
    const index = Math.floor(
        (flightSeconds - CAMERA_RAIL.showcaseStartSeconds) / CAMERA_RAIL.showcaseSeconds
    );
    const isShowcasing = index >= 0 && index < STRAND_COUNT && flightSeconds < INTRO.splitSeconds;
    return isShowcasing ? index : null;
};

/** Decaying shake after each impact, hardest on the first; 0 outside the shake windows */
export const getShakeOffset = (flightSeconds: number, offset: Vector3) => {
    offset.set(0, 0, 0);
    for (let landingOrder = 0; landingOrder < STRAND_COUNT; landingOrder++) {
        const ageSeconds = flightSeconds - getLandingSecondsByOrder(landingOrder);
        if (ageSeconds < 0 || ageSeconds >= CAMERA_SHAKE.seconds) continue;

        const boost = landingOrder === 0 ? CAMERA_SHAKE.firstImpactBoost : 1;
        const strength = CAMERA_SHAKE.amplitude * boost * (1 - ageSeconds / CAMERA_SHAKE.seconds);
        const phase = ageSeconds * CAMERA_SHAKE.frequency;
        offset.x += Math.sin(phase) * strength;
        offset.y += Math.cos(phase * 1.3) * strength;
    }
    return offset;
};
