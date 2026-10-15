import type { Ref } from 'react';
import { Html } from '@react-three/drei';
import type { MeshStandardMaterial } from 'three';

import {
    BLADE,
    CROSS_GUARD,
    HANDLE,
    LABEL_POSITION_Y,
    POMMEL
} from '@/components/Dagger/Dagger.constants';
import { cn } from '@/utils/cn';

import styles from '@/components/Dagger/Dagger.module.css';

type BladeProps = {
    color: string;
    glowColor: string;
    materialRef: Ref<MeshStandardMaterial>;
};

type DaggerPartProps = {
    color: string;
};

type DaggerLabelProps = {
    text: string;
    isHighlighted: boolean;
};

/**
 * Tip at y = -BLADE.length, base at the guard (y = 0)
 */
export const Blade = ({ color, glowColor, materialRef }: BladeProps) => (
    <mesh position={[0, -BLADE.length / 2, 0]}>
        <cylinderGeometry
            args={[BLADE.baseRadius, BLADE.tipRadius, BLADE.length, BLADE.radialSegments]}
        />
        <meshStandardMaterial
            ref={materialRef}
            color={color}
            metalness={BLADE.metalness}
            roughness={BLADE.roughness}
            emissive={glowColor}
            emissiveIntensity={0}
        />
    </mesh>
);

export const CrossGuard = ({ color }: DaggerPartProps) => (
    <mesh>
        <boxGeometry args={[CROSS_GUARD.width, CROSS_GUARD.height, CROSS_GUARD.depth]} />
        <meshStandardMaterial
            color={color}
            metalness={CROSS_GUARD.metalness}
            roughness={CROSS_GUARD.roughness}
        />
    </mesh>
);

export const Handle = ({ color }: DaggerPartProps) => (
    <mesh position={[0, HANDLE.length / 2, 0]}>
        <cylinderGeometry
            args={[HANDLE.topRadius, HANDLE.bottomRadius, HANDLE.length, HANDLE.radialSegments]}
        />
        <meshStandardMaterial
            color={color}
            metalness={HANDLE.metalness}
            roughness={HANDLE.roughness}
        />
    </mesh>
);

export const Pommel = ({ color }: DaggerPartProps) => (
    <mesh position={[0, POMMEL.positionY, 0]}>
        <sphereGeometry args={[POMMEL.radius, POMMEL.widthSegments, POMMEL.heightSegments]} />
        <meshStandardMaterial
            color={color}
            metalness={POMMEL.metalness}
            roughness={POMMEL.roughness}
        />
    </mesh>
);

export const DaggerLabel = ({ text, isHighlighted }: DaggerLabelProps) => (
    <Html
        position={[0, LABEL_POSITION_Y, 0]}
        center
        zIndexRange={[1, 1]}
        className={cn(styles['dagger-label'], isHighlighted && styles['dagger-label-highlighted'])}
    >
        {text}
    </Html>
);
