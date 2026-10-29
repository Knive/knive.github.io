/**
 * The intro clock, read every frame by everything the intro animates.
 * Plain module state, like the glow and scroll stores: it never triggers React renders.
 *
 * Intro time t is wall-clock seconds since the intro started, or a fixed value while seeking
 * (dev scrubbing). Everything in the intro is a function of t, so any frame can be rendered alone.
 */

import { INTRO_SEED, LANDING } from '@/components/Intro/Intro.constants';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';
import { PATH_NOISE } from '@/components/IntroPaths/IntroPaths.constants';
import { createIntroPaths } from '@/components/IntroPaths/IntroPaths.helpers';
import { DAGGERS } from '@/components/Scene/Scene.constants';
import { getDevUrlNumber } from '@/utils/getDevUrlNumber';
import { REVIEW_PARAMS } from '@/components/IntroReview/IntroReview.constants';

let startedAtMs: number | null = null;
/** Set while paused on a sought time; null while playing in real time. Dev: ?t= opens paused there */
let seekSeconds: number | null = getDevUrlNumber(REVIEW_PARAMS.time);
/** Dev: ?seed= re-rolls the paths */
const seed = getDevUrlNumber(REVIEW_PARAMS.seed) ?? INTRO_SEED;

export const getIntroSeed = () => seed;

/** Starts the clock on the intro's first rendered frame, unless a seek already fixed the time */
export const startIntroClock = () => {
    if (startedAtMs === null) startedAtMs = performance.now();
};

export const getIntroTime = () => {
    if (seekSeconds !== null) return seekSeconds;
    if (startedAtMs === null) return 0;
    return (performance.now() - startedAtMs) / 1000;
};

/** Freezes the intro on time t */
export const seekIntro = (seconds: number) => {
    seekSeconds = Math.max(0, seconds);
};

/** Plays on in real time from the current time */
export const playIntro = () => {
    const currentSeconds = getIntroTime();
    startedAtMs = performance.now() - currentSeconds * 1000;
    seekSeconds = null;
};

export const pauseIntro = () => seekIntro(getIntroTime());

export const isIntroSeeking = () => seekSeconds !== null;

let paths: ReturnType<typeof createIntroPaths> | null = null;

/**
 * The daggers' flight paths, built once from the seed. The only per-visit randomness is a tiny
 * noise phase, and none in dev review, so reviewed frames are reproducible.
 */
export const getIntroPaths = () => {
    const phaseOffset = isIntroReviewRequested()
        ? 0
        : (Math.random() * 2 - 1) * PATH_NOISE.phaseJitter;
    paths ??= createIntroPaths(DAGGERS, seed, phaseOffset);
    return paths;
};

/** The intro ends once the last dagger has landed and the settle has played */
export const getIntroEndSeconds = () =>
    Math.max(...getIntroPaths().map(({ impactSeconds }) => impactSeconds)) + LANDING.settleSeconds;

/** True until this dagger's impact; false once landed or when no intro plays */
export const isDaggerFlying = (daggerId: string, isIntroPlaying: boolean) => {
    const path = getIntroPaths().find(({ sectionId }) => sectionId === daggerId);
    return isIntroPlaying && path !== undefined && getIntroTime() < path.impactSeconds;
};
