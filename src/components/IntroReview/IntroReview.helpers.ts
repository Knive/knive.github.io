import { Line3, PerspectiveCamera, Vector3 } from 'three';

import {
    BEATS,
    CONVERGENCE_SECONDS,
    FAN_END_SECONDS,
    LANDING,
    WHITEOUT
} from '@/components/Intro/Intro.constants';
import {
    getBeatAt,
    getStoryTime,
    getTimeScale,
    SLOW_MOTION_WINDOW
} from '@/components/Intro/Intro.helpers';
import { getIntroPaths, getIntroSeed } from '@/components/Intro/introStore';
import { HEAD_CAM } from '@/components/IntroCamera/IntroCamera.constants';
import { createShot, getShot } from '@/components/IntroCamera/IntroCamera.helpers';
import { getPathBodyCentre } from '@/components/IntroPaths/IntroPaths.helpers';
import { REVIEW } from '@/components/IntroReview/IntroReview.constants';

/** What the checks need to know about an intro, all as pure functions of intro time t */
export type IntroModel = {
    label: string;
    firstFlareSeconds: number;
    impactSeconds: number[];
    /** When all the paths meet by design; crossings are only counted before it */
    convergenceSeconds: number;
    /** Wall-clock windows where speed may change faster than the frame-to-frame limit, by design */
    designedWindows: DesignedWindow[];
    /** Hard cuts: screen speeds are only compared within a shot */
    cutSeconds: number[];
    /** Camera archetype of each beat, in order */
    beatArchetypes: string[];
    getDaggerWorldPoint: (daggerIndex: number, seconds: number, target: Vector3) => Vector3;
    /** The point of the dagger the camera frames (its middle); the screen checks follow it */
    getDaggerHeadPoint: (daggerIndex: number, seconds: number, target: Vector3) => Vector3;
    /** Index of the dagger the camera follows at time t, or null for wide shots */
    getShotSubject: (seconds: number) => number | null;
    /** Places the camera for time t; null when the intro has no pure camera yet */
    applyCamera: ((seconds: number, camera: PerspectiveCamera) => void) | null;
};

type CheckResult = { name: string; passed: boolean; detail: string };

/** A stretch of the intro where speed is meant to change fast (slow-motion ramps, reveals, whiteout) */
export type DesignedWindow = { label: string; start: number; end: number };

const FRAME_SECONDS = 1 / REVIEW.framesPerSecond;

/** True when the frame [t, t + 1 frame] (what one speed sample spans) overlaps a designed window */
const isInWindows = (seconds: number, windows: DesignedWindow[]) =>
    windows.some(({ start, end }) => seconds + FRAME_SECONDS >= start && seconds <= end);

const checkDuration = ({ firstFlareSeconds, impactSeconds }: IntroModel): CheckResult => {
    const lastImpact = Math.max(...impactSeconds);
    const duration = lastImpact - firstFlareSeconds;
    return {
        name: `last impact at t <= ${LANDING.latestImpactSeconds}`,
        passed: lastImpact <= LANDING.latestImpactSeconds,
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
    const endSeconds = model.convergenceSeconds - REVIEW.crossingMarginSeconds;
    const paths = model.impactSeconds.map((_, daggerIndex) =>
        Array.from({ length: REVIEW.crossingSamples }, (__, sample) =>
            model.getDaggerWorldPoint(
                daggerIndex,
                (sample / REVIEW.crossingSamples) * endSeconds,
                new Vector3()
            )
        )
    );

    let crossings = 0;
    const segment = new Line3();
    const closest = new Vector3();
    /** Distance from a point to a sampled path, segment by segment (samples alone can straddle a crossing) */
    const distanceToPath = (point: Vector3, path: Vector3[]) => {
        let distance = Infinity;
        for (let index = 1; index < path.length; index++) {
            segment.set(path[index - 1], path[index]).closestPointToPoint(point, true, closest);
            distance = Math.min(distance, closest.distanceTo(point));
        }
        return distance;
    };
    for (let first = 0; first < daggerCount; first++) {
        for (let second = first + 1; second < daggerCount; second++) {
            let isNear = false;
            for (const point of paths[first]) {
                const isNowNear = distanceToPath(point, paths[second]) < REVIEW.crossingDistance;
                if (isNowNear && !isNear) crossings++;
                isNear = isNowNear;
            }
        }
    }
    return {
        name: `path crossings >= ${REVIEW.minCrossings}`,
        passed: crossings >= REVIEW.minCrossings,
        detail: `${crossings} crossings before the convergence (paths closer than ${REVIEW.crossingDistance} m)`
    };
};

/** Speed of one dagger at time t, or null when it should not be compared (off screen...) */
type SpeedSample = (daggerIndex: number, seconds: number) => number | null;

/** Worst frame-to-frame speed change, per dagger, outside the slow-motion windows and the cuts */
const checkSpeedSmoothness = (
    model: IntroModel,
    name: string,
    getSpeed: SpeedSample,
    ignoredSeconds: number[],
    restingSpeed: number,
    /** Changes below this absolute size never fail */
    minVisibleChange = 0
): CheckResult => {
    const failures: string[] = [];
    let worstChange = 0;
    let comparedFrames = 0;

    model.impactSeconds.forEach((impact, daggerIndex) => {
        let previous: number | null = null;
        for (let seconds = 0; seconds < impact - FRAME_SECONDS; seconds += FRAME_SECONDS) {
            const isExcused =
                isInWindows(seconds, model.designedWindows) ||
                ignoredSeconds.some((cut) => Math.abs(seconds - cut) <= FRAME_SECONDS);
            const speed = getSpeed(daggerIndex, seconds);
            if (isExcused || speed === null || speed < restingSpeed) {
                previous = null;
                continue;
            }
            if (previous !== null) {
                const change = Math.abs(speed - previous) / previous;
                worstChange = Math.max(worstChange, change);
                comparedFrames++;
                const isVisible = Math.abs(speed - previous) > minVisibleChange;
                if (change > REVIEW.maxSpeedChange && isVisible && failures.length < 6) {
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
        detail: `worst change ${(worstChange * 100).toFixed(0)} % over ${comparedFrames} compared frames${failures.length ? `; ${failures.join('; ')}` : ''}`
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
        [],
        REVIEW.restingSpeed
    );
};

/**
 * Screen speed within each shot. Enforced on the shot's subject (the head the camera follows: a stop
 * or a pop would show there); the other on-screen daggers are only reported, because a camera pan
 * makes them glide across the frame with large but smooth relative changes of speed.
 */
const checkScreenSpeed = (model: IntroModel): CheckResult[] => {
    const { applyCamera, getShotSubject } = model;
    if (!applyCamera) {
        return [
            {
                name: 'screen speed changes (within a shot)',
                passed: true,
                detail: 'skipped: no pure camera in this intro'
            }
        ];
    }
    const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    const [from, to] = [new Vector3(), new Vector3()];
    /** Normalised device coordinates; z above 1 means behind the camera */
    const toScreen = (daggerIndex: number, seconds: number, target: Vector3) =>
        model.getDaggerHeadPoint(daggerIndex, seconds, target).project(camera);
    const isOnScreen = ({ x, y, z }: Vector3) => z < 1 && Math.abs(x) <= 1 && Math.abs(y) <= 1;
    const worldPoint = new Vector3();
    const isNearCamera = (daggerIndex: number, seconds: number) =>
        model.getDaggerHeadPoint(daggerIndex, seconds, worldPoint).distanceTo(camera.position) <
        REVIEW.nearCameraMetres;
    /** Near the camera, perspective alone changes screen speed fast: only the subject is kept there */
    const getScreenSpeed = (daggerIndex: number, seconds: number, isSubject: boolean) => {
        // What the viewer sees: each frame's position under that frame's own camera
        applyCamera(seconds, camera);
        camera.updateMatrixWorld();
        toScreen(daggerIndex, seconds, from);
        const isNear = isNearCamera(daggerIndex, seconds);
        applyCamera(seconds + FRAME_SECONDS, camera);
        camera.updateMatrixWorld();
        toScreen(daggerIndex, seconds + FRAME_SECONDS, to);
        if (!isOnScreen(from) || !isOnScreen(to) || (!isSubject && isNear)) return null;
        // In view widths (the view spans 2 in device coordinates)
        return from.setZ(0).distanceTo(to.setZ(0)) / 2 / FRAME_SECONDS;
    };
    const subjectResult = checkSpeedSmoothness(
        model,
        `screen speed of the followed head changes <= ${REVIEW.maxSpeedChange * 100} % per frame (and > ${REVIEW.minVisibleScreenSpeedChange} view widths/s to count)`,
        (daggerIndex, seconds) =>
            getShotSubject(seconds) === daggerIndex
                ? getScreenSpeed(daggerIndex, seconds, true)
                : null,
        model.cutSeconds,
        REVIEW.restingSubjectScreenSpeed,
        REVIEW.minVisibleScreenSpeedChange
    );
    const othersResult = checkSpeedSmoothness(
        model,
        `info: screen speed of the other daggers (on screen, beyond ${REVIEW.nearCameraMetres} m)`,
        (daggerIndex, seconds) =>
            getShotSubject(seconds) === daggerIndex
                ? null
                : getScreenSpeed(daggerIndex, seconds, false),
        model.cutSeconds,
        REVIEW.restingScreenSpeed,
        REVIEW.minVisibleScreenSpeedChange
    );
    return [subjectResult, { ...othersResult, passed: true }];
};

/** The closed-form story time must match a numeric integral of the time scale */
const checkStoryTime = (): CheckResult => {
    const step = 1e-4;
    let integral = 0;
    let worstError = 0;
    // Through the whole slow-motion window, ramps included
    const endSeconds = SLOW_MOTION_WINDOW.end + 0.5;
    for (let seconds = 0; seconds <= endSeconds; seconds += step) {
        integral += getTimeScale(seconds + step / 2) * step;
        worstError = Math.max(worstError, Math.abs(integral - getStoryTime(seconds + step)));
    }
    return {
        name: 'story time matches the integral of the time scale',
        passed: worstError < 1e-3,
        detail: `worst error ${worstError.toExponential(2)} s`
    };
};

/** Wall-clock time at which story time reaches the given value (story time only ever grows) */
const toWallTime = (storySeconds: number) => {
    let [low, high] = [0, storySeconds * 10];
    for (let iteration = 0; iteration < 40; iteration++) {
        const middle = (low + high) / 2;
        if (getStoryTime(middle) < storySeconds) low = middle;
        else high = middle;
    }
    return high;
};

export const runIntroChecks = (model: IntroModel) => {
    const results = [
        checkDuration(model),
        checkStoryTime(),
        checkArchetypes(model),
        checkCrossings(model),
        checkWorldSpeed(model),
        ...checkScreenSpeed(model)
    ];
    return { intro: model.label, passed: results.every(({ passed }) => passed), results };
};

/** The Phase E v2 intro, described for the checks: seeded paths, pure shot director, seeded landings */
export const createIntroModel = (): IntroModel => {
    const paths = getIntroPaths();
    const shot = createShot();
    const impactSeconds = paths.map((path) => path.impactSeconds);
    // Each dagger falls freely from the fan's end: a designed, steady speed-up from a slow start
    const fallWindows = paths.map(({ impactSeconds: impact }): DesignedWindow => ({
        label: 'free fall',
        start: toWallTime(FAN_END_SECONDS),
        end: impact
    }));
    const revealWindows = BEATS.filter(({ daggerId }) => daggerId).map(
        ({ endSeconds }): DesignedWindow => ({
            label: 'reveal orbit',
            start: endSeconds - HEAD_CAM.reveal.seconds,
            end: endSeconds
        })
    );
    return {
        label: `Phase E v2 intro, seed ${getIntroSeed()}`,
        firstFlareSeconds: 0,
        impactSeconds,
        convergenceSeconds: CONVERGENCE_SECONDS,
        designedWindows: [
            // The group bursts apart towards each dagger's fall start, the later ones much higher
            {
                label: 'convergence burst',
                start: CONVERGENCE_SECONDS,
                end: WHITEOUT.riseStartSeconds
            },
            {
                label: 'whiteout',
                start: WHITEOUT.riseStartSeconds,
                end: WHITEOUT.fadeStartSeconds + WHITEOUT.fadeSeconds
            },
            {
                label: 'slow motion',
                start: SLOW_MOTION_WINDOW.rampDownStart,
                end: SLOW_MOTION_WINDOW.end
            },
            ...fallWindows,
            ...revealWindows
        ],
        cutSeconds: BEATS.slice(1).map(({ startSeconds }) => startSeconds),
        beatArchetypes: BEATS.map(({ shot: archetype }) => archetype),
        getDaggerWorldPoint: (daggerIndex, seconds, target) =>
            paths[daggerIndex].getPosition(seconds, target),
        getDaggerHeadPoint: (daggerIndex, seconds, target) =>
            getPathBodyCentre(paths[daggerIndex], seconds, target),
        getShotSubject: (seconds) => {
            const { daggerId } = getBeatAt(seconds);
            const index = paths.findIndex(({ sectionId }) => sectionId === daggerId);
            return index === -1 ? null : index;
        },
        applyCamera: (seconds, camera) => {
            getShot(paths, seconds, shot);
            camera.position.copy(shot.position);
            camera.lookAt(shot.lookAt);
            camera.rotateZ(shot.roll);
            camera.fov = shot.fov;
            camera.updateProjectionMatrix();
        }
    };
};
