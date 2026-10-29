import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, Vector2, Vector3, type ShaderMaterial } from 'three';

import { BEATS, FLOOD } from '@/components/Intro/Intro.constants';
import { getIntroPaths, getIntroTime } from '@/components/Intro/introStore';
import { IGNITION_FLARE } from '@/components/IntroFx/IntroFx.constants';
import { getFlood, getIgnitionFlare } from '@/components/IntroFx/IntroFx.helpers';
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

const FLARE_FRAGMENT_SHADER = `
    varying vec2 viewPoint;
    uniform vec2 center;
    uniform vec3 tint;
    uniform float intensity;
    uniform float scale;
    void main() {
        vec2 offset = (viewPoint - center) / scale;
        vec2 distance = abs(offset);
        float core = exp(-dot(offset, offset) / ${(IGNITION_FLARE.coreRadius ** 2).toFixed(6)});
        float cross =
            exp(-distance.x / ${IGNITION_FLARE.crossWidth.toFixed(4)} - distance.y / ${IGNITION_FLARE.crossLength.toFixed(4)}) +
            exp(-distance.y / ${IGNITION_FLARE.crossWidth.toFixed(4)} - distance.x / ${IGNITION_FLARE.crossLength.toFixed(4)});
        float streak = exp(-distance.y / ${IGNITION_FLARE.streakWidth.toFixed(4)} - distance.x / ${IGNITION_FLARE.streakLength.toFixed(4)});
        // White-hot where they overlap, the dagger's colour on the spikes and streak
        vec3 color = vec3(core) + tint * (cross + streak);
        gl_FragColor = vec4(color * intensity, 1.0);
    }
`;

const FIRST_HEAD_CAM_DAGGER = BEATS.find(({ daggerId }) => daggerId)?.daggerId ?? '';
const flareHead = new Vector3();

/** The ignition's point of light: a cross flare and an anamorphic streak on the first dagger's head */
export const IgnitionFlare = ({ glowColors }: GlowColorsProps) => {
    const materialRef = useRef<ShaderMaterial>(null);
    const initialUniforms = useMemo(
        () => ({
            aspect: { value: 1 },
            center: { value: new Vector2() },
            tint: { value: new Color(glowColors[FIRST_HEAD_CAM_DAGGER]) },
            intensity: { value: 0 },
            scale: { value: 1 }
        }),
        [glowColors]
    );

    useFrame(({ camera, size }) => {
        const uniforms = materialRef.current?.uniforms;
        const path = getIntroPaths().find(({ sectionId }) => sectionId === FIRST_HEAD_CAM_DAGGER);
        if (!uniforms || !path) return;
        const seconds = getIntroTime();
        const { intensity, scale } = getIgnitionFlare(seconds);
        uniforms.intensity.value = intensity;
        if (intensity === 0) return;

        const aspect = size.width / size.height;
        getPathHead(path, seconds, flareHead).project(camera);
        uniforms.aspect.value = aspect;
        uniforms.center.value.set(flareHead.x * aspect * 0.5, flareHead.y * 0.5);
        uniforms.scale.value = scale;
    });

    return (
        <mesh frustumCulled={false} renderOrder={IGNITION_FLARE.renderOrder}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={initialUniforms}
                vertexShader={FLOOD_VERTEX_SHADER}
                fragmentShader={FLARE_FRAGMENT_SHADER}
                blending={AdditiveBlending}
                transparent
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
};
