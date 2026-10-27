import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

import { Dagger } from '@/components/Dagger/Dagger';
import { Floor } from '@/components/Floor/Floor';
import { GlowLight } from '@/components/Glow/Glow';
import { Atmosphere, Lights } from '@/components/Scene/Scene.components';
import {
    BLOOM,
    CAMERA,
    CRACK_ORIGINS_X,
    DAGGERS,
    PERFORMANCE_MONITOR_FLIPFLOPS
} from '@/components/Scene/Scene.constants';
import { useQualityTier } from '@/components/Scene/useQualityTier';
import { TreeLine } from '@/components/TreeLine/TreeLine';

const handleCreated = ({ camera }: RootState) => {
    camera.lookAt(...CAMERA.lookAt);
};

export const Scene = () => {
    const { settings, handleIncline, handleDecline, handleFallback } = useQualityTier();

    return (
        <Canvas
            camera={{ position: CAMERA.position, fov: CAMERA.fov }}
            onCreated={handleCreated}
            dpr={settings.dpr}
        >
            <PerformanceMonitor
                flipflops={PERFORMANCE_MONITOR_FLIPFLOPS}
                onIncline={handleIncline}
                onDecline={handleDecline}
                onFallback={handleFallback}
            />
            <Atmosphere />
            <Lights />
            <GlowLight daggers={DAGGERS} />

            {DAGGERS.map((config) => (
                <Dagger key={config.sectionId} config={config} />
            ))}

            <TreeLine />
            <Floor isReflective={settings.isFloorReflective} crackOriginsX={CRACK_ORIGINS_X} />

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
