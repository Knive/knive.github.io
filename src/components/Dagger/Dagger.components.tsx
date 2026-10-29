import { useMemo, type Ref } from 'react';
import { Html, Outlines } from '@react-three/drei';
import { useThree, type ThreeElements } from '@react-three/fiber';
import {
    Color,
    CylinderGeometry,
    DataTexture,
    NearestFilter,
    RedFormat,
    type BufferGeometry,
    type ColorRepresentation,
    type MeshToonMaterial,
    type Texture,
    type Vector3Tuple,
    type WebGLProgramParametersWithUniforms
} from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import {
    CONTACT_SHADOW,
    HIT_SHAPE,
    LABEL_POSITION_Y,
    OUTLINE,
    TOON_RIM
} from '@/components/Dagger/Dagger.constants';
import {
    createContactShadowTexture,
    createLeatherTexture,
    createLeatherWrapGeometry,
    type LeatherWrapSpec
} from '@/components/Dagger/Dagger.helpers';
import { cn } from '@/utils/cn';

import styles from '@/components/Dagger/Dagger.module.css';

export type DaggerPartsProps = {
    config: DaggerConfig;
    /** Pass to every material that glows (runes, crystal...); they pulse together */
    glowMaterialRef: Ref<MeshToonMaterial>;
};

type DaggerLabelProps = {
    text: string;
    isHighlighted: boolean;
};

type ToonMaterialProps = {
    ref?: Ref<MeshToonMaterial>;
    color: ColorRepresentation;
    rimColor: ColorRepresentation;
    map?: Texture;
    emissive?: ColorRepresentation;
    emissiveMap?: Texture;
};

type DaggerHitShapeProps = Pick<
    ThreeElements['mesh'],
    'onClick' | 'onPointerOver' | 'onPointerOut'
> & {
    /** From the ground to the top of the hilt */
    height: number;
};

type DaggerPartProps = ToonMaterialProps & {
    geometry: BufferGeometry;
    position?: Vector3Tuple;
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
    map,
    emissive,
    emissiveMap
}: ToonMaterialProps) => (
    <meshToonMaterial
        ref={ref}
        color={color}
        map={map}
        gradientMap={TOON_GRADIENT_MAP}
        emissive={emissive}
        emissiveMap={emissiveMap}
        emissiveIntensity={0}
        onBeforeCompile={injectRimLight(rimColor)}
    />
);

/** Light dark outline shared by every dagger part; place it inside the mesh */
export const DaggerOutline = () => <Outlines thickness={OUTLINE.thickness} color={OUTLINE.color} />;

/** One outlined toon mesh of a dagger (blade, guard, handle, pommel...) */
export const DaggerPart = ({ geometry, position, ...materialProps }: DaggerPartProps) => (
    <mesh geometry={geometry} position={position}>
        <ToonMaterial {...materialProps} />
        <DaggerOutline />
    </mesh>
);

export type LeatherGripSpec = LeatherWrapSpec & {
    /** Bottom of the grip, above the guard */
    startY: number;
    radialSegments: number;
};

type LeatherGripProps = {
    spec: LeatherGripSpec;
    color: ColorRepresentation;
    rimColor: ColorRepresentation;
    /** Two straps winding opposite ways, for a criss-cross binding */
    isCrossed?: boolean;
    /** Shows between loose turns, like a bare tang; defaults to the leather colour */
    coreColor?: ColorRepresentation;
};

/** Grip core with a leather strap wound around it */
export const LeatherGrip = ({
    spec,
    color,
    rimColor,
    isCrossed = false,
    coreColor = color
}: LeatherGripProps) => {
    const { coreGeometry, wrapGeometries, leatherMap } = useMemo(
        () => ({
            coreGeometry: new CylinderGeometry(
                spec.coreRadius,
                spec.coreRadius,
                spec.length,
                spec.radialSegments
            ).translate(0, spec.length / 2, 0),
            wrapGeometries: (isCrossed ? [spec.turns, -spec.turns] : [spec.turns]).map((turns) =>
                createLeatherWrapGeometry({ ...spec, turns })
            ),
            leatherMap: createLeatherTexture(spec.turns)
        }),
        [spec, isCrossed]
    );

    return (
        <group position={[0, spec.startY, 0]}>
            <DaggerPart geometry={coreGeometry} color={coreColor} rimColor={rimColor} />
            {wrapGeometries.map((geometry) => (
                <DaggerPart
                    key={geometry.uuid}
                    geometry={geometry}
                    color={color}
                    map={leatherMap}
                    rimColor={rimColor}
                />
            ))}
        </group>
    );
};

/** Invisible pointer target; render it at ground level. Only this mesh has handlers, so only it is raycast */
export const DaggerHitShape = ({ height, ...handlers }: DaggerHitShapeProps) => (
    <mesh position={[0, height / 2, 0]} {...handlers}>
        <boxGeometry args={[HIT_SHAPE.width, height, HIT_SHAPE.depth]} />
        <meshBasicMaterial visible={false} />
    </mesh>
);

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

export const DaggerLabel = ({ text, isHighlighted }: DaggerLabelProps) => {
    // Html mounts into the event source (#root, which scrolls) unless told otherwise: keep it on the fixed canvas
    const canvasContainer = useThree((state) => state.gl.domElement.parentElement);
    const portal = useMemo(() => ({ current: canvasContainer! }), [canvasContainer]);

    return (
        <Html
            position={[0, LABEL_POSITION_Y, 0]}
            center
            zIndexRange={[1, 1]}
            portal={portal}
            className={cn(
                styles['dagger-label'],
                isHighlighted && styles['dagger-label-highlighted']
            )}
        >
            {text}
        </Html>
    );
};
