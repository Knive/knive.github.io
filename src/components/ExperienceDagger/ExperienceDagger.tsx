import type { Ref } from 'react';
import { Outlines } from '@react-three/drei';
import type { MeshToonMaterial } from 'three';

import { ToonMaterial, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import {
    GUARD_BAR,
    GUARD_GEAR,
    OUTLINE,
    POMMEL_GEAR
} from '@/components/ExperienceDagger/ExperienceDagger.constants';
import {
    createBladeGeometry,
    createGearGeometry,
    createGuardBarGeometry,
    createHandleGeometry,
    createRuneTexture
} from '@/components/ExperienceDagger/ExperienceDagger.utils';

// Built once: there is a single Experience dagger
const BLADE_GEOMETRY = createBladeGeometry();
const GUARD_BAR_GEOMETRY = createGuardBarGeometry();
const GUARD_GEAR_GEOMETRY = createGearGeometry(GUARD_GEAR);
const HANDLE_GEOMETRY = createHandleGeometry();
const POMMEL_GEOMETRY = createGearGeometry(POMMEL_GEAR);
const RUNE_TEXTURE_MAP = createRuneTexture();
const GUARD_GEAR_POSITION_X = GUARD_BAR.halfWidth + GUARD_GEAR.innerRadius / 2;

const DaggerOutline = () => <Outlines thickness={OUTLINE.thickness} color={OUTLINE.color} />;

export const ExperienceDaggerParts = ({ config, bladeMaterialRef }: DaggerPartsProps) => (
    <>
        <mesh geometry={BLADE_GEOMETRY}>
            <ToonMaterial
                ref={bladeMaterialRef as Ref<MeshToonMaterial>}
                color={config.bladeColor}
                rimColor={config.glowColor}
                emissive={config.glowColor}
                emissiveMap={RUNE_TEXTURE_MAP}
            />
            <DaggerOutline />
        </mesh>

        <mesh geometry={GUARD_BAR_GEOMETRY}>
            <ToonMaterial color={config.guardColor} rimColor={config.glowColor} />
            <DaggerOutline />
        </mesh>
        {[-GUARD_GEAR_POSITION_X, GUARD_GEAR_POSITION_X].map((positionX) => (
            <mesh key={positionX} geometry={GUARD_GEAR_GEOMETRY} position={[positionX, 0, 0]}>
                <ToonMaterial color={config.guardColor} rimColor={config.glowColor} />
                <DaggerOutline />
            </mesh>
        ))}

        <mesh geometry={HANDLE_GEOMETRY}>
            <ToonMaterial color={config.handleColor} rimColor={config.glowColor} />
            <DaggerOutline />
        </mesh>

        <mesh geometry={POMMEL_GEOMETRY} position={[0, POMMEL_GEAR.positionY, 0]}>
            <ToonMaterial color={config.pommelColor} rimColor={config.glowColor} />
            <DaggerOutline />
        </mesh>
    </>
);
