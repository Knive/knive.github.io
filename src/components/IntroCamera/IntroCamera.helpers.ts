import { MathUtils, Vector3 } from 'three';

import { BEATS, CONVERGENCE_SECONDS, type Beat } from '@/components/Intro/Intro.constants';
import { getBeatAt } from '@/components/Intro/Intro.helpers';
import {
    HEAD_CAM,
    HEAD_CAM_SHOTS,
    IGNITION_SHOT,
    WIDE_BEHIND_SHOT
} from '@/components/IntroCamera/IntroCamera.constants';
import { FLIGHT } from '@/components/IntroPaths/IntroPaths.constants';
import {
    getPathHead,
    getPathVelocity,
    type DaggerPath
} from '@/components/IntroPaths/IntroPaths.helpers';
import { CAMERA } from '@/components/Scene/Scene.constants';

export type Shot = {
    position: Vector3;
    lookAt: Vector3;
    /** Radians, applied after lookAt */
    roll: number;
    fov: number;
};

export const createShot = (): Shot => ({
    position: new Vector3(),
    lookAt: new Vector3(),
    roll: 0,
    fov: CAMERA.fov
});

const WORLD_UP = new Vector3(0, 1, 0);
const FALLBACK_RIGHT = new Vector3(1, 0, 0);
const CONVERGENCE = new Vector3(...FLIGHT.convergence);
const FIRST_HEAD_CAM_DAGGER = BEATS.find(({ daggerId }) => daggerId)?.daggerId ?? '';
const [head, velocity, forward, right, up, offset, sample] = Array.from(
    { length: 7 },
    () => new Vector3()
);

/** The head's velocity averaged over a short window around t: a steady heading for the camera */
const getSmoothedVelocity = (path: DaggerPath, seconds: number, target: Vector3) => {
    const { headingWindowSeconds, headingSamples } = HEAD_CAM;
    target.set(0, 0, 0);
    for (let index = 0; index < headingSamples; index++) {
        const offsetSeconds = ((index / (headingSamples - 1)) * 2 - 1) * headingWindowSeconds;
        target.add(getPathVelocity(path, Math.max(0, seconds + offsetSeconds), sample));
    }
    return target.divideScalar(headingSamples);
};

/** Slow sum of sines with fixed phases: the same sway every time t is rendered */
const sway = (seconds: number, phase: number) =>
    HEAD_CAM.handheld.frequencies.reduce(
        (sum, frequency, index) =>
            sum + Math.sin(seconds * frequency * Math.PI * 2 + phase * (index + 1)),
        0
    ) / HEAD_CAM.handheld.frequencies.length;

const findPath = (paths: DaggerPath[], daggerId: string) =>
    paths.find(({ sectionId }) => sectionId === daggerId) ?? paths[0];

/** Behind and beside the head, off-centre, looking a little ahead of it; computed from this beat only */
const applyHeadCam = (beat: Beat, path: DaggerPath, seconds: number, shot: Shot) => {
    const archetype = HEAD_CAM_SHOTS[beat.shot as keyof typeof HEAD_CAM_SHOTS];
    getPathHead(path, seconds, head);
    getSmoothedVelocity(path, seconds, velocity);
    const speed = velocity.length();
    forward.copy(velocity).normalize();
    right.crossVectors(forward, WORLD_UP);
    if (right.lengthSq() < 1e-6) right.copy(FALLBACK_RIGHT);
    right.normalize();
    up.crossVectors(right, forward);

    offset
        .copy(forward)
        .multiplyScalar(-archetype.back)
        .addScaledVector(right, archetype.side)
        .addScaledVector(up, archetype.height);

    // Reveal: orbit around the head at the end of the beat, so the blade crosses the frame side-on
    const { reveal } = HEAD_CAM;
    const revealProgress = MathUtils.smoothstep(
        seconds,
        beat.endSeconds - reveal.seconds,
        beat.endSeconds
    );
    offset.applyAxisAngle(
        up,
        MathUtils.degToRad(reveal.orbitDegrees) * revealProgress * Math.sign(archetype.side)
    );

    const phase = beat.startSeconds * 7.31;
    shot.position
        .copy(head)
        .add(offset)
        .addScaledVector(up, sway(seconds, phase) * HEAD_CAM.handheld.positionMetres);
    shot.lookAt.copy(head).addScaledVector(forward, HEAD_CAM.leadMetres);

    const rollDegrees =
        archetype.rollDegrees +
        Math.sign(archetype.rollDegrees) * reveal.extraRollDegrees * revealProgress +
        sway(seconds, phase + 1) * HEAD_CAM.handheld.rollDegrees;
    shot.roll = MathUtils.degToRad(rollDegrees);
    shot.fov = MathUtils.clamp(
        archetype.baseFov + (speed / HEAD_CAM.referenceSpeed - 1) * HEAD_CAM.fovPerSpeed,
        HEAD_CAM.minFov,
        HEAD_CAM.maxFov
    );
};

/** Waiting on the first dagger's path: its head comes straight at the lens, a point of light at the centre */
const applyIgnition = (paths: DaggerPath[], firstDaggerId: string, shot: Shot) => {
    const path = findPath(paths, firstDaggerId);
    getPathHead(path, IGNITION_SHOT.aheadSeconds, shot.position);
    shot.position.y += IGNITION_SHOT.heightMetres;
    getPathHead(path, 0, shot.lookAt);
    shot.roll = 0;
    shot.fov = IGNITION_SHOT.fov;
};

/** Behind the group as it meets, looking past the meeting point */
const applyWideBehind = (paths: DaggerPath[], shot: Shot) => {
    const arrival = forward.set(0, 0, 0);
    for (const path of paths)
        arrival.add(getPathVelocity(path, CONVERGENCE_SECONDS - 0.05, velocity));
    arrival.normalize();
    shot.position
        .copy(CONVERGENCE)
        .addScaledVector(arrival, -WIDE_BEHIND_SHOT.backMetres)
        .addScaledVector(WORLD_UP, WIDE_BEHIND_SHOT.heightMetres);
    shot.lookAt.copy(CONVERGENCE).addScaledVector(arrival, WIDE_BEHIND_SHOT.leadMetres);
    shot.roll = 0;
    shot.fov = WIDE_BEHIND_SHOT.fov;
};

const applyHeroWide = (shot: Shot) => {
    shot.position.set(...CAMERA.position);
    shot.lookAt.set(...CAMERA.lookAt);
    shot.roll = 0;
    shot.fov = CAMERA.fov;
};

/**
 * The camera at intro time t, as a pure function: each beat frames only from its own data,
 * so the change of beat is a hard cut (hidden by the colour flood).
 */
export const getShot = (paths: DaggerPath[], seconds: number, shot: Shot) => {
    const beat = getBeatAt(seconds);
    if (beat.daggerId) {
        applyHeadCam(beat, findPath(paths, beat.daggerId), seconds, shot);
    } else if (beat.shot === 'ignition') {
        applyIgnition(paths, FIRST_HEAD_CAM_DAGGER, shot);
    } else if (beat.shot === 'wideBehind') {
        applyWideBehind(paths, shot);
    } else {
        applyHeroWide(shot);
    }
    return shot;
};
