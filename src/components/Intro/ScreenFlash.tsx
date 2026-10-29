import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color } from 'three';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { LANDING_SEQUENCE, SCREEN_FLASH } from '@/components/Intro/Intro.constants';
import {
    getLandingSeconds,
    getShowcaseIndex,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';
import { getIntroTime } from '@/components/Intro/introStore';

type ScreenFlashProps = {
    daggers: Pick<DaggerConfig, 'sectionId' | 'glowColor'>[];
};

// The quad's corners are already in clip space: it covers the view whatever the camera does
const VERTEX_SHADER = `
    void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;
const FRAGMENT_SHADER = `
    uniform vec3 flashColor;
    void main() {
        gl_FragColor = vec4(flashColor, 1.0);
    }
`;

const FINAL_COLOR = new Color(SCREEN_FLASH.finalColor);

const addScaled = (target: Color, color: Color, scale: number) =>
    target.setRGB(
        target.r + color.r * scale,
        target.g + color.g * scale,
        target.b + color.b * scale
    );

/** Exponential decay after an event, 0 before it */
const decayAfter = (flightSeconds: number, eventSeconds: number, decaySeconds: number) =>
    flightSeconds < eventSeconds ? 0 : Math.exp(-(flightSeconds - eventSeconds) / decaySeconds);

/**
 * Light added over the whole view during the intro: a faint tint in the colour of the dagger
 * the camera showcases, a flash in each dagger's colour on impact, and a white flash on the last one.
 */
export const ScreenFlash = ({ daggers }: ScreenFlashProps) => {
    const uniforms = useMemo(() => ({ flashColor: { value: new Color(0, 0, 0) } }), []);
    const impacts = useMemo(
        () =>
            daggers.map(({ sectionId, glowColor }) => ({
                color: new Color(glowColor),
                landingSeconds: getLandingSeconds(sectionId)
            })),
        [daggers]
    );
    const finalLandingSeconds = getLandingSeconds(LANDING_SEQUENCE[LANDING_SEQUENCE.length - 1]);

    useFrame(() => {
        const flashColor = uniforms.flashColor.value.setRGB(0, 0, 0);
        const flightSeconds = toFlightSeconds(getIntroTime());

        const showcaseIndex = getShowcaseIndex(flightSeconds);
        if (showcaseIndex !== null) {
            addScaled(flashColor, impacts[showcaseIndex].color, SCREEN_FLASH.tintStrength);
        }
        for (const { color, landingSeconds } of impacts) {
            const flash = decayAfter(
                flightSeconds,
                landingSeconds,
                SCREEN_FLASH.impactDecaySeconds
            );
            addScaled(flashColor, color, flash * SCREEN_FLASH.impactPeak);
        }
        const finalFlash = decayAfter(
            flightSeconds,
            finalLandingSeconds,
            SCREEN_FLASH.finalDecaySeconds
        );
        addScaled(flashColor, FINAL_COLOR, finalFlash * SCREEN_FLASH.finalPeak);
    });

    return (
        <mesh frustumCulled={false} renderOrder={SCREEN_FLASH.renderOrder}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                uniforms={uniforms}
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
