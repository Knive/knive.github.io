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
import { SpeedLines } from '@/components/Intro/SpeedLines';
import { Atmosphere, Lights } from '@/components/Scene/Scene.components';
import {
    BLOOM,
    CAMERA,
    CRACK_LAYOUT,
    DAGGERS,
    PERFORMANCE_MONITOR_FLIPFLOPS
} from '@/components/Scene/Scene.constants';
import { Rocks } from '@/components/Rocks/Rocks';
import { useQualityTier } from '@/components/Scene/useQualityTier';
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
            <Atmosphere />
            <Sky />
            <Lights />
            <GlowLight daggers={DAGGERS} />
            {isIntroPlaying && (
                <>
                    <IntroCamera onIntroEnd={onIntroEnd} />
                    <SpeedLines />
                    <IntroFx daggers={DAGGERS} />
                </>
            )}

            {DAGGERS.map((config) => (
                <Dagger
                    key={config.sectionId}
                    config={config}
                    cracks={CRACK_LAYOUT.byDagger[config.sectionId]}
                    isIntroPlaying={isIntroPlaying}
                />
            ))}

            <TreeLine />
            <Rocks />
            <BladeField />
            <Vegetation />
            <Floor crackLayout={CRACK_LAYOUT} />

            {settings.hasBloom && (
                <EffectComposer>
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
