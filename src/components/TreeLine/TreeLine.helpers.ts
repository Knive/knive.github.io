import { CanvasTexture, SRGBColorSpace } from 'three';

import { BRANCHES, TREE_TEXTURE } from '@/components/TreeLine/TreeLine.constants';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

type Random = () => number;
/** One straight stroke of the tree, in unscaled canvas pixels */
type Segment = { fromX: number; fromY: number; toX: number; toY: number; width: number };
type Branch = {
    x: number;
    y: number;
    /** Canvas angle; -PI / 2 points straight up */
    angle: number;
    length: number;
    width: number;
    depth: number;
};

const UP = -Math.PI / 2;

/** Adds one kinked, tapering branch, then forks into thinner children from its end */
const growBranch = (segments: Segment[], random: Random, branch: Branch) => {
    const { x, y, length, width, depth } = branch;
    const segmentLength = length / BRANCHES.segments;
    const endWidth = width * BRANCHES.widthDecay;
    const jitter = depth < BRANCHES.stiffDepth ? BRANCHES.angleJitter / 3 : BRANCHES.angleJitter;
    let angle = branch.angle;
    let currentX = x;
    let currentY = y;

    for (let segment = 0; segment < BRANCHES.segments; segment++) {
        angle += (random() - 0.5) * jitter;
        const nextX = currentX + Math.cos(angle) * segmentLength;
        const nextY = currentY + Math.sin(angle) * segmentLength;

        segments.push({
            fromX: currentX,
            fromY: currentY,
            toX: nextX,
            toY: nextY,
            width: width + (endWidth - width) * (segment / BRANCHES.segments)
        });

        currentX = nextX;
        currentY = nextY;
    }

    const isTwig = depth >= BRANCHES.maxDepth || endWidth < BRANCHES.minWidth;
    if (isTwig) return;

    const forkCount = Math.round(randomBetween(random, BRANCHES.minForks, BRANCHES.maxForks));
    for (let fork = 0; fork < forkCount; fork++) {
        // Spread children evenly across the fan, with a little randomness
        const fanPosition = forkCount === 1 ? 0 : fork / (forkCount - 1) - 0.5;
        growBranch(segments, random, {
            x: currentX,
            y: currentY,
            angle: angle + fanPosition * BRANCHES.spreadAngle * 2 + (random() - 0.5) * jitter,
            length:
                length *
                BRANCHES.lengthDecay *
                randomBetween(random, BRANCHES.minLengthScale, BRANCHES.maxLengthScale),
            width: endWidth,
            depth: depth + 1
        });
    }
};

/**
 * Scales the tree down to fit the canvas (never up), keeping the trunk base on the bottom edge
 * and centring the crown horizontally.
 */
const drawFitted = (context: CanvasRenderingContext2D, segments: Segment[]) => {
    const { width, height } = TREE_TEXTURE;
    const xs = segments.flatMap(({ fromX, toX }) => [fromX, toX]);
    const minY = Math.min(...segments.flatMap(({ fromY, toY }) => [fromY, toY]));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const usableWidth = width - TREE_TEXTURE.padding * 2;
    const usableHeight = height - TREE_TEXTURE.padding;
    const scale = Math.min(1, usableWidth / (maxX - minX), usableHeight / (height - minY));
    const centerX = (minX + maxX) / 2;

    const toCanvasX = (x: number) => width / 2 + (x - centerX) * scale;
    const toCanvasY = (y: number) => height - (height - y) * scale;

    for (const segment of segments) {
        context.lineWidth = Math.max(BRANCHES.minWidth, segment.width * scale);
        context.beginPath();
        context.moveTo(toCanvasX(segment.fromX), toCanvasY(segment.fromY));
        context.lineTo(toCanvasX(segment.toX), toCanvasY(segment.toY));
        context.stroke();
    }
};

/** Bare tree silhouette standing on the bottom edge of a transparent canvas */
export const createTreeTexture = (seed: number) => {
    const { width, height, color } = TREE_TEXTURE;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (context) {
        const segments: Segment[] = [];
        growBranch(segments, createSeededRandom(seed), {
            x: width / 2,
            y: height,
            angle: UP,
            length: BRANCHES.trunkLength,
            width: BRANCHES.trunkWidth,
            depth: 0
        });

        context.strokeStyle = color;
        context.lineCap = 'round';
        drawFitted(context, segments);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
};
