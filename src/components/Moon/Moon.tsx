import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
    AdditiveBlending,
    Color,
    MathUtils,
    SRGBColorSpace,
    TextureLoader,
    type Group,
    type PerspectiveCamera,
    type Sprite,
    type SpriteMaterial
} from 'three';

import {
    MOON_COLORS,
    MOON_LAYERS,
    MOON_PLACEMENT,
    MOON_RENDER_ORDER,
    MOON_SIZE,
    MOON_STREAKS,
    MOON_TEXTURE_URL
} from '@/components/Moon/Moon.constants';
import {
    createHaloTexture,
    createRimTexture,
    createStreakMaskTexture,
    createStreakTexture
} from '@/components/Moon/Moon.helpers';
import { DAGGERS } from '@/components/Scene/Scene.constants';
import { getSectionLift } from '@/components/Sections/scrollStore';
import { getCameraProgress } from '@/components/ScrollCamera/cameraStore';
import { toSkyPosition } from '@/components/Sky/Sky.helpers';
import { prefersReducedMotion } from '@/utils/prefersReducedMotion';

const RIM_TEXTURE = createRimTexture();
const HALO_TEXTURE = createHaloTexture();
const STREAK_TEXTURE = createStreakTexture();
const STREAK_MASK_TEXTURE = createStreakMaskTexture();

const BASE_COLORS = {
    disc: new Color(MOON_COLORS.disc),
    rim: new Color(MOON_COLORS.rim),
    halo: new Color(MOON_COLORS.halo)
};
const ACCENTS = DAGGERS.map(({ sectionId, glowColor }) => ({
    sectionId,
    color: new Color(glowColor)
}));
const accentShift = new Color();

/** Base colour leaned toward each section's accent by its dagger's lift, at most accentShare */
const tintTowardAccents = (base: Color, out: Color) => {
    out.copy(base);
    for (const { sectionId, color } of ACCENTS) {
        const weight = getSectionLift(sectionId).value * MOON_COLORS.accentShare;
        if (weight === 0) continue;
        out.add(accentShift.copy(color).sub(base).multiplyScalar(weight));
    }
    return out;
};

type MoonProps = {
    haloOpacity: number;
    /** Cloud streaks drawn over the disc, from the front of MOON_STREAKS */
    streakCount: number;
};

/**
 * Painted moon on the sky dome: disc, thin rim light, additive halo and dark cloud streaks
 * drifting across it. It rises and grows as the camera tilts up, so it stays in frame in every
 * section, and leans toward the active section's accent colour.
 */
export const Moon = ({ haloOpacity, streakCount }: MoonProps) => {
    const discTexture = useLoader(TextureLoader, MOON_TEXTURE_URL);
    discTexture.colorSpace = SRGBColorSpace;
    const groupRef = useRef<Group>(null);
    const discRef = useRef<Sprite>(null);
    const rimRef = useRef<Sprite>(null);
    const haloRef = useRef<Sprite>(null);
    const isReducedMotion = useMemo(prefersReducedMotion, []);
    // One texture per streak, so each drifts on its own offset; they share the canvas
    const streakTextures = useMemo(() => MOON_STREAKS.map(() => STREAK_TEXTURE.clone()), []);

    useFrame(({ camera, size }, delta) => {
        const group = groupRef.current;
        if (!group) return;
        const { tilt, drift } = getCameraProgress();
        const aspect = size.width / size.height;

        const placement = aspect < 1 ? MOON_PLACEMENT.portrait : MOON_PLACEMENT.landscape;
        const elevation =
            MathUtils.lerp(placement.heroElevation, placement.tiltedElevation, tilt) +
            MOON_PLACEMENT.driftRise * drift;
        const azimuth = MathUtils.lerp(placement.heroAzimuth, placement.tiltedAzimuth, tilt);
        group.position.set(...toSkyPosition(elevation, azimuth, MOON_PLACEMENT.distance));

        // Diameter that spans the target share of the viewport height at the moon's distance
        const heightShare = Math.min(
            MathUtils.lerp(MOON_SIZE.heroHeightShare, MOON_SIZE.tiltedHeightShare, tilt),
            MOON_SIZE.maxWidthShare * aspect
        );
        const halfFov = MathUtils.degToRad((camera as PerspectiveCamera).fov / 2);
        const diameter =
            2 * camera.position.distanceTo(group.position) * heightShare * Math.tan(halfFov);
        group.scale.setScalar(diameter);
        if (discRef.current) discRef.current.userData.discDiameter = diameter;

        tintTowardAccents(BASE_COLORS.disc, (discRef.current?.material as SpriteMaterial).color);
        tintTowardAccents(BASE_COLORS.rim, (rimRef.current?.material as SpriteMaterial).color);
        tintTowardAccents(BASE_COLORS.halo, (haloRef.current?.material as SpriteMaterial).color);

        if (isReducedMotion) return;
        MOON_STREAKS.forEach(({ driftSpeed }, index) => {
            streakTextures[index].offset.x += driftSpeed * delta;
        });
    });

    return (
        <group ref={groupRef}>
            <sprite
                ref={haloRef}
                scale={MOON_LAYERS.haloScale}
                renderOrder={MOON_RENDER_ORDER.halo}
            >
                <spriteMaterial
                    map={HALO_TEXTURE}
                    opacity={MOON_LAYERS.haloOpacity * haloOpacity}
                    blending={AdditiveBlending}
                    transparent
                    fog={false}
                    toneMapped={false}
                    depthWrite={false}
                />
            </sprite>
            <sprite ref={discRef} name="moon-disc" renderOrder={MOON_RENDER_ORDER.disc}>
                <spriteMaterial
                    map={discTexture}
                    transparent
                    fog={false}
                    toneMapped={false}
                    depthWrite={false}
                />
            </sprite>
            <sprite ref={rimRef} scale={MOON_LAYERS.rimScale} renderOrder={MOON_RENDER_ORDER.rim}>
                <spriteMaterial
                    map={RIM_TEXTURE}
                    transparent
                    fog={false}
                    toneMapped={false}
                    depthWrite={false}
                />
            </sprite>
            {MOON_STREAKS.slice(0, streakCount).map((streak, index) => (
                <sprite
                    key={streak.offsetY}
                    position={[0, streak.offsetY, 0]}
                    scale={[streak.width, streak.height, 1]}
                    renderOrder={MOON_RENDER_ORDER.streaks}
                >
                    <spriteMaterial
                        map={streakTextures[index]}
                        alphaMap={STREAK_MASK_TEXTURE}
                        rotation={streak.rotation}
                        opacity={streak.opacity}
                        transparent
                        fog={false}
                        toneMapped={false}
                        depthWrite={false}
                    />
                </sprite>
            ))}
        </group>
    );
};
