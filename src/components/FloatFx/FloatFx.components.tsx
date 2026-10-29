import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    AdditiveBlending,
    Color,
    MathUtils,
    type BufferGeometry,
    type Points,
    type PointsMaterial,
    type Sprite,
    type SpriteMaterial
} from 'three';

import {
    ARRIVAL_STREAK,
    EMBERS,
    HALO,
    RUNE_ORBIT,
    WISP
} from '@/components/FloatFx/FloatFx.constants';
import {
    createRuneTextures,
    createStreakTexture,
    createWispSheet,
    getFloatStrength
} from '@/components/FloatFx/FloatFx.helpers';
import { createSoftDotTexture } from '@/components/Glow/Glow.helpers';
import { easeOutCubic, type GlowPulse } from '@/components/Glow/Glow.helpers';
import { getArrivalAge } from '@/components/Sections/scrollStore';
import { createSeededRandom, randomBetween } from '@/utils/seededRandom';

export type FloatFxPartProps = {
    sectionId: string;
    glowColor: string;
    isIntroPlaying: boolean;
};

/** Painted light: adds up over the scene, never hidden by fog, never blocks what is behind */
const ADDITIVE_MATERIAL = {
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    fog: false,
    toneMapped: false
} as const;

const HALO_TEXTURE = createSoftDotTexture(HALO.textureSize);
const EMBER_TEXTURE = createSoftDotTexture(EMBERS.textureSize);
const WISP_SHEET = createWispSheet();
const RUNE_TEXTURES = createRuneTextures();
const STREAK_TEXTURE = createStreakTexture();
const WISP_FRAME_COUNT = WISP.columns * WISP.rows;

type HaloProps = FloatFxPartProps & {
    /** The dagger's own rhythm, so the halo breathes like its runes */
    pulse: GlowPulse;
    isReducedMotion: boolean;
};

/** Soft disc of the dagger's colour behind it */
export const Halo = ({
    sectionId,
    glowColor,
    isIntroPlaying,
    pulse,
    isReducedMotion
}: HaloProps) => {
    const materialRef = useRef<SpriteMaterial>(null);

    useFrame(({ clock }) => {
        if (!materialRef.current) return;
        const level = isReducedMotion ? 1 : pulse(clock.elapsedTime);
        materialRef.current.opacity =
            getFloatStrength(sectionId, isIntroPlaying) *
            MathUtils.lerp(HALO.minOpacity, HALO.maxOpacity, level);
    });

    return (
        <sprite scale={HALO.size}>
            <spriteMaterial
                ref={materialRef}
                map={HALO_TEXTURE}
                color={glowColor}
                opacity={0}
                {...ADDITIVE_MATERIAL}
            />
        </sprite>
    );
};

/** Sparks rising around the blade on a loop, positions a pure function of time */
export const Embers = ({ sectionId, glowColor, isIntroPlaying }: FloatFxPartProps) => {
    const pointsRef = useRef<Points<BufferGeometry, PointsMaterial>>(null);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);
    const { embers, positions, colors } = useMemo(() => {
        const random = createSeededRandom(EMBERS.seed);
        return {
            embers: Array.from({ length: EMBERS.count }, () => ({
                angle: random() * Math.PI * 2,
                distance: Math.sqrt(random()) * EMBERS.radius,
                speed: randomBetween(random, EMBERS.minSpeed, EMBERS.maxSpeed),
                phase: random()
            })),
            positions: new Float32Array(EMBERS.count * 3),
            colors: new Float32Array(EMBERS.count * 3)
        };
    }, []);

    useFrame(({ clock }) => {
        const points = pointsRef.current;
        if (!points) return;
        const seconds = clock.elapsedTime;

        embers.forEach(({ angle, distance, speed, phase }, index) => {
            // Share of the way up, looping
            const rise = MathUtils.euclideanModulo((seconds * speed) / EMBERS.height + phase, 1);
            const sway =
                Math.sin(seconds * EMBERS.wobbleSpeed + phase * Math.PI * 2) * EMBERS.wobble;
            positions[index * 3] = Math.cos(angle) * distance + sway;
            positions[index * 3 + 1] = (rise - 0.5) * EMBERS.height;
            positions[index * 3 + 2] = Math.sin(angle) * distance;
            // Additive: a darker colour is a fainter ember
            const fade = 1 - MathUtils.smoothstep(rise, 1 - EMBERS.fadeShare, 1);
            colors[index * 3] = baseColor.r * fade;
            colors[index * 3 + 1] = baseColor.g * fade;
            colors[index * 3 + 2] = baseColor.b * fade;
        });

        points.geometry.attributes.position.needsUpdate = true;
        points.geometry.attributes.color.needsUpdate = true;
        points.material.opacity = getFloatStrength(sectionId, isIntroPlaying) * EMBERS.opacity;
    });

    return (
        <points ref={pointsRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={EMBERS.size}
                map={EMBER_TEXTURE}
                vertexColors
                opacity={0}
                {...ADDITIVE_MATERIAL}
            />
        </points>
    );
};

/** Wisps of the dagger's colour curling up behind it, played from the flipbook sheet */
export const Wisp = ({ sectionId, glowColor, isIntroPlaying }: FloatFxPartProps) => {
    const materialRef = useRef<SpriteMaterial>(null);
    // Own copy of the sheet (same canvas) so each dagger plays its own frame
    const sheet = useMemo(() => {
        const texture = WISP_SHEET.clone();
        texture.repeat.set(1 / WISP.columns, 1 / WISP.rows);
        return texture;
    }, []);

    useFrame(({ clock }) => {
        if (!materialRef.current) return;
        const frame = Math.floor(clock.elapsedTime * WISP.framesPerSecond) % WISP_FRAME_COUNT;
        const column = frame % WISP.columns;
        const row = Math.floor(frame / WISP.columns);
        // Texture v runs bottom to top, the sheet's rows top to bottom
        sheet.offset.set(column / WISP.columns, 1 - (row + 1) / WISP.rows);
        materialRef.current.opacity = getFloatStrength(sectionId, isIntroPlaying) * WISP.opacity;
    });

    return (
        <sprite scale={[WISP.width, WISP.height, 1]}>
            <spriteMaterial
                ref={materialRef}
                map={sheet}
                color={glowColor}
                opacity={0}
                {...ADDITIVE_MATERIAL}
            />
        </sprite>
    );
};

/** Glyphs circling the blade, dimmer behind it */
export const RuneOrbit = ({ sectionId, glowColor, isIntroPlaying }: FloatFxPartProps) => {
    const spriteRefs = useRef<(Sprite | null)[]>([]);

    useFrame(({ clock }) => {
        const strength = getFloatStrength(sectionId, isIntroPlaying);

        spriteRefs.current.forEach((sprite, index) => {
            if (!sprite) return;
            const angle =
                clock.elapsedTime * RUNE_ORBIT.speed + (index / RUNE_ORBIT.count) * Math.PI * 2;
            const depth = Math.sin(angle);
            sprite.position.set(
                Math.cos(angle) * RUNE_ORBIT.radiusX,
                RUNE_ORBIT.centerY + depth * RUNE_ORBIT.tilt,
                depth * RUNE_ORBIT.radiusZ
            );
            // Depth from -1 (behind the blade) to 1 (in front)
            (sprite.material as SpriteMaterial).opacity =
                strength * RUNE_ORBIT.opacity * MathUtils.mapLinear(depth, -1, 1, 0.4, 1);
        });
    });

    return (
        <>
            {RUNE_TEXTURES.map((texture, index) => (
                <sprite
                    key={texture.uuid}
                    ref={(sprite) => {
                        spriteRefs.current[index] = sprite;
                    }}
                    scale={RUNE_ORBIT.size}
                >
                    <spriteMaterial
                        map={texture}
                        color={glowColor}
                        opacity={0}
                        {...ADDITIVE_MATERIAL}
                    />
                </sprite>
            ))}
        </>
    );
};

/** Flash of light across the dagger when it reaches its anchor: opens wide, then thins and fades */
export const ArrivalStreak = ({
    sectionId,
    glowColor
}: Omit<FloatFxPartProps, 'isIntroPlaying'>) => {
    const spriteRef = useRef<Sprite>(null);
    const color = useMemo(
        () => new Color(glowColor).multiplyScalar(ARRIVAL_STREAK.brightness),
        [glowColor]
    );

    useFrame(() => {
        const sprite = spriteRef.current;
        if (!sprite) return;
        const ageSeconds = getArrivalAge(sectionId);
        const progress = ageSeconds === null ? 1 : ageSeconds / ARRIVAL_STREAK.durationSeconds;
        sprite.visible = progress < 1;
        if (!sprite.visible) return;

        const opening = MathUtils.lerp(ARRIVAL_STREAK.startWidthShare, 1, easeOutCubic(progress));
        sprite.scale.set(ARRIVAL_STREAK.width * opening, ARRIVAL_STREAK.height * (1 - progress), 1);
        (sprite.material as SpriteMaterial).opacity = 1 - progress;
    });

    return (
        <sprite ref={spriteRef} visible={false}>
            <spriteMaterial map={STREAK_TEXTURE} color={color} {...ADDITIVE_MATERIAL} />
        </sprite>
    );
};
