import { CanvasTexture, ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three';

import {
    CONTACT_SHADOW,
    DEFAULT_BEVEL_SEGMENTS,
    EMISSIVE_MASK
} from '@/components/Dagger/Dagger.constants';

export type WrappedHandleSpec = {
    length: number;
    baseRadius: number;
    wrapRadius: number;
    wrapCount: number;
    radialSegments: number;
};

export type BevelSpec = {
    depth: number;
    /** How far the bevel cuts in from the outline */
    bevelSize: number;
    /** How far the bevel extends front and back; defaults to bevelSize */
    bevelThickness?: number;
    bevelSegments?: number;
};

export type BarSpec = BevelSpec & {
    halfWidth: number;
    halfHeight: number;
};

type EmissiveMaskOptions = {
    /** Half of the blade width in shape units */
    halfWidth: number;
    bladeLength: number;
    /** Draws white marks on the black canvas; canvas top is the guard, bottom the tip */
    drawGlyphs: (context: CanvasRenderingContext2D, width: number, height: number) => void;
};

const createCanvas = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

/** Extrudes along z with a bevel that stays inside the outline, centred on z = 0 */
export const extrudeBevelled = (
    shape: Shape,
    {
        depth,
        bevelSize,
        bevelThickness = bevelSize,
        bevelSegments = DEFAULT_BEVEL_SEGMENTS
    }: BevelSpec
) =>
    new ExtrudeGeometry(shape, {
        depth,
        bevelSize,
        bevelThickness,
        bevelOffset: -bevelSize,
        bevelSegments
    }).translate(0, 0, -depth / 2);

/** Bevelled rectangular bar centred on the origin, e.g. a cross guard */
export const createBarGeometry = ({ halfWidth, halfHeight, ...bevel }: BarSpec) => {
    const shape = new Shape()
        .moveTo(-halfWidth, -halfHeight)
        .lineTo(halfWidth, -halfHeight)
        .lineTo(halfWidth, halfHeight)
        .lineTo(-halfWidth, halfHeight)
        .closePath();

    return extrudeBevelled(shape, bevel);
};

/** Grip profile (radius, height) from y = 0 up, alternating bare and raised wrap bands */
export const createWrappedHandleGeometry = ({
    length,
    baseRadius,
    wrapRadius,
    wrapCount,
    radialSegments
}: WrappedHandleSpec) => {
    const wrapHeight = length / (wrapCount * 2);
    const profile = [new Vector2(0, 0)];

    for (let band = 0; band < wrapCount * 2; band++) {
        const radius = band % 2 === 0 ? baseRadius : wrapRadius;
        profile.push(
            new Vector2(radius, band * wrapHeight),
            new Vector2(radius, (band + 1) * wrapHeight)
        );
    }
    profile.push(new Vector2(0, length));

    return new LatheGeometry(profile, radialSegments);
};

/**
 * Emissive mask for an extruded blade: white marks on black, so only the marks glow and bloom.
 * The blade shape must span x [-halfWidth, halfWidth] and y [-bladeLength, 0].
 */
export const createEmissiveMaskTexture = ({
    halfWidth,
    bladeLength,
    drawGlyphs
}: EmissiveMaskOptions) => {
    const { width, height } = EMISSIVE_MASK;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = '#fff';
        context.fillStyle = '#fff';
        drawGlyphs(context, width, height);
    }

    const texture = new CanvasTexture(canvas);
    // ExtrudeGeometry cap UVs are shape coordinates: map x [-halfWidth, halfWidth] and y [-bladeLength, 0] to [0, 1]
    texture.repeat.set(1 / (halfWidth * 2), 1 / bladeLength);
    texture.offset.set(0.5, 1);
    return texture;
};

/** Soft black radial gradient, opaque at the centre */
export const createContactShadowTexture = () => {
    const { textureSize } = CONTACT_SHADOW;
    const canvas = createCanvas(textureSize, textureSize);
    const context = canvas.getContext('2d');

    if (context) {
        const center = textureSize / 2;
        const gradient = context.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, textureSize, textureSize);
    }

    return new CanvasTexture(canvas);
};
