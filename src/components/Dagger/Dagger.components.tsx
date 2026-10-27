import type { Ref } from 'react';
import { Html, Outlines } from '@react-three/drei';
import {
    Color,
    DataTexture,
    NearestFilter,
    RedFormat,
    type ColorRepresentation,
    type MeshStandardMaterial,
    type MeshToonMaterial,
    type Texture,
    type WebGLProgramParametersWithUniforms
} from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import {
    BLADE,
    CONTACT_SHADOW,
    CROSS_GUARD,
    HANDLE,
    LABEL_POSITION_Y,
    OUTLINE,
    POMMEL,
    TOON_RIM
} from '@/components/Dagger/Dagger.constants';
import { createContactShadowTexture } from '@/components/Dagger/Dagger.helpers';
import { cn } from '@/utils/cn';

import styles from '@/components/Dagger/Dagger.module.css';

export type BladeMaterial = MeshStandardMaterial | MeshToonMaterial;

export type DaggerPartsProps = {
    config: DaggerConfig;
    bladeMaterialRef: Ref<BladeMaterial>;
};

type BladeProps = {
    color: string;
    glowColor: string;
    materialRef: Ref<MeshStandardMaterial>;
};

type DaggerPartProps = {
    color: string;
};

type DaggerLabelProps = {
    text: string;
    isHighlighted: boolean;
};

type ToonMaterialProps = {
    ref?: Ref<MeshToonMaterial>;
    color: ColorRepresentation;
    rimColor: ColorRepresentation;
    emissive?: ColorRepresentation;
    emissiveMap?: Texture;
};

/** Three flat shading bands: shadow, mid-tone, lit */
const TOON_GRADIENT_MAP = (() => {
    const texture = new DataTexture(new Uint8Array([60, 150, 255]), 3, 1, RedFormat);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.needsUpdate = true;
    return texture;
})();

const CONTACT_SHADOW_TEXTURE = createContactShadowTexture();

/** Adds a hard-edged fresnel rim to the toon shader, after the emissive map is applied */
const injectRimLight =
    (rimColor: ColorRepresentation) => (shader: WebGLProgramParametersWithUniforms) => {
        shader.uniforms.rimColor = { value: new Color(rimColor) };
        shader.fragmentShader = shader.fragmentShader
            .replace('void main() {', 'uniform vec3 rimColor;\nvoid main() {')
            .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                float facing = dot(normalize(vViewPosition), normal);
                float rim = step(${TOON_RIM.threshold.toFixed(2)}, 1.0 - facing);
                totalEmissiveRadiance += rimColor * rim * ${TOON_RIM.intensity.toFixed(2)};`
            );
    };

/** Stepped toon shading with a coloured rim light; the rim stays below the bloom threshold */
export const ToonMaterial = ({
    ref,
    color,
    rimColor,
    emissive,
    emissiveMap
}: ToonMaterialProps) => (
    <meshToonMaterial
        ref={ref}
        color={color}
        gradientMap={TOON_GRADIENT_MAP}
        emissive={emissive}
        emissiveMap={emissiveMap}
        emissiveIntensity={0}
        onBeforeCompile={injectRimLight(rimColor)}
    />
);

/** Light dark outline shared by every dagger part; place it inside the mesh */
export const DaggerOutline = () => <Outlines thickness={OUTLINE.thickness} color={OUTLINE.color} />;

/** Fake contact shadow on the floor around the blade; render it at ground level */
export const ContactShadow = () => (
    <mesh position={[0, CONTACT_SHADOW.height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CONTACT_SHADOW.size, CONTACT_SHADOW.size]} />
        <meshBasicMaterial
            map={CONTACT_SHADOW_TEXTURE}
            transparent
            opacity={CONTACT_SHADOW.opacity}
            depthWrite={false}
        />
    </mesh>
);

/**
 * Tip at y = -BLADE.length, base at the guard (y = 0)
 */
export const Blade = ({ color, glowColor, materialRef }: BladeProps) => (
    <mesh position={[0, -BLADE.length / 2, 0]}>
        <cylinderGeometry
            args={[BLADE.baseRadius, BLADE.tipRadius, BLADE.length, BLADE.radialSegments]}
        />
        <meshStandardMaterial
            ref={materialRef}
            color={color}
            metalness={BLADE.metalness}
            roughness={BLADE.roughness}
            emissive={glowColor}
            emissiveIntensity={0}
        />
    </mesh>
);
export const CrossGuard = ({ color }: DaggerPartProps) => (
    <mesh>
        <boxGeometry args={[CROSS_GUARD.width, CROSS_GUARD.height, CROSS_GUARD.depth]} />
        <meshStandardMaterial
            color={color}
            metalness={CROSS_GUARD.metalness}
            roughness={CROSS_GUARD.roughness}
        />
    </mesh>
);

export const Handle = ({ color }: DaggerPartProps) => (
    <mesh position={[0, HANDLE.length / 2, 0]}>
        <cylinderGeometry
            args={[HANDLE.topRadius, HANDLE.bottomRadius, HANDLE.length, HANDLE.radialSegments]}
        />
        <meshStandardMaterial
            color={color}
            metalness={HANDLE.metalness}
            roughness={HANDLE.roughness}
        />
    </mesh>
);

export const Pommel = ({ color }: DaggerPartProps) => (
    <mesh position={[0, POMMEL.positionY, 0]}>
        <sphereGeometry args={[POMMEL.radius, POMMEL.widthSegments, POMMEL.heightSegments]} />
        <meshStandardMaterial
            color={color}
            metalness={POMMEL.metalness}
            roughness={POMMEL.roughness}
        />
    </mesh>
);

export const DaggerLabel = ({ text, isHighlighted }: DaggerLabelProps) => (
    <Html
        position={[0, LABEL_POSITION_Y, 0]}
        center
        zIndexRange={[1, 1]}
        className={cn(styles['dagger-label'], isHighlighted && styles['dagger-label-highlighted'])}
    >
        {text}
    </Html>
);

/** Shared stand-in for daggers that do not have their own geometry yet */
export const PlaceholderDaggerParts = ({ config, bladeMaterialRef }: DaggerPartsProps) => (
    <>
        <Blade
            color={config.bladeColor}
            glowColor={config.glowColor}
            materialRef={bladeMaterialRef as Ref<MeshStandardMaterial>}
        />
        <CrossGuard color={config.guardColor} />
        <Handle color={config.handleColor} />
        <Pommel color={config.pommelColor} />
    </>
);
