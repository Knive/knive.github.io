import type { Ref } from 'react';
import type { MeshToonMaterial } from 'three';

import {
    DaggerOutline,
    ToonMaterial,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { createBarGeometry, createWrappedHandleGeometry } from '@/components/Dagger/Dagger.helpers';
import {
    EXPERIENCE_HANDLE,
    GUARD_BAR,
    GUARD_GEAR,
    POMMEL_GEAR
} from '@/components/ExperienceDagger/ExperienceDagger.constants';
import {
    createBladeGeometry,
    createGearGeometry,
    createRuneTexture
} from '@/components/ExperienceDagger/ExperienceDagger.helpers';

// Built once: there is a single Experience dagger
const BLADE_GEOMETRY = createBladeGeometry();
const GUARD_BAR_GEOMETRY = createBarGeometry(GUARD_BAR);
const GUARD_GEAR_GEOMETRY = createGearGeometry(GUARD_GEAR);
const HANDLE_GEOMETRY = createWrappedHandleGeometry(EXPERIENCE_HANDLE);
const POMMEL_GEOMETRY = createGearGeometry(POMMEL_GEAR);
const RUNE_TEXTURE_MAP = createRuneTexture();
const GUARD_GEAR_POSITION_X = GUARD_BAR.halfWidth + GUARD_GEAR.innerRadius / 2;

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
