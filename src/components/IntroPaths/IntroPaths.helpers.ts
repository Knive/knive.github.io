import { CatmullRomCurve3, Euler, MathUtils, Quaternion, Vector3, type Object3D } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { toRestRotation } from '@/components/BladeField/BladeField.helpers';
import { CONVERGENCE_SECONDS, FAN_END_SECONDS } from '@/components/Intro/Intro.constants';
import {
    CROSSING_NODES,
    FLIGHT,
    PATH_ARCHETYPES,
    PATH_NOISE,
    SPEED_BURSTS,
    type PathArchetype
} from '@/components/IntroPaths/IntroPaths.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

type Random = () => number;

const CONVERGENCE = new Vector3(...FLIGHT.convergence);
const BLADE_TIP_DIRECTION = new Vector3(0, -1, 0);

/** Symmetric random value in [-range, range) */
const jitter = (random: Random, range: number) => randomBetween(random, -range, range);

/** Control points (convergence excluded) for each archetype; heights and radii jittered */
const ARCHETYPE_POINTS: Record<PathArchetype, (random: Random) => Vector3[]> = {
    // Falls from high above, slightly curving
    steepDive: (random) => {
        const startX = jitter(random, 14);
        return [
            new Vector3(startX, 42 + jitter(random, 4), -55 + jitter(random, 4)),
            new Vector3(startX * 0.8 + jitter(random, 3), 33, -46 + jitter(random, 3)),
            new Vector3(startX * 0.5 + jitter(random, 3), 23, -34 + jitter(random, 3)),
            new Vector3(startX * 0.3 + jitter(random, 2), 15, -22 + jitter(random, 3)),
            new Vector3(jitter(random, 3), 11, -12)
        ];
    },
    // One descending turn around a vertical axis
    helixTurn: (random) => {
        const centerX = jitter(random, 6);
        const radius = 11 + jitter(random, 2);
        const phase = random() * Math.PI * 2;
        return Array.from({ length: 6 }, (_, step) => {
            const angle = phase + (step / 5) * Math.PI * 2;
            return new Vector3(
                centerX + Math.cos(angle) * radius,
                26 - step * 2.6 + jitter(random, 1),
                -38 + step * 4 + Math.sin(angle) * radius
            );
        });
    },
    // Low over the horizon from one side to the other, then up to the meeting point
    lowSkim: (random) => {
        const side = random() < 0.5 ? -1 : 1;
        return [
            new Vector3(side * 45, 4.5, -48 + jitter(random, 4)),
            new Vector3(side * 28, 5 + jitter(random, 1), -40),
            new Vector3(side * 10, 5.5 + jitter(random, 1), -34),
            new Vector3(-side * 8, 6.5, -28 + jitter(random, 3)),
            new Vector3(-side * 14, 9, -18),
            new Vector3(-side * 6, 10, -11)
        ];
    },
    // Whips left and right with shrinking swings while it closes in
    sCurveWhip: (random) => {
        // Swings spaced 14 m apart: tight enough to whip, wide enough never to kink
        const swing = 9 + jitter(random, 2);
        return [1, -1, 0.7, -0.5, 0.3].map(
            (share, step) =>
                new Vector3(share * swing, 18 - step * 1.6 + jitter(random, 1.5), -68 + step * 14)
        );
    },
    // A wide sweep from the side and around towards the field
    wideArc: (random) => {
        const radius = 30 + jitter(random, 4);
        const direction = random() < 0.5 ? -1 : 1;
        return Array.from({ length: 6 }, (_, step) => {
            const angle = direction * (-0.35 + (step / 5) * 1.9);
            return new Vector3(
                Math.sin(angle) * radius,
                14 + jitter(random, 1.5),
                -30 - Math.cos(angle) * radius * 0.6
            );
        });
    }
};

/** Fisher–Yates with the seeded generator */
const shuffle = <Item>(items: Item[], random: Random) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
};

/**
 * Moves the two closest interior control points of two paths onto their midpoint, so the paths
 * cross there. First and last points, and points already used by a crossing, stay where they are.
 * Returns false (nothing moved) when the paths never come within maxJoinMetres.
 */
const joinAtMidpoint = (first: Vector3[], second: Vector3[], usedPoints: Set<Vector3>) => {
    let best: [Vector3, Vector3] | null = null;
    let bestDistance = Infinity;
    for (const firstPoint of first.slice(1, -1)) {
        for (const secondPoint of second.slice(1, -1)) {
            const distance = firstPoint.distanceTo(secondPoint);
            const isFree = !usedPoints.has(firstPoint) && !usedPoints.has(secondPoint);
            if (isFree && distance < bestDistance) {
                bestDistance = distance;
                best = [firstPoint, secondPoint];
            }
        }
    }
    if (!best || bestDistance > CROSSING_NODES.maxJoinMetres) return false;

    const [firstPoint, secondPoint] = best;
    const midpoint = firstPoint.clone().add(secondPoint).multiplyScalar(0.5);
    firstPoint.copy(midpoint);
    secondPoint.copy(midpoint);
    usedPoints.add(firstPoint).add(secondPoint);
    return true;
};

/**
 * Curl of the vector potential (sin(a·y + φ1), sin(b·z + φ2), sin(c·x + φ3)), summed over octaves:
 * a smooth, swirling displacement that depends only on world position.
 */
const createCurlNoise = (random: Random, phaseOffset: number) => {
    const octaves = Array.from({ length: PATH_NOISE.octaves }, (_, octave) => ({
        frequency: PATH_NOISE.frequency * 2 ** octave,
        amplitude: PATH_NOISE.amplitude / 2 ** octave,
        phases: [random(), random(), random()].map((value) => value * Math.PI * 2 + phaseOffset)
    }));

    return (point: Vector3, target: Vector3) => {
        target.set(0, 0, 0);
        for (const { frequency, amplitude, phases } of octaves) {
            target.x -= amplitude * Math.cos(frequency * point.z + phases[1]);
            target.y -= amplitude * Math.cos(frequency * point.x + phases[2]);
            target.z -= amplitude * Math.cos(frequency * point.y + phases[0]);
        }
        // Faded out near the convergence point, so all five meet exactly
        const fade = MathUtils.smoothstep(point.distanceTo(CONVERGENCE), 0, PATH_NOISE.fadeRadius);
        return target.multiplyScalar(fade);
    };
};

/** Arc-length progress over the flight, from base speed plus smooth bursts */
const createProgressTable = (random: Random) => {
    const bursts = Array.from({ length: SPEED_BURSTS.count }, () => ({
        center: randomBetween(random, SPEED_BURSTS.earliestSeconds, SPEED_BURSTS.latestSeconds),
        width: randomBetween(random, SPEED_BURSTS.minWidth, SPEED_BURSTS.maxWidth),
        amplitude: randomBetween(random, SPEED_BURSTS.minAmplitude, SPEED_BURSTS.maxAmplitude)
    }));
    const getSpeed = (seconds: number) =>
        bursts.reduce(
            (speed, { center, width, amplitude }) =>
                speed + amplitude * Math.exp(-(((seconds - center) / width) ** 2)),
            1
        );

    const size = SPEED_BURSTS.tableSize;
    const step = CONVERGENCE_SECONDS / size;
    const cumulative = [0];
    for (let index = 1; index <= size; index++) {
        const midSeconds = (index - 0.5) * step;
        cumulative.push(cumulative[index - 1] + getSpeed(midSeconds) * step);
    }
    const total = cumulative[size];

    return (seconds: number) => {
        const position = MathUtils.clamp(seconds / step, 0, size);
        const index = Math.min(Math.floor(position), size - 1);
        const fraction = position - index;
        return MathUtils.lerp(cumulative[index], cumulative[index + 1], fraction) / total;
    };
};

/** Cubic Hermite point between two positions with end tangents (already scaled to the segment) */
const hermite = (
    from: Vector3,
    fromTangent: Vector3,
    to: Vector3,
    toTangent: Vector3,
    progress: number,
    target: Vector3
) => {
    const p2 = progress * progress;
    const p3 = p2 * progress;
    return target
        .copy(from)
        .multiplyScalar(2 * p3 - 3 * p2 + 1)
        .addScaledVector(fromTangent, p3 - 2 * p2 + progress)
        .addScaledVector(to, -2 * p3 + 3 * p2)
        .addScaledVector(toTangent, p3 - p2);
};

type DaggerFlightInput = {
    sectionId: string;
    landing: LandingTransform;
    bladeLength: number;
};

export type DaggerPath = ReturnType<typeof createDaggerPath>;

const createDaggerPath = (
    { sectionId, landing, bladeLength }: DaggerFlightInput,
    archetype: PathArchetype,
    controlPoints: Vector3[],
    curlNoise: (point: Vector3, target: Vector3) => Vector3,
    getProgress: (seconds: number) => number
) => {
    const curve = new CatmullRomCurve3([...controlPoints, CONVERGENCE.clone()]);
    const landingPoint = new Vector3(landing.x, 0, landing.z);
    const restQuaternion = new Quaternion().setFromEuler(new Euler(...toRestRotation(landing)));
    const axis = new Vector3(0, 1, 0).applyQuaternion(restQuaternion);
    const fanEnd = landingPoint.clone().addScaledVector(axis, FLIGHT.fanHeight);
    const displacement = new Vector3();

    const getFlightPoint = (seconds: number, target: Vector3) => {
        curve.getPointAt(getProgress(seconds), target);
        return target.add(curlNoise(target, displacement));
    };

    // The fan starts with the flight's own velocity at the convergence (C1) and ends falling along the axis
    const fanSeconds = FAN_END_SECONDS - CONVERGENCE_SECONDS;
    const arrival = getFlightPoint(CONVERGENCE_SECONDS - FLIGHT.velocityStepSeconds, new Vector3());
    const arrivalVelocity = CONVERGENCE.clone()
        .sub(arrival)
        .divideScalar(FLIGHT.velocityStepSeconds);
    const fanStartTangent = arrivalVelocity.clone().multiplyScalar(fanSeconds);
    const fanEndTangent = axis.clone().multiplyScalar(-arrivalVelocity.length() * fanSeconds);

    /** Flight-group origin (where the blade will enter the ground) at intro time t, in world space */
    const getPosition = (seconds: number, target: Vector3) => {
        if (seconds <= CONVERGENCE_SECONDS) return getFlightPoint(seconds, target);
        if (seconds < FAN_END_SECONDS) {
            const progress = (seconds - CONVERGENCE_SECONDS) / fanSeconds;
            return hermite(CONVERGENCE, fanStartTangent, fanEnd, fanEndTangent, progress, target);
        }
        return target.copy(landingPoint);
    };

    return {
        sectionId,
        archetype,
        landingPoint,
        restQuaternion,
        inverseRestQuaternion: restQuaternion.clone().invert(),
        /** From the flight-group origin to the blade tip, along the blade */
        tipOffset: bladeLength * (1 - landing.exposedRatio),
        getPosition
    };
};

/**
 * One path per dagger, all from the seed: archetypes shuffled so no two daggers share one,
 * crossings where pairs of paths share a control point, one curl-noise field, per-dagger speed bursts.
 */
export const createIntroPaths = (
    daggers: DaggerFlightInput[],
    seed: number,
    phaseOffset: number
) => {
    const random = createSeededRandom(seed);
    const archetypes = shuffle(PATH_ARCHETYPES, random);
    const controlPoints = daggers.map((_, index) => ARCHETYPE_POINTS[archetypes[index]](random));

    // Each crossing joins a different pair of daggers' paths, among pairs that pass close enough
    const usedPoints = new Set<Vector3>();
    const pairs = shuffle(
        daggers.flatMap((_, first) =>
            daggers.slice(first + 1).map((__, offset) => [first, first + 1 + offset])
        ),
        random
    );
    let crossings = 0;
    for (const [first, second] of pairs) {
        if (crossings === CROSSING_NODES.count) break;
        if (joinAtMidpoint(controlPoints[first], controlPoints[second], usedPoints)) crossings++;
    }

    const curlNoise = createCurlNoise(random, phaseOffset);
    return daggers.map((dagger, index) =>
        createDaggerPath(
            dagger,
            archetypes[index],
            controlPoints[index],
            curlNoise,
            createProgressTable(random)
        )
    );
};

const before = new Vector3();
const after = new Vector3();

/** Velocity at intro time t by central difference (m/s) */
export const getPathVelocity = (path: DaggerPath, seconds: number, target: Vector3) => {
    const step = FLIGHT.velocityStepSeconds;
    path.getPosition(Math.max(0, seconds - step), before);
    path.getPosition(seconds + step, after);
    return target
        .copy(after)
        .sub(before)
        .divideScalar(2 * step);
};

/** Blade tip (the glowing head) at intro time t */
export const getPathHead = (path: DaggerPath, seconds: number, target: Vector3) => {
    path.getPosition(seconds, target);
    const velocity = getPathVelocity(path, seconds, after);
    if (velocity.lengthSq() === 0) return target;
    return target.addScaledVector(velocity.normalize(), path.tipOffset);
};

const velocity = new Vector3();
const orientation = new Quaternion();

/**
 * Places the dagger's flight group (inside its tilted ground group) at intro time t:
 * tip first along its velocity, or at rest once landed.
 */
export const applyPathPose = (path: DaggerPath, seconds: number, target: Object3D) => {
    if (seconds >= FAN_END_SECONDS) {
        target.position.set(0, 0, 0);
        target.quaternion.identity();
        return;
    }
    path.getPosition(seconds, target.position);
    target.position.sub(path.landingPoint).applyQuaternion(path.inverseRestQuaternion);

    getPathVelocity(path, seconds, velocity);
    if (velocity.lengthSq() === 0) return;
    orientation.setFromUnitVectors(BLADE_TIP_DIRECTION, velocity.normalize());
    target.quaternion.copy(path.inverseRestQuaternion).multiply(orientation);
};
