import { Suspense } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';

import { BladeField } from '@/components/BladeField/BladeField';
import { Dagger } from '@/components/Dagger/Dagger';
import { Floor } from '@/components/Floor/Floor';
import { GlowLight } from '@/components/Glow/Glow';
import { IntroCamera } from '@/components/IntroCamera/IntroCamera';
import { IntroFx } from '@/components/IntroFx/IntroFx';
import { useIntroDevTools } from '@/components/Intro/useIntroDevTools';
import { Mist } from '@/components/Mist/Mist';
import { Moon } from '@/components/Moon/Moon';
import { SpeedLines } from '@/components/Intro/SpeedLines';
import {
    Atmosphere,
    GroundSlide,
    Lights,
    SceneDevTools,
    Scenery
} from '@/components/Scene/Scene.components';
import {
    BLOOM,
    CAMERA,
    CRACK_LAYOUT,
    DAGGERS,
    LINEAR_TONE_MAPPING_MODE,
    PERFORMANCE_MONITOR_FLIPFLOPS
} from '@/components/Scene/Scene.constants';
import { Rocks } from '@/components/Rocks/Rocks';
import { useQualityTier } from '@/components/Scene/useQualityTier';
import { ScrollCamera } from '@/components/ScrollCamera/ScrollCamera';
import { Sky } from '@/components/Sky/Sky';
import { TreeLine } from '@/components/TreeLine/TreeLine';
import { Vegetation } from '@/components/Vegetation/Vegetation';

const handleCreated = ({ camera }: RootState) => {
    camera.lookAt(...CAMERA.lookAt);
};

type SceneProps = {
    isIntroPlaying: boolean;
    onIntroEnd: () => void;
};

export const Scene = ({ isIntroPlaying, onIntroEnd }: SceneProps) => {
    const { settings, handleIncline, handleDecline, handleFallback } = useQualityTier();
    // Here, not in useIntro: it pulls in the intro paths and daggers, which belong in the scene chunk
    useIntroDevTools();

    return (
        <Canvas
            flat
            camera={{ position: CAMERA.position, fov: CAMERA.fov }}
            onCreated={handleCreated}
            dpr={settings.dpr}
            // The page's DOM sits over the fixed canvas: listen on the root so daggers still get pointer events
            eventSource={document.getElementById('root') ?? undefined}
            eventPrefix="client"
        >
            {/* After the intro: its heavy frames would drop the tier for the whole visit */}
            {!isIntroPlaying && (
                <PerformanceMonitor
                    flipflops={PERFORMANCE_MONITOR_FLIPFLOPS}
                    onIncline={handleIncline}
                    onDecline={handleDecline}
                    onFallback={handleFallback}
                />
            )}
            {/* First, so the daggers anchor to this frame's camera */}
            <ScrollCamera isIntroPlaying={isIntroPlaying} />
            {import.meta.env.DEV && <SceneDevTools />}
            <Atmosphere />
            <Sky />
            {/* Its own boundary: the scene renders while the moon texture loads */}
            <Suspense fallback={null}>
                <Moon />
            </Suspense>
            <Lights />
            <GlowLight daggers={DAGGERS} />
            {isIntroPlaying && (
                <>
                    <IntroCamera onIntroEnd={onIntroEnd} />
                    <SpeedLines />
                    <IntroFx daggers={DAGGERS} />
                </>
            )}

            <GroundSlide>
                {DAGGERS.map((config) => (
                    <Dagger
                        key={config.sectionId}
                        config={config}
                        cracks={CRACK_LAYOUT.byDagger[config.sectionId]}
                        isIntroPlaying={isIntroPlaying}
                    />
                ))}

                <Scenery>
                    <TreeLine />
                    <Rocks />
                    <BladeField />
                    <Vegetation />
                    <Floor crackLayout={CRACK_LAYOUT} />
                    <Mist />
                </Scenery>
            </GroundSlide>

            {/* On every tier: unmounting it changes how additive sprites blend (the moon halo fades) */}
            <EffectComposer>
                {settings.hasBloom ? (
                    <Bloom
                        mipmapBlur
                        luminanceThreshold={BLOOM.luminanceThreshold}
                        intensity={BLOOM.intensity}
                    />
                ) : (
                    // Cheap pass-through: the composer skips its pipeline without an effect
                    <ToneMapping mode={LINEAR_TONE_MAPPING_MODE} />
                )}
            </EffectComposer>
        </Canvas>
    );
};
