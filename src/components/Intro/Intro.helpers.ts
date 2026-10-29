import {
    BEATS,
    INTRO_SESSION_KEY,
    TIME_SCALE,
    type Beat
} from '@/components/Intro/Intro.constants';
import { REVIEW_PARAMS } from '@/components/IntroReview/IntroReview.constants';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

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
        // sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
        // Not stored: the intro plays again on reload, which is harmless
    }
};

export const shouldPlayIntro = () =>
    isIntroReviewRequested() || (!prefersReducedMotion() && !hasPlayedThisSession());

/** The beat playing at intro time t (the last one once the intro is over) */
export const getBeatAt = (seconds: number): Beat =>
    BEATS.find(({ endSeconds }) => seconds < endSeconds) ?? BEATS[BEATS.length - 1];

/** Smootherstep and its integral from 0 to u, for the time-scale ramps */
const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const integrateSmootherstep = (u: number) => u ** 6 - 3 * u ** 5 + 2.5 * u ** 4;

type ImpactWindow = { firstImpactSeconds: number; lastImpactSeconds: number };

/** Start and end of the slowed stretch, from the start of the ramp down to the end of the ramp up */
export const getSlowMotionWindow = ({ firstImpactSeconds, lastImpactSeconds }: ImpactWindow) => {
    const rampDownStart = firstImpactSeconds - TIME_SCALE.leadInSeconds;
    // The ramp up never starts before the ramp down has finished
    const rampUpStart = Math.max(lastImpactSeconds, rampDownStart + TIME_SCALE.rampDownSeconds);
    return { rampDownStart, rampUpStart, end: rampUpStart + TIME_SCALE.rampUpSeconds };
};

/** Speed of story time relative to wall-clock time at intro time t: 1, down to slowRate, back to 1 */
export const getTimeScale = (seconds: number, impacts: ImpactWindow) => {
    const { slowRate, rampDownSeconds, rampUpSeconds } = TIME_SCALE;
    const { rampDownStart, rampUpStart } = getSlowMotionWindow(impacts);
    const slowdown = 1 - slowRate;

    if (seconds <= rampDownStart) return 1;
    if (seconds <= rampDownStart + rampDownSeconds) {
        return 1 - slowdown * smootherstep((seconds - rampDownStart) / rampDownSeconds);
    }
    if (seconds <= rampUpStart) return slowRate;
    if (seconds <= rampUpStart + rampUpSeconds) {
        return slowRate + slowdown * smootherstep((seconds - rampUpStart) / rampUpSeconds);
    }
    return 1;
};

/** Story time s(t): the integral of the time scale from 0 to t, in closed form */
export const getStoryTime = (seconds: number, impacts: ImpactWindow) => {
    const { slowRate, rampDownSeconds, rampUpSeconds } = TIME_SCALE;
    const { rampDownStart, rampUpStart } = getSlowMotionWindow(impacts);
    const slowdown = 1 - slowRate;

    if (seconds <= rampDownStart) return seconds;
    const rampDownProgress = Math.min((seconds - rampDownStart) / rampDownSeconds, 1);
    const afterRampDown =
        rampDownStart +
        rampDownSeconds * (rampDownProgress - slowdown * integrateSmootherstep(rampDownProgress));
    if (rampDownProgress < 1) return afterRampDown;

    const atRampUp =
        afterRampDown +
        slowRate * (Math.min(seconds, rampUpStart) - (rampDownStart + rampDownSeconds));
    if (seconds <= rampUpStart) return atRampUp;

    const rampUpProgress = Math.min((seconds - rampUpStart) / rampUpSeconds, 1);
    const afterRampUp =
        atRampUp +
        rampUpSeconds *
            (slowRate * rampUpProgress + slowdown * integrateSmootherstep(rampUpProgress));
    if (rampUpProgress < 1) return afterRampUp;
    return afterRampUp + (seconds - rampUpStart - rampUpSeconds);
};

/** Dev only: a ?t= or ?review URL forces the intro to play, whatever the session or motion settings */
export const isIntroReviewRequested = () => {
    if (!import.meta.env.DEV) return false;
    const params = new URLSearchParams(window.location.search);
    return params.has(REVIEW_PARAMS.time) || params.has(REVIEW_PARAMS.review);
};
