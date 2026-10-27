import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
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

export const ExperienceDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE_GEOMETRY}
            ref={glowMaterialRef}
            color={config.bladeColor}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={RUNE_TEXTURE_MAP}
        />

        <DaggerPart
            geometry={GUARD_BAR_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        {[-GUARD_GEAR_POSITION_X, GUARD_GEAR_POSITION_X].map((positionX) => (
            <DaggerPart
                key={positionX}
                geometry={GUARD_GEAR_GEOMETRY}
                position={[positionX, 0, 0]}
                color={config.guardColor}
                rimColor={config.glowColor}
            />
        ))}

        <DaggerPart
            geometry={HANDLE_GEOMETRY}
            color={config.handleColor}
            rimColor={config.glowColor}
        />

        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, POMMEL_GEAR.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
