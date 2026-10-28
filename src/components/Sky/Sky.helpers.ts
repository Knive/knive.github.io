import {
    BufferGeometry,
    CanvasTexture,
    Float32BufferAttribute,
    MathUtils,
    SRGBColorSpace,
    type Vector3Tuple
} from 'three';

import { MOON, SKY_GRADIENT, STARS } from '@/components/Sky/Sky.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

/** Point on a sphere around the origin; azimuth 0 is straight ahead (-z), positive to the right */
export const toSkyPosition = (
    elevationDegrees: number,
    azimuthDegrees: number,
    distance: number
): Vector3Tuple => {
    const elevation = MathUtils.degToRad(elevationDegrees);
    const azimuth = MathUtils.degToRad(azimuthDegrees);
    return [
        distance * Math.cos(elevation) * Math.sin(azimuth),
        distance * Math.sin(elevation),
        -distance * Math.cos(elevation) * Math.cos(azimuth)
    ];
};

/**
 * One-pixel-wide vertical gradient for a sphere's default UVs: the canvas top is the zenith,
 * the middle is the horizon, and v is linear in elevation.
 */
export const createSkyTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = SKY_GRADIENT.textureHeight;
    const context = canvas.getContext('2d');

    if (context) {
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        for (const { elevation, color } of SKY_GRADIENT.stops) {
            gradient.addColorStop((90 - elevation) / 180, color);
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

/** Seeded points spread evenly over the sky above minElevation, dimmer near the horizon */
export const createStarGeometry = () => {
    const random = createSeededRandom(STARS.seed);
    const positions: number[] = [];
    const colors: number[] = [];
    // Uniform on the sphere cap: sample the sine of the elevation, not the angle
    const minSine = Math.sin(MathUtils.degToRad(STARS.minElevation));

    for (let star = 0; star < STARS.count; star++) {
        const elevation = MathUtils.radToDeg(Math.asin(randomBetween(random, minSine, 1)));
        positions.push(...toSkyPosition(elevation, randomBetween(random, 0, 360), STARS.distance));

        const horizonFade = MathUtils.smoothstep(
            elevation,
            STARS.minElevation,
            STARS.fullBrightnessElevation
        );
        const brightness = randomBetween(random, STARS.minBrightness, 1) * horizonFade;
        colors.push(brightness, brightness, brightness);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return geometry;
};

/** Solid moon disc in a soft halo, on a transparent canvas */
export const createMoonTexture = () => {
    const size = MOON.textureSize;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    if (context) {
        const radius = size / 2;
        const halo = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
        halo.addColorStop(MOON.discRatio, MOON.haloColor);
        halo.addColorStop(1, 'transparent');
        context.fillStyle = halo;
        context.fillRect(0, 0, size, size);

        context.fillStyle = MOON.color;
        context.beginPath();
        context.arc(radius, radius, radius * MOON.discRatio, 0, Math.PI * 2);
        context.fill();
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};
