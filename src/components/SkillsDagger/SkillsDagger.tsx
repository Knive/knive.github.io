import {
    DaggerPart,
    LeatherGrip,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { createOutlinedPart } from '@/components/Dagger/Dagger.helpers';
import {
    GUARD_BEVEL,
    GUARD_CRYSTAL,
    GUARD_OUTLINE,
    GUARD_RING,
    POMMEL,
    POMMEL_OUTLINE,
    SKILLS_GRIP
} from '@/components/SkillsDagger/SkillsDagger.constants';
import {
    createBlade,
    createCrystalGeometry,
    createRingGeometry
} from '@/components/SkillsDagger/SkillsDagger.helpers';

// Built once: there is a single Skills dagger
const BLADE = createBlade();
const GUARD_GEOMETRY = createOutlinedPart(GUARD_OUTLINE, GUARD_BEVEL).geometry;
const RING_GEOMETRY = createRingGeometry();
const CRYSTAL_GEOMETRY = createCrystalGeometry();
const POMMEL_GEOMETRY = createOutlinedPart(POMMEL_OUTLINE, POMMEL).geometry;

export const SkillsDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
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
            geometry={RING_GEOMETRY}
            position={[0, GUARD_RING.positionY, 0]}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={CRYSTAL_GEOMETRY}
            position={[0, GUARD_RING.positionY, 0]}
            ref={glowMaterialRef}
            color={GUARD_CRYSTAL.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />

        <LeatherGrip
            spec={SKILLS_GRIP}
            color={config.handleColor}
            rimColor={config.glowColor}
            isCrossed
        />

        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
