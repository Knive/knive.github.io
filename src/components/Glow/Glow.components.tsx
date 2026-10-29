import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    AdditiveBlending,
    Color,
    type BufferGeometry,
    type Mesh,
    type MeshBasicMaterial,
    type Points,
    type PointsMaterial
} from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import type { CrackPath } from '@/components/Floor/Floor.helpers';
import { CRACK_GLOW, SHOCKWAVE_RING, SPARKS } from '@/components/Glow/Glow.constants';
import {
    createCrackGlowTexture,
    easeOutCubic,
    launchSparks,
    stepSparks
} from '@/components/Glow/Glow.helpers';
import { getBurst, getBurstStrength, nowSeconds } from '@/components/Glow/glowStore';

export type GlowEffectProps = {
    daggerId: string;
    glowColor: string;
};

type CrackGlowProps = GlowEffectProps & {
    /** Where the dagger is planted, to line the glow up with the floor cracks */
    landing: LandingTransform;
    cracks: CrackPath[];
};

/** The dagger's floor cracks lighting up in its colour with each burst; render at ground level */
export const CrackGlow = ({ daggerId, glowColor, landing, cracks }: CrackGlowProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshBasicMaterial>(null);
    const texture = useMemo(() => createCrackGlowTexture(cracks, landing), [cracks, landing]);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        const strength = getBurstStrength(daggerId);
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

/** Sparks thrown up from the blade's entry point, falling back under gravity; render at ground level */
export const Sparks = ({ daggerId, glowColor }: GlowEffectProps) => {
    const pointsRef = useRef<Points<BufferGeometry, PointsMaterial>>(null);
    const lastLaunchRef = useRef<number | null>(null);
    const baseColor = useMemo(() => new Color(glowColor), [glowColor]);
    // Reused buffers: every burst relaunches the same particles
    const { positions, velocities } = useMemo(
        () => ({
            positions: new Float32Array(SPARKS.maxCount * 3),
            velocities: new Float32Array(SPARKS.maxCount * 3)
        }),
        []
    );

    useFrame((_, deltaSeconds) => {
        const points = pointsRef.current;
        if (!points) return;

        const running = getMotionBurstAge(daggerId, SPARKS.lifeSeconds);
        points.visible = running !== null;
        if (!running) return;

        const { burst, ageSeconds } = running;
        if (lastLaunchRef.current !== burst.startedAt) {
            lastLaunchRef.current = burst.startedAt;
            launchSparks(positions, velocities);
            points.geometry.setDrawRange(0, Math.round(burst.intensity * SPARKS.maxCount));
        } else {
            stepSparks(positions, velocities, deltaSeconds);
        }

        points.geometry.attributes.position.needsUpdate = true;
        points.material.color
            .copy(baseColor)
            .multiplyScalar((1 - ageSeconds / SPARKS.lifeSeconds) * SPARKS.peak);
    });

    return (
        <points ref={pointsRef} visible={false} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={SPARKS.size}
                transparent
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
};
