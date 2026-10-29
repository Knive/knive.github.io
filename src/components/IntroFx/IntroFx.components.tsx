import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, Vector3, type ShaderMaterial, type Sprite } from 'three';

import { createSoftDotTexture } from '@/components/Glow/Glow.helpers';
import { FAN_END_SECONDS, FLOOD } from '@/components/Intro/Intro.constants';
import { getIntroPaths, getIntroTime } from '@/components/Intro/introStore';
import { HEAD_GLOW } from '@/components/IntroFx/IntroFx.constants';
import { getFlood } from '@/components/IntroFx/IntroFx.helpers';
import { getPathHead } from '@/components/IntroPaths/IntroPaths.helpers';

type GlowColorsProps = {
    /** Glow colour by dagger id */
    glowColors: Record<string, string>;
};

// The quad's corners are already in clip space: it covers the view whatever the camera does
const FLOOD_VERTEX_SHADER = `
    varying vec2 viewPoint;
    uniform float aspect;
    void main() {
        viewPoint = position.xy * vec2(aspect, 1.0) * 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

const FLOOD_FRAGMENT_SHADER = `
    varying vec2 viewPoint;
    uniform vec3 floodColor;
    uniform float flashAlpha;
    uniform float sustainAlpha;
    uniform float clearRadius;
    void main() {
        // The lasting grade fills the frame from its edges, leaving the centre clearer
        float edge = smoothstep(clearRadius, clearRadius + 0.55, length(viewPoint));
        gl_FragColor = vec4(floodColor, max(flashAlpha, sustainAlpha * edge));
    }
`;

/** Saturated colour over the whole frame: cut flashes, the beat's grade, the ignition dark, the whiteout */
export const ColourFlood = ({ glowColors }: GlowColorsProps) => {
    const materialRef = useRef<ShaderMaterial>(null);
    // Initial values only: the material keeps its own copy, updated through the ref
    const initialUniforms = useMemo(
        () => ({
            aspect: { value: 1 },
            floodColor: { value: new Color() },
            flashAlpha: { value: 0 },
            sustainAlpha: { value: 0 },
            clearRadius: { value: 0 }
        }),
        []
    );

    useFrame(({ size }) => {
        const uniforms = materialRef.current?.uniforms;
        if (!uniforms) return;
        const flood = getFlood(getIntroTime(), glowColors);
        uniforms.aspect.value = size.width / size.height;
        uniforms.floodColor.value.set(flood.color);
        uniforms.flashAlpha.value = flood.flashAlpha;
        uniforms.sustainAlpha.value = flood.sustainAlpha;
        uniforms.clearRadius.value = flood.clearRadius;
    });

    return (
        <mesh frustumCulled={false} renderOrder={FLOOD.renderOrder}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={initialUniforms}
                vertexShader={FLOOD_VERTEX_SHADER}
                fragmentShader={FLOOD_FRAGMENT_SHADER}
                transparent
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
};

const HEAD_TEXTURE = createSoftDotTexture(HEAD_GLOW.textureSize);
const head = new Vector3();

/** Placeholder heads: a glowing dot in each dagger's colour at its blade tip, until it lands */
export const HeadGlows = ({ glowColors }: GlowColorsProps) => {
    const spriteRefs = useRef<(Sprite | null)[]>([]);
    const paths = getIntroPaths();
    const colors = useMemo(
        () =>
            paths.map(({ sectionId }) =>
                new Color(glowColors[sectionId]).multiplyScalar(HEAD_GLOW.brightness)
            ),
        [paths, glowColors]
    );

    useFrame(() => {
        const seconds = getIntroTime();
        paths.forEach((path, index) => {
            const sprite = spriteRefs.current[index];
            if (!sprite) return;
            sprite.visible = seconds < FAN_END_SECONDS;
            sprite.position.copy(getPathHead(path, seconds, head));
        });
    });

    return (
        <>
            {paths.map(({ sectionId }, index) => (
                <sprite
                    key={sectionId}
                    ref={(sprite) => {
                        spriteRefs.current[index] = sprite;
                    }}
                    scale={HEAD_GLOW.sizeMetres}
                >
                    <spriteMaterial
                        map={HEAD_TEXTURE}
                        color={colors[index]}
                        blending={AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </sprite>
            ))}
        </>
    );
};
