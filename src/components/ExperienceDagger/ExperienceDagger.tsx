import { CylinderGeometry } from 'three';

import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import {
    createLeatherTexture,
    createLeatherWrapGeometry,
    createOutlinedPart
} from '@/components/Dagger/Dagger.helpers';
import {
    EXPERIENCE_GRIP,
    GRIP_FERRULE,
    GUARD_BEVEL,
    GUARD_CRYSTAL,
    GUARD_GEAR,
    GUARD_OUTLINE,
    HEX_POMMEL
} from '@/components/ExperienceDagger/ExperienceDagger.constants';
import {
    createBlade,
    createCrystalGeometry,
    createGearGeometry,
    createHexPommelGeometry
} from '@/components/ExperienceDagger/ExperienceDagger.helpers';

// Built once: there is a single Experience dagger
const BLADE = createBlade();
const GUARD_GEOMETRY = createOutlinedPart(GUARD_OUTLINE, GUARD_BEVEL).geometry;
const GEAR_GEOMETRY = createGearGeometry(GUARD_GEAR);
const CRYSTAL_GEOMETRY = createCrystalGeometry();
const GRIP_CORE_GEOMETRY = new CylinderGeometry(
    EXPERIENCE_GRIP.coreRadius,
    EXPERIENCE_GRIP.coreRadius,
    EXPERIENCE_GRIP.length,
    EXPERIENCE_GRIP.radialSegments
);
const GRIP_WRAP_GEOMETRY = createLeatherWrapGeometry(EXPERIENCE_GRIP);
const LEATHER_MAP = createLeatherTexture(EXPERIENCE_GRIP.turns);
const FERRULE_GEOMETRY = new CylinderGeometry(
    GRIP_FERRULE.radius,
    GRIP_FERRULE.radius,
    GRIP_FERRULE.height,
    GRIP_FERRULE.radialSegments
);
const POMMEL_GEOMETRY = createHexPommelGeometry();

export const ExperienceDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE.geometry}
            ref={glowMaterialRef}
            color={config.bladeColor}
            map={BLADE.paintMap}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={BLADE.runeMap}
        />

        <DaggerPart
            geometry={GUARD_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={GEAR_GEOMETRY}
            position={[GUARD_GEAR.positionX, 0, 0]}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={CRYSTAL_GEOMETRY}
            position={[GUARD_GEAR.positionX, 0, 0]}
            ref={glowMaterialRef}
            color={GUARD_CRYSTAL.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />

        <group position={[0, EXPERIENCE_GRIP.startY, 0]}>
            <DaggerPart
                geometry={GRIP_CORE_GEOMETRY}
                position={[0, EXPERIENCE_GRIP.length / 2, 0]}
                color={config.handleColor}
                rimColor={config.glowColor}
            />
            <DaggerPart
                geometry={GRIP_WRAP_GEOMETRY}
                color={config.handleColor}
                map={LEATHER_MAP}
                rimColor={config.glowColor}
            />
        </group>
        {GRIP_FERRULE.positionsY.map((positionY) => (
            <DaggerPart
                key={positionY}
                geometry={FERRULE_GEOMETRY}
                position={[0, positionY, 0]}
                color={config.guardColor}
                rimColor={config.glowColor}
            />
        ))}

        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, HEX_POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
