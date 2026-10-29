/**
 * The intro clock, read every frame by everything the intro animates.
 * Plain module state, like the glow and scroll stores: it never triggers React renders.
 *
 * Intro time t is wall-clock seconds since the intro started, or a fixed value while seeking
 * (dev scrubbing). Everything in the intro is a function of t, so any frame can be rendered alone.
 */

import { INTRO_SEED } from '@/components/Intro/Intro.constants';
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
