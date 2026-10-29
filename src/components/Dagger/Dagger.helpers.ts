import {
    Box2,
    CanvasTexture,
    CatmullRomCurve3,
    ExtrudeGeometry,
    RepeatWrapping,
    SRGBColorSpace,
    Shape,
    TubeGeometry,
    Vector2,
    Vector3,
    type UVGenerator
} from 'three';

import {
    BLADE_PAINT,
    CONTACT_SHADOW,
    DEFAULT_BEVEL_SEGMENTS,
    LEATHER_WRAP,
    SHAPE_TEXTURE_SIZE
} from '@/components/Dagger/Dagger.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

export type BevelSpec = {
    depth: number;
    /** How far the bevel cuts in from the outline */
    bevelSize: number;
    /** How far the bevel extends front and back; defaults to bevelSize */
    bevelThickness?: number;
    bevelSegments?: number;
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
    }: BevelSpec,
    uvGenerator?: UVGenerator
) =>
    new ExtrudeGeometry(shape, {
        depth,
        bevelSize,
        bevelThickness,
        bevelOffset: -bevelSize,
        bevelSegments,
        UVGenerator: uvGenerator
    }).translate(0, 0, -depth / 2);

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

/** One outline point in shape units; with a control point, a quadratic curve leads to it */
type OutlineStep = { to: readonly [number, number]; control?: readonly [number, number] };
/** Closed outline, first step is the start point; y = 0 is the guard, negative y the blade */
export type Outline = readonly OutlineStep[];

const createOutlineShape = (outline: Outline) => {
    const [start, ...steps] = outline;
    const shape = new Shape().moveTo(...start.to);

    for (const { to, control } of steps) {
        if (control) shape.quadraticCurveTo(...control, ...to);
        else shape.lineTo(...to);
    }
    return shape.closePath();
};

/**
 * Every face (caps, bevel, side walls) maps its x, y to the shape's bounding box,
 * so the walls and bevel sample the painted edge instead of a stretched strip.
 */
const createBoundsUVGenerator = (bounds: Box2): UVGenerator => {
    const size = bounds.getSize(new Vector2());
    const toUV = (vertices: number[], index: number) =>
        new Vector2(
            (vertices[index * 3] - bounds.min.x) / size.x,
            (vertices[index * 3 + 1] - bounds.min.y) / size.y
        );

    return {
        generateTopUV: (_geometry, vertices, a, b, c) => [a, b, c].map((i) => toUV(vertices, i)),
        generateSideWallUV: (_geometry, vertices, a, b, c, d) =>
            [a, b, c, d].map((i) => toUV(vertices, i))
    };
};

/** Bevelled extrusion of an outline, plus the bounds its textures must cover */
export const createOutlinedPart = (outline: Outline, bevel: BevelSpec) => {
    const shape = createOutlineShape(outline);
    const bounds = new Box2().setFromPoints(shape.getPoints());
    return {
        shape,
        bounds,
        geometry: extrudeBevelled(shape, bevel, createBoundsUVGenerator(bounds))
    };
};

/** Canvas covering the bounds with a uniform scale; draw in shape units (y up) */
const createShapeCanvasTexture = (
    bounds: Box2,
    draw: (context: CanvasRenderingContext2D) => void
) => {
    const size = bounds.getSize(new Vector2());
    const pixelsPerUnit = SHAPE_TEXTURE_SIZE / Math.max(size.x, size.y);
    const canvas = createCanvas(
        Math.ceil(size.x * pixelsPerUnit),
        Math.ceil(size.y * pixelsPerUnit)
    );
    const context = canvas.getContext('2d');

    if (context) {
        // Canvas top is the shape's top (the texture is flipped on upload, so v = 1 is the top)
        context.setTransform(
            pixelsPerUnit,
            0,
            0,
            -pixelsPerUnit,
            -bounds.min.x * pixelsPerUnit,
            bounds.max.y * pixelsPerUnit
        );
        draw(context);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};

const traceShape = (context: CanvasRenderingContext2D, shape: Shape) => {
    const [first, ...rest] = shape.getPoints();
    context.beginPath();
    context.moveTo(first.x, first.y);
    rest.forEach(({ x, y }) => context.lineTo(x, y));
    context.closePath();
};

type BladePaint = {
    /** Near the guard and near the tip: a soft vertical gradient */
    baseColor: string;
    tipColor: string;
    /** Worn (or coloured) band along the outline */
    edgeColor: string;
    seed: number;
};

/** Painted metal: gradient, worn band inside the outline, light scratches */
export const createBladePaintTexture = (
    { shape, bounds }: { shape: Shape; bounds: Box2 },
    { baseColor, tipColor, edgeColor, seed }: BladePaint,
    /** Extra painted details (fuller, edge band...), in shape units and clipped to the blade */
    drawExtras?: (context: CanvasRenderingContext2D) => void
) =>
    createShapeCanvasTexture(bounds, (context) => {
        const gradient = context.createLinearGradient(0, bounds.max.y, 0, bounds.min.y);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, tipColor);
        context.fillStyle = gradient;
        context.fillRect(
            bounds.min.x,
            bounds.min.y,
            bounds.max.x - bounds.min.x,
            bounds.max.y - bounds.min.y
        );

        // Clipped to the shape, a doubled stroke leaves exactly edgeWidth inside the outline
        traceShape(context, shape);
        context.clip();
        context.strokeStyle = edgeColor;
        context.lineWidth = BLADE_PAINT.edgeWidth * 2;
        context.lineJoin = 'round';
        context.stroke();
        drawExtras?.(context);

        const random = createSeededRandom(seed);
        context.strokeStyle = BLADE_PAINT.scratchColor;
        context.lineWidth = BLADE_PAINT.scratchWidth;
        for (let scratch = 0; scratch < BLADE_PAINT.scratchCount; scratch++) {
            const x = randomBetween(random, bounds.min.x, bounds.max.x);
            const y = randomBetween(random, bounds.min.y, bounds.max.y);
            const angle = random() * Math.PI * 2;
            const length = randomBetween(
                random,
                BLADE_PAINT.scratchMinLength,
                BLADE_PAINT.scratchMaxLength
            );
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            context.stroke();
        }
    });

/** White glyphs on black, in shape units: only the glyphs glow and bloom */
export const createRuneMaskTexture = (
    bounds: Box2,
    drawRunes: (context: CanvasRenderingContext2D) => void
) =>
    createShapeCanvasTexture(bounds, (context) => {
        context.fillStyle = '#000';
        context.fillRect(
            bounds.min.x,
            bounds.min.y,
            bounds.max.x - bounds.min.x,
            bounds.max.y - bounds.min.y
        );
        context.strokeStyle = '#fff';
        context.fillStyle = '#fff';
        context.lineCap = 'round';
        drawRunes(context);
    });

/** Helix rising from y = 0, sampled into a smooth curve; negative turns wind the other way */
const createHelix = (radius: number, length: number, turns: number, pointCount: number) =>
    new CatmullRomCurve3(
        Array.from({ length: pointCount + 1 }, (_, index) => {
            const t = index / pointCount;
            const angle = t * turns * Math.PI * 2;
            return new Vector3(Math.cos(angle) * radius, t * length, Math.sin(angle) * radius);
        })
    );

export type LeatherWrapSpec = {
    /** From y = 0 up */
    length: number;
    /** Grip core radius; the strap winds just outside it */
    coreRadius: number;
    strapRadius: number;
    /** Negative to wind the other way (criss-cross bindings use one of each) */
    turns: number;
};

/** Leather strap wound around the grip core; its UVs run along the strap */
export const createLeatherWrapGeometry = ({
    length,
    coreRadius,
    strapRadius,
    turns
}: LeatherWrapSpec) => {
    const segmentCount = Math.ceil(Math.abs(turns) * LEATHER_WRAP.segmentsPerTurn);
    return new TubeGeometry(
        createHelix(coreRadius + strapRadius * 0.5, length, turns, segmentCount),
        segmentCount,
        strapRadius,
        LEATHER_WRAP.radialSegments
    );
};

/** Grayscale strap: darker edges and a dashed stitch line, repeated along the strap */
export const createLeatherTexture = (turns: number) => {
    const { textureWidth: width, textureHeight: height } = LEATHER_WRAP;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    if (context) {
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, LEATHER_WRAP.edgeColor);
        gradient.addColorStop(0.3, LEATHER_WRAP.baseColor);
        gradient.addColorStop(0.7, LEATHER_WRAP.baseColor);
        gradient.addColorStop(1, LEATHER_WRAP.edgeColor);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = LEATHER_WRAP.stitchColor;
        context.lineWidth = 2;
        context.setLineDash([10, 6]);
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.repeat.set(Math.abs(turns) * LEATHER_WRAP.stitchesPerTurn, 1);
    return texture;
};
