import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    AdditiveBlending,
    Color,
    NormalBlending,
    type BufferGeometry,
    type Mesh,
    type MeshBasicMaterial,
    type Points,
    type PointsMaterial,
    type Texture
} from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import type { CrackPath } from '@/components/Floor/Floor.helpers';
import {
    CRACK_GLOW,
    DUST,
    SHOCKWAVE_RING,
    SPARKS,
    type BurstParticleSpec
} from '@/components/Glow/Glow.constants';
import {
    createCrackGlowTexture,
    createSoftDotTexture,
    easeOutCubic,
    launchParticles,
    stepParticles
} from '@/components/Glow/Glow.helpers';
import { getBurst, getBurstStrength, getHoveredDaggerId } from '@/components/Glow/glowStore';
import { nowSeconds } from '@/utils/nowSeconds';

export type GlowEffectProps = {
    daggerId: string;
    glowColor: string;
};

type CrackGlowProps = GlowEffectProps & {
    /** Until its landing burst the dagger is still in the air: no cracks yet */
    isIntroPlaying: boolean;
    /** Where the dagger is planted, to line the glow up with the floor cracks */
    landing: LandingTransform;
    cracks: CrackPath[];
};

/** The dagger's floor cracks in its colour: lit softly once landed, brighter on hover and bursts; render at ground level */
export const CrackGlow = ({
    daggerId,
    glowColor,
    landing,
    cracks,
    isIntroPlaying
}: CrackGlowProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshBasicMaterial>(null);
    const texture = useMemo(() => createCrackGlowTexture(cracks, landing), [cracks, landing]);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        // The landing burst starts at impact; a skipped or already-played intro counts as landed
        const isLanded = !isIntroPlaying || getBurst(daggerId) !== undefined;
        const strength = Math.max(
            isLanded ? CRACK_GLOW.restLevel : 0,
            getHoveredDaggerId() === daggerId ? CRACK_GLOW.hoverLevel : 0,
            getBurstStrength(daggerId)
        );
        mesh.visible = strength > 0;
        material.color.copy(baseColor).multiplyScalar(strength * CRACK_GLOW.peak);
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, CRACK_GLOW.height, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
        >
            <planeGeometry args={[CRACK_GLOW.size, CRACK_GLOW.size]} />
            <meshBasicMaterial
                ref={materialRef}
                map={texture}
                transparent
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
};

/** Running burst and its age if it shows motion effects and is younger than the given life, else null */
const getMotionBurstAge = (daggerId: string, lifeSeconds: number) => {
    const burst = getBurst(daggerId);
    if (!burst?.hasMotion) return null;
    const ageSeconds = nowSeconds() - burst.startedAt;
    return ageSeconds < lifeSeconds ? { burst, ageSeconds } : null;
};

/** Flat ring racing outwards over the floor and fading; render at ground level */
export const ShockwaveRing = ({ daggerId, glowColor }: GlowEffectProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshBasicMaterial>(null);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        const running = getMotionBurstAge(daggerId, SHOCKWAVE_RING.durationSeconds);
        mesh.visible = running !== null;
        if (!running) return;

        const progress = running.ageSeconds / SHOCKWAVE_RING.durationSeconds;
        const radius = easeOutCubic(progress) * running.burst.intensity * SHOCKWAVE_RING.maxRadius;
        mesh.scale.setScalar(Math.max(radius, Number.EPSILON));
        material.color
            .copy(baseColor)
            .multiplyScalar((1 - progress) * running.burst.intensity * SHOCKWAVE_RING.peak);
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, SHOCKWAVE_RING.height, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
        >
            {/* Unit ring, scaled to the current radius */}
            <ringGeometry args={[SHOCKWAVE_RING.innerRadiusRatio, 1, SHOCKWAVE_RING.segments]} />
            <meshBasicMaterial
                ref={materialRef}
                transparent
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
};

type BurstParticlesProps = {
    daggerId: string;
    color: string;
    spec: BurstParticleSpec;
    map?: Texture;
};

/** Particles thrown from the blade's entry point by each motion burst; render at ground level */
const BurstParticles = ({ daggerId, color, spec, map }: BurstParticlesProps) => {
    const pointsRef = useRef<Points<BufferGeometry, PointsMaterial>>(null);
    const lastLaunchRef = useRef<number | null>(null);
    const baseColor = useMemo(() => new Color(color), [color]);
    // Reused buffers: every burst relaunches the same particles
    const { positions, velocities } = useMemo(
        () => ({
            positions: new Float32Array(spec.maxCount * 3),
            velocities: new Float32Array(spec.maxCount * 3)
        }),
        [spec]
    );

    useFrame((_, deltaSeconds) => {
        const points = pointsRef.current;
        if (!points) return;

        const running = getMotionBurstAge(daggerId, spec.lifeSeconds);
        points.visible = running !== null;
        if (!running) return;

        const { burst, ageSeconds } = running;
        if (lastLaunchRef.current !== burst.startedAt) {
            lastLaunchRef.current = burst.startedAt;
            launchParticles(positions, velocities, spec);
            points.geometry.setDrawRange(0, Math.round(burst.intensity * spec.maxCount));
        } else {
            stepParticles(positions, velocities, spec, deltaSeconds);
        }

        points.geometry.attributes.position.needsUpdate = true;
        const fade = (1 - ageSeconds / spec.lifeSeconds) * spec.peak;
        if (spec.isAdditive) points.material.color.copy(baseColor).multiplyScalar(fade);
        else points.material.opacity = fade;
    });

    return (
        <points ref={pointsRef} visible={false} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={spec.size}
                map={map}
                color={spec.isAdditive ? undefined : baseColor}
                transparent
                blending={spec.isAdditive ? AdditiveBlending : NormalBlending}
                depthWrite={false}
                toneMapped={!spec.isAdditive}
            />
        </points>
    );
};

/** Sparks thrown up from the blade's entry point, falling back under gravity */
export const Sparks = ({ daggerId, glowColor }: GlowEffectProps) => (
    <BurstParticles daggerId={daggerId} color={glowColor} spec={SPARKS} />
);

const DUST_TEXTURE = createSoftDotTexture(DUST.textureSize);

/** Earth kicked up low around the blade, drifting out and settling */
export const ImpactDust = ({ daggerId }: Pick<GlowEffectProps, 'daggerId'>) => (
    <BurstParticles daggerId={daggerId} color={DUST.color} spec={DUST} map={DUST_TEXTURE} />
);
