import { PerspectiveCamera, Vector3 } from 'three';

import { INTRO, INTRO_DURATION_SECONDS } from '@/components/Intro/Intro.constants';
import {
    createFlightPlan,
    getSlowMotionWindow,
    getStoryTime,
    getTimeScale,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';
import { REVIEW } from '@/components/IntroReview/IntroReview.constants';
import { DAGGERS } from '@/components/Scene/Scene.constants';

/** What the checks need to know about an intro, all as pure functions of intro time t */
export type IntroModel = {
    label: string;
    firstFlareSeconds: number;
    impactSeconds: number[];
    /** Wall-clock windows where speed may change faster than the frame-to-frame limit */
    slowMotionWindows: [number, number][];
    /** Hard cuts: screen speeds are only compared within a shot */
    cutSeconds: number[];
    /** Camera archetype of each beat, in order */
    beatArchetypes: string[];
    getDaggerWorldPoint: (daggerIndex: number, seconds: number, target: Vector3) => Vector3;
    /** Places the camera for time t; null when the intro has no pure camera yet */
    applyCamera: ((seconds: number, camera: PerspectiveCamera) => void) | null;
};

type CheckResult = { name: string; passed: boolean; detail: string };

const FRAME_SECONDS = 1 / REVIEW.framesPerSecond;

const isInWindows = (seconds: number, windows: [number, number][]) =>
    windows.some(([start, end]) => seconds >= start && seconds <= end);

const checkDuration = ({ firstFlareSeconds, impactSeconds }: IntroModel): CheckResult => {
    const lastImpact = Math.max(...impactSeconds);
    const duration = lastImpact - firstFlareSeconds;
    const passed =
        Math.abs(duration - INTRO_DURATION_SECONDS) <= FRAME_SECONDS &&
        lastImpact <= INTRO_DURATION_SECONDS + Number.EPSILON;
    return {
        name: 'duration 4.0 s, last impact at t <= 4.0',
        passed,
        detail: `first flare ${firstFlareSeconds.toFixed(3)} s, last impact ${lastImpact.toFixed(3)} s, duration ${duration.toFixed(3)} s`
    };
};

const checkArchetypes = ({ beatArchetypes }: IntroModel): CheckResult => {
    const repeats = beatArchetypes.filter(
        (archetype, index) => archetype === beatArchetypes[index - 1]
    );
    return {
        name: 'no two consecutive beats share a camera archetype',
        passed: repeats.length === 0,
        detail: `beats: ${beatArchetypes.join(', ')}`
    };
};

/** Counts the times one dagger's path comes within reach of another's (entering, not staying, near) */
const checkCrossings = (model: IntroModel): CheckResult => {
    const daggerCount = model.impactSeconds.length;
    const paths = model.impactSeconds.map((impact, daggerIndex) =>
        Array.from({ length: REVIEW.crossingSamples }, (_, sample) =>
            model.getDaggerWorldPoint(
                daggerIndex,
                (sample / REVIEW.crossingSamples) * impact,
                new Vector3()
            )
        )
    );

    let crossings = 0;
    for (let first = 0; first < daggerCount; first++) {
        for (let second = first + 1; second < daggerCount; second++) {
            let isNear = false;
            for (const point of paths[first]) {
                const distance = Math.min(...paths[second].map((other) => other.distanceTo(point)));
                const isNowNear = distance < REVIEW.crossingDistance;
                if (isNowNear && !isNear) crossings++;
                isNear = isNowNear;
            }
        }
    }
    return {
        name: `path crossings >= ${REVIEW.minCrossings}`,
        passed: crossings >= REVIEW.minCrossings,
        detail: `${crossings} crossings (paths closer than ${REVIEW.crossingDistance} m)`
    };
};

type SpeedSample = (daggerIndex: number, seconds: number) => number | null;

/** Worst frame-to-frame speed change, per dagger, outside the slow-motion windows and the cuts */
const checkSpeedSmoothness = (
    model: IntroModel,
    name: string,
    getSpeed: SpeedSample,
    ignoredSeconds: number[]
): CheckResult => {
    const failures: string[] = [];
    let worstChange = 0;

    model.impactSeconds.forEach((impact, daggerIndex) => {
        let previous: number | null = null;
        for (let seconds = 0; seconds < impact - FRAME_SECONDS; seconds += FRAME_SECONDS) {
            const isExcused =
                isInWindows(seconds, model.slowMotionWindows) ||
                ignoredSeconds.some((cut) => Math.abs(seconds - cut) <= FRAME_SECONDS);
            const speed = getSpeed(daggerIndex, seconds);
            if (isExcused || speed === null || speed < REVIEW.restingSpeed) {
                previous = null;
                continue;
            }
            if (previous !== null) {
                const change = Math.abs(speed - previous) / previous;
                worstChange = Math.max(worstChange, change);
                if (change > REVIEW.maxSpeedChange && failures.length < 6) {
                    failures.push(
                        `dagger ${daggerIndex} at ${seconds.toFixed(3)} s: ${(change * 100).toFixed(0)} %`
                    );
                }
            }
            previous = speed;
        }
    });

    return {
        name,
        passed: failures.length === 0,
        detail: `worst change ${(worstChange * 100).toFixed(0)} %${failures.length ? `; ${failures.join('; ')}` : ''}`
    };
};

const checkWorldSpeed = (model: IntroModel) => {
    const [from, to] = [new Vector3(), new Vector3()];
    return checkSpeedSmoothness(
        model,
        `world speed changes <= ${REVIEW.maxSpeedChange * 100} % per frame`,
        (daggerIndex, seconds) => {
            model.getDaggerWorldPoint(daggerIndex, seconds, from);
            model.getDaggerWorldPoint(daggerIndex, seconds + FRAME_SECONDS, to);
            return from.distanceTo(to) / FRAME_SECONDS;
        },
        []
    );
};

const checkScreenSpeed = (model: IntroModel): CheckResult => {
    const { applyCamera } = model;
    if (!applyCamera) {
        return {
            name: 'screen speed',
            passed: true,
            detail: 'skipped: no pure camera in this intro'
        };
    }
    const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    const [from, to] = [new Vector3(), new Vector3()];
    const toScreen = (daggerIndex: number, seconds: number, target: Vector3) => {
        // Same camera for both samples: only the dagger's motion on screen is measured
        model.getDaggerWorldPoint(daggerIndex, seconds, target).project(camera);
        return target.setZ(0);
    };
    return checkSpeedSmoothness(
        model,
        `screen speed changes <= ${REVIEW.maxSpeedChange * 100} % per frame (within a shot)`,
        (daggerIndex, seconds) => {
            applyCamera(seconds, camera);
            camera.updateMatrixWorld();
            toScreen(daggerIndex, seconds, from);
            toScreen(daggerIndex, seconds + FRAME_SECONDS, to);
            return from.distanceTo(to) / FRAME_SECONDS;
        },
        model.cutSeconds
    );
};

/** The closed-form story time must match a numeric integral of the time scale */
const checkStoryTime = (model: IntroModel): CheckResult => {
    const impacts = {
        firstImpactSeconds: Math.min(...model.impactSeconds),
        lastImpactSeconds: Math.max(...model.impactSeconds)
    };
    const step = 1e-4;
    let integral = 0;
    let worstError = 0;
    // Through the whole slow-motion window, ramps included
    const endSeconds = getSlowMotionWindow(impacts).end + 0.5;
    for (let seconds = 0; seconds <= endSeconds; seconds += step) {
        integral += getTimeScale(seconds + step / 2, impacts) * step;
        worstError = Math.max(
            worstError,
            Math.abs(integral - getStoryTime(seconds + step, impacts))
        );
    }
    return {
        name: 'story time matches the integral of the time scale',
        passed: worstError < 1e-3,
        detail: `worst error ${worstError.toExponential(2)} s`
    };
};

export const runIntroChecks = (model: IntroModel) => {
    const results = [
        checkDuration(model),
        checkStoryTime(model),
        checkArchetypes(model),
        checkCrossings(model),
        checkWorldSpeed(model),
        checkScreenSpeed(model)
    ];
    return { intro: model.label, passed: results.every(({ passed }) => passed), results };
};

/** Wall-clock time at which the old flight clock reaches a flight time (it only ever slows down) */
const toWallSeconds = (flightSeconds: number) => {
    let seconds = 0;
    while (toFlightSeconds(seconds) < flightSeconds) seconds += 1e-3;
    return seconds;
};

/**
 * Baseline: the current braid intro, described for the checks. Its camera smooths its target
 * frame by frame, so it has no pure camera and the screen-speed check is skipped.
 */
export const createBraidIntroModel = (): IntroModel => {
    const plans = DAGGERS.map(({ sectionId, landing }, strand) =>
        createFlightPlan(strand, sectionId, landing)
    );
    const slowMotionStart = INTRO.firstLandingSeconds - INTRO.slowMotion.leadInSeconds;
    return {
        label: 'braid intro (baseline before the Phase E v2 rewrite)',
        firstFlareSeconds: 0,
        impactSeconds: plans.map(({ landingSeconds }) => toWallSeconds(landingSeconds)),
        slowMotionWindows: [
            [toWallSeconds(slowMotionStart), toWallSeconds(INTRO.firstLandingSeconds)]
        ],
        cutSeconds: [],
        // One rail for every showcase: the same camera archetype throughout
        beatArchetypes: DAGGERS.map(() => 'rail'),
        getDaggerWorldPoint: (daggerIndex, seconds, target) =>
            plans[daggerIndex].getWorldPoint(toFlightSeconds(seconds), target),
        applyCamera: null
    };
};
