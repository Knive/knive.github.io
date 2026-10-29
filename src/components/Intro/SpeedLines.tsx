import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, type ShaderMaterial } from 'three';

import { CONVERGENCE_SECONDS, SPEED_LINES } from '@/components/Intro/Intro.constants';
import { getIntroTime } from '@/components/Intro/introStore';

// The quad's corners are already in clip space: it covers the view whatever the camera does
const VERTEX_SHADER = `
    varying vec2 viewPoint;
    uniform float aspect;
    void main() {
        viewPoint = position.xy * vec2(aspect, 1.0) * 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    varying vec2 viewPoint;
    uniform float time;
    uniform float strength;
    uniform float lanes;
    uniform float density;
    uniform float thickness;
    uniform float speed;
    uniform float streakLength;
    uniform float innerRadius;

    float hash(float value) {
        return fract(sin(value * 127.1) * 43758.5453);
    }

    void main() {
        float radius = length(viewPoint);
        float lanePosition = (atan(viewPoint.y, viewPoint.x) / 6.2831853 + 0.5) * lanes;
        float lane = floor(lanePosition);
        float laneSeed = hash(lane);
        if (laneSeed > density) discard;

        // Thin line in the middle of its lane, thinner towards the centre
        float laneOffset = abs(fract(lanePosition) - 0.5);
        float line = 1.0 - smoothstep(0.0, thickness * radius, laneOffset);

        // A streak racing outwards along the lane, each lane at its own pace and offset
        float travel = fract(hash(lane + 7.0) + time * speed * (0.6 + laneSeed) - radius);
        float streak = step(travel, streakLength) * (travel / streakLength);

        float centreFade = smoothstep(innerRadius, innerRadius * 2.0, radius);
        gl_FragColor = vec4(vec3(line * streak * centreFade * strength), 1.0);
    }
`;

/** Speed lines over the view during the flight; they vanish at the convergence */
export const SpeedLines = () => {
    const materialRef = useRef<ShaderMaterial>(null);
    // Initial values only: the material keeps its own copy, updated through the ref
    const initialUniforms = useMemo(
        () => ({
            aspect: { value: 1 },
            time: { value: 0 },
            strength: { value: 0 },
            lanes: { value: SPEED_LINES.lanes },
            density: { value: SPEED_LINES.density },
            thickness: { value: SPEED_LINES.thickness },
            speed: { value: SPEED_LINES.speed },
            streakLength: { value: SPEED_LINES.length },
            innerRadius: { value: SPEED_LINES.innerRadius }
        }),
        []
    );

    useFrame(({ size }) => {
        const uniforms = materialRef.current?.uniforms;
        if (!uniforms) return;
        const seconds = getIntroTime();
        const fadeIn = MathUtils.smoothstep(
            seconds,
            SPEED_LINES.startSeconds,
            SPEED_LINES.startSeconds + SPEED_LINES.fadeSeconds
        );
        const fadeOut =
            1 -
            MathUtils.smoothstep(
                seconds,
                CONVERGENCE_SECONDS - SPEED_LINES.fadeSeconds,
                CONVERGENCE_SECONDS
            );

        uniforms.aspect.value = size.width / size.height;
        uniforms.time.value = seconds;
        uniforms.strength.value = SPEED_LINES.strength * fadeIn * fadeOut;
    });

    return (
        <mesh frustumCulled={false} renderOrder={SPEED_LINES.renderOrder}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={initialUniforms}
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
                blending={AdditiveBlending}
                transparent
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
};
