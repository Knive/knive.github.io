import { BURST_ENVELOPE, PULSE, type SineWave } from '@/components/Glow/Glow.constants';

/** Sustained glow shape over time (seconds), within [0, 1] */
export type GlowPulse = (timeSeconds: number) => number;

const { attackSeconds, durationSeconds, endLevel } = BURST_ENVELOPE;
/** Decay rate so the envelope reaches endLevel exactly at durationSeconds */
const DECAY_RATE = -Math.log(endLevel) / (durationSeconds - attackSeconds);

/** Burst strength over its age: 0 → 1 during the attack, then decays to 0 */
export const burstEnvelope = (ageSeconds: number) => {
    if (ageSeconds < 0 || ageSeconds >= durationSeconds) return 0;
    if (ageSeconds < attackSeconds) return ageSeconds / attackSeconds;
    return Math.exp(-DECAY_RATE * (ageSeconds - attackSeconds));
};

const sumSines = (timeSeconds: number, waves: SineWave[]) =>
    waves.reduce(
        (sum, { frequency, amplitude, phase }) =>
            sum + amplitude * Math.sin(timeSeconds * frequency + phase),
        0
    );

/** Fraction of the way through the current period, in [0, 1) */
const getPhase = (timeSeconds: number, periodSeconds: number) =>
    (timeSeconds % periodSeconds) / periodSeconds;

/** Bell-shaped bump centred on `center`, 1 at the centre */
const gaussian = (value: number, center: number, width: number) =>
    Math.exp(-(((value - center) / width) ** 2));

/**
 * One rhythm per dagger, so they stay distinguishable without relying on colour.
 */
export const GLOW_PULSES = {
    /** Experience: a sharp tick every second, like clockwork */
    clockwork: (timeSeconds) => {
        const { tickSeconds, decay, floor } = PULSE.clockwork;
        const tick = Math.exp(-getPhase(timeSeconds, tickSeconds) * decay);
        return floor + (1 - floor) * tick;
    },
    /** Skills: quick shimmer of the runes */
    runeShimmer: (timeSeconds) =>
        PULSE.runeShimmer.base + sumSines(timeSeconds, PULSE.runeShimmer.waves),
    /** Projects: double beat of the crystal */
    heartbeat: (timeSeconds) => {
        const { periodSeconds, firstBeat, secondBeat, secondBeatStrength, beatWidth, floor } =
            PULSE.heartbeat;
        const phase = getPhase(timeSeconds, periodSeconds);
        const beat = Math.max(
            gaussian(phase, firstBeat, beatWidth),
            secondBeatStrength * gaussian(phase, secondBeat, beatWidth)
        );
        return floor + (1 - floor) * beat;
    },
    /** Education: slow, calm breathing */
    breathing: (timeSeconds) => {
        const { periodSeconds, floor } = PULSE.breathing;
        const breath = 0.5 - 0.5 * Math.cos(getPhase(timeSeconds, periodSeconds) * Math.PI * 2);
        return floor + (1 - floor) * breath;
    },
    /** Contact: irregular ember flicker */
    emberFlicker: (timeSeconds) =>
        PULSE.emberFlicker.base + sumSines(timeSeconds, PULSE.emberFlicker.waves)
} satisfies Record<string, GlowPulse>;
