import { BEATS, FLOOD, WHITEOUT, type Beat } from '@/components/Intro/Intro.constants';
import { getBeatAt } from '@/components/Intro/Intro.helpers';
import { MathUtils } from 'three';

import {
    CONVERGENCE_COLOR,
    IGNITION_COLOR,
    IGNITION_FLARE,
    IGNITION_FLOOD
} from '@/components/IntroFx/IntroFx.constants';

export type Flood = {
    color: string;
    /** Whole-frame opacity (cut flashes, whiteout) */
    flashAlpha: number;
    /** Lasting grade, strongest at the frame edges */
    sustainAlpha: number;
    /** Share of the frame around the centre the lasting grade leaves clearer */
    clearRadius: number;
};

/** Cuts: every beat start after the first */
const CUTS = BEATS.slice(1);

export const getBeatColor = (beat: Beat, glowColors: Record<string, string>) => {
    if (beat.daggerId) return glowColors[beat.daggerId];
    return beat.shot === 'ignition' ? IGNITION_COLOR : CONVERGENCE_COLOR;
};

/** Flash around one cut: up in about 2 frames to the peak on the cut, held, then decaying */
const getCutFlashAlpha = (secondsFromCut: number) => {
    const { peakAlpha, riseSeconds, holdSeconds, decaySeconds } = FLOOD;
    if (secondsFromCut < -riseSeconds) return 0;
    if (secondsFromCut < 0) return peakAlpha * (1 + secondsFromCut / riseSeconds);
    if (secondsFromCut < holdSeconds) return peakAlpha;
    return peakAlpha * Math.max(0, 1 - (secondsFromCut - holdSeconds) / decaySeconds);
};

/** Whiteout over the convergence: up to full white, held across the cut to the landing, faded out */
export const getWhiteoutAlpha = (seconds: number) => {
    const { riseStartSeconds, peakSeconds, fadeStartSeconds, fadeSeconds } = WHITEOUT;
    if (seconds < riseStartSeconds) return 0;
    if (seconds < peakSeconds)
        return (seconds - riseStartSeconds) / (peakSeconds - riseStartSeconds);
    if (seconds < fadeStartSeconds) return 1;
    return Math.max(0, 1 - (seconds - fadeStartSeconds) / fadeSeconds);
};

/** The full-screen colour at intro time t, as a pure function */
export const getFlood = (seconds: number, glowColors: Record<string, string>): Flood => {
    const whiteout = getWhiteoutAlpha(seconds);
    if (whiteout > 0) {
        return { color: CONVERGENCE_COLOR, flashAlpha: whiteout, sustainAlpha: 0, clearRadius: 0 };
    }

    const beat = getBeatAt(seconds);
    // The strongest nearby cut flash, in the colour of the beat it opens
    let flashAlpha = 0;
    let flashColor = getBeatColor(beat, glowColors);
    for (const cut of CUTS) {
        const alpha = getCutFlashAlpha(seconds - cut.startSeconds);
        if (alpha > flashAlpha) {
            flashAlpha = alpha;
            flashColor = getBeatColor(cut, glowColors);
        }
    }

    if (beat.shot === 'ignition') {
        return {
            color: flashAlpha > 0 ? flashColor : IGNITION_COLOR,
            flashAlpha,
            sustainAlpha: IGNITION_FLOOD.alpha,
            clearRadius: IGNITION_FLOOD.clearRadius
        };
    }
    return {
        color: flashColor,
        flashAlpha,
        sustainAlpha: beat.daggerId ? FLOOD.sustainAlpha : 0,
        clearRadius: FLOOD.sustainClearRadius
    };
};

const IGNITION_BEAT = BEATS[0];

/** Ignition flare at intro time t: lights up, then grows until the cut to the first head-cam */
export const getIgnitionFlare = (seconds: number) => {
    if (seconds >= IGNITION_BEAT.endSeconds) return { intensity: 0, scale: 0 };
    const progress = seconds / IGNITION_BEAT.endSeconds;
    const { peakIntensity, startScale, fadeInShare } = IGNITION_FLARE;
    return {
        intensity: peakIntensity * MathUtils.smoothstep(progress, 0, fadeInShare),
        scale: MathUtils.lerp(startScale, 1, progress * progress)
    };
};
