import type { ShotArchetype } from '@/components/Intro/Intro.constants';

type HeadCamArchetype = Exclude<ShotArchetype, 'ignition' | 'wideBehind' | 'heroWide'>;

type HeadCamShot = {
    /** Metres behind the middle of the dagger, along its velocity */
    back: number;
    /** Metres to its right (negative: left) and above (negative: below); they put the dagger off-centre */
    side: number;
    height: number;
    /** Camera roll; signs alternate from beat to beat */
    rollDegrees: number;
    /** At the reference speed; widens with speed */
    baseFov: number;
};

/**
 * One archetype per head-cam beat: distance, offsets, roll and lens all differ. Wide enough side
 * offsets that the whole dagger (about 3 m) shows at three-quarters, not only the blade
 */
export const HEAD_CAM_SHOTS: Record<HeadCamArchetype, HeadCamShot> = {
    closeRoll: { back: 3, side: 1.8, height: 0.6, rollDegrees: 12, baseFov: 72 },
    highBack: { back: 4.2, side: -1.6, height: 2.4, rollDegrees: -18, baseFov: 70 },
    lowUp: { back: 3.2, side: 1.5, height: -2, rollDegrees: 10, baseFov: 80 },
    sidePass: { back: 1.6, side: 3.8, height: 0.3, rollDegrees: -22, baseFov: 76 },
    lensGraze: { back: 2.4, side: 1.1, height: 0.35, rollDegrees: 25, baseFov: 90 }
};

export const HEAD_CAM = {
    /** The camera looks this far ahead of the middle of the dagger */
    leadMetres: 2.5,
    /**
     * The camera's heading is the head's velocity averaged over ±this many seconds (sampled, so still a
     * pure function of t): it rides through the path's small wiggles instead of copying them
     */
    headingWindowSeconds: 0.1,
    headingSamples: 9,
    minFov: 70,
    maxFov: 100,
    /** Speed at which the lens is baseFov; each multiple of it adds fovPerSpeed degrees */
    referenceSpeed: 30,
    fovPerSpeed: 10,
    /** Low-frequency handheld sway, as sums of sines (frequencies in Hz) */
    handheld: {
        positionMetres: 0.06,
        rollDegrees: 1.2,
        frequencies: [0.7, 1.3, 2.1]
    },
    /**
     * Reveal at the end of each beat: the camera orbits around the head and rolls further,
     * so the blade crosses the frame side-on as a silhouette
     */
    reveal: {
        seconds: 0.15,
        orbitDegrees: 75,
        extraRollDegrees: 15
    }
} as const;

export const IGNITION_SHOT = {
    /** The camera waits on the first dagger's path, this many seconds ahead of its head */
    aheadSeconds: 0.8,
    heightMetres: 0.5,
    fov: 70
} as const;

/** Each impact jolts the hero camera: a fast decaying shake (gone within about 0.35 s) */
export const IMPACT_SHAKE = {
    metres: 0.05,
    frequencyHz: 22,
    /** 1/s */
    decayRate: 10
} as const;

export const WIDE_BEHIND_SHOT = {
    /** Behind and above the meeting point, along the group's arrival direction */
    backMetres: 12,
    heightMetres: 3,
    /** Looks past the meeting point, where the fan opens */
    leadMetres: 4,
    fov: 75
} as const;
