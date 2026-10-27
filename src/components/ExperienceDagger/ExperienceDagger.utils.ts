import { CanvasTexture, ExtrudeGeometry, LatheGeometry, Path, Shape, Vector2 } from 'three';

import { BLADE } from '@/components/Dagger/Dagger.constants';
import {
    DEFAULT_BEVEL_SEGMENTS,
    EXPERIENCE_BLADE,
    EXPERIENCE_HANDLE,
    GUARD_BAR,
    RUNE_TEXTURE,
    TOOTH_STEPS
} from '@/components/ExperienceDagger/ExperienceDagger.constants';

export type GearSpec = {
    teeth: number;
    innerRadius: number;
    outerRadius: number;
    holeRadius: number;
    depth: number;
    bevelSize: number;
};

/** Extrudes along z with a bevel that stays inside the outline, centred on z = 0 */
const extrudeBevelled = (
    shape: Shape,
    depth: number,
    bevelSize: number,
    bevelSegments: number = DEFAULT_BEVEL_SEGMENTS
) =>
    new ExtrudeGeometry(shape, {
        depth,
        bevelSize,
        bevelThickness: bevelSize,
        bevelOffset: -bevelSize,
        bevelSegments
    }).translate(0, 0, -depth / 2);

export const createGearGeometry = ({
    teeth,
    innerRadius,
    outerRadius,
    holeRadius,
    depth,
    bevelSize
}: GearSpec) => {
    const shape = new Shape();
    const stepAngle = (Math.PI * 2) / (teeth * TOOTH_STEPS);
    const toothRadii = [innerRadius, outerRadius, outerRadius, innerRadius];

    for (let step = 0; step < teeth * TOOTH_STEPS; step++) {
        const radius = toothRadii[step % TOOTH_STEPS];
        const angle = step * stepAngle;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (step === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const hole = new Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    return extrudeBevelled(shape, depth, bevelSize);
};

/** Flat blade: parallel edges from the guard, then a short taper to the tip */
export const createBladeGeometry = () => {
    const { halfWidth, taperStartY, depth, bevelSize, bevelSegments } = EXPERIENCE_BLADE;
    const shape = new Shape()
        .moveTo(-halfWidth, 0)
        .lineTo(halfWidth, 0)
        .lineTo(halfWidth, taperStartY)
        .lineTo(0, -BLADE.length)
        .lineTo(-halfWidth, taperStartY)
        .closePath();

    return extrudeBevelled(shape, depth, bevelSize, bevelSegments);
};

export const createGuardBarGeometry = () => {
    const { halfWidth, halfHeight, depth, bevelSize } = GUARD_BAR;
    const shape = new Shape()
        .moveTo(-halfWidth, -halfHeight)
        .lineTo(halfWidth, -halfHeight)
        .lineTo(halfWidth, halfHeight)
        .lineTo(-halfWidth, halfHeight)
        .closePath();

    return extrudeBevelled(shape, depth, bevelSize);
};

/** Grip profile (radius, height) with raised leather wraps */
export const createHandleGeometry = () => {
    const { length, baseRadius, wrapRadius, wrapCount, radialSegments } = EXPERIENCE_HANDLE;
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

const drawGear = (
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
) => {
    const tickCount = 8;
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    for (let tick = 0; tick < tickCount; tick++) {
        const angle = (tick / tickCount) * Math.PI * 2;
        context.moveTo(
            centerX + Math.cos(angle) * radius * 0.6,
            centerY + Math.sin(angle) * radius * 0.6
        );
        context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    context.stroke();
};

const drawRune = (
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
) => {
    context.beginPath();
    context.moveTo(centerX, centerY - radius);
    context.lineTo(centerX, centerY + radius);
    context.moveTo(centerX - radius * 0.6, centerY - radius * 0.4);
    context.lineTo(centerX, centerY);
    context.lineTo(centerX + radius * 0.6, centerY - radius * 0.4);
    context.stroke();
};

/**
 * Emissive mask: white glyphs on black, so only the runes glow and bloom.
 * Canvas top is the guard, bottom is the tip.
 */
export const createRuneTexture = () => {
    const { width, height, glyphCount, glyphAreaEnd, lineWidth } = RUNE_TEXTURE;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = '#fff';
        context.lineWidth = lineWidth;

        const glyphSpacing = (height * glyphAreaEnd) / glyphCount;
        const glyphRadius = width * 0.3;
        for (let glyph = 0; glyph < glyphCount; glyph++) {
            const centerY = (glyph + 0.5) * glyphSpacing;
            const drawGlyph = glyph % 2 === 0 ? drawGear : drawRune;
            drawGlyph(context, width / 2, centerY, glyphRadius);
        }
    }

    const texture = new CanvasTexture(canvas);
    // ExtrudeGeometry cap UVs are shape coordinates: map x [-halfWidth, halfWidth] and y [-length, 0] to [0, 1]
    texture.repeat.set(1 / (EXPERIENCE_BLADE.halfWidth * 2), 1 / BLADE.length);
    texture.offset.set(0.5, 1);
    return texture;
};
