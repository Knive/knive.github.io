import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Dagger } from '@/components/Dagger/Dagger';
import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { PlaceholderDaggerParts } from '@/components/Dagger/Dagger.components';
import { ExperienceDaggerParts } from '@/components/ExperienceDagger/ExperienceDagger';
import { Lights } from '@/components/Scene/Scene.components';

const DAGGER_DROP_INTERVAL_SECONDS = 0.5;

/** Only HDR emissive (the runes) exceeds 1, so nothing else blooms */
const BLOOM = {
    luminanceThreshold: 1,
    intensity: 1.2
} as const;

const DAGGERS: DaggerConfig[] = [
    {
        sectionId: 'experience',
        label: 'Experience',
        positionX: -2.6,
        bladeColor: '#B0B8A4',
        guardColor: '#B08D57',
        handleColor: '#4A3020',
        pommelColor: '#B08D57',
        glowColor: '#C9A24A',
        Parts: ExperienceDaggerParts
    },
    {
        sectionId: 'skills',
        label: 'Skills',
        positionX: -1.3,
        bladeColor: '#9AAAB8',
        guardColor: '#252E3C',
        handleColor: '#161E2A',
        pommelColor: '#303848',
        glowColor: '#3A6FAA',
        Parts: PlaceholderDaggerParts
    },
    {
        sectionId: 'projects',
        label: 'Projects',
        positionX: 0,
        bladeColor: '#C4CED6',
        guardColor: '#4A4438',
        handleColor: '#2A2420',
        pommelColor: '#5A5048',
        glowColor: '#C9813A',
        Parts: PlaceholderDaggerParts
    },
    {
        sectionId: 'about',
        label: 'About',
        positionX: 1.3,
        bladeColor: '#A8A898',
        guardColor: '#3A3828',
        handleColor: '#5C4830',
        pommelColor: '#C4B870',
        glowColor: '#98A83A',
        Parts: PlaceholderDaggerParts
    },
    {
        sectionId: 'contact',
        label: 'Contact',
        positionX: 2.6,
        bladeColor: '#8090A0',
        guardColor: '#28283A',
        handleColor: '#1A1828',
        pommelColor: '#383858',
        glowColor: '#6855B0',
        Parts: PlaceholderDaggerParts
    }
];

const handleCreated = ({ camera }: RootState) => {
    camera.lookAt(0, 0.4, 0);
};

export const Scene = () => {
    return (
        <Canvas
            camera={{ position: [0, 1.5, 7.5], fov: 50 }}
            onCreated={handleCreated}
            dpr={[1, 2]}
        >
            <Lights />

            {DAGGERS.map((config, index) => (
                <Dagger
                    key={config.sectionId}
                    config={config}
                    fallDelaySeconds={index * DAGGER_DROP_INTERVAL_SECONDS}
                />
            ))}

            {/* Dark stone floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#080B10" roughness={0.96} metalness={0.04} />
            </mesh>

            <EffectComposer>
                <Bloom
                    mipmapBlur
                    luminanceThreshold={BLOOM.luminanceThreshold}
                    intensity={BLOOM.intensity}
                />
            </EffectComposer>
        </Canvas>
    );
};
