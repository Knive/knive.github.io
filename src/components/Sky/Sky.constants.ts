import { FOG } from '@/components/Scene/Scene.constants';

/** Inside the camera far plane, outside everything else */
export const SKY_RADIUS = 90;

/** Vertical gradient on the sky dome; elevation in degrees above the horizon */
export const SKY_GRADIENT = {
    textureHeight: 512,
    stops: [
        // Below the horizon: matches the fog, so the floor edge melts into the sky
        { elevation: -90, color: FOG.color },
        { elevation: -1, color: FOG.color },
        { elevation: 0, color: '#e08a4c' },
        { elevation: 3, color: '#b9574a' },
        { elevation: 8, color: '#5b3a5e' },
        { elevation: 16, color: '#1f2c52' },
        { elevation: 35, color: '#0d1530' },
        { elevation: 90, color: '#070b1c' }
    ]
} as const;

/** Angles in degrees; the camera sees up to about 35 degrees in the hero and 60 tilted up */
export const STARS = {
    count: 4000,
    /** The first stars, shown in the hero; the others fade in as the camera tilts up */
    heroCount: 2500,
    /** Seed of the per-star twinkle phase, separate so the positions keep their sequence */
    twinkleSeed: 22,
    distance: 80,
    /** Stars fade in from here, so none sit in the sunset glow */
    minElevation: 6,
    fullBrightnessElevation: 18,
    minBrightness: 0.35,
    /** In screen pixels */
    size: 1.5,
    seed: 21
} as const;
