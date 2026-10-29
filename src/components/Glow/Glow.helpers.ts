import { CanvasTexture, MathUtils } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { FLOOR } from '@/components/Floor/Floor.constants';
import { drawCrack, worldToCanvas, type CrackPath } from '@/components/Floor/Floor.helpers';
import {
    BURST_ENVELOPE,
    CRACK_GLOW,
    PULSE,
    SPARKS,
    type SineWave
} from '@/components/Glow/Glow.constants';

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
    /** Projects: the orb's signal shrinks to its core, then swells back out ring by ring */
    signalWave: (timeSeconds) => {
        const { periodSeconds, contractEnd, innerRing, outerRing, innerRingShare, floor } =
            PULSE.signalWave;
        const phase = getPhase(timeSeconds, periodSeconds);
        const contraction = 1 - MathUtils.smoothstep(phase, 0, contractEnd);
        const rings =
            innerRingShare * MathUtils.smoothstep(phase, innerRing.start, innerRing.end) +
            (1 - innerRingShare) * MathUtils.smoothstep(phase, outerRing.start, outerRing.end);
        return floor + (1 - floor) * Math.max(contraction, rings);
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

/**
 * Mask for one dagger's crack glow: its floor cracks in white, fading out from the dagger,
 * on a transparent canvas centred on the dagger (same orientation as the floor texture).
 */
export const createCrackGlowTexture = (
    cracks: CrackPath[],
    { x, z }: Pick<LandingTransform, 'x' | 'z'>
) => {
    const { size, textureSize } = CRACK_GLOW;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');

    if (context) {
        const center = textureSize / 2;
        // Floor-canvas pixels to decal pixels: same world point, different resolution and origin
        const floorPixelsToDecal = textureSize / size / (FLOOR.textureSize / FLOOR.size);
        const origin = worldToCanvas(x, z);

        context.save();
        context.translate(center, center);
        context.scale(floorPixelsToDecal, floorPixelsToDecal);
        context.translate(-origin.x, -origin.y);
        context.strokeStyle = '#fff';
        context.lineCap = 'round';
        cracks.forEach((crack) => drawCrack(context, crack));
        context.restore();

        // Keep the cracks only where this gradient is opaque: bright near the dagger, gone at the edge
        const falloff = context.createRadialGradient(center, center, 0, center, center, center);
        falloff.addColorStop(0, 'rgba(255, 255, 255, 1)');
        falloff.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.globalCompositeOperation = 'destination-in';
        context.fillStyle = falloff;
        context.fillRect(0, 0, textureSize, textureSize);
    }

    return new CanvasTexture(canvas);
};

/** Fast start, gentle stop; progress in [0, 1] */
export const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

/** Puts every spark back at the origin with a random upward velocity inside the cone */
export const launchSparks = (
    positions: Float32Array,
    velocities: Float32Array,
    random = Math.random
) => {
    for (let index = 0; index < positions.length; index += 3) {
        const azimuth = random() * Math.PI * 2;
        const tilt = random() * SPARKS.coneAngle;
        const speed = SPARKS.minSpeed + random() * (SPARKS.maxSpeed - SPARKS.minSpeed);

        positions[index] = 0;
        positions[index + 1] = SPARKS.originHeight;
        positions[index + 2] = 0;
        velocities[index] = Math.sin(tilt) * Math.cos(azimuth) * speed;
        velocities[index + 1] = Math.cos(tilt) * speed;
        velocities[index + 2] = Math.sin(tilt) * Math.sin(azimuth) * speed;
    }
};

/** One physics step: gravity, then motion; sparks that hit the floor stop there */
export const stepSparks = (
    positions: Float32Array,
    velocities: Float32Array,
    deltaSeconds: number
) => {
    for (let index = 0; index < positions.length; index += 3) {
        velocities[index + 1] -= SPARKS.gravity * deltaSeconds;
        positions[index] += velocities[index] * deltaSeconds;
        positions[index + 1] += velocities[index + 1] * deltaSeconds;
        positions[index + 2] += velocities[index + 2] * deltaSeconds;

        if (positions[index + 1] < 0) {
            positions[index + 1] = 0;
            velocities[index] = velocities[index + 1] = velocities[index + 2] = 0;
        }
    }
};
