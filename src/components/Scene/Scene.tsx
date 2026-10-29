import { Suspense } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

import { BladeField } from '@/components/BladeField/BladeField';
import { Dagger } from '@/components/Dagger/Dagger';
import { Floor } from '@/components/Floor/Floor';
import { GlowLight } from '@/components/Glow/Glow';
import { IntroCamera } from '@/components/IntroCamera/IntroCamera';
import { IntroFx } from '@/components/IntroFx/IntroFx';
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
            <PerformanceMonitor
                flipflops={PERFORMANCE_MONITOR_FLIPFLOPS}
                onIncline={handleIncline}
                onDecline={handleDecline}
                onFallback={handleFallback}
            />
            {/* First, so the daggers anchor to this frame's camera */}
            <ScrollCamera isIntroPlaying={isIntroPlaying} />
            {import.meta.env.DEV && <SceneDevTools />}
            <Atmosphere />
            <Sky />
            {/* Its own boundary: the scene renders while the moon texture loads */}
            <Suspense fallback={null}>
                <Moon
                    haloOpacity={settings.moonHaloOpacity}
                    streakCount={settings.moonStreakCount}
                />
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

            {settings.hasBloom && (
                <EffectComposer enabled={settings.hasBloom}>
                    <Bloom
                        mipmapBlur
                        luminanceThreshold={BLOOM.luminanceThreshold}
                        intensity={BLOOM.intensity}
                    />
                </EffectComposer>
            )}
        </Canvas>
    );
};
